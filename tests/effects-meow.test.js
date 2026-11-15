const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = process.argv[2] || path.resolve(__dirname, "..");
const { variantFor } = require("./variant");
const V = variantFor(ROOT);
const renderer = fs.readFileSync(`${ROOT}/dist/renderer.js`, "utf8");
const theme = fs.readFileSync(`${ROOT}/themes/b-themer.theme.css`, "utf8");

const results = [];
const ok = (name, cond, extra = "") => results.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
class Sheet { constructor() { this.text = ""; this.disabled = false; } replaceSync(t) { this.text = t; } }

function fakeIndexedDB() {
    const data = new Map();
    return {
        open() {
            const req = {};
            const db = {
                createObjectStore() {},
                transaction() {
                    const t = {};
                    const done = () => setTimeout(() => t.oncomplete && t.oncomplete());
                    const store = {
                        get: k => (done(), { result: data.get(k) }),
                        put: (v, k) => (data.set(k, v), done(), { result: k }),
                        delete: k => (data.delete(k), done(), {}),
                    };
                    t.objectStore = () => store;
                    return t;
                },
            };
            setTimeout(() => {
                req.result = db;
                req.onupgradeneeded && req.onupgradeneeded();
                req.onsuccess && req.onsuccess();
            });
            return req;
        },
        data,
    };
}

(async () => {
    const errors = [];
    const vc = new VirtualConsole();
    vc.on("jsdomError", e => { if (!/Not implemented/.test(String(e.message))) errors.push(String(e.stack || e.message)); });
    const html = `<!doctype html><html><head><title>Discord | #general | Home</title></head><body>
      <nav class="guilds_x"></nav>
      <section class="panels_x"><div class="actionButtons_x">
        <button class="button_x" aria-label="Camera"><svg width="20" height="20"><path d="M0 0"/></svg></button>
        <button class="button_x" aria-label="Soundboard"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M1 1"/></svg></button>
      </div></section></body></html>`;
    const dom = new JSDOM(html, { url: "https://discord.com/channels/111111/1", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc });
    const w = dom.window;
    w.CSSStyleSheet = Sheet;
    let adopted = [];
    Object.defineProperty(w.document, "adoptedStyleSheets", { get: () => adopted, set: v => (adopted = [...v]) });
    const drawn = new Set();
    w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => drawn.add(String(k))), set: (t, k, v) => ((t[k] = v), true) });
    w.HTMLMediaElement.prototype.play = function () { w.__played = (w.__played || 0) + 1; return Promise.resolve(); };
    w.HTMLMediaElement.prototype.pause = () => {};
    w.URL.createObjectURL = () => "blob:https://discord.com/test";
    w.URL.revokeObjectURL = () => {};
    w.createImageBitmap = async () => ({ width: 7680, height: 4320, close() {} });
    w.HTMLCanvasElement.prototype.toBlob = function (cb, type, q) { w.__wallCanvas = { w: this.width, h: this.height, type, q }; cb(new w.Blob([new Uint8Array(900000)], { type })); };
    Object.defineProperty(w.HTMLMediaElement.prototype, "duration", { configurable: true, get: () => 2 });
    Object.defineProperty(w.HTMLMediaElement.prototype, "src", {
        configurable: true,
        get() { return this._src || ""; },
        set(v) { this._src = v; setTimeout(() => this.onloadedmetadata && this.onloadedmetadata()); },
    });
    const idb = fakeIndexedDB();
    w.indexedDB = idb;
    idb.data.set("wallpaper", new w.Blob([new Uint8Array(7 * 1024 * 1024)], { type: "image/png" }));
    for (const [k, v] of [["library", { boards: [{ id: "main" }], sounds: [{ id: "old1" }] }], ["sounds", []], ["okGuilds", ["1"]], ["audio:old1", "blob"], ["audio-discord:old1", "blob"]]) idb.data.set(`plugin:meowSoundboard:${k}`, v);

    const requests = [];
    let failSend = null;
    w.fetch = async (url, init = {}) => {
        const body = init.body ? JSON.parse(init.body) : null;
        requests.push({ method: init.method || "GET", url: String(url), body, auth: init.headers && init.headers.Authorization });
        const reply = (status, data) => ({ ok: status < 300, status, text: async () => JSON.stringify(data) });
        if (/\/soundboard-sounds$/.test(url)) return reply(200, { sound_id: "999", name: body.name });
        if (/send-soundboard-sound$/.test(url)) return failSend ? reply(403, failSend) : reply(204, null);
        if (/\/messages$/.test(url)) return reply(200, { id: "m1" });
        return reply(404, { message: "Unknown" });
    };
    w.BThemerNative = {
        getState: () => ({ version: "t", dataDir: "", quickCss: "", themes: [{ file: "b-themer.theme.css", source: "bundled", css: theme, name: "B" }], settings: { plugins: { screenEffects: { enabled: true, settings: { pauseUnfocused: false } }, meowSoundboard: { enabled: true, settings: { homeGuild: "1", volume: 50 } } } } }),
        setSettings: () => Promise.resolve(true), setQuickCss: () => Promise.resolve(true),
        openPath: () => Promise.resolve(""), fetchImage: () => Promise.reject(new Error("x")),
        reloadPlugins: () => {}, onThemesChanged: () => {}, onRendererChanged: () => {},
    };
    const native = { started: [], chunks: [], stopped: [], picked: null };
    Object.assign(w.BThemerNative, {
        recDefaultDir: () => Promise.resolve("C:\\Users\\me\\Documents\\Meow Recordings"),
        recStart: o => (native.started.push(o), Promise.resolve({ id: `rec${native.started.length}`, folder: "C:\\x", file: `C:\\x\\${o.name}.mp3` })),
        recChunk: (id, data) => native.chunks.push({ id, data }),
        recStop: id => (native.stopped.push(id), Promise.resolve({ path: `C:\\x\\${native.started.at(-1).name}.mp3`, format: "mp3", bytes: 123456 })),
        recPickDir: () => Promise.resolve("D:\\Calls"),
        recOpenDir: dir => (native.opened = dir, Promise.resolve("")),
        recShow: f => (native.shown = f, Promise.resolve(true)),
        recList: () => Promise.resolve([{ name: "VALO - Home - 2026-11-13 15.00.mp3", path: "C:\\x\\a.mp3", bytes: 2400000, at: Date.now() }]),
    });
    const css = () => w.document.adoptedStyleSheets.filter(s => !s.disabled).map(s => s.text).join("\n");

    w.eval(renderer);
    w.eval(`
      (() => {
        const modules = {}, cache = {};
        const req = id => { if (cache[id]) return cache[id].exports; const m = (cache[id] = { exports: {} }); modules[id].call(m.exports, m, m.exports, req); return m.exports; };
        const jsonp = (parent, data) => { for (const k in data[1]) modules[k] = data[1][k]; if (parent) parent(data); };
        const g = (self.webpackChunkdiscord_app = self.webpackChunkdiscord_app || []);
        g.forEach(jsonp.bind(null, 0));
        g.push = jsonp.bind(null, g.push.bind(g));
        window.__req = req;
      })();
      (self.webpackChunkdiscord_app = self.webpackChunkdiscord_app || []).push([[1], {
        30: function (e, t) {
          class Store { constructor(n) { this.n = n; } getName() { return this.n; } }
          const guilds = { 111111: { id: "111111", name: "Home" }, 222222: { id: "222222", name: "Elsewhere" } };
          window.__voice = null;
          Object.assign(t, {
            Token: { getToken: () => "user-token", setToken() {} }, // the multi-account module: not the one to use
            AuthenticationStore: Object.assign(new Store("AuthenticationStore"), { getToken: () => "auth-token" }),
            Http: (() => {
                const call = m => o => {
                    if (window.__httpOff) return Promise.reject(new TypeError("client not ready"));
                    (window.__http = window.__http || []).push([m, o]);
                    if (o.url === "/fail") return Promise.reject({ status: 403, body: { message: "Missing Permissions" } });
                    return Promise.resolve({ ok: true, status: 200, body: { via: "discord", url: o.url } });
                };
                return { getAPIBaseURL: () => "https://discord.com/api/v9", get: call("get"), post: call("post"), put: call("put"), patch: call("patch"), del: call("del") };
            })(),
            MessageActions: { sendMessage: (c, m) => ((window.__sent = window.__sent || []).push([c, m]), Promise.resolve({})), editMessage() {}, deleteMessage() {} },
            GuildStore: Object.assign(new Store("GuildStore"), { getGuilds: () => guilds, getGuild: id => guilds[id] || null }),
            SelectedChannelStore: Object.assign(new Store("SelectedChannelStore"), { getVoiceChannelId: () => window.__voice, getChannelId: () => "1" }),
            ChannelStore: Object.assign(new Store("ChannelStore"), { getChannel: id => ({ id, guild_id: id === "7" ? "222222" : "111111" }) }),
            UserStore: Object.assign(new Store("UserStore"), { getCurrentUser: () => ({ id: "77" }) }),
            Dispatcher: (() => { const subs = {}; return { _subscriptions: subs, register() {}, dispatch(a) { (subs[a.type] || []).forEach(fn => fn(a)); }, subscribe(t, fn) { (subs[t] = subs[t] || []).push(fn); }, unsubscribe(t, fn) { subs[t] = (subs[t] || []).filter(x => x !== fn); } }; })(),
            MediaEngineStore: Object.assign(new Store("MediaEngineStore"), {
                isSelfMute: () => !!window.__muted, isSelfDeaf: () => false,
                getInputDeviceId: () => "{0.0.1.00000000}.{razer}", // Discord's own (native) id: not the page's
                getInputDevices: () => ({ "{0.0.1.00000000}.{razer}": { id: "{0.0.1.00000000}.{razer}", name: "Headset Mic (Razer)" } }),
            }),
          });
        },
      }]);
    `);
    w.__req(30);
    const B = w.BThemer;
    await sleep(80);
    const list = () => Object.fromEntries(B.plugins.list().map(p => [p.id, p]));
    const D = w.__req(30).Dispatcher;

    const wall = idb.data.get("wallpaper");
    ok("wallpaper: no size limit: a big picture is kept exactly as it is", wall && wall.type === "image/png" && wall.size === 7 * 1024 * 1024 && !w.__wallCanvas);

    if (V.featureOn("splash")) {
        Object.defineProperty(w.HTMLImageElement.prototype, "src", {
            configurable: true,
            get() { return this._src || ""; },
            set(v) { this._src = v; setTimeout(() => this.dispatchEvent(new w.Event("load"))); },
        });
        idb.data.set("splash", new w.Blob([new Uint8Array(5000)], { type: "image/gif" }));
        Object.assign(B.settings, { splashStyle: "media", splashMediaName: "cat.gif", splashDim: 40, splashFit: "contain" });
        B.open("splash");
        await sleep(40);
        const spPage = w.document.getElementById("bt-window");
        ok("splash page: shows your picture or video's name, with Remove", /cat\.gif/.test(spPage.querySelector(".bt-splash-status").textContent) && [...spPage.querySelectorAll(".bt-b")].some(b => b.textContent === "Remove it"));
        [...spPage.querySelectorAll(".bt-b")].find(b => b.textContent === "Preview").click();
        await sleep(80);
        const spl = w.document.getElementById("bt-splash");
        const splMedia = spl && spl.querySelector("img.bt-sp-media");
        ok("splash: your picture (GIF) fills the background, darkened as you set", spl && spl.dataset.style === "media" && splMedia && /^blob:/.test(splMedia.src) && spl.style.getPropertyValue("--sp-dim") === "0.4" && spl.style.getPropertyValue("--sp-fit") === "contain");
        spl.click();
        await sleep(600);
        B.settings.splashStyle = "wallpaper";
        [...spPage.querySelectorAll(".bt-b")].find(b => b.textContent === "Preview").click();
        await sleep(80);
        const wallSplash = w.document.getElementById("bt-splash");
        ok("splash: My wallpaper uses your wallpaper as it is", wallSplash && wallSplash.dataset.style === "media" && wallSplash.querySelector("img.bt-sp-media") && /^blob:/.test(wallSplash.querySelector("img.bt-sp-media").src));
        wallSplash.click();
        await sleep(600);
        const splashPick = [...w.document.querySelectorAll('input[type="file"]')].find(i => /^image\/\*,video/.test(i.accept));
        const bitmapBefore = w.createImageBitmap;
        w.createImageBitmap = async () => ({ width: 400, height: 225, close() {} });
        Object.defineProperty(splashPick, "files", { value: [new w.File([new Uint8Array(3000)], "25523.jpg", { type: "image/jpeg" })], configurable: true });
        w.document.querySelectorAll(".bt-toast").forEach(x => x.remove());
        splashPick.dispatchEvent(new w.Event("change"));
        await sleep(80);
        const warnText = [...w.document.querySelectorAll(".bt-toast")].map(x => x.textContent).join(" | ");
        ok("splash: warns when a picture is too small for the screen (it would look blurry)", /only 400×225, so it will look blurry/.test(warnText) && B.settings.splashMediaName === "25523.jpg" && B.settings.splashStyle === "media", warnText);
        B.open("splash");
        await sleep(80);
        const lowNote = w.document.querySelector("#bt-window .bt-splash-lowres");
        ok("splash page: says plainly the picture is too small, offers the wallpaper", lowNote && !lowNote.hidden && /only 400×225/.test(lowNote.textContent) && [...lowNote.querySelectorAll(".bt-b")].some(b => b.textContent === "Use my wallpaper instead"), lowNote && lowNote.outerHTML);
        [...lowNote.querySelectorAll(".bt-b")].find(b => b.textContent === "Use my wallpaper instead").click();
        await sleep(20);
        ok("splash page: Use my wallpaper instead switches the splash to your wallpaper", B.settings.splashStyle === "wallpaper" && lowNote.hidden);
        ok("splash: choosing a picture yourself means it's kept, even if small", B.settings.splashLowResSwitched === true);
        B.settings.splashStyle = "media";
        delete B.settings.splashLowResSwitched;
        w.document.querySelectorAll(".bt-toast").forEach(x => x.remove());
        [...w.document.querySelectorAll("#bt-window .bt-b")].find(b => b.textContent === "Preview").click();
        await sleep(120);
        const switched = w.document.querySelector("#bt-splash:not(.bt-out)");
        const switchToast = [...w.document.querySelectorAll(".bt-toast")].map(x => x.textContent).join(" | ");
        ok("splash: a picture too small to look sharp switches to the Discord logo screen (once)", B.settings.splashStyle === "clyde" && B.settings.splashLowResSwitched === true && switched && switched.dataset.style === "clyde" && !switched.querySelector(".bt-sp-media") && /only 400×225, so it looked blurry/.test(switchToast), JSON.stringify({ style: B.settings.splashStyle, switchToast }));
        ok("splash: screen effects never draw over the splash (reconnects, Preview)", css().includes("html:has(#bt-splash) :is(#bt-petals, #bt-fx, .bt-pet, .bt-meow-recbar) { display: none !important; }"));
        switched.click();
        await sleep(600);
        w.createImageBitmap = bitmapBefore;
        B.settings.splashStyle = "media";
        w.document.getElementById("bt-window")?.remove();
        B.open("splash");
        await sleep(40);
        [...w.document.getElementById("bt-window").querySelectorAll(".bt-b")].find(b => b.textContent === "Remove it").click();
        await sleep(40);
        ok("splash page: Remove it deletes the picture and goes back to the Discord logo screen", !idb.data.has("splash") && B.settings.splashStyle === "clyde" && !B.settings.splashMediaName);
        w.document.getElementById("bt-window")?.remove();

        if (V.hasPlugin("screenEffects")) {
    }
        ok("effects: plugin running with a canvas", list().screenEffects && list().screenEffects.running && !!w.document.getElementById("bt-fx"));
        ok("effects: hidden on Discord's loading screen (petals, effects, cursor pet, Meow)", css().includes("html[data-bt-loading] :is(#bt-petals, #bt-fx, .bt-pet, .bt-meow-recbar) { display: none !important; }"));
        const fx = B.settings.plugins.screenEffects.settings;
        const EFFECTS = ["snow", "stars", "warp", "fireflies", "bubbles", "confetti", "hearts", "rain", "storm", "matrix", "leaves", "embers", "bokeh", "none"];
        const TRAILS = ["sparkles", "stars", "hearts", "rainbow", "bubbles", "fire"];
        const BURSTS = ["fireworks", "hearts", "confetti", "ripple"];
        for (const [i, effect] of EFFECTS.entries()) {
            fx.effect = effect;
            fx.colors = ["natural", "accent", "rainbow", "custom"][i % 4];
            fx.trail = TRAILS[i % TRAILS.length];
            fx.burst = BURSTS[i % BURSTS.length];
            await sleep(40);
            for (let k = 0; k < 6; k++) w.dispatchEvent(new w.MouseEvent("pointermove", { clientX: 100 + k * 9, clientY: 120 }));
            w.dispatchEvent(new w.MouseEvent("pointerdown", { clientX: 200, clientY: 200, button: 0 }));
            await sleep(50);
        }
        ok("effects: all 14 effects, 6 trails and 4 bursts draw without errors", errors.length === 0, errors[0] || "");
        ok("effects: really drew (circles, glyphs, rectangles, lines, curves)", ["arc", "fillText", "fillRect", "lineTo", "bezierCurveTo", "quadraticCurveTo"].every(m => drawn.has(m)), [...drawn].join(","));
        B.open("general");
        await sleep(30);
        const shortcuts = [...w.document.querySelectorAll(".bt-quick-actions button")].map(b => b.textContent);
        ok("effects: pause / resume in Shortcuts", shortcuts.includes("Pause / resume screen effects"), shortcuts.join(" | "));
        w.document.getElementById("bt-window")?.remove();
        const nav = w.document.querySelector("nav");
        nav.remove();
        w.document.documentElement.setAttribute("data-bt-loading", "");
        await sleep(40);
        drawn.clear();
        await sleep(80);
        ok("effects: nothing drawn while Discord's loading screen is up", drawn.size === 0 && errors.length === 0 && list().screenEffects.running, [...drawn].join(","));
        w.document.body.prepend(nav);
        await sleep(80);
        ok("effects: start once the app is on screen", !w.document.documentElement.hasAttribute("data-bt-loading") && drawn.size > 0);

    }
    let probe = null;
    B.definePlugin({ id: "restProbe", enabledByDefault: true, start(api) { probe = api.discord; } });
    await sleep(20);
    const got = await probe.rest.get("/users/@me");
    ok("api.discord.rest goes through Discord's own HTTP client (it signs requests itself)", got && got.via === "discord" && w.__http.at(-1)[0] === "get" && w.__http.at(-1)[1].url === "/users/@me" && !requests.length);
    let failure = null;
    await probe.rest.post("/fail", {}).catch(e => (failure = e));
    ok("api.discord.rest: Discord's error message comes through", failure && failure.message === "Missing Permissions" && failure.status === 403);
    w.__httpOff = true;
    await probe.rest.get("/users/@me").catch(() => {});
    w.__httpOff = false;
    ok("api.discord.rest fallback uses your token from AuthenticationStore (not the multi-account module: that gave 401)", requests.at(-1) && requests.at(-1).auth === "auth-token");
    await probe.sendMessage("42", "hi");
    ok("api.discord.sendMessage sends through Discord itself", JSON.stringify(w.__sent.at(-1)) === JSON.stringify(["42", { content: "hi", tts: false, invalidEmojis: [], validNonShortcutEmojis: [] }]));
    requests.length = 0;
    w.__sent = [];

    if (V.hasPlugin("meowSoundboard")) {
        const toasts = () => [...w.document.querySelectorAll(".bt-toast")].map(t => t.textContent).join(" | ");
        const clearToasts = () => w.document.querySelectorAll(".bt-toast").forEach(t => t.remove());
        ok("meow: on by default", list().meowSoundboard && list().meowSoundboard.running);
        await sleep(40);
        ok("meow: the old soundboard's saved sounds are removed from this PC", !["library", "sounds", "okGuilds", "audio:old1", "audio-discord:old1"].some(k => idb.data.has(`plugin:meowSoundboard:${k}`)) && !("homeGuild" in B.settings.plugins.meowSoundboard.settings));
        const sb = w.document.querySelector('button[aria-label="Soundboard"]');
        const meow = sb.nextElementSibling;
        ok("meow: button right after Discord's Soundboard button", meow && meow.classList.contains("bt-meow-btn") && meow.getAttribute("aria-label") === "Start Meow recording" && meow.className.includes("button_x"));
        ok("meow: its drawn cat (head, ears, eyes, whiskers), animated on hover", meow.querySelector("svg.bt-meow-icon .bt-cat-head .bt-cat-ear-l") && meow.querySelector(".bt-cat-wl") && css().includes("@keyframes bt-cat-tilt"));
        ok("meow: only one button even if the panel re-renders", w.document.querySelectorAll(".bt-meow-btn").length === 1);
        ok("meow: the whiskers tilt with the face (one group), and still wiggle", meow.querySelector(".bt-cat-face > .bt-cat-head") && meow.querySelector(".bt-cat-face .bt-cat-wl") && meow.querySelector(".bt-cat-face .bt-cat-wr") && css().includes(":is(.bt-meow-btn:hover, .bt-meow-btn:focus-visible) .bt-cat-face { animation: bt-cat-tilt") && css().includes(".bt-cat-wl { animation: bt-cat-wl"));
        const later = w.document.createElement("div");
        later.innerHTML =
            '<div class="actionButtons_y"><button class="btn_y" aria-label="Camera"><svg><path/></svg></button><button class="btn_y" aria-label="Share Screen"><svg><path/></svg></button>' +
            '<button class="btn_y" aria-label="Activities"><svg><path/></svg></button>' +
            '<div class="cellWrap_y"><button class="btn_y" aria-label="Soundboard"><div class="lottieIcon_y" style="width:20px;height:20px"></div></button></div></div>';
        w.document.body.append(later);
        await sleep(30);
        const row = later.querySelector(".actionButtons_y");
        ok("meow: a fifth cell in the voice panel's row, one line", row.children.length === 5 && row.querySelector(":scope > .bt-meow-cell .bt-meow-btn svg.bt-meow-icon") && css().includes(":has(> .bt-meow-cell)"));
        later.remove();

        const media = { calls: [], tracks: [], denyDesktop: false, denyMic: false };
        const MICS = { def: "Default - Laptop Mic", hs1: "Headset Mic (Razer)" };
        const fakeStream = (kind, deviceId = "def") => {
            const t = (k) => { const tr = { kind: k, label: k === "audio" && kind === "mic" ? MICS[deviceId] : "", stopped: false, stop() { this.stopped = true; }, getSettings: () => ({ deviceId }) }; media.tracks.push(tr); return tr; };
            const audio = [t("audio")], video = kind === "desktop" ? [t("video")] : [];
            return { getAudioTracks: () => audio, getVideoTracks: () => video, getTracks: () => [...audio, ...video] };
        };
        w.navigator.mediaDevices = { getUserMedia: c => {
            media.calls.push(c);
            const desktop = c.audio && c.audio.mandatory && c.audio.mandatory.chromeMediaSource === "desktop";
            if (desktop && media.denyDesktop) return Promise.reject(Object.assign(new Error("Permission denied"), { name: "NotAllowedError" }));
            if (!desktop && media.denyMic) return Promise.reject(new Error("no mic"));
            return Promise.resolve(fakeStream(desktop ? "desktop" : "mic", (c.audio && c.audio.deviceId && c.audio.deviceId.exact) || "def"));
        }, enumerateDevices: () => Promise.resolve([
            { kind: "audioinput", deviceId: "def", label: MICS.def }, { kind: "audioinput", deviceId: "hs1", label: MICS.hs1 }, { kind: "audiooutput", deviceId: "spk", label: "Speakers" },
        ]) };
        const micCalls = () => media.calls.filter(c => c.audio && !c.audio.mandatory);
        const audio = { contexts: [] };
        w.AudioContext = class {
            constructor(o) { this.sampleRate = (o && o.sampleRate) || 44100; this.destination = { dest: true }; this.closed = false; audio.contexts.push(this); }
            createGain() { const g = { gain: { value: 1 }, connect(n) { this.to = n; }, disconnect() {} }; (this.gains = this.gains || []).push(g); return g; }
            createAnalyser() { return { fftSize: 2048, connect() {}, getFloatTimeDomainData: b => b.fill(w.__micLevel ?? 0.3) }; }
            createMediaStreamSource(st) { return { stream: st, connect(n) { this.to = n; } }; }
            createScriptProcessor(size, inCh, outCh) { const p = { size, inCh, outCh, connect(n) { this.to = n; }, disconnect() { this.cut = true; } }; this.proc = p; return p; }
            close() { this.closed = true; return Promise.resolve(); }
            resume() { this.resumed = true; return Promise.resolve(); }
        };

        meow.click();
        await sleep(30);
        ok("meow: outside voice it says to join one", /Join a voice channel first/.test(toasts()) && !native.started.length);
        clearToasts();

        const panel = w.document.createElement("section");
        panel.className = "panels_x";
        panel.innerHTML = '<div class="rtcConnectionStatus_x"><a href="/channels/111111/5">VALO / Home</a></div>';
        w.document.body.append(panel);
        meow.click();
        await sleep(60);
        const desktopCall = media.calls.find(c => c.audio && c.audio.mandatory);
        ok("meow: finds your channel from the voice panel when Discord's store doesn't say", native.started.length === 1);
        ok("meow: captures what you hear (the PC's sound) and stops the picture", desktopCall && desktopCall.audio.mandatory.chromeMediaSource === "desktop" && media.tracks.filter(t => t.kind === "video").every(t => t.stopped));
        ok("meow: and your microphone", media.calls.some(c => c.audio && c.audio.echoCancellation === true && c.video === false));
        const st = native.started[0];
        ok("meow: names the file after the channel and time, 48 kHz stereo, your quality", /^VALO - Home - \d{4}-\d\d-\d\d \d\d\.\d\d$/.test(st.name) && st.rate === 48000 && st.channels === 2 && st.quality === "High" && st.dir === "", JSON.stringify(st));
        const posts = () => (w.__sent || []).filter(([c]) => c === "5").map(([, m]) => ({ body: m }));
        ok("meow: tells the channel it's being recorded", posts().length === 1 && /Recording started/.test(posts()[0].body.content));
        ok("meow: button and a red REC bar show it's recording", meow.classList.contains("bt-recording") && meow.getAttribute("aria-pressed") === "true" && /REC 00:0\d/.test(w.document.querySelector(".bt-meow-recbar").textContent) && w.document.querySelector(".bt-meow-recbar").textContent.includes("VALO - Home"));
        ok("meow: plays nothing back (no echo)", audio.contexts[0].proc.to && audio.contexts[0].proc.to.gain.value === 0);
        ok("meow: records YOUR voice from the microphone Discord uses (matched by name), not Windows' default", micCalls().length === 2 && !micCalls()[0].audio.deviceId && micCalls()[1].audio.deviceId.exact === "hs1" && media.tracks.find(t => t.label === MICS.def).stopped, JSON.stringify(micCalls()));
        ok("meow: says it's recording your voice", /with your voice \(Headset Mic \(Razer\)\)/.test(toasts()), toasts());
        const chip = () => w.document.querySelector(".bt-meow-recbar .bt-rec-mic");
        await sleep(300);
        ok("meow: REC bar shows your mic is live", chip() && chip().textContent === "Mic" && chip().classList.contains("bt-hot"));
        const micGainNow = () => audio.contexts[0].gains.find(g => g.to && g.to !== audio.contexts[0].proc && g.gain.value !== 0 && g !== audio.contexts[0].gains[0]) || audio.contexts[0].gains[2];
        B.settings.plugins.meowSoundboard.settings.micVolume = 150;
        await sleep(300);
        ok("meow: my voice volume", audio.contexts[0].gains.some(g => g.gain.value === 1.5));
        w.__muted = true;
        await sleep(1100);
        ok("meow: muted in Discord → your voice is left out", audio.contexts[0].gains.filter(g => g.gain.value === 1.5).length === 0 && chip().textContent === "Mic muted" && chip().classList.contains("bt-off"));
        w.__muted = false;
        B.settings.plugins.meowSoundboard.settings.micVolume = 100;
        await sleep(300);

        const proc = audio.contexts[0].proc;
        const half = new Float32Array(24000).fill(0.5), neg = new Float32Array(24000).fill(-0.5);
        for (let k = 0; k < 2; k++) proc.onaudioprocess({ inputBuffer: { numberOfChannels: 2, getChannelData: c => (c ? neg : half) } });
        const chunk = native.chunks.at(-1);
        ok("meow: audio goes to the main process as 16-bit stereo", chunk && chunk.id === "rec1" && chunk.data instanceof w.Int16Array && chunk.data.length === 96000 && chunk.data[0] === 16383 && chunk.data[1] === -16384);
        proc.onaudioprocess({ inputBuffer: { numberOfChannels: 1, getChannelData: () => new Float32Array(4096).fill(2) } });
        clearToasts();

        meow.click();
        await sleep(60);
        ok("meow: stop flushes the last audio and saves", native.stopped[0] === "rec1" && native.chunks.at(-1).data.length === 8192 && native.chunks.at(-1).data[0] === 32767 && native.chunks.at(-1).data[1] === 32767);
        ok("meow: says where it's saved", /Saved VALO - Home - .*\.mp3 \(121 KB\)/.test(toasts()), toasts());
        ok("meow: tells the channel it stopped", posts().length === 2 && /Recording stopped/.test(posts()[1].body.content));
        ok("meow: releases the PC's sound and the mic", media.tracks.every(t => t.stopped) && audio.contexts[0].closed && !w.document.querySelector(".bt-meow-recbar") && !meow.classList.contains("bt-recording"));

        clearToasts();
        w.__micLevel = 0;
        w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "m", code: "KeyM", ctrlKey: true, altKey: true, bubbles: true }));
        await sleep(60);
        ok("meow: Ctrl+Alt+M starts it", native.started.length === 2 && meow.classList.contains("bt-recording"));
        D.dispatch({ type: "VOICE_CHANNEL_SELECT", channelId: null, guildId: null });
        await sleep(800);
        ok("meow: says when your voice wasn't picked up (silent mic)", /Your voice wasn't picked up: “Headset Mic \(Razer\)” stayed silent/.test(toasts()), toasts());
        w.__micLevel = 0.3;
        ok("meow: leaving the voice channel stops and saves it", native.stopped.length === 2 && /You left the voice channel/.test(toasts()) && !meow.classList.contains("bt-recording"), toasts());
        D.dispatch({ type: "VOICE_CHANNEL_SELECT", channelId: "5", guildId: "111111" });

        clearToasts();
        media.denyMic = true;
        meow.click();
        await sleep(60);
        ok("meow: without a microphone it still records what you hear", native.started.length === 3 && /Couldn't open your microphone/.test(toasts()));
        meow.click();
        await sleep(60);
        media.denyMic = false;
        clearToasts();
        media.denyDesktop = true;
        meow.click();
        await sleep(60);
        ok("meow: if the PC's sound can't be captured, it says why", native.started.length === 3 && /couldn't capture your PC's sound \(Permission denied\)/.test(toasts()) && !meow.classList.contains("bt-recording"), toasts());
        media.denyDesktop = false;

        B.settings.plugins.meowSoundboard.settings.announce = false;
        const before = posts().length;
        meow.click();
        await sleep(60);
        meow.click();
        await sleep(60);
        ok("meow: no channel notice when you turn it off", posts().length === before && native.started.length === 4 && native.stopped.length === 4);
        B.settings.plugins.meowSoundboard.settings.announce = true;
        B.settings.plugins.meowSoundboard.settings.includeMic = false;
        const micCallsBefore = micCalls().length;
        clearToasts();
        meow.click();
        await sleep(60);
        ok("meow: turn your voice off: the mic isn't opened", micCalls().length === micCallsBefore && /without your voice/.test(toasts()) && !w.document.querySelector(".bt-meow-recbar .bt-rec-mic").textContent, toasts());
        meow.click();
        await sleep(60);
        B.settings.plugins.meowSoundboard.settings.includeMic = true;

        B.open("meow");
        await sleep(80);
        const page = () => w.document.querySelector("#bt-window .bt-meow-page");
        ok("meow page: folder (default), options and recordings", page() && page().querySelector(".bt-meow-path").textContent === "C:\\Users\\me\\Documents\\Meow Recordings" && page().querySelector('[data-meow="includeMic"]').checked && page().querySelector(".bt-meow-file b").textContent.startsWith("VALO - Home"));
        const micSel = page().querySelector('select[data-meow="micDevice"]');
        ok("meow page: Your voice: microphone (same as Discord by default), volume, follow mute", micSel && [...micSel.options].map(o => o.textContent).join("|") === "Same as Discord (Headset Mic (Razer))|Default - Laptop Mic|Headset Mic (Razer)" && micSel.value === "" && page().querySelector('input[data-meow="micVolume"]') && /Leave my voice out while I'm muted/.test(page().textContent), [...(micSel ? micSel.options : [])].map(o => o.textContent).join("|"));
        micSel.value = "def";
        micSel.dispatchEvent(new w.Event("change"));
        ok("meow page: pick a microphone", B.settings.plugins.meowSoundboard.settings.micDevice === "def");
        [...page().querySelectorAll(".bt-b")].find(b => b.textContent === "Test my mics").click();
        await sleep(300);
        const testRows = () => [...page().querySelectorAll(".bt-meow-testmic")];
        const testCtx = audio.contexts.at(-1);
        ok("meow page: Test my mics shows every microphone with its own live meter (dB scale)", testRows().map(r => r.querySelector(".bt-meow-testname").textContent).join("|") === "Default - Laptop Mic|Headset Mic (Razer)" && testRows().every(r => parseInt(r.querySelector(".bt-meow-meter > i").style.width, 10) === 83 && r.classList.contains("bt-hears")) && testCtx.resumed, testRows().map(r => r.querySelector(".bt-meow-meter > i").style.width).join(","));
        ok("meow page: the microphone in use is marked", testRows()[0].querySelector(".bt-b").textContent === "In use" && testRows()[1].querySelector(".bt-b").textContent === "Use");
        testRows()[1].querySelector(".bt-b").click();
        await sleep(40);
        ok("meow page: Use picks the microphone that hears you", B.settings.plugins.meowSoundboard.settings.micDevice === "hs1" && testRows()[1].querySelector(".bt-b").textContent === "In use" && page().querySelector('select[data-meow="micDevice"]'));
        [...page().querySelectorAll(".bt-b")].find(b => b.textContent === "Stop test").click();
        await sleep(30);
        ok("meow page: the test stops and lets go of every microphone", !testRows().length && media.tracks.filter(t => t.kind === "audio").every(t => t.stopped) && testCtx.closed, JSON.stringify(media.tracks.filter(t => !t.stopped).map(t => t.kind + ":" + t.label)));
        const callsBeforePick = micCalls().length;
        meow.click();
        await sleep(60);
        ok("meow: your chosen microphone is used", micCalls().length === callsBeforePick + 2 && micCalls().at(-1).audio.deviceId.exact === "hs1", JSON.stringify(micCalls().slice(callsBeforePick)));
        meow.click();
        await sleep(60);
        B.settings.plugins.meowSoundboard.settings.micDevice = "";
        ok("meow page: ready to record the channel you're in", /Ready to record/.test(page().querySelector(".bt-meow-status").textContent) && !page().querySelector(".bt-meow-status button").disabled);
        [...page().querySelectorAll(".bt-b")].find(b => b.textContent === "Change…").click();
        await sleep(40);
        ok("meow page: choose your own folder", B.settings.plugins.meowSoundboard.settings.folder === "D:\\Calls" && page().querySelector(".bt-meow-path").textContent === "D:\\Calls");
        [...page().querySelectorAll(".bt-b")].find(b => b.textContent === "Use default").click();
        await sleep(20);
        ok("meow page: back to the default folder", B.settings.plugins.meowSoundboard.settings.folder === "");
        page().querySelector(".bt-meow-file .bt-b").click();
        ok("meow page: Show opens the file's folder", native.shown === "C:\\x\\a.mp3");
        panel.remove();
        w.document.getElementById("bt-window").remove();
        B.open("general");
        await sleep(30);
        const meowShortcuts = [...w.document.querySelectorAll(".bt-quick-actions button")].map(b => b.textContent);
        ok("meow: in Shortcuts", meowShortcuts.includes("Start / stop Meow recording") && meowShortcuts.includes("Open Meow recordings"), meowShortcuts.join(" | "));

        const noHandler = name => () => Promise.reject(new Error(`Error invoking remote method '${name}': Error: No handler registered for '${name}'`));
        Object.assign(w.BThemerNative, { recStart: noHandler("BT_REC_START"), recList: noHandler("BT_REC_LIST"), recOpenDir: noHandler("BT_REC_OPEN_DIR") });
        w.document.getElementById("bt-window")?.remove();
        clearToasts();
        w.document.body.append(panel);
        const tracksBefore = media.tracks.length;
        meow.click();
        await sleep(80);
        ok("meow: before a full restart it says exactly what to do (not a raw error)", /Quit Discord fully once/.test(toasts()) && /system tray/.test(toasts()) && !/No handler/.test(toasts()) && !meow.classList.contains("bt-recording"), toasts());
        ok("meow: and releases the PC's sound and mic it had opened", media.tracks.length > tracksBefore && media.tracks.slice(tracksBefore).every(t => t.stopped));
        B.open("meow");
        await sleep(80);
        const warnEl = w.document.querySelector("#bt-window .bt-meow-page .bt-warn");
        ok("meow page: shows the same instructions", warnEl && /Quit Discord fully once/.test(warnEl.textContent));
        panel.remove();

    }
    console.log(results.join("\n"));
    console.log(`\n${results.filter(r => r.startsWith("PASS")).length}/${results.length} passed`);
    process.exit(results.some(r => r.startsWith("FAIL")) ? 1 : 0);
})().catch(e => { console.log(results.join("\n")); console.error(e); process.exit(1); });
