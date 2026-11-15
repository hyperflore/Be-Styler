"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync, execFileSync, spawn } = require("child_process");
const shim = require("../src/shared/shim.js");

const MAIN_FILE = path.resolve(__dirname, "..", "dist", "main.js");

const BRANCHES = {
    stable: { win: "Discord", exe: "Discord", unix: ["discord"], mac: "Discord" },
    ptb: { win: "DiscordPTB", exe: "DiscordPTB", unix: ["discord-ptb", "discordptb"], mac: "Discord PTB" },
    canary: { win: "DiscordCanary", exe: "DiscordCanary", unix: ["discord-canary", "discordcanary"], mac: "Discord Canary" },
    development: { win: "DiscordDevelopment", exe: "DiscordDevelopment", unix: ["discord-development"], mac: "Discord Development" },
};

const args = process.argv.slice(2);
const flag = name => args.includes(`--${name}`);
const opt = name => (args.find(a => a.startsWith(`--${name}=`)) || "").slice(name.length + 3) || null;

const mode = flag("uninject") ? "uninject" : flag("status") ? "status" : "inject";
const restart = !flag("no-restart") && mode !== "status";
const location = opt("location");
const branchArg = (opt("branch") || (mode === "status" ? "all" : "stable")).toLowerCase();

const c = { green: s => `\x1b[32m${s}\x1b[0m`, red: s => `\x1b[31m${s}\x1b[0m`, pink: s => `\x1b[95m${s}\x1b[0m`, dim: s => `\x1b[2m${s}\x1b[0m` };
const ok = msg => console.log(`${c.green("✔")} ${msg}`);
const info = msg => console.log(`${c.pink("›")} ${msg}`);
function fail(msg) {
    console.error(c.red(`✖ ${msg}`));
    process.exit(1);
}

function newestResources(root) {
    if (!fs.existsSync(root)) return null;
    const apps = fs.readdirSync(root)
        .filter(d => /^app-\d/.test(d) && fs.existsSync(path.join(root, d, "resources")))
        .sort((a, b) => shim.compareVersions(b, a));
    return apps.length ? { appDir: path.join(root, apps[0]), resources: path.join(root, apps[0], "resources") } : null;
}

function findBranch(branch) {
    const b = BRANCHES[branch];
    if (process.platform === "win32") {
        const root = path.join(process.env.LOCALAPPDATA || "", b.win);
        const found = newestResources(root);
        return found && { branch, root, exe: b.exe, ...found };
    }
    if (process.platform === "darwin") {
        const resources = `/Applications/${b.mac}.app/Contents/Resources`;
        return fs.existsSync(resources) ? { branch, root: null, exe: b.mac, appDir: path.dirname(resources), resources } : null;
    }
    for (const name of b.unix) {
        for (const base of ["/opt", "/usr/share", "/usr/lib", "/usr/lib64", path.join(os.homedir(), ".local", "share")]) {
            const resources = path.join(base, name, "resources");
            if (fs.existsSync(path.join(resources, "app.asar")) || fs.existsSync(path.join(resources, shim.ORIGINAL_NAME))) {
                return { branch, root: null, exe: b.exe === "Discord" ? "Discord" : b.exe, appDir: path.dirname(resources), resources };
            }
        }
    }
    return null;
}

function fromLocation(loc) {
    const p = path.resolve(loc);
    const hasAsar = dir => fs.existsSync(path.join(dir, "app.asar")) || fs.existsSync(path.join(dir, shim.ORIGINAL_NAME));
    let found = null;
    if (hasAsar(p)) found = { appDir: path.dirname(p), resources: p, root: null };
    else if (hasAsar(path.join(p, "resources"))) found = { appDir: p, resources: path.join(p, "resources"), root: null };
    else {
        const r = newestResources(p);
        if (r) found = { ...r, root: p };
    }
    if (!found) fail(`No Discord found at ${p}`);
    const exe = (fs.readdirSync(found.appDir).find(f => /^Discord.*\.exe$/i.test(f)) || "Discord.exe").replace(/\.exe$/i, "");
    return { branch: "custom", exe, ...found };
}

function stateOf(resources) {
    const asar = path.join(resources, "app.asar");
    const orig = path.join(resources, shim.ORIGINAL_NAME);
    if (fs.existsSync(path.join(resources, "_app.asar")) || fs.existsSync(path.join(resources, "app"))) return "other-mod";
    if (fs.existsSync(orig)) return shim.isShim(asar) ? "patched" : "broken";
    if (fs.existsSync(asar)) return shim.isShim(asar) ? "broken" : "not-patched";
    return "missing";
}

function patch(target) {
    const { resources } = target;
    const asar = path.join(resources, "app.asar");
    const orig = path.join(resources, shim.ORIGINAL_NAME);
    const state = stateOf(resources);
    if (state === "other-mod") fail("Another client mod is installed on this Discord (found _app.asar or resources/app). Uninstall it first.");
    if (state === "missing") fail(`app.asar not found in ${resources}`);
    if (!fs.existsSync(orig)) {
        if (shim.isShim(asar)) fail("Discord's original app.asar is missing. Reinstall Discord, then try again.");
        retry(() => fs.renameSync(asar, orig));
    }
    const pkg = shim.readAsarFile(orig, "package.json").toString("utf8");
    const tmp = `${asar}.tmp`;
    fs.writeFileSync(tmp, shim.buildShim(pkg, MAIN_FILE));
    retry(() => fs.renameSync(tmp, asar));
    cleanLegacy(target);
}

function unpatchResources(resources) {
    const asar = path.join(resources, "app.asar");
    const orig = path.join(resources, shim.ORIGINAL_NAME);
    if (!fs.existsSync(orig)) return false;
    if (fs.existsSync(asar)) {
        if (!shim.isShim(asar)) return false;
        retry(() => fs.rmSync(asar));
    }
    retry(() => fs.renameSync(orig, asar));
    return true;
}

function cleanLegacy(target) {
    const dirs = target.root
        ? fs.readdirSync(target.root).filter(d => /^app-\d/.test(d)).map(d => path.join(target.root, d))
        : [target.appDir];
    const re = new RegExp(`${shim.LEGACY_START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${shim.LEGACY_END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\r?\\n?`, "g");
    for (const dir of dirs) {
        const modules = path.join(dir, "modules");
        if (!fs.existsSync(modules)) continue;
        for (const core of fs.readdirSync(modules).filter(d => /^discord_desktop_core/.test(d))) {
            const file = path.join(modules, core, "discord_desktop_core", "index.js");
            if (!fs.existsSync(file)) continue;
            const src = fs.readFileSync(file, "utf8");
            if (src.includes(shim.LEGACY_START)) {
                fs.writeFileSync(file, src.replace(re, ""));
                info(c.dim(`removed old-style injection from ${path.relative(target.root || dir, file)}`));
            }
        }
    }
}

function retry(fn, tries = 8) {
    for (let i = 1; ; i++) {
        try {
            return fn();
        } catch (e) {
            if (i >= tries || !["EBUSY", "EPERM", "EACCES"].includes(e.code)) {
                if (e.code === "EACCES" || e.code === "EPERM") {
                    fail(`${e.message}\n  ${process.platform === "win32" ? "Make sure Discord is fully closed." : "Try again with sudo."}`);
                }
                throw e;
            }
            execSync(process.platform === "win32" ? "ping -n 2 127.0.0.1 >NUL" : "sleep 0.4");
        }
    }
}

function processesOf(target) {
    const scope = path.resolve(target.root || target.appDir).toLowerCase() + path.sep;
    try {
        if (process.platform === "win32") {
            const out = execFileSync(
                "powershell",
                ["-NoProfile", "-Command", `Get-Process -Name '${target.exe}' -ErrorAction SilentlyContinue | ForEach-Object { "$($_.Id)|$($_.Path)" }`],
                { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
            );
            return out.split(/\r?\n/).filter(Boolean).map(l => l.split("|")).filter(([, p]) => p && p.toLowerCase().startsWith(scope)).map(([pid]) => pid);
        }
        const pids = execSync(`pgrep -x "${target.exe}"`, { encoding: "utf8" }).split("\n").filter(Boolean);
        return pids.filter(pid => {
            try {
                return fs.realpathSync(`/proc/${pid}/exe`).toLowerCase().startsWith(scope);
            } catch {
                return process.platform === "darwin";
            }
        });
    } catch {
        return [];
    }
}
const isRunning = target => processesOf(target).length > 0;
function closeDiscord(target) {
    for (const pid of processesOf(target)) {
        try {
            if (process.platform === "win32") execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore" });
            else process.kill(Number(pid));
        } catch { }
    }
}
function startDiscord(target) {
    if (process.platform === "win32" && target.root && fs.existsSync(path.join(target.root, "Update.exe"))) {
        spawn(path.join(target.root, "Update.exe"), ["--processStart", `${target.exe}.exe`], { detached: true, stdio: "ignore" }).unref();
        return true;
    }
    if (process.platform === "darwin") {
        spawn("open", ["-a", target.exe], { detached: true, stdio: "ignore" }).unref();
        return true;
    }
    return false;
}

if (mode === "inject" && !fs.existsSync(MAIN_FILE)) fail(`Can't find ${MAIN_FILE}. Run \`npm run build\` first.`);

let targets;
if (location) targets = [fromLocation(location)];
else {
    const names = branchArg === "all" ? Object.keys(BRANCHES) : [branchArg];
    if (names.some(n => !BRANCHES[n])) fail(`Unknown branch "${branchArg}". Use stable, ptb, canary, development or all.`);
    targets = names.map(findBranch).filter(Boolean);
    if (!targets.length) fail(`Discord ${branchArg === "all" ? "" : `${branchArg} `}isn't installed (or wasn't found). Use --location=PATH.`);
}

for (const t of targets) {
    const label = `Discord ${t.branch} (${path.basename(t.appDir)})`;
    if (mode === "status") {
        const s = stateOf(t.resources);
        const color = s === "patched" ? c.green : s === "not-patched" ? (x => x) : c.red;
        info(`${label}: ${color(s)}  ${c.dim(t.resources)}`);
        continue;
    }

    const wasRunning = restart && isRunning(t);
    if (wasRunning) {
        info(`Closing ${label}…`);
        closeDiscord(t);
        execSync(process.platform === "win32" ? "ping -n 2 127.0.0.1 >NUL" : "sleep 0.8");
    }

    if (mode === "inject") {
        patch(t);
        ok(`Patched ${label} → ${c.dim(MAIN_FILE)}`);
    } else {
        const dirs = t.root
            ? fs.readdirSync(t.root).filter(d => /^app-\d/.test(d)).map(d => path.join(t.root, d, "resources")).filter(fs.existsSync)
            : [t.resources];
        const removed = dirs.filter(unpatchResources).length;
        cleanLegacy(t);
        ok(removed ? `Removed Be Themer from ${label}` : `${label} wasn't patched`);
    }

    if (wasRunning) info(startDiscord(t) ? `Restarting ${label}…` : `Start ${label} again to load the change.`);
}

if (mode === "inject") info("Open Discord and press Ctrl+Alt+B (or User Settings → Be Themer) for settings.");
