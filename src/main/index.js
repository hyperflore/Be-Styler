"use strict";

if (global.__BThemerMainLoaded) return;
global.__BThemerMainLoaded = true;

const electron = require("electron");
const Module = require("module");
const fs = require("fs");
const path = require("path");
const shim = require("./shim.js");

const { app, ipcMain, shell } = electron;

const HERE = __dirname;
const GPU_PROFILE = (() => {
    try {
        return JSON.parse(fs.readFileSync(path.join(HERE, "build-profile.json"), "utf8")).gpu === true;
    } catch {
        return false;
    }
})();
if (GPU_PROFILE) {
    app.commandLine.appendSwitch("enable-gpu-rasterization");
    app.commandLine.appendSwitch("enable-zero-copy");
}
const PRELOAD = path.join(HERE, "preload.js");
const RENDERER = path.join(HERE, "renderer.js");
const BUNDLED_THEMES = path.join(HERE, "themes");
const BUILD_INFO = (() => {
    try {
        return JSON.parse(fs.readFileSync(path.join(HERE, "build-info.json"), "utf8"));
    } catch {
        return { version: "dev" };
    }
})();

const DATA_DIR = process.env.BTHEMER_DATA_DIR || path.join(app.getPath("appData"), "B-Themer");

(function moveOldDataFolder() {
    if (process.env.BTHEMER_DATA_DIR) return;
    const old = path.join(app.getPath("appData"), "Moonberry");
    const done = path.join(DATA_DIR, ".moved-from-moonberry");
    if (!fs.existsSync(old) || fs.existsSync(done)) return;
    const merge = (from, to) => {
        for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
            const a = path.join(from, entry.name), b = path.join(to, entry.name);
            try {
                if (entry.isDirectory()) {
                    fs.mkdirSync(b, { recursive: true });
                    merge(a, b);
                } else if (!fs.existsSync(b) || fs.statSync(a).mtimeMs > fs.statSync(b).mtimeMs) {
                    fs.copyFileSync(a, b);
                }
            } catch (err) {
                console.warn("[Be Themer] couldn't move", a, err.message);
            }
        }
    };
    try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        merge(old, DATA_DIR);
        fs.writeFileSync(done, `Merged from ${old} on ${new Date().toISOString()}\n`);
        fs.writeFileSync(path.join(old, "MOVED.txt"), `Be Themer now keeps its files in ${DATA_DIR}. This folder can be deleted.\n`);
    } catch (err) {
        console.warn("[Be Themer] couldn't merge the old data folder:", err.message);
    }
})();
const USER_THEMES = path.join(DATA_DIR, "themes");
const USER_PLUGINS = path.join(DATA_DIR, "plugins");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const QUICKCSS_FILE = path.join(DATA_DIR, "quickcss.css");

const MAX_IMAGE_BYTES = 40 * 1024 * 1024;
const MAX_PLUGIN_BYTES = 2 * 1024 * 1024;

fs.mkdirSync(USER_THEMES, { recursive: true });
fs.mkdirSync(USER_PLUGINS, { recursive: true });
if (!fs.existsSync(QUICKCSS_FILE)) {
    fs.writeFileSync(QUICKCSS_FILE, "/* Be Themer custom CSS. It loads after every theme and plugin. */\n");
}

const hookedWindows = new Map();

class BThemerWindow extends electron.BrowserWindow {
    constructor(options = {}) {
        const prefs = options.webPreferences;
        const original = prefs && prefs.preload;
        const hook = typeof original === "string" && !/splash/i.test(path.basename(original));
        if (hook) {
            prefs.preload = PRELOAD;
            prefs.sandbox = false;
        }

        super(options);

        if (hook) {
            const wc = this.webContents;
            const id = wc.id;
            hookedWindows.set(id, original);
            wc.once("destroyed", () => hookedWindows.delete(id));
            wc.on("before-input-event", (event, input) => {
                if (input.type !== "keyDown") return;
                if (input.key === "F12") {
                    event.preventDefault();
                    wc.toggleDevTools();
                    return;
                }
                const mod = process.platform === "darwin" ? input.meta : input.control;
                if (input.key === "F5" || (mod && !input.alt && input.key.toLowerCase() === "r")) {
                    event.preventDefault();
                    wc.reload();
                }
            });
        }
    }
}

Object.defineProperty(BThemerWindow, "name", { value: "BrowserWindow" });

const pick = key => (key === "BrowserWindow" ? BThemerWindow : electron[key]);
const electronShim = new Proxy({}, {
    get: (_target, key) => pick(key),
    has: (_target, key) => key in electron,
    ownKeys: () => Reflect.ownKeys(electron),
    getOwnPropertyDescriptor: (_target, key) =>
        key in electron ? { configurable: true, enumerable: true, writable: false, value: pick(key) } : undefined,
});
const originalLoad = Module._load;
Module._load = function (request) {
    if (request === "electron") return electronShim;
    return originalLoad.apply(this, arguments);
};

function readSettings() {
    try {
        return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
    } catch {
        return {};
    }
}

function writeAtomic(file, data) {
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, file);
}

function parseMeta(css, file) {
    const meta = { name: file.replace(/(\.theme)?\.css$/i, ""), author: "", description: "", version: "" };
    const header = css.match(/^\s*\/\*\*([\s\S]*?)\*\//);
    if (header) {
        for (const [, key, value] of header[1].matchAll(/@(\w+)[ \t]+([^\r\n]*)/g)) {
            if (key in meta) meta[key] = value.trim();
        }
    }
    return meta;
}

const readDirSafe = dir => {
    try {
        return fs.readdirSync(dir);
    } catch {
        return [];
    }
};

function listThemes() {
    const themes = new Map();
    for (const [dir, source] of [[BUNDLED_THEMES, "bundled"], [USER_THEMES, "user"]]) {
        for (const file of readDirSafe(dir)) {
            if (!file.toLowerCase().endsWith(".css")) continue;
            try {
                const css = fs.readFileSync(path.join(dir, file), "utf8");
                themes.set(file, { file, source, css, ...parseMeta(css, file) });
            } catch { }
        }
    }
    return [...themes.values()];
}

function listUserPlugins() {
    if (readSettings().userPlugins === false) return [];
    return readDirSafe(USER_PLUGINS)
        .filter(f => f.toLowerCase().endsWith(".js") && !/^[_.]/.test(f))
        .sort()
        .flatMap(file => {
            try {
                const full = path.join(USER_PLUGINS, file);
                if (fs.statSync(full).size > MAX_PLUGIN_BYTES) {
                    console.warn(`[Be Themer] skipping ${file}: larger than 2 MB`);
                    return [];
                }
                return [{ file, source: fs.readFileSync(full, "utf8") }];
            } catch {
                return [];
            }
        });
}

function readQuickCss() {
    try {
        return fs.readFileSync(QUICKCSS_FILE, "utf8");
    } catch {
        return "";
    }
}

const isHooked = e => hookedWindows.has(e.sender.id);

ipcMain.on("BT_ORIGINAL_PRELOAD", e => {
    e.returnValue = hookedWindows.get(e.sender.id) || null;
});

ipcMain.on("BT_RENDERER_SRC", e => {
    try {
        e.returnValue = isHooked(e) ? fs.readFileSync(RENDERER, "utf8") : "";
    } catch (err) {
        console.error("[Be Themer] can't read dist/renderer.js (did you run `npm run build`?):", err.message);
        e.returnValue = "";
    }
});

ipcMain.on("BT_USER_PLUGINS", e => {
    e.returnValue = isHooked(e) ? listUserPlugins() : [];
});

ipcMain.on("BT_GET_STATE", e => {
    e.returnValue = isHooked(e)
        ? { version: BUILD_INFO.version, dataDir: DATA_DIR, settings: readSettings(), themes: listThemes(), quickCss: readQuickCss() }
        : null;
});

ipcMain.handle("BT_SET_QUICKCSS", (e, css) => {
    if (!isHooked(e) || typeof css !== "string" || css.length > 5_000_000) return false;
    writeAtomic(QUICKCSS_FILE, css);
    return true;
});

ipcMain.handle("BT_SET_SETTINGS", (e, json) => {
    if (!isHooked(e) || typeof json !== "string" || json.length > 5_000_000) return false;
    JSON.parse(json);
    writeAtomic(SETTINGS_FILE, json);
    return true;
});

const OPENABLE = { themes: USER_THEMES, plugins: USER_PLUGINS, bundled: BUNDLED_THEMES, quickcss: QUICKCSS_FILE, data: DATA_DIR };
ipcMain.handle("BT_OPEN_PATH", (e, which) => {
    if (!isHooked(e) || !Object.prototype.hasOwnProperty.call(OPENABLE, which)) return "Not allowed";
    return shell.openPath(OPENABLE[which]);
});

const EXTERNAL_PROTOCOLS = new Set(["https:", "http:", "spotify:", "steam:", "com.epicgames.launcher:", "tidal:", "itunes:"]);
ipcMain.handle("BT_OPEN_EXTERNAL", (e, rawUrl) => {
    if (!isHooked(e)) return false;
    let url;
    try {
        url = new URL(String(rawUrl));
    } catch {
        return false;
    }
    if (!EXTERNAL_PROTOCOLS.has(url.protocol)) return false;
    return shell.openExternal(url.href).then(() => true, () => false);
});

ipcMain.handle("BT_CAPTURE_WINDOW", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const image = await e.sender.capturePage();
    return image.toDataURL();
});

const SPOTIFY_SCOPES = "user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read user-library-modify";
let spotifyLogin = null;
const spotifyToken = async params => {
    const doFetch = electron.net && typeof electron.net.fetch === "function" ? electron.net.fetch.bind(electron.net) : fetch;
    const res = await doFetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(params).toString(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error_description || json.error || `Spotify answered HTTP ${res.status}`);
    return { accessToken: json.access_token, refreshToken: json.refresh_token || params.refresh_token, expiresAt: Date.now() + (json.expires_in || 3600) * 1000 };
};
ipcMain.handle("BT_SPOTIFY_LOGIN", async (e, rawClientId, rawPort) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const clientId = String(rawClientId || "").trim();
    if (!/^[0-9a-f]{32}$/i.test(clientId)) throw new Error("That doesn't look like a Spotify Client ID (32 letters/digits).");
    const port = Math.trunc(Number(rawPort)) || 8888;
    if (port < 1024 || port > 65535) throw new Error("Callback port must be between 1024 and 65535.");
    const redirectUri = `http://127.0.0.1:${port}/callback`;
    const verifier = crypto.randomBytes(48).toString("base64url");
    const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
    const state = crypto.randomBytes(16).toString("hex");
    if (spotifyLogin) spotifyLogin.close();
    const http = require("http");
    const code = await new Promise((resolve, reject) => {
        const finish = (err, value) => {
            clearTimeout(timer);
            server.close();
            if (spotifyLogin === server) spotifyLogin = null;
            err ? reject(err) : resolve(value);
        };
        const server = http.createServer((req, res) => {
            const url = new URL(req.url, redirectUri);
            if (url.pathname !== "/callback") { res.writeHead(404).end(); return; }
            const ok = url.searchParams.get("state") === state && url.searchParams.get("code");
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(`<!doctype html><meta charset=utf-8><title>Be Themer</title><body style="font:16px system-ui;background:#1e1f22;color:#f2f3f5;display:grid;place-items:center;height:90vh">${ok ? "Spotify is connected. You can close this tab and go back to Discord." : "Spotify login didn't finish. Try again from Discord."}`);
            if (ok) finish(null, url.searchParams.get("code"));
            else finish(new Error(url.searchParams.get("error") === "access_denied" ? "You cancelled the Spotify login." : "Spotify login failed."));
        });
        const timer = setTimeout(() => finish(new Error("Spotify login timed out.")), 5 * 60 * 1000);
        server.on("error", err => finish(new Error(err.code === "EADDRINUSE" ? `Port ${port} is in use. Pick another callback port (and add it to your Spotify app).` : err.message)));
        server.close = (orig => function () { try { return orig.call(this); } catch {} })(server.close);
        spotifyLogin = server;
        server.listen(port, "127.0.0.1", () => {
            const auth = new URL("https://accounts.spotify.com/authorize");
            for (const [k, v] of Object.entries({ client_id: clientId, response_type: "code", redirect_uri: redirectUri, code_challenge_method: "S256", code_challenge: challenge, state, scope: SPOTIFY_SCOPES })) auth.searchParams.set(k, v);
            shell.openExternal(auth.href).catch(err => finish(err));
        });
    });
    return spotifyToken({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: clientId, code_verifier: verifier });
});
ipcMain.handle("BT_SPOTIFY_REFRESH", async (e, clientId, refreshToken) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    return spotifyToken({ grant_type: "refresh_token", refresh_token: String(refreshToken), client_id: String(clientId) });
});
ipcMain.handle("BT_SPOTIFY_API", async (e, token, method, path, body, via) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    method = String(method || "GET").toUpperCase();
    if (!["GET", "PUT", "POST", "DELETE"].includes(method)) throw new Error("Bad method");
    const url = new URL(String(path), "https://api.spotify.com/v1/");
    if (url.origin !== "https://api.spotify.com" || !url.pathname.startsWith("/v1/")) throw new Error("Only Spotify Web API requests are allowed.");
    const doFetch = electron.net && typeof electron.net.fetch === "function" ? electron.net.fetch.bind(electron.net) : fetch;
    const res = await doFetch(url.href, {
        method,
        headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
        body: body !== undefined ? JSON.stringify(body) : method === "GET" ? undefined : "",
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (res.status >= 400) spotifyLog("api", `[${String(via || "?")}]`, method, url.pathname, res.status, data?.error?.message || String(text).slice(0, 120));
    const retryAfter = res.status === 429 ? Number(res.headers.get("retry-after")) || 0 : 0;
    return { status: res.status, data, retryAfter };
});

const SPOTIFY_PARTITION = "persist:bt-spotify";
const spotifyLog = (...parts) => {
    try {
        const file = path.join(DATA_DIR, "spotify-debug.log");
        try { if (fs.statSync(file).size > 200_000) fs.writeFileSync(file, ""); } catch {}
        fs.appendFileSync(file, `${new Date().toISOString()} ${parts.map(p => (typeof p === "string" ? p : JSON.stringify(p))).join(" ")}
`);
    } catch {}
};
const spotifySession = () => electron.session.fromPartition(SPOTIFY_PARTITION);
let spotifyBlocker = false;
const spotifyNoDevice = new Set();
const blockSpotifyDevice = wcId => {
    if (wcId != null) spotifyNoDevice.add(wcId);
    if (spotifyBlocker) return;
    spotifyBlocker = true;
    spotifySession().webRequest.onBeforeRequest({ urls: ["*://*.spotify.com/*", "wss://*.spotify.com/*"] }, (details, callback) => {
        callback({ cancel: spotifyNoDevice.has(details.webContentsId) && /dealer|\/connect-state\/|\/track-playback\/|\/melody\//i.test(details.url) });
    });
};
const spotifyLoggedIn = async () => {
    const cookies = await spotifySession().cookies.get({ name: "sp_dc" }).catch(() => []);
    return cookies.some(c => c.value);
};
let spotifyLoginWin = null;
ipcMain.handle("BT_SPOTIFY_WEB_LOGIN", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    if (spotifyLoginWin && !spotifyLoginWin.isDestroyed()) { spotifyLoginWin.focus(); throw new Error("The Spotify login window is already open."); }
    const parent = electron.BrowserWindow.fromWebContents(e.sender) || undefined;
    const win = new electron.BrowserWindow({
        width: 480, height: 720, parent, modal: false, autoHideMenuBar: true, title: "Log in to Spotify",
        backgroundColor: "#121212",
        webPreferences: { partition: SPOTIFY_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    spotifyLoginWin = win;
    win.webContents.setWindowOpenHandler(({ url }) => {
        return { action: "allow", overrideBrowserWindowOptions: { parent: win, autoHideMenuBar: true, webPreferences: { partition: SPOTIFY_PARTITION, sandbox: true } } };
    });
    return new Promise((resolve, reject) => {
        let done = false;
        const ses = spotifySession();
        const finish = (err, value) => {
            if (done) return;
            done = true;
            ses.cookies.removeListener("changed", onCookie);
            clearTimeout(timer);
            if (!win.isDestroyed()) win.close();
            spotifyLoginWin = null;
            err ? reject(err) : resolve(value);
        };
        const onCookie = (_ev, cookie, _cause, removed) => {
            if (!removed && cookie.name === "sp_dc" && cookie.value) setTimeout(() => finish(null, true), 600);
        };
        ses.cookies.on("changed", onCookie);
        const timer = setTimeout(() => finish(new Error("Spotify login timed out.")), 10 * 60 * 1000);
        win.on("closed", () => finish(new Error("Spotify login window was closed.")));
        spotifyLoggedIn().then(yes => {
            if (yes) return finish(null, true);
            win.loadURL("https://accounts.spotify.com/login?continue=https%3A%2F%2Fopen.spotify.com%2F");
        });
    });
});

let spotifyWebToken = null;
let spotifyWebPending = null;
const captureSpotifyWebToken = () => new Promise((resolve, reject) => {
    const win = new electron.BrowserWindow({
        show: false, width: 1100, height: 800,
        webPreferences: { partition: SPOTIFY_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
    });
    win.webContents.setUserAgent(LAZY_UA);
    const dbg = win.webContents.debugger;
    const tokenRequests = new Set();
    let done = false;
    const finish = (err, value) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { dbg.detach(); } catch {}
        if (!win.isDestroyed()) win.destroy();
        err ? reject(err) : resolve(value);
    };
    const seen = { messages: 0, responses: 0, enabled: false, sample: [] };
    const timer = setTimeout(() => {
        let where = "";
        try { where = `${win.webContents.getURL()} | ${win.webContents.getTitle()} | loading ${win.webContents.isLoading()}`; } catch {}
        spotifyLog("token capture timed out; saw", tokenRequests.size, "token responses;", seen, "page:", where);
        finish(new Error("Spotify's web player didn't hand out a token in time."));
    }, 30_000);
    spotifyLog("token capture started");
    try { dbg.attach("1.3"); } catch (err) { return finish(err); }
    dbg.on("message", async (_ev, method, params) => {
        seen.messages++;
        if (method === "Network.responseReceived") {
            seen.responses++;
            const u = String(params.response?.url || "").split("?")[0];
            if (/token|auth|session/i.test(u) && seen.sample.length < 12) seen.sample.push(`${params.response?.status} ${u.slice(0, 90)}`);
        }
        if (method === "Network.responseReceived") {
            const url = params.response?.url || "";
            if (/\/(api\/token|get_access_token)/.test(url) && /spotify\.com/.test(url)) {
                tokenRequests.add(params.requestId);
                spotifyLog("token response", params.response.status, url.split("?")[0]);
            }
        } else if (method === "Network.loadingFinished" && tokenRequests.has(params.requestId)) {
            try {
                const { body, base64Encoded } = await dbg.sendCommand("Network.getResponseBody", { requestId: params.requestId });
                const json = JSON.parse(base64Encoded ? Buffer.from(body, "base64").toString("utf8") : body);
                spotifyLog("token body", { isAnonymous: json.isAnonymous, hasToken: !!json.accessToken, keys: Object.keys(json) });
                if (json.isAnonymous) return finish(new Error("not-logged-in"));
                if (json.accessToken) {
                    if (!lazy.spLibChecked) {
                        lazy.spLibChecked = true;
                        setTimeout(() => {
                            const run = spLibQueue.then(() => spLibrary("playlists"));
                            spLibQueue = run.catch(() => {});
                            run.then(async r => {
                                spotifyLog("library self-check: sidebar", r.items.length, "items", r.items.slice(0, 3).map(x => `${x.kind}:${x.title}`), "user", r.user || "?");
                                if (r.items.length || !spLibWin || spLibWin.isDestroyed()) return;
                                const shape = await spLibWin.webContents.executeJavaScript(`(() => {
                                    const ids = {}; for (const e of document.querySelectorAll("[data-testid]")) { const k = e.getAttribute("data-testid"); ids[k] = (ids[k] || 0) + 1; }
                                    const links = [...document.querySelectorAll('a[href*="/playlist/"], a[href*="/collection/"]')].slice(0, 6).map(a => a.getAttribute("href") + " | " + (a.getAttribute("aria-label") || "").slice(0, 40));
                                    const labelled = [...document.querySelectorAll("[aria-labelledby]")].slice(0, 8).map(e => e.getAttribute("aria-labelledby").slice(0, 70));
                                    const lib = document.querySelector('[aria-label*="Library" i], nav');
                                    return { url: location.href, title: document.title, elements: document.querySelectorAll("*").length,
                                        text: (document.body && document.body.innerText || "").replace(/\s+/g, " ").slice(0, 500), testids: Object.entries(ids).sort((a, b) => b[1] - a[1]).slice(0, 45), links, labelled,
                                        libHtml: lib ? lib.outerHTML.replace(/\\s+/g, " ").replace(/<svg[\\s\\S]*?<\\/svg>/g, "<svg/>").slice(0, 1600) : "" };
                                })()`).catch(err => ({ err: String(err) }));
                                spotifyLog("library page shape", shape);
                            },
                                err => spotifyLog("library self-check failed", String(err?.message || err)));
                        }, 2000);
                    }
                    finish(null, { accessToken: json.accessToken, expiresAt: Number(json.accessTokenExpirationTimestampMs) || Date.now() + 55 * 60_000 });
                }
            } catch { }
        }
    });
    const tokenWcId = win.webContents.id;
    blockSpotifyDevice(tokenWcId);
    win.once("closed", () => spotifyNoDevice.delete(tokenWcId));
    win.webContents.setAudioMuted(true);
    dbg.sendCommand("Network.enable").then(() => { seen.enabled = true; }, err => spotifyLog("Network.enable failed", String(err?.message || err)));
    win.loadURL("https://open.spotify.com/").catch(() => {});
    const SCAN = `(() => {
        for (const sc of document.querySelectorAll("script")) {
            const t = sc.textContent || "";
            if (!t.includes("accessToken")) continue;
            try { const j = JSON.parse(t); if (j && j.accessToken) return { accessToken: j.accessToken, exp: j.accessTokenExpirationTimestampMs || 0, anon: !!j.isAnonymous, where: sc.id || "script" }; } catch {}
            const m = /"accessToken"\s*:\s*"([^"]+)"/.exec(t), e = /"accessTokenExpirationTimestampMs"\s*:\s*(\d+)/.exec(t), a = /"isAnonymous"\s*:\s*(true|false)/.exec(t);
            if (m) return { accessToken: m[1], exp: e ? Number(e[1]) : 0, anon: a ? a[1] === "true" : false, where: sc.id || "script" };
        }
        return null;
    })()`;
    const scan = setInterval(async () => {
        if (done || win.isDestroyed()) return clearInterval(scan);
        const found = await win.webContents.executeJavaScript(SCAN).catch(() => null);
        if (!found || done) return;
        spotifyLog("token found in the page", { where: found.where, anon: found.anon });
        if (found.anon) return;
        clearInterval(scan);
        finish(null, { accessToken: found.accessToken, expiresAt: found.exp || Date.now() + 55 * 60_000 });
    }, 1000);
});
ipcMain.handle("BT_SPOTIFY_WEB_TOKEN", async (e, force) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    if (!force && spotifyWebToken && spotifyWebToken.expiresAt - Date.now() > 60_000) return spotifyWebToken;
    if (!(await spotifyLoggedIn())) { spotifyLog("web token: no sp_dc cookie in the login session"); throw new Error("not-logged-in"); }
    spotifyWebPending ||= captureSpotifyWebToken()
        .then(t => { spotifyLog("web token: ok, expires", new Date(t.expiresAt).toISOString()); return t; },
            err => { spotifyLog("web token: failed", String(err?.message || err)); throw err; })
        .finally(() => { spotifyWebPending = null; });
    spotifyWebToken = await spotifyWebPending;
    return spotifyWebToken;
});
ipcMain.handle("BT_SPOTIFY_WEB_LOGOUT", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    spotifyWebToken = null;
    await spotifySession().clearStorageData().catch(() => {});
    return true;
});
let spLibWin = null;
let spLibQueue = Promise.resolve();
const SP_TRACKS = `(() => {
    const clean = t => (t || "").replace(/\\s+/g, " ").trim();
    const out = [];
    for (const row of document.querySelectorAll('[data-testid="tracklist-row"]')) {
        const link = row.querySelector('a[href*="/track/"]');
        const id = link && (/\\/track\\/([A-Za-z0-9]{22})/.exec(link.getAttribute("href")) || [])[1];
        if (!id) continue;
        const artists = [...row.querySelectorAll('a[href*="/artist/"]')].map(a => clean(a.textContent)).filter(Boolean);
        const album = row.querySelector('a[href*="/album/"]');
        const img = row.querySelector("img");
        const dur = [...row.querySelectorAll("div, span")].map(e => clean(e.textContent)).find(t => /^\\d{1,2}:\\d{2}(:\\d{2})?$/.test(t)) || "";
        out.push({ id, uri: "spotify:track:" + id, title: clean(link.textContent), artists: [...new Set(artists)], album: album ? clean(album.textContent) : "",
            image: img ? img.src : "", duration: dur });
    }
    return out;
})()`;
const SP_SIDEBAR = `(() => {
    const clean = t => (t || "").replace(/\\s+/g, " ").trim();
    const out = [];
    for (const el of document.querySelectorAll('[aria-labelledby*="listrow-title-spotify:"]')) {
        const m = /listrow-title-(spotify:([a-z]+):([A-Za-z0-9]+))/.exec(el.getAttribute("aria-labelledby") || "");
        if (!m || out.some(x => x.uri === m[1])) continue;
        const title = document.getElementById("listrow-title-" + m[1]);
        const sub = document.getElementById("listrow-subtitle-" + m[1]);
        const img = el.querySelector("img");
        const src = img ? (img.currentSrc || img.src || (img.getAttribute("srcset") || "").split(" ")[0] || img.getAttribute("data-src") || "") : "";
        out.push({ uri: m[1], kind: m[2], id: m[3], title: clean(title && (title.innerText || title.textContent)),
            subtitle: clean(sub && (sub.innerText || sub.textContent)), image: /^https:/.test(src) ? src : "" });
    }
    const me = document.querySelector('a[href^="/user/"]');
    return { items: out, user: me ? (/\\/user\\/([^/?#]+)/.exec(me.getAttribute("href")) || [])[1] || "" : "" };
})()`;
const SP_SCROLL = `(() => {
    const row = document.querySelector('[data-testid="tracklist-row"]');
    let el = row && row.parentElement;
    while (el && el !== document.body && !(el.scrollHeight > el.clientHeight + 20 && /auto|scroll/.test(getComputedStyle(el).overflowY))) el = el.parentElement;
    const target = el && el !== document.body ? el : document.querySelector('[data-overlayscrollbars-viewport], .main-view-container__scroll-node') || document.scrollingElement;
    if (!target) return false;
    const before = target.scrollTop;
    target.scrollTop = before + target.clientHeight * 0.9;
    return target.scrollTop !== before;
})()`;
async function spLibPage(url) {
    if (!spLibWin || spLibWin.isDestroyed()) {
        spLibWin = new electron.BrowserWindow({
            show: false, width: 1280, height: 1000,
            webPreferences: { partition: SPOTIFY_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
        });
        spLibWin.webContents.setUserAgent(LAZY_UA);
        spLibWin.webContents.setAudioMuted(true);
        spLibWin.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    }
    clearTimeout(spLibWin.idleTimer);
    spLibWin.idleTimer = setTimeout(() => { if (spLibWin && !spLibWin.isDestroyed()) spLibWin.destroy(); spLibWin = null; }, 90_000);
    if (spLibWin.webContents.getURL().split("?")[0] !== url) {
        spLibWin.webContents.loadURL(url).catch(() => {});
        await new Promise(r => setTimeout(r, 1200));
    }
    return spLibWin;
}
const spPoll = async (win, js, ok, tries = 24, every = 500) => {
    let v = null;
    for (let i = 0; i < tries; i++) {
        v = await win.webContents.executeJavaScript(js).catch(() => null);
        if (ok(v)) return v;
        await new Promise(r => setTimeout(r, every));
    }
    return v;
};
async function spLibTracks(url, max) {
    const win = await spLibPage(url);
    const seen = new Map();
    let rows = await spPoll(win, SP_TRACKS, v => Array.isArray(v) && v.length > 0);
    for (let step = 0; step < 12 && Array.isArray(rows); step++) {
        for (const r of rows) if (!seen.has(r.id)) seen.set(r.id, r);
        if (seen.size >= max) break;
        const moved = await win.webContents.executeJavaScript(SP_SCROLL).catch(() => false);
        if (!moved) break;
        await new Promise(r => setTimeout(r, 450));
        rows = await win.webContents.executeJavaScript(SP_TRACKS).catch(() => []);
    }
    return [...seen.values()].slice(0, max);
}
async function spLibrary(kind, id) {
    if (kind === "liked") return { items: await spLibTracks("https://open.spotify.com/collection/tracks", 100) };
    if (kind === "playlist") {
        if (!/^[A-Za-z0-9]{22}$/.test(String(id))) throw new Error("Bad playlist id");
        return { items: await spLibTracks(`https://open.spotify.com/playlist/${id}`, 100) };
    }
    if (kind === "playlists") {
        const win = await spLibPage("https://open.spotify.com/");
        const r = await spPoll(win, SP_SIDEBAR, v => v && v.items && v.items.length > 0);
        return { items: (r && r.items) || [], user: (r && r.user) || "" };
    }
    throw new Error("Unknown library list");
}
ipcMain.handle("BT_SPOTIFY_LIBRARY", async (e, kind, id) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    if (!(await spotifyLoggedIn())) throw new Error("not-logged-in");
    const run = spLibQueue.then(() => spLibrary(String(kind), id ? String(id) : ""));
    spLibQueue = run.catch(() => {});
    const res = await run;
    spotifyLog("library", kind, "→", res.items.length, "items", res.items[0] ? { first: res.items[0].title } : "");
    return res;
});

const SP_ADD_BTN = `document.querySelector('[data-testid="action-bar-row"] [data-testid="add-button"], [data-testid="action-bar"] [data-testid="add-button"]')`;
async function spLike(id, want) {
    const win = await spLibPage(`https://open.spotify.com/track/${id}`);
    const state = () => win.webContents.executeJavaScript(`(() => { const b = ${SP_ADD_BTN}; return b ? b.getAttribute("aria-checked") : null; })()`).catch(() => null);
    const now = await spPoll(win, `(() => { const b = ${SP_ADD_BTN}; return b ? b.getAttribute("aria-checked") : null; })()`, v => v === "true" || v === "false", 30, 400);
    if (now !== "true" && now !== "false") throw new Error("Couldn't find Spotify's save button.");
    const liked = now === "true";
    if (want == null || want === liked) return liked;
    await win.webContents.executeJavaScript(`(() => { const b = ${SP_ADD_BTN}; if (b) b.click(); })()`);
    for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 400));
        if ((await state()) === String(want)) return want;
        if (!want) {
            const handled = await win.webContents.executeJavaScript(`(() => {
                const dlg = document.querySelector('[role="dialog"]');
                if (!dlg) return false;
                const box = [...dlg.querySelectorAll('[role="checkbox"], input[type="checkbox"], button[aria-checked]')]
                    .find(b => /liked/i.test((b.closest("li, [role='listitem'], label, div") || b).innerText || b.getAttribute("aria-label") || ""));
                if (box && (box.getAttribute("aria-checked") === "true" || box.checked)) box.click();
                const done = [...dlg.querySelectorAll("button")].find(b => /^done$/i.test((b.innerText || "").trim()));
                if (done) { done.click(); return true; }
                return false;
            })()`).catch(() => false);
            if (handled) { await new Promise(r => setTimeout(r, 800)); return (await state()) === "true"; }
        }
    }
    return (await state()) === "true";
}
ipcMain.handle("BT_SPOTIFY_LIKE", async (e, id, want) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    if (!/^[A-Za-z0-9]{22}$/.test(String(id))) throw new Error("Bad track id");
    if (!(await spotifyLoggedIn())) throw new Error("not-logged-in");
    const run = spLibQueue.then(() => spLike(String(id), want == null ? null : !!want));
    spLibQueue = run.catch(() => {});
    const r = await run;
    if (want != null) spotifyLog("like", id, want, "→", r);
    return r;
});

ipcMain.on("BT_SPOTIFY_LOG", (e, msg) => { if (isHooked(e)) spotifyLog("plugin:", String(msg).slice(0, 400)); });
ipcMain.handle("BT_SPOTIFY_WEB_STATUS", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    return spotifyLoggedIn();
});

const YT_PARTITION = "persist:bt-youtube";
const YT_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const ytSession = () => electron.session.fromPartition(YT_PARTITION);
const ytLoggedIn = async () => {
    const cookies = await ytSession().cookies.get({ domain: ".youtube.com" }).catch(() => []);
    return cookies.some(c => c.name === "LOGIN_INFO" || c.name === "SAPISID" || c.name === "__Secure-3PSID");
};
const ytText = t => (t ? t.simpleText ?? (t.runs || []).map(r => r.text).join("") ?? t.content ?? "" : "");
const ytVideos = data => {
    const out = [];
    const seen = new Set();
    const push = v => { if (v.id && !seen.has(v.id)) { seen.add(v.id); out.push(v); } };
    const walk = node => {
        if (!node || typeof node !== "object" || out.length >= 60) return;
        if (Array.isArray(node)) { for (const n of node) walk(n); return; }
        const r = node.videoRenderer || node.playlistVideoRenderer || node.gridVideoRenderer || node.compactVideoRenderer || node.videoWithContextRenderer;
        if (r && r.videoId) {
            push({
                id: r.videoId,
                title: ytText(r.title) || ytText(r.headline),
                channel: ytText(r.ownerText) || ytText(r.shortBylineText) || ytText(r.longBylineText),
                duration: ytText(r.lengthText) || r.thumbnailOverlays?.find(o => o.thumbnailOverlayTimeStatusRenderer)?.thumbnailOverlayTimeStatusRenderer?.text?.simpleText || "",
                live: !!r.badges?.some(b => /LIVE/.test(b.metadataBadgeRenderer?.style || "")),
            });
            return;
        }
        const lockup = node.lockupViewModel;
        if (lockup && lockup.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" && lockup.contentId) {
            const meta = lockup.metadata?.lockupMetadataViewModel;
            const rows = meta?.metadata?.contentMetadataViewModel?.metadataRows || [];
            push({
                id: lockup.contentId,
                title: meta?.title?.content || "",
                channel: rows[0]?.metadataParts?.[0]?.text?.content || "",
                duration: "",
                live: false,
            });
            return;
        }
        for (const k in node) walk(node[k]);
    };
    walk(data);
    return out;
};
const ytFetchPage = async (url, useLogin) => {
    const ses = useLogin ? ytSession() : null;
    const doFetch = ses && typeof ses.fetch === "function" ? ses.fetch.bind(ses)
        : electron.net && typeof electron.net.fetch === "function" ? electron.net.fetch.bind(electron.net) : fetch;
    const res = await doFetch(url, { headers: { "User-Agent": YT_UA, "Accept-Language": "en-US,en;q=0.9" } });
    if (!res.ok) throw new Error(`YouTube answered HTTP ${res.status}`);
    const html = await res.text();
    const m = /(?:var ytInitialData|window\["ytInitialData"\])\s*=\s*(\{.+?\});\s*(?:var |window\[|<\/script>)/s.exec(html);
    if (!m) throw new Error("YouTube's page changed; couldn't read it.");
    return JSON.parse(m[1]);
};
ipcMain.handle("BT_YT_SEARCH", async (e, query) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const q = String(query || "").trim().slice(0, 200);
    if (!q) return [];
    const data = await ytFetchPage(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgIQAQ%253D%253D`, false);
    return ytVideos(data).slice(0, 20);
});
const ytGet = async url => {
    const doFetch = electron.net && typeof electron.net.fetch === "function" ? electron.net.fetch.bind(electron.net) : fetch;
    const res = await doFetch(url, { headers: { "User-Agent": YT_UA, "Accept-Language": "en-US,en;q=0.9" } });
    if (!res.ok) throw new Error(`YouTube answered HTTP ${res.status}`);
    return res.text();
};
const xmlText = s => String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const ytChannelFeed = async id => {
    const xml = await ytGet(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(id)}`);
    const name = xmlText((/<author>\s*<name>([\s\S]*?)<\/name>/.exec(xml) || [])[1]) || xmlText((/<title>([\s\S]*?)<\/title>/.exec(xml) || [])[1]);
    const videos = [];
    for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
        const e = m[1];
        const vid = (/<yt:videoId>([\w-]{11})<\/yt:videoId>/.exec(e) || [])[1];
        if (!vid) continue;
        videos.push({
            id: vid,
            title: xmlText((/<title>([\s\S]*?)<\/title>/.exec(e) || [])[1]),
            channel: xmlText((/<name>([\s\S]*?)<\/name>/.exec(e) || [])[1]) || name,
            published: (/<published>([^<]+)<\/published>/.exec(e) || [])[1] || "",
            short: /\/shorts\//.test((/<link[^>]+href="([^"]+)"/.exec(e) || [])[1] || ""),
            duration: "",
            live: false,
        });
    }
    return { id, name, videos };
};
ipcMain.handle("BT_YT_RESOLVE_CHANNEL", async (e, raw) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    let text = String(raw || "").trim();
    if (!text) throw new Error("Paste a channel link or @handle.");
    let id = (/(UC[\w-]{22})/.exec(text) || [])[1];
    if (!id) {
        let url;
        if (/^@[\w.-]+$/.test(text)) url = `https://www.youtube.com/${text}`;
        else {
            try { url = new URL(/^https?:/i.test(text) ? text : `https://${text}`).href; } catch { throw new Error("That isn't a YouTube channel link."); }
            const host = new URL(url).hostname.replace(/^(www|m)\./, "");
            if (host !== "youtube.com") throw new Error("That isn't a YouTube channel link.");
        }
        const html = await ytGet(url);
        id = (/<meta itemprop="identifier" content="(UC[\w-]{22})"/.exec(html) || /"externalId":"(UC[\w-]{22})"/.exec(html)
            || /<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{22})"/.exec(html) || /"channelId":"(UC[\w-]{22})"/.exec(html) || [])[1];
        if (!id) throw new Error("Couldn't find that channel.");
    }
    const feed = await ytChannelFeed(id);
    return { id, name: feed.name || id };
});
ipcMain.handle("BT_YT_CHANNEL_VIDEOS", async (e, ids, includeShorts) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const list = [...new Set((Array.isArray(ids) ? ids : []).map(String).filter(x => /^UC[\w-]{22}$/.test(x)))].slice(0, 300);
    const all = [];
    for (let i = 0; i < list.length; i += 8) {
        const batch = await Promise.allSettled(list.slice(i, i + 8).map(ytChannelFeed));
        for (const r of batch) if (r.status === "fulfilled") all.push(...r.value.videos);
    }
    return all.filter(v => includeShorts || !v.short).sort((a, b) => String(b.published).localeCompare(String(a.published))).slice(0, 80);
});

const LAZY_PARTITION = "persist:bt-lazy";
const LAZY_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36";
const lazySession = () => electron.session.fromPartition(LAZY_PARTITION);
const lazy = { tabs: new Map(), active: null, host: null, owner: null, level: "standard", blocking: null, visible: false, nextId: 1, lastWhy: "", lastLogAt: 0 };
const lazySend = data => { try { if (lazy.owner && !lazy.owner.isDestroyed()) lazy.owner.send("BT_LAZY_EVENT", data); } catch {} };
const lazyLog = (...parts) => {
    try {
        const file = path.join(DATA_DIR, "lazy-debug.log");
        try { if (fs.statSync(file).size > 300_000) fs.writeFileSync(file, ""); } catch {}
        fs.appendFileSync(file, `${new Date().toISOString()} ${parts.map(p => (typeof p === "string" ? p : JSON.stringify(p))).join(" ")}\n`);
    } catch {}
};
const lazySafe = fn => (...args) => { try { return fn(...args); } catch (err) { console.error("[Be Themer] Lazy:", err); } };
const lazyAlive = t => t && t.view && !t.view.webContents.isDestroyed();
const lazyActive = () => { const t = lazy.tabs.get(lazy.active); return lazyAlive(t) ? t : null; };
const lazyTabInfo = t => {
    const wc = t.view.webContents;
    return { id: t.id, url: wc.getURL() || t.url || "", title: wc.getTitle() || "", loading: wc.isLoading(), favicon: t.favicon || "", blocked: t.blocked };
};
const lazyState = () => {
    const tabs = [...lazy.tabs.values()].filter(lazyAlive).map(lazyTabInfo);
    const t = lazyActive();
    if (!t) return { open: false, tabs, active: null, blocked: 0, level: lazy.level };
    const wc = t.view.webContents;
    return {
        open: true, tabs, active: t.id, url: wc.getURL() || t.url || "", title: wc.getTitle(), loading: wc.isLoading(),
        canBack: wc.navigationHistory.canGoBack(), canForward: wc.navigationHistory.canGoForward(),
        blocked: t.blocked, favicon: t.favicon || "", level: lazy.level,
    };
};
const lazyPush = lazySafe(() => lazySend(lazyState()));
const LAZY_ENGINES = { standard: "fromPrebuiltAdsAndTracking", aggressive: "fromPrebuiltFull" };
async function lazyShields(level, force) {
    lazy.level = LAZY_ENGINES[level] ? level : level === "off" ? "off" : "standard";
    if (lazy.blocking) { try { lazy.blocking.disableBlockingInSession(lazySession()); } catch {} lazy.blocking = null; }
    if (lazy.level === "off") return { ok: true, level: "off" };
    let mod;
    try { mod = require(path.join(__dirname, "adblock.js")); } catch (err) { throw new Error("The ad-block engine isn't installed (dist/adblock.js)."); }
    const cache = path.join(DATA_DIR, `lazy-shields-${lazy.level}.bin`);
    try { if (force || Date.now() - fs.statSync(cache).mtimeMs > 3 * 864e5) fs.rmSync(cache, { force: true }); } catch {}
    const doFetch = electron.net && typeof electron.net.fetch === "function" ? electron.net.fetch.bind(electron.net) : fetch;
    const blocker = await mod.ElectronBlocker[LAZY_ENGINES[lazy.level]](doFetch, {
        path: cache, read: fs.promises.readFile, write: fs.promises.writeFile,
    });
    blocker.on("request-blocked", lazySafe(request => {
        const tabId = request?.tabId;
        for (const t of lazy.tabs.values()) {
            if (lazyAlive(t) && t.view.webContents.id === tabId) { t.blocked++; if (t.id === lazy.active) lazySend({ blocked: t.blocked }); break; }
        }
    }));
    blocker.enableBlockingInSession(lazySession());
    lazy.blocking = blocker;
    return { ok: true, level: lazy.level };
}
function lazyHook(sender) {
    lazy.owner = sender;
    if (!sender.__btLazyHooked) {
        sender.__btLazyHooked = true;
        sender.on("did-start-navigation", lazySafe((_e, _u, inPage, isMain) => { if (isMain && !inPage) lazySetVisible(false); }));
        sender.on("destroyed", lazySafe(() => { for (const id of [...lazy.tabs.keys()]) lazyCloseTab(id); }));
    }
}
lazy.size = { width: 320, height: 380 };
lazy.zoom = 0.67;
const LAZY_PAGE_CSS = "html::-webkit-scrollbar, body::-webkit-scrollbar, *::-webkit-scrollbar { width: 0 !important; height: 0 !important; background: transparent !important; } html, body { scrollbar-width: none !important; }";
const lazyPageSize = () => ({ width: Math.round(lazy.size.width / lazy.zoom), height: Math.round(lazy.size.height / lazy.zoom) });
const lazyResizeAll = () => {
    const { width, height } = lazyPageSize();
    for (const t of lazy.tabs.values()) if (lazyAlive(t)) t.win.setContentSize(width, height);
};
const lazyFit = wc => {
    try { wc.insertCSS(LAZY_PAGE_CSS).catch(err => lazyLog("css failed", String(err?.message || err))); } catch (err) { lazyLog("css failed", String(err?.message || err)); }
};
lazy.visible = false;
const lazySendFrame = frame => { try { if (lazy.owner && !lazy.owner.isDestroyed()) lazy.owner.send("BT_LAZY_FRAME", frame); } catch {} };
function lazyNewTab(sender, url) {
    lazyHook(sender);
    const win = new electron.BrowserWindow({
        show: false, width: lazyPageSize().width, height: lazyPageSize().height, frame: false, skipTaskbar: true, paintWhenInitiallyHidden: true,
        backgroundColor: "#ffffff",
        webPreferences: { offscreen: true, partition: LAZY_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
    });
    const wc = win.webContents;
    const t = { id: lazy.nextId++, win, view: { webContents: wc }, url, favicon: "", blocked: 0 };
    wc.setUserAgent(LAZY_UA);
    wc.setFrameRate(30);
    wc.stopPainting();
    wc.on("paint", lazySafe((_e, _dirty, image) => {
        if (t.id !== lazy.active || !lazy.visible || image.isEmpty()) return;
        const { width, height } = image.getSize();
        const data = image.toJPEG(86);
        lazy.frames = (lazy.frames || 0) + 1;
        if (lazy.frames === 1 || lazy.frames % 300 === 0) lazyLog("frame", lazy.frames, { tab: t.id, width, height, kb: Math.round(data.length / 1024) });
        lazySendFrame({ id: t.id, width, height, data });
    }));
    wc.on("cursor-changed", lazySafe((_e, type) => { if (t.id === lazy.active) lazySend({ cursor: type }); }));
    wc.setWindowOpenHandler(({ url: u }) => {
        if (/^https?:/i.test(u)) setImmediate(lazySafe(() => { lazyOpenIn(lazyNewTab(lazy.owner, u), u); lazyPush(); }));
        return { action: "deny" };
    });
    for (const ev of ["did-navigate", "did-navigate-in-page", "page-title-updated", "did-start-loading", "did-stop-loading"]) wc.on(ev, lazyPush);
    wc.on("dom-ready", lazySafe(() => lazyFit(wc)));
    wc.on("did-navigate", lazySafe(() => lazyFit(wc)));
    wc.on("did-start-navigation", lazySafe((_e, _url, inPage, isMain) => { if (isMain && !inPage) { t.blocked = 0; lazyPush(); } }));
    wc.on("page-favicon-updated", lazySafe((_e, icons) => { t.favicon = icons?.[0] || ""; lazyPush(); }));
    wc.on("did-fail-load", lazySafe((_e, code, desc, failedUrl, isMain) => {
        if (!isMain) return;
        lazyLog("fail", t.id, code, desc, failedUrl);
        if (code !== -3 && t.id === lazy.active) lazySend({ error: `${desc} (${code})`, url: failedUrl });
    }));
    wc.on("did-finish-load", lazySafe(() => { lazyFit(wc); lazyLog("loaded", t.id, wc.getURL()); }));
    wc.on("render-process-gone", lazySafe((_e, d) => { lazyLog("page crashed", t.id, d); if (t.id === lazy.active) lazySend({ error: `The page crashed (${d?.reason})` }); }));
    lazy.tabs.set(t.id, t);
    lazySwitch(t.id);
    lazyLog("tab created", t.id, url);
    return t;
}
function lazyOpenIn(t, url) {
    t.url = url;
    t.view.webContents.loadURL(url).catch(err => lazyLog("loadURL rejected", t.id, String(err?.message || err)));
}
function lazyPaint() {
    for (const t of lazy.tabs.values()) {
        if (!lazyAlive(t)) continue;
        const wc = t.view.webContents;
        const on = lazy.visible && t.id === lazy.active;
        if (on && !wc.isPainting()) { wc.startPainting(); wc.invalidate(); }
        else if (!on && wc.isPainting()) wc.stopPainting();
    }
}
function lazySetVisible(v) {
    const was = lazy.visible;
    lazy.visible = !!v;
    lazyPaint();
    if (lazy.visible && !was) lazyActive()?.view.webContents.invalidate();
}
function lazySwitch(id) {
    if (!lazy.tabs.has(id)) return;
    lazy.active = id;
    lazyPaint();
    lazyActive()?.view.webContents.invalidate();
}
function lazyCloseTab(id) {
    const t = lazy.tabs.get(id);
    if (!t) return;
    lazy.tabs.delete(id);
    try { t.win.destroy(); } catch {}
    if (lazy.active === id) {
        const rest = [...lazy.tabs.keys()];
        lazy.active = null;
        if (rest.length) lazySwitch(rest[rest.length - 1]);
    }
}
ipcMain.handle("BT_LAZY_SHIELDS", async (e, level, force) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    return lazyShields(String(level || "standard"), !!force);
});
ipcMain.handle("BT_LAZY_OPEN", async (e, rawUrl, newTab) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const url = new URL(String(rawUrl));
    if (!/^https?:$/.test(url.protocol)) throw new Error("Only http(s) pages.");
    lazyHook(e.sender);
    const t = newTab || !lazyActive() ? lazyNewTab(e.sender, url.href) : lazyActive();
    lazyLog("open", t.id, url.href);
    lazyOpenIn(t, url.href);
    return lazyState();
});
ipcMain.handle("BT_LAZY_TAB", (e, action, id) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    id = Number(id);
    if (action === "switch") lazySwitch(id);
    else if (action === "close") lazyCloseTab(id);
    return lazyState();
});
ipcMain.on("BT_LAZY_VIEWPORT", (e, vp) => {
    try {
        if (!isHooked(e)) return;
        lazyHook(e.sender);
        const w = Math.max(100, Math.min(3000, Math.round(Number(vp?.width) || 0)));
        const h = Math.max(100, Math.min(3000, Math.round(Number(vp?.height) || 0)));
        if (w !== lazy.size.width || h !== lazy.size.height) {
            lazy.size = { width: w, height: h };
            lazyResizeAll();
        }
        if (!!vp?.visible !== lazy.visible) { lazyLog(vp?.visible ? "showing" : "not showing", { w, h, tab: lazy.active }); if (vp?.visible) lazy.frames = 0; }
        lazySetVisible(!!vp?.visible);
    } catch (err) { console.error("[Be Themer] Lazy viewport:", err); }
});
const LAZY_INPUT_TYPES = new Set(["mouseDown", "mouseUp", "mouseMove", "mouseWheel", "mouseEnter", "mouseLeave", "keyDown", "keyUp", "char"]);
ipcMain.on("BT_LAZY_INPUT", (e, ev) => {
    try {
        if (!isHooked(e) || !ev || !LAZY_INPUT_TYPES.has(ev.type)) return;
        const t = lazyActive();
        if (!t) return;
        const wc = t.view.webContents;
        if (ev.type === "mouseDown" && !wc.isFocused()) wc.focus();
        if (typeof ev.x === "number") ev.x = Math.round(ev.x / lazy.zoom);
        if (typeof ev.y === "number") ev.y = Math.round(ev.y / lazy.zoom);
        wc.sendInputEvent(ev);
    } catch (err) { console.error("[Be Themer] Lazy input:", err); }
});
ipcMain.handle("BT_LAZY_ZOOM", (e, factor) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    lazy.zoom = Math.max(0.3, Math.min(1.5, Number(factor) || 0.67));
    lazyResizeAll();
    return lazy.zoom;
});
ipcMain.handle("BT_LAZY_EDIT", (e, cmd) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const wc = lazyActive()?.view.webContents;
    if (wc && ["copy", "cut", "paste", "selectAll", "undo", "redo"].includes(cmd)) wc[cmd]();
    return true;
});
ipcMain.handle("BT_LAZY_NAV", async (e, action) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const t = lazyActive();
    if (!t) return lazyState();
    const wc = t.view.webContents;
    if (action === "back" && wc.navigationHistory.canGoBack()) wc.navigationHistory.goBack();
    else if (action === "forward" && wc.navigationHistory.canGoForward()) wc.navigationHistory.goForward();
    else if (action === "reload") wc.reload();
    else if (action === "stop") wc.stop();
    else if (action === "devtools") wc.openDevTools({ mode: "detach" });
    return lazyState();
});
const LAZY_EXTRACT = `(() => {
    const clean = t => (t || "").replace(/\\s+/g, " ").trim();
    const out = [];
    for (const s of document.querySelectorAll('[data-type="web"]')) {
        const a = s.querySelector('a[href^="http"]');
        if (!a) continue;
        const title = clean((s.querySelector('.title, .search-snippet-title, [class*="title"]') || {}).textContent);
        const desc = clean((s.querySelector('.snippet-description, .generic-snippet .content, [class*="description"], .content') || {}).textContent);
        const site = clean((s.querySelector('.site-name-content .desktop-small-semibold, .site-name-content > div') || {}).textContent);
        const icon = (s.querySelector('img.favicon') || {}).src || "";
        if (title && !out.some(r => r.url === a.href)) out.push({ url: a.href, title, desc: desc.slice(0, 320), site, icon });
    }
    return { title: document.title, results: out };
})()`;
const LAZY_EXTRACT_IMAGES = `(() => {
    const clean = t => (t || "").replace(/\\s+/g, " ").trim();
    const original = src => {
        // the thumbnail proxy carries the original image's address, base64url-encoded, after "/g:ce/"
        const m = /\\/g:ce\\/(.+)$/.exec(src || "");
        if (!m) return "";
        try {
            let b = m[1].replace(/\\//g, "").replace(/-/g, "+").replace(/_/g, "/");
            while (b.length % 4) b += "=";
            const u = atob(b);
            return /^https?:\\/\\//.test(u) ? u : "";
        } catch { return ""; }
    };
    const out = [];
    for (const b of document.querySelectorAll("button.image-result")) {
        const img = b.querySelector(".image-wrapper img, img");
        const thumb = img && (img.currentSrc || img.src);
        if (!thumb || !/^https:/.test(thumb)) continue;
        const style = b.getAttribute("style") || "";
        const w = Number((/--width:\\s*(\\d+)/.exec(style) || [])[1]) || 0, h = Number((/--height:\\s*(\\d+)/.exec(style) || [])[1]) || 0;
        out.push({
            thumb, full: original(thumb) || thumb, title: clean(img.alt),
            site: clean((b.querySelector(".image-metadata-source") || {}).textContent), w, h,
        });
    }
    return { title: document.title, images: out };
})()`;
const LAZY_EXTRACT_SUMMARY = `(() => {
    const clean = t => (t || "").replace(/\\s+/g, " ").trim();
    // innerText keeps the answer's paragraphs and list lines apart
    const lines = t => (t || "").split(/\\n+/).map(l => l.replace(/[ \\t]+/g, " ").trim()).filter(Boolean).join("\\n");
    const ai = document.querySelector(".chatllm-answer");
    const aiText = ai && lines(ai.innerText);
    if (aiText && aiText.length > 60) return { kind: "answer", title: "", text: aiText.slice(0, 1200), done: !document.querySelector(".chatllm-answer [class*='loading'], .chatllm-answer [class*='cursor']") };
    const box = document.querySelector("#infobox");
    if (box) {
        const title = clean((box.querySelector(".infobox-header-title") || {}).textContent);
        const sub = clean((box.querySelector(".infobox-header-subtitle, .infobox-header [class*='subtitle']") || {}).textContent);
        let text = "";
        for (const el of box.querySelectorAll("p, .infobox-description, [class*='description'], #infobox-snippet [class*='content']")) { const t = clean(el.textContent); if (t.length > text.length) text = t; }
        if (!text) text = clean((document.querySelector("#infobox-snippet") || box).textContent).replace(title, "").replace(sub, "").trim();
        if (title || text) return { kind: "info", title, sub, text: text.slice(0, 900), done: true };
    }
    return null;
})()`;
let lazySearchWin = null;
let lazySearchQueue = Promise.resolve();
const lazySearchPage = () => {
    if (lazySearchWin && !lazySearchWin.isDestroyed()) return lazySearchWin;
    lazySearchWin = new electron.BrowserWindow({
        show: false, width: 1100, height: 900,
        webPreferences: { partition: LAZY_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
    });
    lazySearchWin.webContents.setUserAgent(LAZY_UA);
    lazySearchWin.webContents.setAudioMuted(true);
    lazySearchWin.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    return lazySearchWin;
};
async function lazySearch(query, page, kind) {
    lazy.searchGen = (lazy.searchGen || 0) + 1;
    lazy.searchShown = null;
    const win = lazySearchPage();
    if (kind === "images") {
        const url = `https://search.brave.com/images?q=${encodeURIComponent(query)}`;
        await Promise.race([win.loadURL(url), new Promise((_r, rej) => setTimeout(() => rej(new Error("Search timed out.")), 20_000))]);
        let found = { images: [] };
        for (let i = 0; i < 8; i++) {
            found = await win.webContents.executeJavaScript(LAZY_EXTRACT_IMAGES).catch(() => ({ images: [] }));
            if (found.images.length) break;
            await new Promise(r => setTimeout(r, 400));
        }
        if (!found.images.length && /captcha|verify|human|blocked/i.test(found.title || "")) {
            const err = new Error("verify");
            err.verifyUrl = url;
            throw err;
        }
        lazy.searchShown = null;
        return { query, kind, url, images: found.images.slice(0, 60), results: [] };
    }
    const url = `https://search.brave.com/search?q=${encodeURIComponent(query)}&source=web${page > 0 ? `&offset=${page}` : "&summary=1"}`;
    await Promise.race([win.loadURL(url), new Promise((_r, rej) => setTimeout(() => rej(new Error("Search timed out.")), 20_000))]);
    lazy.searchShown = page === 0 ? query : null;
    let found = { results: [] };
    for (let i = 0; i < 6; i++) {
        found = await win.webContents.executeJavaScript(LAZY_EXTRACT).catch(() => ({ results: [] }));
        if (found.results.length) break;
        await new Promise(r => setTimeout(r, 400));
    }
    if (!found.results.length && /captcha|verify|human|blocked/i.test(found.title || "")) {
        const err = new Error("verify");
        err.verifyUrl = url;
        throw err;
    }
    return { query, page, url, results: found.results };
}
ipcMain.handle("BT_LAZY_SEARCH", async (e, query, page, kind) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const q = String(query || "").trim().slice(0, 300);
    if (!q) return { query: q, page: 0, results: [] };
    const run = lazySearchQueue.then(() => lazySearch(q, Math.max(0, Math.min(9, Number(page) || 0)), kind === "images" ? "images" : "web"));
    lazySearchQueue = run.catch(() => {});
    try {
        return await run;
    } catch (err) {
        if (err.message === "verify") return { query: q, page: 0, results: [], verifyUrl: err.verifyUrl };
        throw err;
    }
});

ipcMain.handle("BT_LAZY_SUMMARY", async (e, query) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const q = String(query || "").trim();
    await lazySearchQueue;
    const gen = lazy.searchGen;
    const run = (async () => {
        if (!lazySearchWin || lazySearchWin.isDestroyed() || lazy.searchShown !== q) return null;
        let best = null;
        for (let i = 0; i < 16; i++) {
            if (lazy.searchGen !== gen || lazy.searchShown !== q) return best;
            const s = await lazySearchWin.webContents.executeJavaScript(LAZY_EXTRACT_SUMMARY).catch(() => null);
            if (lazy.searchGen !== gen) return best;
            if (s) {
                if (best && s.text === best.text && s.kind === "answer") return s;
                best = s;
                if (s.kind === "info" && i > 5) return s;
            }
            await new Promise(r => setTimeout(r, 500));
        }
        return best;
    })();
    return run.catch(() => null);
});

ipcMain.handle("BT_LAZY_SUGGEST", async (e, query) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const q = String(query || "").trim().slice(0, 120);
    if (!q) return [];
    const doFetch = electron.net && typeof electron.net.fetch === "function" ? electron.net.fetch.bind(electron.net) : fetch;
    try {
        const res = await doFetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`, { headers: { "User-Agent": LAZY_UA } });
        const json = await res.json();
        return (Array.isArray(json?.[1]) ? json[1] : []).map(String).filter(s => s && s.toLowerCase() !== q.toLowerCase()).slice(0, 6);
    } catch {
        return [];
    }
});

ipcMain.handle("BT_LAZY_STATE", e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    return lazyState();
});
ipcMain.handle("BT_LAZY_CLOSE", e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    for (const id of [...lazy.tabs.keys()]) lazyCloseTab(id);
    return true;
});
ipcMain.handle("BT_LAZY_POPOUT", (e, rawUrl) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const url = String(rawUrl || lazyActive()?.view.webContents.getURL() || "https://search.brave.com/");
    const win = new electron.BrowserWindow({
        width: 1200, height: 820, autoHideMenuBar: true, title: "Lazy", backgroundColor: "#ffffff",
        webPreferences: { partition: LAZY_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    win.webContents.setUserAgent(LAZY_UA);
    win.webContents.setWindowOpenHandler(({ url: u }) => {
        if (/^https?:/i.test(u)) return { action: "allow", overrideBrowserWindowOptions: { autoHideMenuBar: true, webPreferences: { partition: LAZY_PARTITION, sandbox: true } } };
        return { action: "deny" };
    });
    if (/^https?:/i.test(url)) win.loadURL(url);
    return true;
});
ipcMain.handle("BT_LAZY_CLEAR", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    await lazySession().clearStorageData().catch(() => {});
    await lazySession().clearCache().catch(() => {});
    return true;
});

const TW_PARTITION = "persist:bt-twitch";
const twSession = () => electron.session.fromPartition(TW_PARTITION);
const twStatus = async () => {
    const cookies = await twSession().cookies.get({ domain: ".twitch.tv" }).catch(() => []);
    const token = cookies.find(c => c.name === "auth-token" && c.value);
    const login = cookies.find(c => c.name === "login" && c.value)?.value || cookies.find(c => c.name === "name" && c.value)?.value || "";
    return { loggedIn: !!token, login: decodeURIComponent(login || "") };
};
let twLoginWin = null;
ipcMain.handle("BT_TW_LOGIN", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    if ((await twStatus()).loggedIn) return twStatus();
    if (twLoginWin && !twLoginWin.isDestroyed()) { twLoginWin.focus(); throw new Error("The Twitch login window is already open."); }
    const win = new electron.BrowserWindow({
        width: 480, height: 760, autoHideMenuBar: true, title: "Log in to Twitch", backgroundColor: "#0e0e10",
        parent: electron.BrowserWindow.fromWebContents(e.sender) || undefined,
        webPreferences: { partition: TW_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    twLoginWin = win;
    win.webContents.setUserAgent(LAZY_UA);
    win.webContents.setWindowOpenHandler(() => ({ action: "allow", overrideBrowserWindowOptions: { parent: win, autoHideMenuBar: true, webPreferences: { partition: TW_PARTITION, sandbox: true } } }));
    return new Promise((resolve, reject) => {
        let done = false;
        const ses = twSession();
        const finish = (err, value) => {
            if (done) return;
            done = true;
            ses.cookies.removeListener("changed", onCookie);
            if (!win.isDestroyed()) win.close();
            twLoginWin = null;
            err ? reject(err) : resolve(value);
        };
        const onCookie = (_ev, cookie, _cause, removed) => {
            if (!removed && cookie.name === "auth-token" && cookie.value) setTimeout(async () => finish(null, await twStatus()), 1200);
        };
        ses.cookies.on("changed", onCookie);
        win.on("closed", () => finish(new Error("Twitch login window was closed.")));
        win.loadURL("https://www.twitch.tv/login");
    });
});
ipcMain.handle("BT_TW_STATUS", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    return twStatus();
});
ipcMain.handle("BT_TW_LOGOUT", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    await twSession().clearStorageData().catch(() => {});
    return true;
});
const TW_EXTRACT = `(() => {
    const clean = t => (t || "").replace(/\\s+/g, " ").trim();
    const thumb = src => (src || "").replace(/-\\d+x\\d+\\.jpg/, "-440x248.jpg");
    const out = [];
    const push = item => { if (item.login && !out.some(x => x.login === item.login)) out.push(item); };
    // directory / following cards
    for (const link of document.querySelectorAll('a[data-a-target="preview-card-image-link"]')) {
        const card = link.closest("article") || link.parentElement;
        const login = (link.getAttribute("href") || "").replace(/^\\//, "").split(/[/?#]/)[0];
        const img = link.querySelector("img");
        const ch = card.querySelector('[data-a-target="preview-card-channel-link"]');
        push({
            login,
            name: clean((card.querySelector('[data-a-target="preview-card-channel-link"] p[title]') || {}).title) || login,
            title: clean((ch && ch.querySelector("h4") || {}).title || (ch && ch.querySelector("h4") || {}).textContent),
            game: clean((card.querySelector('[data-a-target="preview-card-game-link"]') || {}).textContent),
            viewers: clean((card.querySelector(".tw-media-card-stat") || {}).textContent),
            thumb: thumb(img && img.src), live: true,
        });
    }
    // search results
    for (const r of document.querySelectorAll('[data-a-target="search-result-live-channel"], [data-a-target="search-result-offline-channel"], [data-a-target="search-result-channel"]')) {
        const a = r.querySelector("a[href]");
        const login = (a && a.getAttribute("href") || "").replace(/^\\//, "").split(/[/?#]/)[0];
        const sel = n => r.querySelector('[data-test-selector="search-result-live-channel__' + n + '"]');
        const img = r.querySelector("img");
        const live = r.getAttribute("data-a-target") === "search-result-live-channel";
        push({
            login,
            name: clean((sel("name") || {}).textContent) || clean(img && img.alt) || login,
            title: clean((sel("title") || {}).title || (sel("title") || {}).textContent),
            game: clean((sel("category") || {}).textContent),
            viewers: clean((sel("viewer-count") || {}).textContent),
            thumb: live ? thumb(img && img.src) : (img && img.src) || "", live,
        });
    }
    return { title: document.title, loggedIn: !!document.querySelector('[data-a-target="user-menu-toggle"] img, [data-a-target="top-nav-avatar"]'), items: out.filter(x => /^[a-z0-9_]{2,25}$/i.test(x.login)) };
})()`;
const HELPER_IDLE_MS = 2 * 60_000;
function helperTouch(win) {
    if (!win || win.isDestroyed()) return;
    clearTimeout(win.idleTimer);
    win.idleTimer = setTimeout(() => { if (!win.isDestroyed()) win.destroy(); }, HELPER_IDLE_MS);
}
let twWin = null;
let twQueue = Promise.resolve();
const TW_PAGES = {
    following: () => "https://www.twitch.tv/directory/following/live",
    top: () => "https://www.twitch.tv/directory/all",
    search: q => `https://www.twitch.tv/search?term=${encodeURIComponent(q)}&type=channels`,
};
ipcMain.handle("BT_TW_LIST", async (e, kind, query) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const make = TW_PAGES[String(kind)];
    if (!make) throw new Error("Unknown list");
    const q = String(query || "").trim().slice(0, 100);
    if (kind === "search" && !q) return { items: [] };
    if (kind === "following" && !(await twStatus()).loggedIn) throw new Error("not-logged-in");
    const run = twQueue.then(async () => {
        if (!twWin || twWin.isDestroyed()) {
            twWin = new electron.BrowserWindow({
                show: false, width: 1280, height: 900,
                webPreferences: { partition: TW_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
            });
            twWin.webContents.setUserAgent(LAZY_UA);
            twWin.webContents.setAudioMuted(true);
            twWin.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
        }
        helperTouch(twWin);
        await Promise.race([twWin.loadURL(make(q)), new Promise((_r, rej) => setTimeout(() => rej(new Error("Twitch took too long to answer.")), 20_000))]);
        let found = { items: [] };
        for (let i = 0; i < 16; i++) {
            found = await twWin.webContents.executeJavaScript(TW_EXTRACT).catch(() => ({ items: [] }));
            if (found.items.length >= 4 || (i > 8 && found.items.length)) break;
            await new Promise(r => setTimeout(r, 500));
        }
        helperTouch(twWin);
        return { items: found.items.slice(0, 40) };
    });
    twQueue = run.catch(() => {});
    return run;
});

const KICK_PARTITION = "persist:bt-kick";
const kickSession = () => electron.session.fromPartition(KICK_PARTITION);
const kickToken = async () => {
    const cookies = await kickSession().cookies.get({ name: "session_token" }).catch(() => []);
    const c = cookies.find(x => x.value && /kick\.com$/.test(x.domain.replace(/^\./, "")));
    return c ? decodeURIComponent(c.value) : "";
};
let kickWin = null;
let kickQueue = Promise.resolve();
async function kickPage() {
    if (!kickWin || kickWin.isDestroyed()) {
        kickWin = new electron.BrowserWindow({
            show: false, width: 1280, height: 900,
            webPreferences: { partition: KICK_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true, backgroundThrottling: false },
        });
        kickWin.webContents.setUserAgent(LAZY_UA);
        kickWin.webContents.setAudioMuted(true);
        kickWin.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    }
    helperTouch(kickWin);
    if (!/^https:\/\/kick\.com\//.test(kickWin.webContents.getURL()) || kickWin.lastLoad < Date.now() - 20 * 60_000) {
        await Promise.race([kickWin.loadURL("https://kick.com/"), new Promise((_r, rej) => setTimeout(() => rej(new Error("Kick took too long to answer.")), 25_000))]);
        kickWin.lastLoad = Date.now();
        await new Promise(r => setTimeout(r, 1500));
    }
    helperTouch(kickWin);
    return kickWin;
}
async function kickFetch(url, token) {
    const win = await kickPage();
    const headers = { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    const r = await win.webContents.executeJavaScript(`fetch(${JSON.stringify(url)}, { headers: ${JSON.stringify(headers)}, credentials: "include" })
        .then(async res => ({ status: res.status, text: await res.text() })).catch(e => ({ status: 0, text: String(e) }))`);
    if (r.status === 401 || r.status === 403) { const err = new Error(r.status === 401 ? "not-logged-in" : `Kick refused (${r.status})`); err.status = r.status; throw err; }
    if (r.status !== 200) throw new Error(`Kick answered ${r.status || "nothing"}`);
    try { return JSON.parse(r.text); } catch { throw new Error("Kick sent something unexpected."); }
}
const kickNum = n => (Number(n) >= 1000 ? `${(Number(n) / 1000).toFixed(Number(n) >= 10000 ? 0 : 1)}K` : String(n ?? ""));
const kickItem = x => {
    const ch = x.channel || x;
    const ls = x.livestream || x.current_livestream || (x.is_live || x.isLive ? x : null) || null;
    const slug = ch.slug || x.channel_slug || x.slug || ch.username?.toLowerCase();
    return {
        slug: String(slug || "").toLowerCase(),
        name: ch.username || ch.user?.username || x.user_username || x.username || slug || "",
        title: x.title || x.session_title || ls?.session_title || ls?.title || "",
        game: x.category?.name || ls?.categories?.[0]?.name || ls?.category?.name || (x.categories?.[0]?.name) || "",
        viewers: x.viewer_count != null ? kickNum(x.viewer_count) : ls?.viewer_count != null ? kickNum(ls.viewer_count) : "",
        thumb: x.thumbnail?.src || x.thumbnail?.url || ls?.thumbnail?.url || ls?.thumbnail?.src || "",
        avatar: ch.profile_pic || ch.profile_picture || ch.user?.profilePic || x.profile_picture || x.user?.profile_pic || "",
        live: !!(x.is_live || x.isLive || ls?.is_live || x.viewer_count != null && x.title != null),
        followers: ch.followers_count ?? ch.followersCount ?? null,
    };
};
const KICK_LISTS = {
    async top() {
        const j = await kickFetch("https://web.kick.com/api/v1/livestreams?limit=30&sort=viewer_count_desc");
        return (j?.data?.livestreams || []).map(kickItem);
    },
    async search(q) {
        const j = await kickFetch(`https://kick.com/api/search?searched_word=${encodeURIComponent(q)}`);
        const chans = (Array.isArray(j?.channels) ? j.channels : []).map(kickItem);
        const seen = new Set();
        return chans.filter(x => x.slug && !seen.has(x.slug) && seen.add(x.slug))
            .sort((a, b) => (b.live - a.live) || ((b.followers || 0) - (a.followers || 0)));
    },
    async following() {
        const token = await kickToken();
        if (!token) throw new Error("not-logged-in");
        const j = await kickFetch("https://kick.com/api/v2/channels/followed", token);
        const arr = Array.isArray(j) ? j : j?.channels || j?.data || [];
        return arr.map(kickItem).sort((a, b) => b.live - a.live);
    },
};
ipcMain.handle("BT_KICK_LIST", async (e, kind, query) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const fn = KICK_LISTS[String(kind)];
    if (!fn) throw new Error("Unknown list");
    const q = String(query || "").trim().slice(0, 80);
    if (kind === "search" && !q) return { items: [] };
    const run = kickQueue.then(async () => ({ items: (await fn(q)).filter(x => /^[a-z0-9_-]{2,40}$/.test(x.slug)).slice(0, 40) }));
    kickQueue = run.catch(() => {});
    return run;
});
ipcMain.handle("BT_KICK_STATUS", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const token = await kickToken();
    if (!token) return { loggedIn: false, login: "" };
    try {
        const run = kickQueue.then(() => kickFetch("https://kick.com/api/v1/user", token));
        kickQueue = run.catch(() => {});
        const me = await run;
        return { loggedIn: true, login: me?.username || me?.streamer_channel?.slug || "" };
    } catch (err) {
        return { loggedIn: err.status !== 401, login: "" };
    }
});
let kickLoginWin = null;
ipcMain.handle("BT_KICK_LOGIN", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    if (await kickToken()) return true;
    if (kickLoginWin && !kickLoginWin.isDestroyed()) { kickLoginWin.focus(); throw new Error("The Kick login window is already open."); }
    const win = new electron.BrowserWindow({
        width: 520, height: 780, autoHideMenuBar: true, title: "Log in to Kick", backgroundColor: "#0b0e0f",
        parent: electron.BrowserWindow.fromWebContents(e.sender) || undefined,
        webPreferences: { partition: KICK_PARTITION, contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    kickLoginWin = win;
    win.webContents.setUserAgent(LAZY_UA);
    win.webContents.setWindowOpenHandler(() => ({ action: "allow", overrideBrowserWindowOptions: { parent: win, autoHideMenuBar: true, webPreferences: { partition: KICK_PARTITION, sandbox: true } } }));
    return new Promise((resolve, reject) => {
        let done = false;
        const ses = kickSession();
        const finish = (err, value) => {
            if (done) return;
            done = true;
            ses.cookies.removeListener("changed", onCookie);
            if (!win.isDestroyed()) win.close();
            kickLoginWin = null;
            if (kickWin && !kickWin.isDestroyed()) kickWin.lastLoad = 0;
            err ? reject(err) : resolve(value);
        };
        const onCookie = (_ev, cookie, _cause, removed) => {
            if (!removed && cookie.name === "session_token" && cookie.value) setTimeout(() => finish(null, true), 1500);
        };
        ses.cookies.on("changed", onCookie);
        win.on("closed", () => finish(new Error("Kick login window was closed.")));
        win.loadURL("https://kick.com/?login=true");
    });
});
ipcMain.handle("BT_KICK_LOGOUT", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    await kickSession().clearStorageData().catch(() => {});
    if (kickWin && !kickWin.isDestroyed()) kickWin.lastLoad = 0;
    return true;
});

const spotifyExe = () => {
    const candidates = [
        path.join(process.env.APPDATA || "", "Spotify", "Spotify.exe"),
        path.join(process.env.LOCALAPPDATA || "", "Microsoft", "WindowsApps", "Spotify.exe"),
    ];
    return candidates.find(p => { try { return fs.statSync(p).isFile(); } catch { return false; } }) || null;
};
const spotifyRunning = () => new Promise(resolve => {
    require("child_process").execFile("tasklist", ["/FI", "IMAGENAME eq Spotify.exe", "/NH"], { windowsHide: true }, (err, out) => {
        resolve(!err && /Spotify\.exe/i.test(String(out)));
    });
});
const launchSpotify = () => {
    const exe = spotifyExe();
    const { spawn } = require("child_process");
    if (exe) {
        spawn(exe, ["--minimized"], { detached: true, stdio: "ignore", windowsHide: true }).unref();
        return true;
    }
    spawn("explorer.exe", ["shell:AppsFolder\\SpotifyAB.SpotifyMusic_zpdnekdrzrea0!Spotify"], { detached: true, stdio: "ignore" }).unref();
    return true;
};
let spotifyKeepTimer = null;
let spotifyLaunchedAt = 0;
const spotifyKeepTick = async () => {
    if (await spotifyRunning()) return;
    if (Date.now() - spotifyLaunchedAt < 20_000) return;
    spotifyLaunchedAt = Date.now();
    try { launchSpotify(); } catch (err) { console.error("[Be Themer] couldn't start Spotify:", err); }
};
ipcMain.handle("BT_SPOTIFY_KEEPALIVE", (e, on) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    clearInterval(spotifyKeepTimer);
    spotifyKeepTimer = null;
    if (on) {
        spotifyKeepTick();
        spotifyKeepTimer = setInterval(spotifyKeepTick, 8000);
    }
    return !!on;
});
ipcMain.handle("BT_SPOTIFY_LAUNCH", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    if (await spotifyRunning()) return "running";
    spotifyLaunchedAt = Date.now();
    launchSpotify();
    return "launched";
});

ipcMain.handle("BT_SPOTIFY_COOKIE_TOKEN", async (e, rawCookie) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const spDc = String(rawCookie || "").trim().replace(/^sp_dc=/i, "").replace(/;.*$/, "").trim();
    if (!spDc) throw new Error("Paste your sp_dc cookie from open.spotify.com first.");
    const doFetch = electron.net && typeof electron.net.fetch === "function" ? electron.net.fetch.bind(electron.net) : fetch;
    const res = await doFetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player", {
        headers: {
            Cookie: `sp_dc=${spDc}`,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            "App-Platform": "WebPlayer",
            Accept: "application/json",
        },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.accessToken) {
        const anon = json.isAnonymous === true;
        throw new Error(anon ? "That sp_dc cookie is expired or wrong. Copy a fresh one from open.spotify.com while logged in."
            : `Spotify rejected the cookie login (HTTP ${res.status}).`);
    }
    return { accessToken: json.accessToken, expiresAt: Number(json.accessTokenExpirationTimestampMs) || Date.now() + 55 * 60_000 };
});

ipcMain.handle("BT_LYRICS", async (e, q) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const doFetch = electron.net && typeof electron.net.fetch === "function" ? electron.net.fetch.bind(electron.net) : fetch;
    const params = new URLSearchParams({ track_name: String(q?.track || ""), artist_name: String(q?.artist || "") });
    if (q?.album) params.set("album_name", String(q.album));
    if (q?.duration) params.set("duration", String(Math.round(Number(q.duration))));
    const headers = { "User-Agent": "BeThemer (https://github.com/hyperflore/Be-Themer)" };
    let res = await doFetch(`https://lrclib.net/api/get?${params}`, { headers });
    if (res.status === 404) {
        const sp = new URLSearchParams({ track_name: String(q?.track || ""), artist_name: String(q?.artist || "") });
        res = await doFetch(`https://lrclib.net/api/search?${sp}`, { headers });
        const list = res.ok ? await res.json().catch(() => []) : [];
        const hit = (Array.isArray(list) ? list : []).find(x => x.syncedLyrics) || (Array.isArray(list) ? list[0] : null);
        return hit ? { synced: hit.syncedLyrics || null, plain: hit.plainLyrics || null, instrumental: !!hit.instrumental } : null;
    }
    if (!res.ok) throw new Error(`Lyrics service answered HTTP ${res.status}`);
    const json = await res.json().catch(() => null);
    return json ? { synced: json.syncedLyrics || null, plain: json.plainLyrics || null, instrumental: !!json.instrumental } : null;
});

ipcMain.handle("BT_FETCH_IMAGE", async (e, rawUrl) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const url = new URL(String(rawUrl));
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http(s) links are supported.");

    const doFetch = electron.net && typeof electron.net.fetch === "function" ? electron.net.fetch.bind(electron.net) : fetch;
    const res = await doFetch(url.href, { redirect: "follow" });
    if (!res.ok) throw new Error(`The server answered HTTP ${res.status}.`);

    const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!type.startsWith("image/")) throw new Error("That link isn't a direct image link.");
    if (Number(res.headers.get("content-length") || 0) > MAX_IMAGE_BYTES) throw new Error("Image is larger than 40 MB.");

    const data = new Uint8Array(await res.arrayBuffer());
    if (data.byteLength > MAX_IMAGE_BYTES) throw new Error("Image is larger than 40 MB.");
    return { type, data };
});

const crypto = require("crypto");
const { execFile } = require("child_process");

const REC_DEFAULT_DIR = path.join(app.getPath("documents"), "Meow Recordings");
const REC_QUALITIES = new Set(["Medium", "High"]);
const WAV2MP3 = path.join(DATA_DIR, "tools", "wav2mp3.ps1");
const WAV2MP3_SOURCE = `param([string]$In, [string]$Out, [string]$Quality = "High")
# WAV -> MP3 with Windows' own Media Foundation encoder (WinRT MediaTranscoder). Written by Be Themer.
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$ext = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 }
function Await-Op($op, [Type]$type) {
    $m = ($ext | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1' })[0].MakeGenericMethod($type)
    $t = $m.Invoke($null, @($op)); $t.Wait(-1) | Out-Null; $t.Result
}
function Await-Progress($op, [Type]$progress) {
    $m = ($ext | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncActionWithProgress\`1' })[0].MakeGenericMethod($progress)
    $t = $m.Invoke($null, @($op)); $t.Wait(-1) | Out-Null
}
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFolder, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Transcoding.MediaTranscoder, Windows.Media.Transcoding, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.MediaProperties.MediaEncodingProfile, Windows.Media.MediaProperties, ContentType = WindowsRuntime] | Out-Null
$src = Await-Op ([Windows.Storage.StorageFile]::GetFileFromPathAsync($In)) ([Windows.Storage.StorageFile])
$folder = Await-Op ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync([System.IO.Path]::GetDirectoryName($Out))) ([Windows.Storage.StorageFolder])
$dst = Await-Op ($folder.CreateFileAsync([System.IO.Path]::GetFileName($Out), [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])
$profile = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateMp3([Windows.Media.MediaProperties.AudioEncodingQuality]::$Quality)
$tc = New-Object Windows.Media.Transcoding.MediaTranscoder
$prep = Await-Op ($tc.PrepareFileTranscodeAsync($src, $dst, $profile)) ([Windows.Media.Transcoding.PrepareTranscodeResult])
if (-not $prep.CanTranscode) { throw "Windows can't convert this file ($($prep.FailureReason))" }
Await-Progress ($prep.TranscodeAsync()) ([double])
"ok"
`;

const recordings = new Map();

const safeFileName = s =>
    String(s || "")
        .replace(/[\\/:*?"<>|\x00-\x1f]+/g, " ")
        .replace(/\s+/g, " ")
        .replace(/[. ]+$/, "")
        .trim()
        .slice(0, 120) || "Meow recording";
const freePath = (dir, base, ext) => {
    let p = path.join(dir, base + ext);
    for (let n = 2; fs.existsSync(p) || fs.existsSync(p.replace(/\.\w+$/, ".wav")); n++) p = path.join(dir, `${base} (${n})${ext}`);
    return p;
};
const recFolder = dir => (typeof dir === "string" && dir.trim() && path.isAbsolute(dir.trim()) ? path.resolve(dir.trim()) : REC_DEFAULT_DIR);
const wavHeader = (dataBytes, rate, channels) => {
    const h = Buffer.alloc(44);
    h.write("RIFF", 0);
    h.writeUInt32LE(Math.min(0xffffffff, 36 + dataBytes), 4);
    h.write("WAVE", 8);
    h.write("fmt ", 12);
    h.writeUInt32LE(16, 16);
    h.writeUInt16LE(1, 20);
    h.writeUInt16LE(channels, 22);
    h.writeUInt32LE(rate, 24);
    h.writeUInt32LE(rate * channels * 2, 28);
    h.writeUInt16LE(channels * 2, 32);
    h.writeUInt16LE(16, 34);
    h.write("data", 36);
    h.writeUInt32LE(Math.min(0xffffffff - 36, dataBytes), 40);
    return h;
};
const closeWav = r => {
    try {
        fs.writeSync(r.fd, wavHeader(r.bytes, r.rate, r.channels), 0, 44, 0);
    } finally {
        fs.closeSync(r.fd);
    }
};
const wavToMp3 = (wav, mp3, quality) =>
    new Promise((resolve, reject) => {
        if (process.platform !== "win32") return reject(new Error("MP3 conversion uses Windows' encoder"));
        try {
            fs.mkdirSync(path.dirname(WAV2MP3), { recursive: true });
            if (!fs.existsSync(WAV2MP3) || fs.readFileSync(WAV2MP3, "utf8") !== WAV2MP3_SOURCE) fs.writeFileSync(WAV2MP3, WAV2MP3_SOURCE);
        } catch (err) {
            return reject(err);
        }
        execFile(
            "powershell.exe",
            ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", WAV2MP3, "-In", wav, "-Out", mp3, "-Quality", REC_QUALITIES.has(quality) ? quality : "High"],
            { windowsHide: true, timeout: 30 * 60 * 1000 },
            (err, stdout, stderr) => {
                if (!err && /\bok\b/.test(stdout) && fs.existsSync(mp3) && fs.statSync(mp3).size > 0) return resolve();
                fs.rmSync(mp3, { force: true });
                reject(new Error(String(stderr || (err && err.message) || "Windows couldn't convert it").trim().split(/\r?\n/).filter(Boolean).pop()));
            },
        );
    });
const finishRecording = async r => {
    closeWav(r);
    if (!r.bytes) {
        fs.rmSync(r.wavPath, { force: true });
        return { empty: true };
    }
    try {
        await wavToMp3(r.wavPath, r.mp3Path, r.quality);
        fs.rmSync(r.wavPath, { force: true });
        return { path: r.mp3Path, format: "mp3", bytes: fs.statSync(r.mp3Path).size };
    } catch (err) {
        return { path: r.wavPath, format: "wav", bytes: fs.statSync(r.wavPath).size, error: err.message };
    }
};

ipcMain.handle("BT_REC_DEFAULT_DIR", e => (isHooked(e) ? REC_DEFAULT_DIR : null));

ipcMain.handle("BT_REC_START", (e, opts) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const { dir, name, rate, channels, quality } = opts || {};
    if (!Number.isInteger(rate) || rate < 8000 || rate > 192000 || ![1, 2].includes(channels)) throw new Error("Bad audio format");
    const folder = recFolder(dir);
    fs.mkdirSync(folder, { recursive: true });
    const mp3Path = freePath(folder, safeFileName(name), ".mp3");
    const wavPath = mp3Path.replace(/\.mp3$/i, ".wav");
    const fd = fs.openSync(wavPath, "w");
    fs.writeSync(fd, wavHeader(0, rate, channels));
    const id = crypto.randomUUID();
    const owner = e.sender;
    recordings.set(id, { fd, wavPath, mp3Path, bytes: 0, rate, channels, owner: owner.id, quality });
    owner.once("destroyed", () => {
        const r = recordings.get(id);
        if (!r) return;
        recordings.delete(id);
        finishRecording(r).catch(() => {});
    });
    return { id, folder, file: mp3Path };
});

ipcMain.on("BT_REC_CHUNK", (e, id, data) => {
    const r = recordings.get(id);
    if (!r || r.owner !== e.sender.id || !data || typeof data.byteLength !== "number") return;
    const buf = Buffer.from(data.buffer || data, data.byteOffset || 0, data.byteLength);
    if (r.bytes + buf.length > 0xffffffff - 36) return;
    fs.writeSync(r.fd, buf);
    r.bytes += buf.length;
});

ipcMain.handle("BT_REC_STOP", (e, id) => {
    const r = recordings.get(id);
    if (!r || r.owner !== e.sender.id) throw new Error("That recording isn't running.");
    recordings.delete(id);
    return finishRecording(r);
});

const OWL_DEFAULT_DIR = path.join(app.getPath("videos"), "Owlie Recordings");
const owlFolder = dir => (typeof dir === "string" && dir.trim() && path.isAbsolute(dir.trim()) ? path.resolve(dir.trim()) : OWL_DEFAULT_DIR);
const owlRecordings = new Map();
ipcMain.handle("BT_OWL_SOURCES", async e => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const list = await electron.desktopCapturer.getSources({ types: ["screen", "window"], thumbnailSize: { width: 320, height: 180 }, fetchWindowIcons: false });
    return list
        .filter(src => src.name && !/^(Be Themer|Discord)$/i.test(src.name) || src.id.startsWith("screen:"))
        .map(src => ({ id: src.id, name: src.name, screen: src.id.startsWith("screen:"), thumb: src.thumbnail && !src.thumbnail.isEmpty() ? src.thumbnail.toDataURL() : "" }));
});
ipcMain.handle("BT_OWL_START", (e, opts) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const ext = opts?.ext === "mp4" ? ".mp4" : ".webm";
    const folder = owlFolder(opts?.dir);
    fs.mkdirSync(folder, { recursive: true });
    const file = freePath(folder, safeFileName(String(opts?.name || "Owlie recording")), ext);
    const fd = fs.openSync(file, "w");
    const id = crypto.randomUUID();
    const owner = e.sender;
    owlRecordings.set(id, { fd, file, bytes: 0, owner: owner.id });
    owner.once("destroyed", () => { const r = owlRecordings.get(id); if (r) { owlRecordings.delete(id); try { fs.closeSync(r.fd); } catch {} } });
    return { id, file, folder };
});
ipcMain.on("BT_OWL_CHUNK", (e, id, data) => {
    const r = owlRecordings.get(id);
    if (!r || r.owner !== e.sender.id || !data || typeof data.byteLength !== "number") return;
    const buf = Buffer.from(data.buffer || data, data.byteOffset || 0, data.byteLength);
    try { fs.writeSync(r.fd, buf); r.bytes += buf.length; } catch (err) { console.error("[Be Themer] Owlie write:", err); }
});
ipcMain.handle("BT_OWL_STOP", (e, id) => {
    if (!isHooked(e)) throw new Error("Not allowed");
    const r = owlRecordings.get(id);
    if (!r) return null;
    owlRecordings.delete(id);
    try { fs.closeSync(r.fd); } catch {}
    if (!r.bytes) { try { fs.rmSync(r.file, { force: true }); } catch {} return { file: null, bytes: 0 }; }
    return { file: r.file, bytes: r.bytes };
});
ipcMain.handle("BT_OWL_PICK_DIR", async (e, current) => {
    if (!isHooked(e)) return null;
    const res = await electron.dialog.showOpenDialog(electron.BrowserWindow.fromWebContents(e.sender), {
        title: "Choose where Owlie saves recordings", defaultPath: owlFolder(current), properties: ["openDirectory", "createDirectory", "promptToCreate"],
    });
    return res.canceled || !res.filePaths[0] ? null : res.filePaths[0];
});
ipcMain.handle("BT_OWL_OPEN", (e, dir, file) => {
    if (!isHooked(e)) return false;
    if (file && owlFolder(dir) === path.dirname(path.resolve(String(file))) && fs.existsSync(file)) { shell.showItemInFolder(path.resolve(String(file))); return true; }
    const folder = owlFolder(dir);
    fs.mkdirSync(folder, { recursive: true });
    shell.openPath(folder);
    return true;
});
ipcMain.handle("BT_OWL_DEFAULT_DIR", e => (isHooked(e) ? OWL_DEFAULT_DIR : null));

ipcMain.handle("BT_REC_PICK_DIR", async (e, current) => {
    if (!isHooked(e)) return null;
    const win = electron.BrowserWindow.fromWebContents(e.sender);
    const res = await electron.dialog.showOpenDialog(win, {
        title: "Choose where Meow saves recordings",
        defaultPath: recFolder(current),
        properties: ["openDirectory", "createDirectory", "promptToCreate"],
    });
    return res.canceled || !res.filePaths[0] ? null : res.filePaths[0];
});

ipcMain.handle("BT_REC_OPEN_DIR", (e, dir) => {
    if (!isHooked(e)) return "Not allowed";
    const folder = recFolder(dir);
    fs.mkdirSync(folder, { recursive: true });
    return shell.openPath(folder);
});

ipcMain.handle("BT_REC_SHOW", (e, file) => {
    if (!isHooked(e) || typeof file !== "string" || !path.isAbsolute(file) || !/\.(mp3|wav)$/i.test(file) || !fs.existsSync(file)) return false;
    shell.showItemInFolder(path.resolve(file));
    return true;
});

ipcMain.handle("BT_REC_LIST", (e, dir) => {
    if (!isHooked(e)) return [];
    const folder = recFolder(dir);
    try {
        return fs
            .readdirSync(folder)
            .filter(f => /\.(mp3|wav)$/i.test(f))
            .map(f => {
                const st = fs.statSync(path.join(folder, f));
                return { name: f, path: path.join(folder, f), bytes: st.size, at: st.mtimeMs };
            })
            .sort((a, b) => b.at - a.at)
            .slice(0, 50);
    } catch {
        return [];
    }
});

function debounce(fn, ms) {
    let t;
    return (...a) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...a), ms);
    };
}

function watchSafe(target, onChange) {
    try {
        fs.watch(target, { persistent: false }, onChange);
    } catch (err) {
        console.warn("[Be Themer] can't watch", target, err.message);
    }
}

const broadcast = channel => {
    for (const wc of electron.webContents.getAllWebContents()) {
        if (hookedWindows.has(wc.id) && !wc.isDestroyed()) wc.send(channel);
    }
};

app.whenReady().then(() => {
    const themesChanged = debounce(() => broadcast("BT_THEMES_CHANGED"), 150);
    const pluginsChanged = debounce(() => broadcast("BT_PLUGINS_CHANGED"), 200);
    const rendererChanged = debounce(() => broadcast("BT_RENDERER_CHANGED"), 300);

    const ext = (file, e) => !file || String(file).toLowerCase().endsWith(e);
    watchSafe(BUNDLED_THEMES, (_ev, file) => ext(file, ".css") && themesChanged());
    watchSafe(USER_THEMES, (_ev, file) => ext(file, ".css") && themesChanged());
    watchSafe(USER_PLUGINS, (_ev, file) => ext(file, ".js") && pluginsChanged());
    watchSafe(DATA_DIR, (_ev, file) => file === "quickcss.css" && themesChanged());
    watchSafe(HERE, (_ev, file) => file === "renderer.js" && rendererChanged());
});

function relaxCsp(headers) {
    for (const name of Object.keys(headers)) {
        if (name.toLowerCase() !== "content-security-policy") continue;
        const values = [].concat(headers[name]);
        headers[name] = values.map(policy => {
            const directives = new Map();
            for (const part of String(policy).split(";")) {
                const [key, ...vals] = part.trim().split(/\s+/);
                if (key && !directives.has(key)) directives.set(key, vals);
            }
            const add = (key, ...vals) => {
                if (!directives.has(key)) {
                    if (!directives.has("default-src")) return;
                    directives.set(key, [...directives.get("default-src")]);
                }
                const list = directives.get(key);
                for (const v of vals) if (!list.includes(v)) list.push(v);
            };
            add("script-src", "'unsafe-eval'");
            add("img-src", "blob:", "data:", "https://i.ytimg.com", "https://*.ggpht.com", "https://yt3.googleusercontent.com", "https://imgs.search.brave.com", "https://icons.duckduckgo.com", "https://static-cdn.jtvnw.net", "https://images.kick.com", "https://files.kick.com", "https://*.scdn.co", "https://*.spotifycdn.com");
            add("frame-src", "https://www.youtube.com", "https://www.youtube-nocookie.com", "https://player.twitch.tv", "https://www.twitch.tv", "https://clips.twitch.tv", "https://player.kick.com", "https://kick.com");
            add("media-src", "blob:", "data:");
            return [...directives].map(([k, v]) => [k, ...v].join(" ")).join("; ");
        });
    }
    return headers;
}

const globToRegExp = pattern =>
    new RegExp(`^${String(pattern).replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

function matchesUrlPattern(pattern, url) {
    if (pattern === "<all_urls>") return true;
    const m = /^(\*|[a-z][\w+.-]*):\/\/([^/]*)(\/.*)?$/i.exec(String(pattern));
    if (!m) return true;
    let u;
    try {
        u = new URL(url);
    } catch {
        return false;
    }
    const [, scheme, hostPort, pathPattern = "/*"] = m;
    const protocol = u.protocol.slice(0, -1);
    if (scheme === "*" ? !/^(https?|wss?)$/.test(protocol) : scheme.toLowerCase() !== protocol) return false;
    const [host, port] = hostPort.split(":");
    if (port && port !== "*" && port !== u.port) return false;
    if (host !== "*") {
        if (host.startsWith("*.")) {
            const base = host.slice(2).toLowerCase();
            if (u.hostname !== base && !u.hostname.endsWith(`.${base}`)) return false;
        } else if (host.toLowerCase() !== u.hostname) return false;
    }
    return globToRegExp(pathPattern).test(u.pathname + u.search);
}

function installCspPatch() {
    const webRequest = electron.session.defaultSession.webRequest;
    const register = webRequest.onHeadersReceived.bind(webRequest);
    let discord = null;

    register((details, callback) => {
        const finish = (response = {}) => {
            if (response.cancel) return callback(response);
            const headers = response.responseHeaders || details.responseHeaders || {};
            callback({ ...response, responseHeaders: relaxCsp(headers) });
        };
        const urls = discord && discord.filter && discord.filter.urls;
        if (discord && (!urls || !urls.length || urls.some(p => matchesUrlPattern(p, details.url)))) {
            try {
                discord.listener(details, finish);
            } catch (err) {
                console.error("[Be Themer] Discord's header listener threw:", err);
                finish();
            }
        } else finish();
    });

    webRequest.onHeadersReceived = (filterOrListener, maybeListener) => {
        if (filterOrListener === null || maybeListener === null) discord = null;
        else if (typeof filterOrListener === "function") discord = { filter: null, listener: filterOrListener };
        else discord = { filter: filterOrListener, listener: maybeListener };
    };
}

app.whenReady().then(() => {
    try {
        installCspPatch();
    } catch (err) {
        console.error("[Be Themer] couldn't adjust the Content-Security-Policy:", err);
    }
});

function persistAcrossUpdates() {
    if (process.platform !== "win32" || !process.resourcesPath) return;
    let ofs;
    try {
        ofs = require("original-fs");
    } catch {
        return;
    }
    const resources = process.resourcesPath;
    if (!shim.isShim(path.join(resources, "app.asar"), ofs)) return;

    const appDir = path.dirname(resources);
    const root = path.dirname(appDir);
    let dirs = [];
    try {
        dirs = ofs.readdirSync(root);
    } catch {
        return;
    }
    for (const dir of dirs) {
        if (!/^app-\d/.test(dir) || shim.compareVersions(dir, path.basename(appDir)) <= 0) continue;
        const res = path.join(root, dir, "resources");
        const asar = path.join(res, "app.asar");
        const orig = path.join(res, shim.ORIGINAL_NAME);
        try {
            if (!ofs.existsSync(asar) || ofs.existsSync(orig) || ofs.existsSync(path.join(res, "_app.asar"))) continue;
            if (shim.isShim(asar, ofs)) continue;
            const pkg = shim.readAsarFile(asar, "package.json", ofs).toString("utf8");
            const loader = shim.buildShim(pkg, __filename);
            ofs.renameSync(asar, orig);
            ofs.writeFileSync(asar, loader);
            console.log(`[Be Themer] carried over to Discord ${dir}`);
        } catch (err) {
            console.error(`[Be Themer] couldn't carry over to ${dir}:`, err);
        }
    }
}

app.whenReady().then(persistAcrossUpdates);
app.on("will-quit", persistAcrossUpdates);

console.log(`[Be Themer] v${BUILD_INFO.version} main loaded. Data: ${DATA_DIR}`);
