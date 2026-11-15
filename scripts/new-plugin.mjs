import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const builtin = args.includes("--builtin");
const name = args.filter(a => !a.startsWith("--")).join(" ").trim();

if (!name) {
    console.error('Usage: npm run new-plugin -- "My Plugin" [--builtin]');
    process.exit(1);
}

const words = name.replace(/[^A-Za-z0-9 ]+/g, " ").trim().split(/\s+/);
const id = words.map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w[0].toLowerCase() + w.slice(1))).join("");
if (!/^[A-Za-z][\w-]{0,63}$/.test(id)) {
    console.error(`Can't make a plugin id out of "${name}". Use letters and digits, starting with a letter.`);
    process.exit(1);
}

function dataDir() {
    if (process.platform === "win32") return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "B-Themer");
    if (process.platform === "darwin") return path.join(os.homedir(), "Library", "Application Support", "B-Themer");
    return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "B-Themer");
}

const dir = builtin ? path.join(ROOT, "src", "plugins") : path.join(dataDir(), "plugins");
const file = path.join(dir, `${id}.js`);
if (fs.existsSync(file)) {
    console.error(`${file} already exists.`);
    process.exit(1);
}

const typesPath = path.join(ROOT, "types", "b-themer.d.ts").replaceAll("\\", "/");
const source = fs
    .readFileSync(path.join(ROOT, "templates", "plugin.js"), "utf8")
    .replaceAll("__TYPES_PATH__", typesPath)
    .replaceAll("__PLUGIN_ID__", id)
    .replaceAll("__PLUGIN_NAME__", name)
    .replaceAll("__PLUGIN_AUTHOR__", "you");

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(file, source);

console.log(`\x1b[32m✔\x1b[0m Created ${file}`);
console.log(
    builtin
        ? "  Run `npm run build` (or keep `npm run dev` running), then press Ctrl+R in Discord."
        : "  It loads into Discord right away. Saving the file reloads it. Enable it in Ctrl+Alt+B → Plugins."
);
