const fs = require("fs");
const os = require("os");
const path = require("path");
const Module = require("module");
const ROOT = process.argv[2] || path.resolve(__dirname, "..");

const results = [];
const ok = (name, cond, extra = "") => results.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);

const windows = new Map();
let nextId = 1;
class BrowserWindow {
    constructor(options = {}) {
        this.id = nextId++;
        this.options = options;
        this.minimized = false;
        this.webContents = { id: this.id, once() {}, on() {}, reload() {}, toggleDevTools() {} };
        windows.set(this.id, this);
    }
    minimize() { this.minimized = true; }
    static fromId(id) {
        const win = windows.get(id);
        return win && win.constructor.name === "BrowserWindow" ? win : null;
    }
    static getAllWindows() {
        return [...windows.values()].filter(w => w.constructor.name === "BrowserWindow");
    }
}
const noop = () => {};
const fakeElectron = {
    BrowserWindow,
    app: { getPath: () => os.tmpdir(), on: noop, whenReady: () => new Promise(noop), getVersion: () => "0", setAppPath: noop },
    ipcMain: { handle: noop, on: noop, removeHandler: noop },
    session: { defaultSession: { webRequest: { onHeadersReceived: noop } } },
    protocol: {},
    shell: { openPath: () => Promise.resolve(""), openExternal: () => Promise.resolve() },
    dialog: {},
};

const data = fs.mkdtempSync(path.join(os.tmpdir(), "bt-main-test-"));
process.env.BTHEMER_DATA_DIR = data;
const load = Module._load;
Module._load = function (request, ...rest) {
    if (request === "electron" || request === "original-fs") return request === "electron" ? fakeElectron : fs;
    return load.call(this, request, ...rest);
};

try {
    require(path.join(ROOT, "dist", "main.js"));
    const discordsElectron = Module._load("electron", module, false);
    const DiscordBrowserWindow = discordsElectron.BrowserWindow;
    ok("main: Discord gets Be Themer's window class", DiscordBrowserWindow !== BrowserWindow && Object.getPrototypeOf(DiscordBrowserWindow) === BrowserWindow);
    const win = new DiscordBrowserWindow({ webPreferences: { preload: path.join(data, "discord-preload.js") } });
    ok("main: its windows are BrowserWindows to Electron (constructor.name)", win.constructor.name === "BrowserWindow");
    const found = DiscordBrowserWindow.fromId(win.id);
    ok("main: BrowserWindow.fromId finds Discord's window (minimise / maximise / close work)", found === win);
    found && found.minimize();
    ok("main: so minimise reaches the window", win.minimized === true);
    ok("main: getAllWindows lists it", DiscordBrowserWindow.getAllWindows().includes(win));
    ok("main: the window loads Be Themer's preload", /preload\.js$/.test(win.options.webPreferences.preload) && win.options.webPreferences.preload !== path.join(data, "discord-preload.js"));
} catch (e) {
    ok("main: loads against a fake Electron", false, e && e.stack);
} finally {
    Module._load = load;
    fs.rmSync(data, { recursive: true, force: true });
}

console.log(results.join("\n"));
console.log(`\n${results.filter(r => r.startsWith("PASS")).length}/${results.length} passed`);
process.exit(results.some(r => r.startsWith("FAIL")) ? 1 : 0);
