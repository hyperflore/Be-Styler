(() => {
    "use strict";

    if (window.BThemer || !/(^|\.)discord\.com$/.test(location.hostname)) return;
    const Native = window.BThemerNative;
    if (!Native) {
        console.error("[Be Themer] couldn't start: its preload script didn't run.");
        return;
    }

    const TAG = ["%c[Be Themer]", "color:#ff7eb6;font-weight:700"];
    const log = (...a) => console.log(...TAG, ...a);
    const warn = (...a) => console.warn(...TAG, ...a);

    const MAIN_THEME = "b-themer.theme.css";
    const LOGO = "__BT_LOGO__";
    const LOGO_HD = "__BT_LOGO_HD__";
    const REPO_URL = "__BT_REPO__";
    const FEATURES = __BT_FEATURES__;
    const featureOn = name => FEATURES[name] !== false;

    const DEFAULTS = {
        wallpaperBlur: 0, brightness: 100, saturation: 100, dim: 22,
        gradEnabled: true,
        gradIntensity: 100, grad1: "#ff9ecf", grad2: "#9d8cff", grad3: "#ffb38a", grad4: "#6ad7ff",
        gradBase: "#1e1233", gradAnimate: true, gradSpeed: 40,
        translucent: true, glassBlur: 16, glassOpacity: 38, glassTint: "#140c24", borders: true, opaquePopups: true,
        accent: "#ff7eb6", accent2: "#a78bfa", font: "default", radius: 10, textShadow: true,
        bubbles: false, hoverEffect: "glow", notifAccent: true,
        roleStyle: "off", roleSpeed: 4,
        soundboardRing: "#ff5fa2",
        enabledThemes: [MAIN_THEME], userPlugins: true,
        serverThemesEnabled: true,
        splashStyle: "clyde", splashText: "", splashLogo: true, splashFit: "cover", splashDim: 25, splashMediaName: "",
        splashBg: "#111214", splashFg: "#ffffff", splashAccent: "#5865f2", splashSize: 100, splashSpeed: 100,
        splashClydeAnim: "pulse", splashClydeLook: "solid", splashLoader: "none",
        splashPlace: "center", splashPattern: "none", splashPatternOpacity: 8, splashTextSize: 13, splashTextOpacity: 55,
        splashSpinner: "arc", splashThickness: 4,
        splashTermLines: "", splashTermWindow: true, splashTermCursor: "block", splashTermTimes: true,
        splashBars: 7, splashBarWidth: 8, splashBarRound: 3, splashEqColors: "alternate", splashEqMirror: true,
        splashShapesMotion: "hop", splashMorphStay: false, splashCounterMode: "percent", splashCounterFont: "discord", splashCounterLine: true,
    };

    const FONTS = {
        default: ["Discord default", ""],
        segoe: ["Segoe UI", `"Segoe UI", system-ui, sans-serif`],
        yugothic: ["Yu Gothic UI", `"Yu Gothic UI", "Yu Gothic", "Meiryo UI", sans-serif`],
        meiryo: ["Meiryo UI", `"Meiryo UI", Meiryo, sans-serif`],
        comic: ["Comic Sans MS", `"Comic Sans MS", "Comic Sans", cursive`],
        system: ["System UI", `system-ui, sans-serif`],
        mono: ["Consolas (mono)", `Consolas, "Cascadia Mono", monospace`],
    };

    const PRESETS = {
        Sakura: { accent: "#ff7eb6", accent2: "#a78bfa", grad1: "#ff9ecf", grad2: "#9d8cff", grad3: "#ffb38a", grad4: "#6ad7ff", gradBase: "#1e1233", glassTint: "#140c24" },
        Midnight: { accent: "#7aa2ff", accent2: "#c084fc", grad1: "#4f46e5", grad2: "#0ea5e9", grad3: "#9333ea", grad4: "#22d3ee", gradBase: "#0b1026", glassTint: "#0a0f24" },
        Sunset: { accent: "#ff9f5a", accent2: "#ff6b9a", grad1: "#ff7a59", grad2: "#ffb347", grad3: "#ff5e99", grad4: "#8b5cf6", gradBase: "#2a1220", glassTint: "#22101a" },
        Matcha: { accent: "#7ee0a8", accent2: "#c4f1a0", grad1: "#6ee7b7", grad2: "#a7f3d0", grad3: "#fde68a", grad4: "#34d399", gradBase: "#0f2019", glassTint: "#0c1a14" },
        Cyber: { accent: "#00f0ff", accent2: "#ff2bd6", grad1: "#ff2bd6", grad2: "#00f0ff", grad3: "#7c3aed", grad4: "#22d3ee", gradBase: "#0a0618", glassTint: "#0b0716" },
        Ocean: { accent: "#4fc3f7", accent2: "#26a69a", grad1: "#0288d1", grad2: "#00bcd4", grad3: "#1de9b6", grad4: "#3949ab", gradBase: "#071a2c", glassTint: "#06141f" },
        Lavender: { accent: "#c39bff", accent2: "#ff9ad5", grad1: "#b388ff", grad2: "#ea80fc", grad3: "#8c9eff", grad4: "#f8bbd0", gradBase: "#1b1430", glassTint: "#160f26" },
        Crimson: { accent: "#ff5c7a", accent2: "#ff9e5c", grad1: "#d50032", grad2: "#ff6f00", grad3: "#c51162", grad4: "#6a1b9a", gradBase: "#1f0a10", glassTint: "#1a080d" },
        Forest: { accent: "#8bd17c", accent2: "#e6c36a", grad1: "#2e7d32", grad2: "#9ccc65", grad3: "#00897b", grad4: "#fbc02d", gradBase: "#0b1a10", glassTint: "#0a160d" },
        Aurora: { accent: "#64ffda", accent2: "#b388ff", grad1: "#00e5ff", grad2: "#76ff03", grad3: "#d500f9", grad4: "#2979ff", gradBase: "#050b1a", glassTint: "#070d1c" },
        Peach: { accent: "#ffab91", accent2: "#ffd180", grad1: "#ff8a65", grad2: "#ffcc80", grad3: "#f48fb1", grad4: "#ce93d8", gradBase: "#2a1712", glassTint: "#22130f" },
        Neon: { accent: "#ff2e88", accent2: "#00f5d4", grad1: "#ff2e88", grad2: "#7b2ff7", grad3: "#00f5d4", grad4: "#f5d300", gradBase: "#0b0221", glassTint: "#0d0420" },
        Gold: { accent: "#ffd166", accent2: "#ef8354", grad1: "#ffb703", grad2: "#fb8500", grad3: "#ffd166", grad4: "#8d5524", gradBase: "#1c1405", glassTint: "#181104" },
        Sky: { accent: "#8ec5ff", accent2: "#ffd6e8", grad1: "#a1c4fd", grad2: "#c2e9fb", grad3: "#fbc2eb", grad4: "#84fab0", gradBase: "#101a2b", glassTint: "#0f1726" },
        Mono: { accent: "#e0e0e0", accent2: "#9e9e9e", grad1: "#616161", grad2: "#9e9e9e", grad3: "#424242", grad4: "#bdbdbd", gradBase: "#0e0e10", glassTint: "#121214" },
    };

    const presetOf = name => (name && (PRESETS[name] || (S.customThemes && S.customThemes[name] && S.customThemes[name].values))) || null;
    const FONT_OPTIONS = Object.entries(FONTS).map(([k, [label]]) => [k, label]);
    const ROLE_STYLES = [
        ["off", "Off (Discord's normal colours)"],
        ["shine", "Shine: a light sweeps across"],
        ["gradient", "Gradient: role colour into your accent"],
        ["glow", "Glow"],
        ["holo", "Holographic"],
    ];

    const SERVER_GROUPS = [
        ["Gradient", [
            ["grad1", "Top-left glow", "color"],
            ["grad2", "Top-right glow", "color"],
            ["grad3", "Bottom-right glow", "color"],
            ["grad4", "Bottom-left glow", "color"],
            ["gradBase", "Background colour", "color"],
            ["gradIntensity", "Glow strength", "range", 0, 200, "%"],
            ["gradAnimate", "Colour shift", "toggle"],
            ["gradSpeed", "Colour shift speed", "range", 5, 120, "s"],
        ]],
        ["Colours and glass", [
            ["accent", "Accent colour", "color"],
            ["accent2", "Second accent colour", "color"],
            ["glassTint", "Glass tint", "color"],
            ["translucent", "Liquid glass", "toggle"],
        ]],
        ["Names and text", [
            ["roleStyle", "Role colour style", "select", ROLE_STYLES],
            ["roleSpeed", "Role animation speed", "range", 1, 12, "s"],
            ["font", "Font", "select", FONT_OPTIONS],
            ["radius", "Corner roundness", "range", 0, 24, "px"],
            ["bubbles", "Message bubbles", "toggle"],
        ]],
    ];
    const SERVER_ROWS = SERVER_GROUPS.flatMap(([, rows]) => rows);
    const SERVER_KEYS = SERVER_ROWS.map(r => r[0]);
    const PRESET_KEYS = Object.keys(PRESETS.Sakura);

    const SCHEMA = [
        { title: "On and off", custom: "themeSwitch" },
        { title: "Discord Theme", custom: "themeOnOff", page: "theme" },
        { title: "Colour presets", page: "theme", note: "One click sets your accent, gradient and glass colours.", custom: "presets" },
        { title: "Wallpaper", page: "theme", note: "Your own picture behind Discord. Without one, your gradient shows instead.", custom: "wallpaper", items: [
            ["wallpaperBlur", "Blur", "range", 0, 30, "px"],
            ["brightness", "Brightness", "range", 30, 160, "%"],
            ["saturation", "Colour intensity", "range", 0, 200, "%"],
            ["dim", "Darken", "range", 0, 90, "%"],
        ] },
        { title: "Gradient", page: "theme", note: "Shown when you don't have a wallpaper picture.", items: [
            ["gradEnabled", "Show my gradient", "toggle"],
            ["gradIntensity", "Glow strength", "range", 0, 200, "%"],
            ["grad1", "Top-left glow", "color"],
            ["grad2", "Top-right glow", "color"],
            ["grad3", "Bottom-right glow", "color"],
            ["grad4", "Bottom-left glow", "color"],
            ["gradBase", "Background colour", "color"],
            ["gradAnimate", "Colour shift", "toggle"],
            ["gradSpeed", "Colour shift speed", "range", 5, 120, "s"],
        ] },
        { title: "Glass panels", page: "theme", items: [
            ["glassBlur", "Blur", "range", 0, 40, "px"],
            ["glassOpacity", "Opacity", "range", 0, 95, "%"],
            ["glassTint", "Tint", "color"],
            ["borders", "Panel outlines", "toggle"],
            ["opaquePopups", "Solid pop-ups", "toggle"],
        ] },
        { title: "Role colours", page: "theme", note: "Make coloured role names stand out. Each server can have its own style on the Server Theme page.", items: [
            ["roleStyle", "Role colour style", "select", ROLE_STYLES],
            ["roleSpeed", "Animation speed", "range", 1, 12, "s"],
        ] },
        { title: "Colours, font and shape", page: "theme", items: [
            ["accent", "Accent colour", "color"],
            ["accent2", "Second accent colour", "color"],
            ["font", "Font", "select", FONT_OPTIONS],
            ["radius", "Corner roundness", "range", 0, 24, "px"],
            ["textShadow", "Text shadow", "toggle"],
            ["notifAccent", "Notification colour follows my theme", "toggle"],
        ] },
        { title: "Messages", page: "theme", items: [
            ["bubbles", "Message bubbles", "toggle"],
            ["hoverEffect", "When you hover a message", "select", [["glow", "Glow"], ["slide", "Slide"], ["none", "Nothing"]]],
        ] },
        { title: "Voice", page: "theme", items: [
            ["soundboardRing", "Soundboard speaking ring", "color"],
        ] },
        { title: "Theme Maker", custom: "themeMaker", page: "maker", note: "Build your own colour theme from nodes. Your themes appear in your Colour presets and in every server's preset list." },
        { title: "Plugins", custom: "plugins", page: "plugins" },
        { title: "Theme files", custom: "themes", page: "theme" },
        { title: "Server looks", custom: "servers", page: "servers", note: "Give a server its own gradient, colours, role style, picture and extra themes. It switches automatically when you open that server." },
        { title: "Meow", custom: "meowPage", page: "meow" },
        { title: "Owlie", custom: "owliePage", page: "owlie" },
        { title: "Splash", custom: "splash", page: "splash", items: [
            ["splashStyle", "Loading screen", "select", [["clyde", "Discord logo"], ["morph", "Shapes into Discord logo"], ["minimal", "Minimal spinner"], ["terminal", "Terminal"], ["equalizer", "Equalizer"], ["shapes", "Shapes"], ["counter", "Counter"], ["wallpaper", "My wallpaper"], ["media", "My picture or video"], ["discord", "Discord's own"]]],
            ["splashBg", "Background colour", "color"],
            ["splashFg", "Main colour", "color"],
            ["splashAccent", "Second colour", "color"],
            ["splashSize", "Size", "range", 50, 200, "%"],
            ["splashSpeed", "Speed", "range", 25, 300, "%"],
            ["splashPlace", "Position", "select", [["center", "Centre"], ["high", "Upper third"], ["low", "Lower third"], ["left", "Bottom left corner"], ["right", "Bottom right corner"]]],
            ["splashPattern", "Background pattern", "select", [["none", "None"], ["dots", "Dot grid"], ["grid", "Grid lines"], ["lines", "Diagonal lines"], ["plus", "Plus signs"]]],
            ["splashPatternOpacity", "Pattern strength", "range", 2, 40, "%"],
            ["splashClydeAnim", "Logo animation", "select", [["pulse", "Pulse"], ["breathe", "Breathe"], ["bounce", "Bounce"], ["float", "Float"], ["flip", "Flip"], ["wobble", "Wobble"], ["heartbeat", "Heartbeat"], ["glitch", "Glitch"], ["none", "Still"]]],
            ["splashClydeLook", "Logo look", "select", [["solid", "Solid"], ["outline", "Outline"], ["duotone", "Two colours"]]],
            ["splashLoader", "With the logo", "select", [["none", "Nothing"], ["dots", "Three dots"], ["bar", "Loading bar"], ["ring", "Spinner"], ["ripple", "Ripples"]]],
            ["splashSpinner", "Spinner", "select", [["arc", "Arc"], ["dots", "Dot wheel"], ["ticks", "Ticks"], ["squares", "Two squares"], ["ripple", "Ripples"]]],
            ["splashThickness", "Thickness", "range", 1, 10, "px"],
            ["splashTermLines", "Terminal lines", "text"],
            ["splashTermWindow", "Window frame", "toggle"],
            ["splashTermCursor", "Cursor", "select", [["block", "Block"], ["underline", "Underline"], ["bar", "Bar"]]],
            ["splashTermTimes", "Timestamps", "toggle"],
            ["splashBars", "Bars", "range", 3, 24, ""],
            ["splashBarWidth", "Bar width", "range", 2, 24, "px"],
            ["splashBarRound", "Bar roundness", "range", 0, 12, "px"],
            ["splashEqColors", "Bar colours", "select", [["alternate", "Both, alternating"], ["main", "Main colour"], ["second", "Second colour"]]],
            ["splashEqMirror", "Grow from the middle", "toggle"],
            ["splashMorphStay", "Stay as the logo", "toggle"],
            ["splashShapesMotion", "Motion", "select", [["hop", "Hop"], ["spin", "Spin"], ["orbit", "Orbit"], ["morph", "Morph (one shape)"]]],
            ["splashCounterMode", "Counts", "select", [["percent", "Percent"], ["count", "Number only"], ["elapsed", "Seconds elapsed"]]],
            ["splashCounterFont", "Number font", "select", [["discord", "Discord (bold)"], ["thin", "Thin"], ["mono", "Monospace"]]],
            ["splashCounterLine", "Line under it", "toggle"],
            ["splashText", "Text", "text"],
            ["splashTextSize", "Text size", "range", 10, 24, "px"],
            ["splashTextOpacity", "Text visibility", "range", 10, 100, "%"],
            ["splashLogo", "Show the logo", "toggle"],
            ["splashFit", "Picture or video fit", "select", [["cover", "Fill the screen"], ["contain", "Fit inside (whole picture)"]]],
            ["splashDim", "Darken the picture or video", "range", 0, 90, "%"],
        ] },
        { title: "Custom CSS", custom: "quickcss", page: "quickcss" },
        { title: "Shortcuts", custom: "quickActions" },
        { title: "Advanced", custom: "other" },
    ];

    const HINTS = {
        wallpaperBlur: "Softens the picture so text is easier to read.",
        dim: "Darkens the picture behind your chats.",
        gradEnabled: "Off shows a plain background colour instead. Servers with their own look keep their gradient.",
        gradIntensity: "How bright the coloured glows are.",
        gradAnimate: "Slowly shifts the gradient's colours.",
        glassBlur: "How much the background is blurred behind panels.",
        glassOpacity: "Higher is more solid.",
        borders: "A thin line around each panel.",
        opaquePopups: "Menus, @mention lists and search results get a solid background, so they're easy to read.",
        roleStyle: "For coloured role names in chat and the member list. Roles Discord already shows with its own gradient are left alone.",
        textShadow: "Helps text stand out on bright pictures.",
        notifAccent: "Mention badges, the red NEW line and the new-messages bar in your accent colour. Off: Discord's own red.",
        bubbles: "Puts each message in its own rounded box.",
        soundboardRing: "The ring around someone while they play a soundboard sound (Discord's is blue). Talking on the mic stays green.",
        translucent: "See-through, blurred panels. Off makes them solid.",
        userPlugins: "Loads .js files from your plugins folder. Restart Discord after changing this.",
        splashStyle: "Replaces Discord's loading screen (when it starts and when it reconnects). My wallpaper uses your wallpaper at full quality. Discord's own is its usual screen.",
        splashText: "Optional lines shown on the loading screen, one after another, separated by | . Empty: no text.",
        splashBg: "A flat colour, no gradients.",
        splashFg: "The logo, spinner, text and shapes.",
        splashAccent: "Loader, highlights, bars and shapes.",
        splashSize: "Scales everything on the loading screen.",
        splashSpeed: "How fast it moves.",
        splashLoader: "A small loader with Discord's logo, in your second colour.",
        splashPlace: "Where it sits on the screen.",
        splashPattern: "A flat pattern in your main colour behind it.",
        splashMorphStay: "Off: the logo breaks back into shapes and it all starts again.",
        splashTermLines: "Your own lines, separated by | . Empty: Be Themer's boot log with your real numbers.",
        splashTermTimes: "Seconds since start on each line, like a real boot log.",
        splashEqMirror: "Off: bars grow up from a baseline.",
        splashCounterMode: "Seconds elapsed is honest: Discord doesn't say how far along it is.",
        splashTextSize: "Your text sits just under it, quietly.",
        splashLogo: "Your logo over your wallpaper or picture. The animated loading screen is a motion design video of your logo.",
    };

    let state = Native.getState() || { settings: {}, themes: [], quickCss: "", version: "?", dataDir: "" };
    const S = { ...DEFAULTS, ...(state.settings || {}) };
    if (!Array.isArray(S.enabledThemes)) S.enabledThemes = [...DEFAULTS.enabledThemes];
    if (!S.plugins || typeof S.plugins !== "object") S.plugins = {};
    if (!S.serverThemes || typeof S.serverThemes !== "object" || Array.isArray(S.serverThemes)) S.serverThemes = {};
    delete S.showButton;
    if ((S.settingsVersion || 0) < 2) {
        S.bubbles = false;
        S.settingsVersion = 2;
    }
    for (const [id, p] of Object.entries(S.serverThemes)) {
        if (!p || typeof p !== "object") {
            delete S.serverThemes[id];
            continue;
        }
        if (!Array.isArray(p.themes)) p.themes = [];
        if (!["global", "gradient", "image"].includes(p.background)) p.background = p.wallpaper ? "image" : "global";
        if (p.preset && !presetOf(p.preset)) p.preset = "";
        for (const k of SERVER_KEYS) if (p[k] === "" || p[k] === null) delete p[k];
    }
    if ((S.settingsVersion || 0) < 3) {
        for (const p of Object.values(S.serverThemes)) if (p.background === "global" && p.preset) p.background = "gradient";
        S.settingsVersion = 3;
    }

    if ("petals" in S || "hideNitro" in S || "compactServers" in S) {
        if ("petals" in S) {
            S.plugins.sakuraPetals = {
                enabled: !!S.petals,
                settings: { count: S.petalCount, speed: S.petalSpeed, size: S.petalSize, opacity: S.petalOpacity, behindGlass: S.petalsBehindGlass },
            };
        }
        if ("hideNitro" in S) S.plugins.hideNitro = { enabled: !!S.hideNitro, settings: {} };
        if ("compactServers" in S) S.plugins.compactServers = { enabled: !!S.compactServers, settings: {} };
        for (const k of ["petals", "petalCount", "petalSpeed", "petalSize", "petalOpacity", "petalsBehindGlass", "hideNitro", "compactServers"]) delete S[k];
        for (const p of Object.values(S.plugins)) for (const [k, v] of Object.entries(p.settings)) if (v === undefined) delete p.settings[k];
    }

    let enabled = S.enabled !== false;
    let started = false;

    let currentGuild = null;
    const guildFromUrl = () => {
        const m = /^\/channels\/(\d+)\//.exec(location.pathname + "/");
        return m ? m[1] : null;
    };
    const currentGuildName = () => {
        const parts = document.title.split(/\s+[|•]\s+/).map(s => s.trim())
            .filter(s => s && !/^discord$/i.test(s) && !/^[#@]/.test(s) && !/^\(\d+\)/.test(s));
        return parts[parts.length - 1] || null;
    };
    const activeProfile = (guild = currentGuild) => {
        if (!guild || S.serverThemesEnabled === false) return null;
        const p = S.serverThemes[guild];
        return p && p.enabled !== false ? p : null;
    };
    const hasOwn = (p, key) => p[key] !== undefined && p[key] !== null && p[key] !== "";
    const profileValue = (p, key) => {
        if (hasOwn(p, key)) return p[key];
        const preset = presetOf(p.preset);
        return preset && key in preset ? preset[key] : S[key];
    };
    const effective = () => {
        const p = activeProfile();
        if (!p) return S;
        const E = { ...S };
        for (const k of SERVER_KEYS) E[k] = profileValue(p, k);
        return E;
    };
    const effectiveThemes = () => {
        const p = activeProfile();
        if (!p) return S.enabledThemes;
        const extra = Array.isArray(p.themes) ? p.themes : [];
        return [...new Set([MAIN_THEME, ...(p.replace ? [] : S.enabledThemes), ...extra])];
    };
    const gradientShown = () => {
        const p = activeProfile();
        if (p && p.background === "gradient") return true;
        return S.gradEnabled !== false;
    };
    let hasWallpaper = false;
    let wallpaperCss = "none";

    const $ = (tag, props = {}) => Object.assign(document.createElement(tag), props);
    const cls = (...names) => names.map(n => `[class^="${n}_"],[class*=" ${n}_"]`).join(",");
    const hasCls = (el, name) => new RegExp(`(^|\\s)${name}_`).test(typeof el.className === "string" ? el.className : "");
    const ready = fn => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn, { once: true }) : fn());

    const hexRgb = h => {
        h = String(h).replace("#", "");
        if (h.length === 3) h = [...h].map(c => c + c).join("");
        const n = parseInt(h, 16) || 0;
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };

    const idb = (() => {
        let opening;
        const open = () => (opening ??= new Promise((res, rej) => {
            const r = indexedDB.open("b-themer", 1);
            r.onupgradeneeded = () => r.result.createObjectStore("kv");
            r.onsuccess = () => res(r.result);
            r.onerror = () => rej(r.error);
        }));
        const tx = async (mode, fn) => {
            const d = await open();
            return new Promise((res, rej) => {
                const t = d.transaction("kv", mode);
                const req = fn(t.objectStore("kv"));
                t.oncomplete = () => res(req.result);
                t.onerror = () => rej(t.error);
            });
        };
        return {
            get: k => tx("readonly", s => s.get(k)).catch(() => undefined),
            set: (k, v) => tx("readwrite", s => s.put(v, k)),
            del: k => tx("readwrite", s => s.delete(k)).catch(() => {}),
        };
    })();

    const CHUNK_GLOBAL = "webpackChunkdiscord_app";
    const wp = {
        React: null,
        LayoutTypes: { SECTION: 1, SIDEBAR_ITEM: 2, PANEL: 3, CATEGORY: 5, CUSTOM: 19 },
        layoutTypesFound: false,
        settingsPatched: false,
        patches: [],
        applied: [],
        api: {},
        modules: [],
        waiters: [],
        scanned: 0,
        req: null,
        reqs: [],
        reqSizes: new Map(),
        reqAsked: false,
        seen: new WeakSet(),
        loaderReady: false,
    };

    const candidatesOf = exp => {
        const out = [];
        if (!exp || (typeof exp !== "object" && typeof exp !== "function")) return out;
        out.push(exp);
        let keys;
        try { keys = Object.getOwnPropertyNames(exp); } catch { keys = Object.keys(exp); }
        for (const key of keys) {
            if (key === "prototype" || key === "caller" || key === "arguments") continue;
            try {
                const v = exp[key];
                if (v && (typeof v === "object" || typeof v === "function") && v !== exp) out.push(v);
            } catch { }
        }
        return out;
    };
    const firstMatch = (filter, exp) => {
        for (const c of candidatesOf(exp)) {
            try {
                if (filter(c)) return c;
            } catch { }
        }
        return null;
    };
    const wpFind = filter => {
        for (let pass = 0; pass < 2; pass++) {
            const from = pass ? wp.scanned : 0;
            if (pass) {
                wp.scanned = wp.modules.length;
                if (!wpAbsorbLoaded()) break;
            }
            for (let i = from; i < wp.modules.length; i++) {
                const hit = firstMatch(filter, wp.modules[i].exports);
                if (hit) return hit;
            }
            if (!pass) wp.scanned = wp.modules.length;
        }
        return null;
    };
    function checkWaiters(exp) {
        for (const w of [...wp.waiters]) {
            const hit = firstMatch(w.filter, exp);
            if (!hit) continue;
            wp.waiters.splice(wp.waiters.indexOf(w), 1);
            try {
                w.cb(hit);
            } catch (e) {
                warn("waitFor callback failed:", e);
            }
        }
    }
    const wpWaitFor = (filter, cb) => {
        const hit = wpFind(filter);
        if (hit) {
            cb(hit);
            return () => {};
        }
        const w = { filter, cb };
        wp.waiters.push(w);
        return () => {
            const i = wp.waiters.indexOf(w);
            if (i >= 0) wp.waiters.splice(i, 1);
        };
    };
    const byProps = (...props) => c => props.every(p => c[p] !== undefined);
    const storeNamed = name => c =>
        (typeof c.getName === "function" && c.getName() === name) || (c.constructor && c.constructor.displayName === name);

    const isDispatcher = c =>
        typeof c.dispatch === "function" && typeof c.subscribe === "function" && typeof c.unsubscribe === "function" &&
        typeof c.register === "function" && ("_subscriptions" in c || "_actionHandlers" in c);
    const storeWithDispatcher = c => {
        try {
            return storeNamed("MessageStore")(c) && c._dispatcher && isDispatcher(c._dispatcher);
        } catch {
            return false;
        }
    };
    const flux = { dispatcher: null, interceptors: new Set(), wrapped: false };
    const messageSendListeners = new Set();
    const messageEditListeners = new Set();
    const runInterceptors = action => {
        for (const fn of flux.interceptors) {
            try {
                if (fn(action) === false) return false;
            } catch (e) {
                warn("event interceptor failed:", e);
            }
        }
        return true;
    };
    const useDispatcher = hit => {
        if (flux.dispatcher) return flux.dispatcher;
        wpAbsorbLoaded();
        const viaStore = (storeWithDispatcher(hit) ? hit : wpFind(storeWithDispatcher))?._dispatcher;
        const d = viaStore || hit;
        flux.dispatcher = d;
        if (!flux.wrapped) {
            flux.wrapped = true;
            if (typeof d.addInterceptor === "function") {
                d.addInterceptor(action => !runInterceptors(action));
            } else {
                const original = d.dispatch;
                d.dispatch = function (action) {
                    if (!runInterceptors(action)) return Promise.resolve();
                    return original.apply(this, arguments);
                };
            }
        }
        return d;
    };
    const withDispatcher = cb =>
        wpWaitFor(c => storeWithDispatcher(c) || isDispatcher(c), hit => {
            queueMicrotask(() => {
                try {
                    cb(useDispatcher(hit));
                } catch (e) {
                    warn("event hook failed:", e);
                }
            });
        });

    const net = { handlers: new Set() };
    const absoluteUrl = u => {
        try {
            return new URL(String(u), location.href).href;
        } catch {
            return String(u);
        }
    };
    const runNetHandlers = req => {
        for (const h of net.handlers) {
            try {
                const r = h(req);
                if (r && r.block) return r;
                if (r && "body" in r) req.body = r.body;
            } catch (e) {
                warn("request handler failed:", e);
            }
        }
        return null;
    };
    const fakeXhrSuccess = (xhr, status) => {
        for (const [k, v] of Object.entries({ readyState: 4, status, statusText: "", responseText: "", response: "", responseURL: "" })) {
            try {
                Object.defineProperty(xhr, k, { configurable: true, get: () => v });
            } catch { }
        }
        setTimeout(() => {
            for (const type of ["readystatechange", "load", "loadend"]) xhr.dispatchEvent(new Event(type));
        });
    };
    try {
        const xhrOpen = XMLHttpRequest.prototype.open;
        const xhrSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function (method, url) {
            this.__bt = { method: String(method).toUpperCase(), url: absoluteUrl(url) };
            return xhrOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function (body) {
            if (this.__bt && net.handlers.size) {
                const req = { method: this.__bt.method, url: this.__bt.url, body };
                const blocked = runNetHandlers(req);
                if (blocked) return fakeXhrSuccess(this, blocked.status || 204);
                body = req.body;
            }
            return xhrSend.call(this, body);
        };

        const realFetch = window.fetch;
        if (typeof realFetch === "function") window.fetch = function (input, init) {
            if (!net.handlers.size) return realFetch.apply(this, arguments);
            const isRequest = typeof Request !== "undefined" && input instanceof Request;
            const req = {
                method: String((init && init.method) || (isRequest ? input.method : "GET")).toUpperCase(),
                url: absoluteUrl(isRequest ? input.url : input),
                body: init && init.body,
            };
            const before = req.body;
            const blocked = runNetHandlers(req);
            if (blocked) return Promise.resolve(new Response(null, { status: blocked.status || 204 }));
            return realFetch.call(this, input, req.body !== before ? { ...init, body: req.body } : init);
        };

        if (navigator.sendBeacon) {
            const realBeacon = navigator.sendBeacon.bind(navigator);
            navigator.sendBeacon = (url, data) => {
                if (!net.handlers.size) return realBeacon(url, data);
                const req = { method: "POST", url: absoluteUrl(url), body: data };
                if (runNetHandlers(req)) return true;
                return realBeacon(url, req.body);
            };
        }
    } catch (e) {
        warn("couldn't hook network requests; privacy plugins won't work.", e);
    }

    const copyText = text => {
        try {
            if (window.DiscordNative && DiscordNative.clipboard && typeof DiscordNative.clipboard.copy === "function") {
                DiscordNative.clipboard.copy(text);
                return true;
            }
        } catch { }
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            return true;
        }
        return false;
    };

    const domWatch = (() => {
        const subs = new Set();
        let mo = null;
        const start = () => {
            if (mo || !document.body) return;
            mo = new MutationObserver(muts => {
                for (const fn of subs) {
                    try {
                        fn(muts);
                    } catch (e) {
                        warn("page watcher failed:", e);
                    }
                }
            });
            mo.observe(document.body, { childList: true, subtree: true });
        };
        return fn => {
            subs.add(fn);
            if (document.body) start();
            else ready(start);
            return () => subs.delete(fn);
        };
    })();

    const ctxMenus = { handlers: new Set(), target: null, observer: null };
    const ctxSetup = () => {
        if (ctxMenus.observer) return;
        document.addEventListener("contextmenu", e => (ctxMenus.target = e.target instanceof Element ? e.target : null), true);
        const seen = new WeakSet();
        const handle = menu => {
            if (seen.has(menu) || !ctxMenus.target) return;
            seen.add(menu);
            const navId = menu.id || "";
            for (const h of ctxMenus.handlers) {
                if (h.navIds !== "*" && !h.navIds.includes(navId)) continue;
                try {
                    const out = h.build({ navId, menu, target: ctxMenus.target });
                    if (!out) continue;
                    const { items = Array.isArray(out) ? out : [], hide = [] } = Array.isArray(out) ? {} : out;
                    for (const id of hide) {
                        const el = menu.querySelector(`[id="${`${navId}-${id}`.replace(/["\\]/g, "\\$&")}"]`);
                        if (el) el.style.display = "none";
                    }
                    if (hide.length) {
                        for (const g of menu.querySelectorAll('[role="group"]')) {
                            if ([...g.children].length && [...g.children].every(c => c.style.display === "none")) {
                                g.style.display = "none";
                                const sep = g.previousElementSibling;
                                if (sep && /separator/.test(sep.className)) sep.style.display = "none";
                            }
                        }
                    }
                    if (items.length) ctxAppendGroup(menu, navId, items.filter(Boolean));
                } catch (e) {
                    warn(`context menu handler (${h.plugin}) failed:`, e);
                }
            }
        };
        ctxMenus.observer = true;
        ready(() => domWatch(muts => {
            if (!ctxMenus.handlers.size) return;
            for (const m of muts) for (const n of m.addedNodes) {
                if (n.nodeType !== 1) continue;
                if (n.matches('[role="menu"]')) handle(n);
                if (!n.firstElementChild || n.closest('[data-list-id="chat-messages"]')) continue;
                for (const el of n.querySelectorAll('[role="menu"]')) handle(el);
            }
        }));
    };
    const ctxClose = () => {
        for (const t of [document.activeElement, document]) {
            try {
                t && t.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true }));
            } catch { }
        }
    };
    const ctxMakeItem = (menu, navId, it) => {
        const scroller = menu.querySelector('[class*="scroller"]') || menu;
        const listItems = ctxListGroups(scroller).flatMap(g => [...g.querySelectorAll(':scope > [role="menuitem"]:not(.bt-menuitem)')]);
        const samples = listItems.length ? listItems : [...menu.querySelectorAll('[role="menuitem"]:not(.bt-menuitem)')].filter(n => !n.closest('[role="group"]') || !ctxIsRow(n.closest('[role="group"]')));
        const enabled = n => n.getAttribute("aria-disabled") !== "true" && !/(^|\s)disabled|_disabled|disabled_/i.test(String(n.className || ""));
        const sample = samples.find(n => n.style.display !== "none" && enabled(n)) || samples.find(enabled) || samples.find(n => n.style.display !== "none") || samples[0];
        let item;
        if (sample) {
            item = sample.cloneNode(true);
            item.style.removeProperty("display");
            item.removeAttribute("aria-disabled");
            for (const n of [item, ...item.querySelectorAll("*")]) {
                for (const c of [...n.classList]) if (/disabled/i.test(c)) n.classList.remove(c);
            }
            item.style.removeProperty("pointer-events");
            item.style.removeProperty("opacity");
            item.removeAttribute("aria-expanded");
            item.removeAttribute("aria-haspopup");
            item.querySelectorAll('[class*="iconContainer"], [class*="subtext"], [class*="hint"], [class*="caret"], svg, img').forEach(n => n.remove());
            const label = item.querySelector('[class*="label"]') || item;
            label.textContent = it.label;
        } else {
            item = $("div", { role: "menuitem", textContent: it.label });
            item.style.cssText = "padding:6px 8px;margin:2px 0;border-radius:4px;font-size:14px;font-weight:500";
        }
        item.id = `${navId}-${it.id || "bt-" + String(it.label).toLowerCase().replace(/\W+/g, "-")}`;
        item.classList.add("bt-menuitem");
        if (it.danger) item.classList.add("bt-menuitem-danger");
        if (it.disabled) {
            item.classList.add("bt-menuitem-disabled");
            item.setAttribute("aria-disabled", "true");
        }
        item.tabIndex = -1;
        item.addEventListener(
            "click",
            e => {
                e.preventDefault();
                e.stopImmediatePropagation();
                if (it.disabled) return;
                try {
                    it.action();
                } catch (err) {
                    warn("menu item failed:", err);
                }
                ctxClose();
            },
            true,
        );
        return item;
    };
    const ctxIsRow = group => {
        try {
            const cs = getComputedStyle(group);
            if (/flex|grid/.test(cs.display) && (cs.flexDirection || "row").startsWith("row") && cs.display !== "grid") return group.children.length > 1;
            if (cs.display === "grid") return true;
        } catch { }
        return !!group.querySelector('[class*="emoji"], img[alt]') && !group.querySelector('[class*="label"]');
    };
    const ctxListGroups = scroller => [...scroller.querySelectorAll(':scope > [role="group"]')].filter(g => !ctxIsRow(g) && g.querySelector('[role="menuitem"] [class*="label"]'));
    const ctxAppendGroup = (menu, navId, items) => {
        const scroller = menu.querySelector('[class*="scroller"]') || menu;
        const groups = scroller.querySelectorAll(':scope > [role="group"]');
        const sep = scroller.querySelector(':scope > [class*="separator"]');
        if (groups.length && sep) scroller.append(sep.cloneNode(true));
        const template = ctxListGroups(scroller).pop();
        const group = template ? template.cloneNode(false) : $("div", { role: "group" });
        group.style.display = "";
        group.classList.add("bt-menu-group");
        group.append(...items.map(it => ctxMakeItem(menu, navId, it)));
        scroller.append(group);
    };
    const ctxCss = `
        .bt-menuitem { cursor: pointer; }
        .bt-menu-group { display: flex !important; flex-direction: column !important; }
        .bt-menu-group > .bt-menuitem { width: auto !important; white-space: nowrap; }
        .bt-menuitem:hover { background: var(--menu-item-default-hover-bg, var(--brand-500, #5865f2)) !important; color: var(--white, #fff) !important; }
        .bt-menuitem-danger, .bt-menuitem-danger * { color: var(--status-danger, #f23f43) !important; }
        .bt-menuitem-danger:hover { background: var(--status-danger, #f23f43) !important; }
        .bt-menuitem-danger:hover, .bt-menuitem-danger:hover * { color: #fff !important; }
        .bt-menuitem.bt-menuitem-disabled { opacity: .5; cursor: not-allowed; }
        .bt-menuitem.bt-menuitem-disabled:hover { background: transparent !important; color: inherit !important; }
        .bt-menuitem-danger.bt-menuitem-disabled:hover { color: var(--status-danger, #f23f43) !important; }`;

    const storeCache = new Map();
    const discordStore = name => {
        if (!storeCache.get(name)) storeCache.set(name, wpFind(storeNamed(name)));
        return storeCache.get(name) || null;
    };
    let tokenModule = null;
    const discordToken = () => {
        try {
            const t = discordStore("AuthenticationStore")?.getToken?.();
            if (typeof t === "string" && t) return t;
        } catch { }
        tokenModule ??= wpFind(c => typeof c.getToken === "function" && typeof c.setToken === "function");
        try {
            const t = tokenModule ? tokenModule.getToken() : null;
            return typeof t === "string" && t ? t : null;
        } catch {
            return null;
        }
    };
    let httpModule;
    const discordHttp = () => {
        if (httpModule === undefined || httpModule === null) {
            httpModule = wpFind(c => ["get", "post", "put", "patch", "del"].every(k => typeof c[k] === "function") && typeof c.getAPIBaseURL === "function");
        }
        return httpModule || null;
    };
    const httpError = e => Object.assign(new Error((e && e.body && e.body.message) || (e && e.message) || `HTTP ${e && e.status}`), { status: e && e.status, data: e && e.body });
    const discordRest = async (method, path, body) => {
        const http = discordHttp();
        if (http) {
            let res;
            try {
                res = await http[method === "DELETE" ? "del" : method.toLowerCase()]({ url: path, body, oldFormErrors: true });
            } catch (e) {
                if (e && (e.status || e.body)) throw httpError(e);
                warn("Discord's HTTP client failed, trying a plain request:", e);
                res = undefined;
            }
            if (res !== undefined) {
                if (res && typeof res === "object" && "status" in res && !res.ok && res.status >= 400) throw httpError(res);
                if (res && typeof res === "object" && "body" in res) {
                    if (typeof res.json === "function" && res.body && typeof res.body.getReader === "function") return await res.json();
                    if (typeof res.body === "string") {
                        try { return res.body ? JSON.parse(res.body) : null; } catch { return res.body; }
                    }
                    return res.body;
                }
                if (res === null || typeof res !== "object" || "ok" in res || "headers" in res) return res;
                warn("Discord's HTTP client returned something that isn't a response; using plain requests from now on.");
                httpModule = false;
            }
        }
        const token = discordToken();
        if (!token) throw new Error("not logged in (no token found)");
        const res = await fetch(`${location.origin}/api/v9${path}`, {
            method,
            headers: { Authorization: token, ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        const text = await res.text();
        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch { }
        if (!res.ok) throw Object.assign(new Error((data && data.message) || `HTTP ${res.status}`), { status: res.status, data });
        return data;
    };
    let messageActions;
    const discordSendMessage = async (channelId, content) => {
        messageActions ??= wpFind(c => typeof c.sendMessage === "function" && typeof c.editMessage === "function" && typeof c.deleteMessage === "function") || null;
        const id = String(channelId);
        if (messageActions) {
            return messageActions.sendMessage(id, { content: String(content), tts: false, invalidEmojis: [], validNonShortcutEmojis: [] }, undefined, {});
        }
        return discordRest("POST", `/channels/${id}/messages`, { content: String(content), tts: false, flags: 0, nonce: String(BigInt(Date.now() - 1420070400000) << 22n) });
    };
    const discordApi = Object.freeze({
        store: discordStore,
        rest: Object.freeze({
            get: p => discordRest("GET", p),
            post: (p, b) => discordRest("POST", p, b ?? {}),
            put: (p, b) => discordRest("PUT", p, b),
            patch: (p, b) => discordRest("PATCH", p, b ?? {}),
            del: p => discordRest("DELETE", p),
        }),
        route() {
            const m = /^\/channels\/(@me|\d+)(?:\/(\d+))?(?:\/(\d+))?/.exec(location.pathname) || [];
            return { guildId: m[1] || null, channelId: m[2] || null, messageId: m[3] || null };
        },
        currentUser() {
            try {
                return discordStore("UserStore")?.getCurrentUser() || null;
            } catch {
                return null;
            }
        },
        messageIdsOf(el) {
            const li = el && el.closest && el.closest('[id^="chat-messages-"]');
            const m = li && /^chat-messages-(\d+)-(\d+)$/.exec(li.id);
            return m ? { channelId: m[1], messageId: m[2] } : null;
        },
        getMessage(channelId, messageId) {
            try {
                return discordStore("MessageStore")?.getMessage(channelId, messageId) || null;
            } catch {
                return null;
            }
        },
        dispatch(action) {
            return flux.dispatcher ? flux.dispatcher.dispatch(action) : undefined;
        },
        onMessageSend(fn) {
            if (typeof fn !== "function") throw new TypeError("onMessageSend expects a function");
            messageSendListeners.add(fn);
            return () => messageSendListeners.delete(fn);
        },
        onMessageEdit(fn) {
            if (typeof fn !== "function") throw new TypeError("onMessageEdit expects a function");
            messageEditListeners.add(fn);
            return () => messageEditListeners.delete(fn);
        },
        sendMessage: discordSendMessage,
    });

    const xxh64 = str => {
        const M = (1n << 64n) - 1n, P1 = 11400714785074694791n, P2 = 14029467366897019727n, P3 = 1609587929392839161n, P4 = 9650029242287828579n, P5 = 2870177450012600261n;
        const rotl = (x, r) => ((x << BigInt(r)) | (x >> BigInt(64 - r))) & M;
        const b = [];
        for (const ch of str) {
            const c = ch.codePointAt(0);
            if (c < 0x80) b.push(c);
            else if (c < 0x800) b.push(0xC0 | c >> 6, 0x80 | c & 63);
            else if (c < 0x10000) b.push(0xE0 | c >> 12, 0x80 | c >> 6 & 63, 0x80 | c & 63);
            else b.push(0xF0 | c >> 18, 0x80 | c >> 12 & 63, 0x80 | c >> 6 & 63, 0x80 | c & 63);
        }
        const n = b.length;
        const u64 = i => { let v = 0n; for (let k = 7; k >= 0; k--) v = (v << 8n) | BigInt(b[i + k]); return v; };
        const u32 = i => BigInt((b[i] | b[i + 1] << 8 | b[i + 2] << 16 | b[i + 3] << 24) >>> 0);
        const round = (acc, x) => (rotl((acc + x * P2) & M, 31) * P1) & M;
        const merge = (acc, v) => (((acc ^ round(0n, v)) * P1) & M) + P4 & M;
        let i = 0, h;
        if (n >= 32) {
            let v1 = (P1 + P2) & M, v2 = P2, v3 = 0n, v4 = (M + 1n - P1) & M;
            for (; i + 32 <= n; i += 32) { v1 = round(v1, u64(i)); v2 = round(v2, u64(i + 8)); v3 = round(v3, u64(i + 16)); v4 = round(v4, u64(i + 24)); }
            h = (rotl(v1, 1) + rotl(v2, 7) + rotl(v3, 12) + rotl(v4, 18)) & M;
            h = merge(merge(merge(merge(h, v1), v2), v3), v4);
        } else h = P5;
        h = (h + BigInt(n)) & M;
        for (; i + 8 <= n; i += 8) h = ((rotl(h ^ round(0n, u64(i)), 27) * P1) & M) + P4 & M;
        if (i + 4 <= n) { h = ((rotl(h ^ ((u32(i) * P1) & M), 23) * P2) & M) + P3 & M; i += 4; }
        for (; i < n; i++) h = (rotl(h ^ ((BigInt(b[i]) * P5) & M), 11) * P1) & M;
        h = ((h ^ (h >> 33n)) * P2) & M; h = ((h ^ (h >> 29n)) * P3) & M;
        return h ^ (h >> 32n);
    };
    const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const hashMessageKey = key => {
        const h = xxh64(key), bytes = [];
        const len = Math.ceil(Math.floor(Math.log2(Number(h)) + 1) / 8);
        for (let k = 0; k < len; k++) bytes.unshift(Number((h >> BigInt(8 * k)) & 255n));
        const isBigEndian = (() => { const e = new Uint8Array(4); new Uint32Array(e.buffer)[0] = 1; return !(e[0] & 1); })();
        const o = isBigEndian ? bytes : bytes.reverse();
        return [B64[o[0] >> 2], B64[(o[0] & 3) << 4 | o[1] >> 4], B64[(o[1] & 15) << 2 | o[2] >> 6], B64[o[2] & 63], B64[o[3] >> 2], B64[(o[3] & 3) << 4 | o[4] >> 4]].join("");
    };
    const canonicalize = m => {
        const isString = typeof m === "string";
        let src = (isString ? m : m.source).replaceAll(/#{intl::([\w$+/]*)(?:::(\w+))?}/g, (_, key, mod) => {
            const h = mod === "raw" ? key : hashMessageKey(key);
            const bracket = !Number.isNaN(Number(h[0])) || h.includes("+") || h.includes("/");
            if (isString) return bracket ? `["${h}"]` : `.${h}`;
            return bracket ? String.raw`(?:\["${h}"\])`.replaceAll("+", "\\+") : String.raw`(?:\.${h})`;
        });
        if (isString) return src;
        src = src.replaceAll(/(\\*)\\i/g, (all, slashes) => slashes.length % 2 === 0 ? `${slashes}(?:[A-Za-z_$][\\w$]*)` : all.slice(1));
        return new RegExp(src, m.flags);
    };
    wp.api.hashMessageKey = hashMessageKey;
    const definePatch = patch => wp.patches.push({
        ...patch,
        find: canonicalize(patch.find),
        replacements: patch.replacements.map(r => ({ ...r, match: canonicalize(r.match) })),
        applied: false,
    });

    const runMessageListeners = async (listeners, args, label) => {
        for (const listener of [...listeners]) {
            try {
                const result = await listener(...args);
                if (result && result.cancel) return true;
            } catch (e) {
                warn(`${label} listener failed:`, e);
            }
        }
        return false;
    };
    wp.api.beforeMessageSend = (...args) => runMessageListeners(messageSendListeners, args, "message pre-send");
    wp.api.beforeMessageEdit = (...args) => runMessageListeners(messageEditListeners, args, "message pre-edit");

    const isLayoutTypes = o =>
        o && typeof o === "object" && ["SECTION", "SIDEBAR_ITEM", "PANEL", "CUSTOM"].every(k => typeof o[k] === "number");

    function wpAbsorb(module) {
        if (!module || typeof module !== "object" || wp.seen.has(module)) return;
        wp.seen.add(module);
        wp.modules.push(module);
        if (!wp.React || !wp.layoutTypesFound) inspectExports(module.exports);
        if (wp.waiters.length) checkWaiters(module.exports);
    }
    const inspectExports = exp => {
        if (!exp || (typeof exp !== "object" && typeof exp !== "function")) return;
        try {
            if (
                !wp.React &&
                typeof exp.createElement === "function" &&
                typeof exp.useEffect === "function" &&
                typeof exp.Component === "function" &&
                typeof exp.version === "string"
            ) {
                wp.React = exp;
            }
            if (!wp.layoutTypesFound) {
                const candidates = [exp];
                for (const key of Object.keys(exp)) {
                    try {
                        candidates.push(exp[key]);
                    } catch { }
                }
                const found = candidates.find(isLayoutTypes);
                if (found) {
                    wp.LayoutTypes = { ...wp.LayoutTypes, ...found };
                    wp.layoutTypesFound = true;
                }
            }
        } catch { }
    };

    const patchFactory = (id, factory) => {
        if (typeof factory !== "function" || factory.__bt) return factory;
        let code;
        try {
            code = Function.prototype.toString.call(factory);
        } catch {
            return factory;
        }

        let run = factory;
        const hits = wp.patches.filter(p => !p.applied && code.includes(p.find) && (!p.predicate || (() => { try { return !!p.predicate(); } catch { return false; } })()));
        if (hits.length) {
            let src = code;
            const ok = [];
            for (const p of hits) {
                let next = src;
                for (const r of p.replacements) next = next.replace(r.match, r.replace);
                if (next === src) warn(`patch "${p.name}" found its module (${id}) but didn't match. Discord probably changed.`);
                else {
                    src = next;
                    ok.push(p);
                }
            }
            if (ok.length) {
                if (!/^(function\b|async\b|\(|[\w$]+\s*=>)/.test(src)) src = src.replace(/^[^(]*/, "function");
                try {
                    run = (0, eval)(`(${src})\n//# sourceURL=bthemer://patched/${id}.js`);
                    for (const p of ok) {
                        p.applied = true;
                        wp.applied.push(p.name);
                    }
                } catch (e) {
                    warn(`couldn't apply patch(es) ${ok.map(p => `"${p.name}"`).join(", ")}:`, e);
                    run = factory;
                }
            }
        }

        const wrapped = function (module) {
            const result = run.apply(this, arguments);
            if (module) wpAbsorb(module);
            return result;
        };
        wrapped.__bt = true;
        wrapped.toString = () => code;
        return wrapped;
    };

    const patchChunk = chunk => {
        const modules = chunk && chunk[1];
        if (!modules || typeof modules !== "object") return;
        for (const id of Object.keys(modules)) modules[id] = patchFactory(id, modules[id]);
    };

    const hookChunkArray = arr => {
        if (!Array.isArray(arr) || arr.__btHooked) return arr;
        Object.defineProperty(arr, "__btHooked", { value: true });
        for (const chunk of arr) patchChunk(chunk);
        let current = arr.push;
        Object.defineProperty(arr, "push", {
            configurable: true,
            get() {
                const target = current;
                return function (...chunks) {
                    for (const c of chunks) {
                        try {
                            patchChunk(c);
                        } catch (e) {
                            warn("couldn't inspect a Discord chunk:", e);
                        }
                    }
                    return target.apply(this, chunks);
                };
            },
            set(fn) {
                current = fn;
            },
        });
        return arr;
    };

    function wpAbsorbLoaded() {
        if (!wp.loaderReady) return false;
        if (!wp.reqAsked && Array.isArray(window[CHUNK_GLOBAL])) {
            wp.reqAsked = true;
            try {
                window[CHUNK_GLOBAL].push([[Symbol("be-themer")], {}, req => {
                    if (!req || wp.reqs.includes(req)) return;
                    wp.reqs.push(req);
                    const size = r => (r && r.c ? Object.keys(r.c).length : -1);
                    if (!wp.req || size(req) > size(wp.req)) wp.req = req;
                    wpAbsorbLoaded();
                }]);
            } catch (e) {
                warn("couldn't read Discord's loaded modules:", e);
            }
        }
        const before = wp.modules.length;
        for (const req of wp.reqs) {
            const cache = req && req.c;
            if (!cache) continue;
            const ids = Object.keys(cache);
            if (wp.reqSizes.get(req) === ids.length) continue;
            wp.reqSizes.set(req, ids.length);
            for (const id of ids) wpAbsorb(cache[id]);
        }
        return wp.modules.length > before;
    }

    try {
        let chunks = window[CHUNK_GLOBAL];
        if (chunks) hookChunkArray(chunks);
        Object.defineProperty(window, CHUNK_GLOBAL, {
            configurable: true,
            get: () => chunks,
            set: value => {
                chunks = hookChunkArray(value);
            },
        });
    } catch (e) {
        warn("couldn't hook Discord's module loader; settings will only be in the Ctrl+Alt+B window.", e);
    }
    try {
        const desc = Object.getOwnPropertyDescriptor(Function.prototype, "m");
        if (!desc || desc.configurable) Object.defineProperty(Function.prototype, "m", {
            configurable: true,
            enumerable: false,
            set(modules) {
                Object.defineProperty(this, "m", { value: modules, configurable: true, enumerable: true, writable: true });
                let isRequire = false;
                try { isRequire = Function.prototype.toString.call(this).includes("exports:{}"); } catch { }
                if (!isRequire || !modules || typeof modules !== "object") return;
                try {
                    for (const id of Object.keys(modules)) modules[id] = patchFactory(id, modules[id]);
                    if (!wp.reqs.includes(this)) wp.reqs.push(this);
                    if (!wp.req || Object.keys(modules).length > Object.keys(wp.req.m || {}).length) wp.req = this;
                } catch (e) {
                    warn("couldn't patch Discord's main bundle:", e);
                }
            },
        });
    } catch (e) {
        warn("couldn't hook webpack's module table:", e);
    }
    wp.loaderReady = true;
    wpAbsorbLoaded();
    {
        let tries = 0;
        const again = setInterval(() => {
            if (++tries > 120 || (!wp.waiters.length && wp.reqs.length)) return clearInterval(again);
            if (wp.waiters.length) wpAbsorbLoaded();
        }, 500);
    }

    wp.api.fakeNitroEnabled = key => !!plugins.get("fakeNitro")?.running && (key == null || !!pluginState("fakeNitro").settings[key]);
    const streamQualityBypass = () => {
        const st = S.plugins?.fakeNitro;
        return !!st?.enabled && (st.settings?.streamQuality ?? true);
    };
    definePatch({
        name: "fake nitro stream availability",
        find: "canUseCustomStickersEverywhere:",
        predicate: streamQualityBypass,
        replacements: [
            { match: /canUseHighVideoUploadQuality:/, replace: "$&()=>true,_$&" },
            { match: /canStreamQuality:/, replace: "$&()=>true,_$&" },
        ],
    });
    definePatch({
        name: "fake nitro quality presets",
        find: "#{intl::STREAM_FPS_OPTION}",
        predicate: streamQualityBypass,
        replacements: [{ match: /guildPremiumTier:\i\.\i\.TIER_\d,?/g, replace: "" }],
    });
    definePatch({
        name: "fake nitro stream preview pause",
        find: "streamerPaused()",
        replacements: [{
            match: /streamerPaused\(\)\{/,
            replace: '$&if(window.BThemer.__wp.fakeNitroEnabled("disableStreamPause"))return false;',
        }],
    });
    definePatch({
        name: "fake nitro stream tile focus",
        find: "StreamTile",
        replacements: [{
            match: /[\w$]+\.[\w$]+\.isFocused\(\)/,
            replace: '(window.BThemer.__wp.fakeNitroEnabled("disableStreamPause")||$&)',
        }],
    });

    // Be Themer section in Discord's User Settings
    definePatch({
        name: "settings section",
        find: ".buildLayout().map",
        replacements: [{ match: /([\w$]+)\.buildLayout\(\)(?=\.map)/, replace: "window.BThemer.__wp.settingsLayout($1)" }],
    });

    definePatch({
        name: "message pre-send hooks",
        find: ".handleSendMessage,onResize:",
        replacements: [{
            match: /(?<=channel:[\w$]+\}\)\.then\()(?:async )?([\w$]+=>.+?let ([\w$]+)=[\w$]+\.[\w$]+\.parse\(([\w$]+),.+?\.getSendMessageOptions\(\{.+?\}\)?;)(?=.+?([\w$]+)\.flags=)(?<=\)\(({.+?})\)\.then.+?)/,
            replace: (match, rest, parsed, channel, _options, props) => `async ${rest}if(await window.BThemer.__wp.beforeMessageSend(${channel}.id,${parsed},${_options},${props}))return{shouldClear:false,shouldRefocus:true};`,
        }],
    });
    definePatch({
        name: "message pre-edit hooks",
        find: "#{intl::EDIT_TEXTAREA_HELP}",
        replacements: [{
            match: /(?<=,channel:[\w$]+,message:[\w$]+\}\)\.then\().+?(?=[\w$]+\.content!==this\.props\.message\.content&&[\w$]+\((.+?)\)\})/,
            replace: (match, args) => `async ${match}if(await window.BThemer.__wp.beforeMessageEdit(${args}))return Promise.resolve({shouldClear:false,shouldRefocus:true});`,
        }],
    });

    const PAGES = [
        { id: "general", title: "Be Themer", image: LOGO, icon: "M12 2.5l2.2 5.3 5.3 2.2-5.3 2.2L12 17.5l-2.2-5.3L4.5 10l5.3-2.2zM18.5 15l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" },
        { id: "theme", title: "Discord Theme", icon: "M12 3a9 9 0 0 0 0 18c.8 0 1.5-.7 1.5-1.5 0-.4-.1-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.4-4-8-9-8zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" },
        { id: "servers", title: "Server Theme", icon: "M5 3h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 10h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm2-7a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" },
        { id: "maker", title: "Theme Maker", icon: "M4 4h6v5H4zm10 0h6v5h-6zM4 15h6v5H4zm10 0h6v5h-6zM10 6.5h4v1h-4zM7 9v6h1V9zm9 0v3.5h-4V15h-1v-3.5h4V9z" },
        { id: "plugins", title: "Plugins", icon: "M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.8h1.5a2.7 2.7 0 0 1 0 5.4H2V20a2 2 0 0 0 2 2h3.8v-1.5a2.7 2.7 0 0 1 5.4 0V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z" },
        { id: "meow", title: "Meow", icon: "M4.2 3.9c0-.65.75-.98 1.25-.55L9.6 7.1a11 11 0 0 1 4.8 0l4.15-3.75c.5-.43 1.25-.1 1.25.55v6.3c.7 1.2.8 2.6.8 4.4 0 3.8-3.85 6.9-8.6 6.9s-8.6-3.1-8.6-6.9c0-1.8.1-3.2.8-4.4zM7.75 14.1a1.25 1.55 0 1 0 2.5 0 1.25 1.55 0 1 0-2.5 0zm6 0a1.25 1.55 0 1 0 2.5 0 1.25 1.55 0 1 0-2.5 0zm-2.7 2.75h1.9l-.95 1.1z", evenOdd: true },
        { id: "owlie", title: "Owlie", evenOdd: true, icon: "M4 3.2l3.6 2.3a9.5 9.5 0 0 1 8.8 0L20 3.2v8.3c0 5-3.6 9.3-8 9.3s-8-4.3-8-9.3zM8.6 13.4a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2zm6.8 0a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2zM12 13.6l-1.2 1.6h2.4z" },
        { id: "splash", title: "Splash", evenOdd: true, icon: "M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6v2h3v2H7v-2h3v-2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm8 3.2l1.2 2.6 2.6 1.2-2.6 1.2L12 13.8l-1.2-2.6L8.2 10l2.6-1.2z" },
        { id: "quickcss", title: "Custom CSS", icon: "M8.7 16.6 4.1 12l4.6-4.6L7.3 6l-6 6 6 6zm6.6 0 4.6-4.6-4.6-4.6L16.7 6l6 6-6 6z" },
    ].filter(p => featureOn({ theme: "themes", servers: "themes", maker: "themes", splash: "splash", quickcss: "customCss", meow: "meow", owlie: "owlie" }[p.id] || p.id));

    let ErrorBoundary = null;
    const getErrorBoundary = () => {
        if (ErrorBoundary || !wp.React || typeof wp.React.Component !== "function") return ErrorBoundary;
        const R = wp.React;
        ErrorBoundary = class BeThemerErrorBoundary extends R.Component {
            constructor(props) {
                super(props);
                this.state = { error: null };
            }
            static getDerivedStateFromError(error) {
                return { error };
            }
            componentDidCatch(error) {
                warn("a settings page crashed (Discord kept running):", error);
            }
            render() {
                if (!this.state.error) return this.props.children;
                return R.createElement("div", { className: "bt-native bt-crashed" },
                    `Be Themer couldn't show this page (${this.state.error.message || this.state.error}). Press Ctrl+Alt+B to open it in a window instead.`);
            }
        };
        return ErrorBoundary;
    };

    const mountPanel = (page, part) => el => {
        const key = part ? `${page}|${part}` : page;
        if (!el || el.__btPage === key) return;
        el.__btPage = key;
        try {
            el.replaceChildren(buildPanel(page, true, part));
        } catch (e) {
            warn(`couldn't build the "${page}" page:`, e);
            el.textContent = `Be Themer couldn't show this page (${e.message}). Press Ctrl+Alt+B to open it in a window instead.`;
        }
    };

    const pageComponents = {};
    const pageComponent = (page, part) =>
        (pageComponents[part ? `${page}|${part}` : page] ??= function BeThemerSettingsPage() {
            const R = wp.React;
            const body = R.createElement("div", { className: "bt-native", ref: mountPanel(page, part) });
            const Boundary = getErrorBoundary();
            return Boundary ? R.createElement(Boundary, null, body) : body;
        });

    const NATIVE_SUBPAGES = ["theme"];
    const settingsSection = () => {
        const R = wp.React;
        const T = wp.LayoutTypes;
        const icon = (d, evenOdd, image) => () =>
            image
                ? R.createElement("img", { src: image, width: 20, height: 20, alt: "", "aria-hidden": true, draggable: false, style: { display: "block", borderRadius: 5, objectFit: "cover" } })
                : R.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true }, R.createElement("path", evenOdd ? { d, fillRule: "evenodd" } : { d }));
        const entry = ({ id, title, icon: d, evenOdd, image }) => ({
            key: `bthemer_${id}`,
            type: T.SIDEBAR_ITEM,
            useTitle: () => title,
            icon: icon(d, evenOdd, image),
            buildLayout: () => [{
                key: `bthemer_${id}_panel`,
                type: T.PANEL,
                useTitle: () => title,
                buildLayout: () => (NATIVE_SUBPAGES.includes(id) ? subCategories(id, title) : [{
                    key: `bthemer_${id}_category`,
                    type: T.CATEGORY,
                    buildLayout: () => [{
                        key: `bthemer_${id}_custom`,
                        type: T.CUSTOM,
                        Component: pageComponent(id),
                        useSearchTerms: () => [title, "Be Themer", "theme", "plugins", "custom css", "wallpaper"],
                    }],
                }]),
            }],
        });
        const subCategories = (id, title) => {
            const slug = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
            const sections = SCHEMA.filter(sec => (sec.page || "general") === id && sec.title !== title);
            return [
                {
                    key: `bthemer_${id}_category`,
                    type: T.CATEGORY,
                    buildLayout: () => [{ key: `bthemer_${id}_custom`, type: T.CUSTOM, Component: pageComponent(id, "head"), useSearchTerms: () => [title, "Be Themer", "theme"] }],
                },
                ...sections.map(sec => ({
                    key: `bthemer_${id}_${slug(sec.title)}_category`,
                    type: T.CATEGORY,
                    useTitle: () => sec.title,
                    buildLayout: () => [{
                        key: `bthemer_${id}_${slug(sec.title)}_custom`,
                        type: T.CUSTOM,
                        Component: pageComponent(id, sec.title),
                        useSearchTerms: () => [sec.title, title, "Be Themer", ...(sec.items || []).map(it => it[1])],
                    }],
                })),
            ];
        };
        return {
            key: "bthemer_section",
            type: T.SECTION,
            useTitle: () => "Be Themer",
            buildLayout: () => PAGES.map(entry),
        };
    };

    wp.api.settingsLayout = builder => {
        const layout = builder.buildLayout();
        try {
            if (builder.key !== "$Root" || !Array.isArray(layout) || !wp.React) return layout;
            wp.settingsPatched = true;
            if (layout.some(node => node && node.key === "bthemer_section")) return layout;
            let index = layout.findIndex(node => node && node.key === "billing_section");
            if (index < 0) index = Math.min(2, layout.length);
            layout.splice(index, 0, settingsSection());
        } catch (e) {
            warn("couldn't add Be Themer to Discord's settings:", e);
        }
        return layout;
    };

    const sheets = { themes: new CSSStyleSheet(), vars: new CSSStyleSheet(), ui: new CSSStyleSheet(), quick: new CSSStyleSheet() };
    const pluginSheets = new Set();
    const ourSheets = () => [sheets.themes, sheets.vars, sheets.ui, ...pluginSheets, sheets.quick];

    const mountSheets = () => {
        if (!document.documentElement) return;
        const ours = ourSheets();
        const others = document.adoptedStyleSheets.filter(s => !ours.includes(s) && !s._bt);
        document.adoptedStyleSheets = [...others, ...ours];
    };
    const newSheet = () => Object.assign(new CSSStyleSheet(), { _bt: true });
    for (const s of Object.values(sheets)) s._bt = true;

    const setCss = (sheet, css, label) => {
        if (sheet._btText === css) return;
        if (/@import\b/i.test(css)) warn(`${label} uses @import, which Be Themer can't load. Paste the imported CSS in instead.`);
        try {
            sheet.replaceSync(css.replace(/@import[^;]*;/gi, ""));
            sheet._btText = css;
        } catch (e) {
            sheet._btText = undefined;
            warn(`Couldn't load ${label}:`, e);
        }
    };

    const applyThemes = () => {
        const byFile = new Map(state.themes.map(t => [t.file, t]));
        const css = effectiveThemes()
            .map(f => byFile.get(f))
            .filter(Boolean)
            .map(t => `/* ${t.file} */\n${t.css}`)
            .join("\n");
        setCss(sheets.themes, featureOn("themes") ? css : "", "themes");
        setCss(sheets.quick, featureOn("customCss") ? state.quickCss || "" : "", "QuickCSS");
        sheets.themes.disabled = sheets.quick.disabled = !enabled;
        refreshThemeLists();
    };

    const reloadThemes = () => {
        state = Native.getState() || state;
        mountSheets();
        applyThemes();
        refreshServerSections();
        for (const ed of document.querySelectorAll(".bt-quickcss")) {
            if (document.activeElement !== ed && ed.value !== state.quickCss) ed.value = state.quickCss || "";
        }
    };

    const HUE = (() => {
        const bez = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
        const easeInOut = x => {
            let lo = 0, hi = 1;
            for (let i = 0; i < 30; i++) {
                const mid = (lo + hi) / 2;
                if (bez(0.42, 0.58, mid) < x) lo = mid;
                else hi = mid;
            }
            return bez(0, 1, (lo + hi) / 2);
        };
        const N = 40, values = [];
        for (let i = 0; i <= N; i++) values.push(35 * easeInOut(i / N));
        let biggest = 0;
        for (let i = 1; i <= N; i++) biggest = Math.max(biggest, values[i] - values[i - 1]);
        return {
            steps: Math.max(2, Math.ceil(biggest / 0.15)),
            keyframes: `@keyframes bt-hue-eased { ${values.map((v, i) => `${((i / N) * 100).toFixed(1)}% { filter: var(--bt-wall-filter) hue-rotate(${v.toFixed(3)}deg); }`).join(" ")} }`,
        };
    })();
    const varsCss = () => {
        const E = effective();
        const ring = /^#[0-9a-f]{3,8}$/i.test(String(E.soundboardRing)) ? E.soundboardRing : "#ff5fa2";
        const showGrad = gradientShown();
        const k = showGrad ? (Number(E.gradIntensity) || 0) / 100 : 0;
        const font = (FONTS[E.font] || FONTS.default)[1];
        return `:root:root {
  --bt-accent: ${E.accent};
  --bt-accent-2: ${E.accent2};
  --bt-glass-rgb: ${hexRgb(E.glassTint).join(" ")};
  --bt-glass-alpha: ${E.translucent ? E.glassOpacity / 100 : 1};
  --bt-blur: ${E.translucent ? E.glassBlur : 0}px;${E.translucent ? "" : `
  --bt-glass-strong: rgb(${hexRgb(E.glassTint).join(" ")});
  --bt-glass-float: rgb(${hexRgb(E.glassTint).map(c => Math.round(c + (255 - c) * 0.04)).join(" ")});
  --bt-glass-filter: none;
  --bt-float-filter: none;`}
  --bt-popup-bg: ${E.opaquePopups ? `rgb(${hexRgb(E.glassTint).map(c => Math.round(c + (255 - c) * 0.07)).join(" ")})` : "var(--bt-glass-float)"};
  --bt-popup-filter: ${E.opaquePopups ? "none" : "var(--bt-float-filter)"};
  --bt-solid-bg: rgb(${hexRgb(E.glassTint).map(c => Math.round(c + (255 - c) * 0.07)).join(" ")});
  --bt-border: ${E.borders ? "rgb(255 255 255 / 0.08)" : "transparent"};
  --bt-radius: ${E.radius}px;
  ${font ? `--bt-font: ${font};` : ""}
  --bt-wallpaper: ${wallpaperCss};
  --bt-wall-blur: ${E.wallpaperBlur}px;
  --bt-wall-brightness: ${E.brightness}%;
  --bt-wall-saturation: ${E.saturation}%;
  --bt-dim: ${E.dim / 100};
  --bt-grad-1: ${E.grad1};
  --bt-grad-2: ${E.grad2};
  --bt-grad-3: ${E.grad3};
  --bt-grad-4: ${E.grad4};
  --bt-grad-base: ${E.gradBase};
  --bt-grad-alpha: ${Math.round(Math.min(k, 1) * 100)}%;
  --bt-grad-size: ${Math.round(20 + 28 * k)}%;
  --bt-bg-animation: ${showGrad && E.gradAnimate && !hasWallpaper ? `bt-hue-eased ${E.gradSpeed}s steps(${HUE.steps}, jump-none) infinite alternate` : "none"};
  --bt-text-shadow: ${E.textShadow ? "0 1px 2px rgb(0 0 0 / 0.45)" : "none"};
  --bt-role-speed: ${Math.min(12, Math.max(1, Number(E.roleSpeed) || 4))}s;
  --bt-sb-ring: ${ring};
}${enabled ? `
/* Discord draws the speaking ring inline: var(--status-speaking) for the mic, var(--brand-500) for the
   soundboard. Giving --brand-500 our colour on just those elements recolours only the soundboard ring. */
[style*="--brand-500"][style*="box-shadow"] { --brand-500: ${ring} !important; }
${soundboardGlowCss(ring)}` : ""}
${HUE.keyframes}`;
    };

    const setRootAttr = (name, value) => {
        const root = document.documentElement;
        if (!root) return;
        if (value === null || value === false || value === undefined) root.removeAttribute(name);
        else root.setAttribute(name, value === true ? "" : value);
    };

    const ROLE_NAMES = [
        '[class*="username_"]',
        '[class*="nameAndDecorators_"] [class*="name_"]',
        '[class*="nameAndDecorators_"] span',
    ].map(sel => `${sel}[style*="color"]:not([style*="--custom-gradient"], [class*="radient"])`).join(", ");

    const uiCss = `
/* Colours come from Discord's own variables (themed or not), so these pages look like the rest of Settings. */
.bt-panel, #bt-window, #bt-settings-inline, #bt-toasts, .bt-cp {
  --bt-ui-head: var(--header-primary, var(--text-strong, #f2f3f5));
  --bt-ui-text: var(--text-normal, #dbdee1);
  --bt-ui-sub: var(--header-secondary, var(--text-secondary, #b5bac1));
  --bt-ui-muted: var(--text-muted, #949ba4);
  --bt-ui-card: var(--background-secondary, #2b2d31);
  --bt-ui-input: var(--input-background, var(--background-tertiary, #1e1f22));
  --bt-ui-line: var(--background-modifier-accent, rgb(78 80 88 / .48));
  --bt-ui-hover: var(--background-modifier-hover, rgb(78 80 88 / .3));
  --bt-ui-selected: var(--background-modifier-selected, rgb(78 80 88 / .6));
  --bt-ui-brand: var(--brand-500, var(--brand-experiment, #5865f2));
  --bt-ui-btn: var(--button-secondary-background, #4e5058);
  --bt-ui-btn-hover: var(--button-secondary-background-hover, #6d6f78);
  --bt-ui-danger: var(--button-danger-background, #da373c);
  --bt-ui-on: var(--status-positive, #23a55a);
  --bt-ui-off: #80848e;
  --bt-ui-value: var(--text-link, #00a8fc);
  --bt-ui-mono: var(--font-code, Consolas, "Cascadia Mono", "Lucida Console", monospace);
  --bt-ui-font: var(--font-primary, "gg sans", "Noto Sans", "Helvetica Neue", Helvetica, Arial, sans-serif);
}

/* page */
.bt-panel { color: var(--bt-ui-text); font: 14px/1.3 var(--bt-ui-font); animation: bt-fade .12s ease; }
.bt-panel h2, .bt-window-title { margin: 0 0 4px; font: 600 20px/24px var(--font-display, var(--bt-ui-font)); color: var(--bt-ui-head); }
.bt-sub { color: var(--bt-ui-muted); font-size: 13px; line-height: 16px; margin: 0 0 16px; }

/* sections: twirl-down groups, state remembered */
.bt-sec { border-bottom: 1px solid var(--bt-ui-line); scroll-margin-top: 12px; }
/* enabled plugins */
.bt-enabled-plugins { margin: 4px 0 14px; }
.bt-enabled-head { font: 700 12px var(--bt-ui-font); text-transform: uppercase; letter-spacing: .02em; color: var(--bt-ui-sub); margin-bottom: 6px; }
.bt-enabled-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.bt-enabled-chip { padding: 3px 10px; border-radius: 999px; font: 500 12px var(--bt-ui-font); color: var(--bt-ui-head); background: var(--bt-ui-hover); box-shadow: inset 0 0 0 1px var(--bt-ui-line); }
.bt-enabled-none { color: var(--bt-ui-sub); font: 13px var(--bt-ui-font); }

/* Theme Maker: the node editor */
.bt-maker { display: flex; flex-direction: column; gap: 10px; }
.bt-maker-bar { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.bt-maker-bar select, .bt-maker-name {
  height: 32px; box-sizing: border-box; padding: 0 10px; border-radius: 6px; border: 1px solid var(--bt-ui-line);
  background: var(--background-secondary, #2b2d31); color: var(--bt-ui-text); font: 500 13px var(--bt-ui-font);
}
.bt-maker-bar select { width: auto; max-width: 220px; flex: 0 1 auto; }
.bt-maker-name { flex: 1 1 160px; min-width: 140px; }
.bt-nodes {
  position: relative; height: 540px; overflow: hidden; border-radius: 10px; border: 1px solid #111; outline: none;
  background-color: #1d1d1f; touch-action: none; user-select: none; cursor: default;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1.5' cy='1.5' r='1.1' fill='%23ffffff' fill-opacity='.09'/%3E%3C/svg%3E");
  background-size: var(--bt-grid, 24px) var(--bt-grid, 24px);
}
.bt-nodes:focus-visible { box-shadow: 0 0 0 2px #ffa31a55; }
.bt-nodes.bt-panning { cursor: grabbing; }
.bt-nodes.bt-nodes-empty::after { content: "No theme open"; position: absolute; inset: 0; display: grid; place-items: center; color: #6d6d70; font: 500 14px var(--bt-ui-font); }
.bt-nodes-world { position: absolute; left: 0; top: 0; transform-origin: 0 0; }
.bt-nodes-wires { position: absolute; left: 0; top: 0; width: 1px; height: 1px; overflow: visible; pointer-events: none; }
.bt-wire { fill: none; stroke-width: 2.4; stroke-linecap: round; }
.bt-wire-c { stroke: #c7c729; }
.bt-wire-n { stroke: #a1a1a1; }
.bt-wire-temp { stroke-dasharray: 6 5; opacity: .85; }
.bt-node {
  position: absolute; min-width: 190px; padding-bottom: 6px; border-radius: 8px; border: 1px solid #141414;
  background: #303033; color: #e6e6e6; font: 12px/1.3 var(--bt-ui-font); box-shadow: 0 8px 22px rgb(0 0 0 / .45);
}
.bt-node.bt-selected { border-color: #ffa31a; box-shadow: 0 0 0 1px #ffa31a, 0 8px 22px rgb(0 0 0 / .45); }
.bt-node-head { padding: 5px 10px; margin-bottom: 4px; border-radius: 7px 7px 0 0; font-weight: 600; color: #fff; cursor: grab; background: #3d3d40; }
.bt-node-head[data-cat="Input"] { background: #83314a; }
.bt-node-head[data-cat="Colour"] { background: #6a6820; }
.bt-node-head[data-cat="Number"] { background: #245b7a; }
.bt-node-head[data-cat="Output"] { background: #4a2d6e; }
.bt-node-in, .bt-node-out, .bt-node-param { position: relative; display: flex; align-items: center; gap: 6px; min-height: 24px; padding: 1px 12px; }
.bt-node-out { justify-content: flex-end; }
.bt-node-label { flex: 1; color: #cfcfcf; white-space: nowrap; }
.bt-node-out .bt-node-label { flex: none; }
.bt-socket { position: absolute; top: 50%; width: 11px; height: 11px; margin-top: -6.5px; border-radius: 50%; border: 1.5px solid #141414; cursor: crosshair; transition: transform .08s ease; }
.bt-node-in .bt-socket { left: -7px; }
.bt-node-out .bt-socket { right: -7px; }
.bt-socket:hover { transform: scale(1.35); }
.bt-socket-c { background: #c7c729; }
.bt-socket-n { background: #a1a1a1; }
.bt-node-in.bt-linked .bt-node-own { display: none; }
.bt-node-color { width: 36px; height: 18px; padding: 0; border: 1px solid #141414; border-radius: 4px; background: none; cursor: pointer; }
.bt-node-param .bt-node-color { width: 100%; height: 24px; }
.bt-node-field { width: 64px; height: 20px; box-sizing: border-box; padding: 0 6px; border: 0; border-radius: 4px; background: #545457; color: #fff; font: inherit; }
select.bt-node-field { width: calc(100% - 24px); margin: 2px 12px; }
.bt-out-val { width: 14px; height: 10px; border-radius: 3px; }
.bt-out-val[data-type="n"] { width: auto; height: auto; color: #9a9a9e; font-size: 11px; }
.bt-maker-preview { display: flex; flex-wrap: wrap; gap: 6px; }
.bt-maker-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 6px; background: var(--bt-ui-hover); color: var(--bt-ui-text); font: 12px var(--bt-ui-font); }
.bt-maker-sw { width: 14px; height: 14px; border-radius: 4px; box-shadow: inset 0 0 0 1px rgb(255 255 255 / .2); }
.bt-maker-empty { padding: 4px 0; color: var(--bt-ui-sub); font: 13px var(--bt-ui-font); }

/* the GitHub button: a round ice crystal */
.bt-gh-wrap { display: flex; flex-direction: column; align-items: center; gap: 7px; margin: 2px 0 20px; }
.bt-gh {
  all: unset; box-sizing: border-box; width: 64px; height: 64px; border-radius: 50%; cursor: pointer; display: grid; place-items: center;
  box-shadow: 0 6px 22px rgb(120 190 245 / .28), 0 1px 2px rgb(0 0 0 / .35);
  transition: transform .18s cubic-bezier(.2, .8, .2, 1), box-shadow .18s ease;
}
.bt-gh-crystal { width: 64px; height: 64px; display: block; overflow: visible; }
.bt-gh-shine { opacity: 0; transform: translateX(0); }
.bt-gh:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 10px 30px rgb(120 190 245 / .45), 0 2px 4px rgb(0 0 0 / .35); }
.bt-gh:hover .bt-gh-shine { animation: bt-gh-shine .9s cubic-bezier(.4, 0, .2, 1); }
.bt-gh:active { transform: translateY(0) scale(.97); }
.bt-gh:focus-visible { outline: 2px solid #9fd0f5; outline-offset: 4px; }
.bt-gh-off { opacity: .55; }
.bt-gh-label { font: 600 13px/16px var(--bt-ui-font); color: var(--bt-ui-head); letter-spacing: .02em; }
@keyframes bt-gh-shine { 0% { opacity: .55; transform: translateX(0); } 100% { opacity: .55; transform: translateX(84px); } }
@media (prefers-reduced-motion: reduce) { .bt-gh, .bt-gh:hover { transition: none; transform: none; } .bt-gh:hover .bt-gh-shine { animation: none; } }

.bt-sec:first-of-type { border-top: 1px solid var(--bt-ui-line); }
.bt-sec-head {
  all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 8px; width: 100%; height: 34px; padding: 0 4px;
  cursor: pointer; user-select: none; font: 700 12px/16px var(--bt-ui-font); letter-spacing: .02em; text-transform: uppercase; color: var(--bt-ui-sub);
}
.bt-sec-head:hover { color: var(--bt-ui-head); background: var(--bt-ui-hover); }
.bt-twirl {
  flex: none; width: 0; height: 0; margin: 0 2px; border-left: 5px solid currentColor;
  border-top: 4px solid transparent; border-bottom: 4px solid transparent; transition: transform .12s ease;
}
.bt-sec:not(.bt-collapsed) > .bt-sec-head .bt-twirl { transform: rotate(90deg); }
.bt-sec-body { padding: 2px 4px 14px 22px; }
.bt-sec.bt-collapsed > .bt-sec-body { display: none; }
.bt-sec-solo { border: 0; }
.bt-sec-solo > .bt-sec-body { padding: 0; }
.bt-note { color: var(--bt-ui-muted); font-size: 13px; line-height: 16px; margin: 0 0 8px; }
.bt-empty { color: var(--bt-ui-muted); font-size: 14px; padding: 8px 0; }
.bt-status { color: var(--bt-ui-sub); font-size: 14px; min-height: 18px; }
.bt-crashed { padding: 16px; border-radius: 8px; color: var(--bt-ui-text); background: rgb(242 63 67 / .1); border: 1px solid rgb(242 63 67 / .5); }

/* property rows: name (and a short grey description) on the left, control and value on the right */
.bt-row { padding: 5px 0; }
.bt-row + .bt-row { border-top: 1px solid color-mix(in srgb, var(--bt-ui-line) 55%, transparent); }
.bt-row-main { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 30px; }
.bt-row-text { flex: 1 1 auto; min-width: 0; }
.bt-row-title { display: block; color: var(--bt-ui-head); font-size: 14px; font-weight: 500; line-height: 18px; }
.bt-row-toggle .bt-row-title, .bt-row-select .bt-row-title { cursor: pointer; }
.bt-row-desc { margin-top: 2px; color: var(--bt-ui-muted); font-size: 12px; line-height: 15px; }
.bt-row-ctl { flex: none; display: flex; align-items: center; gap: 10px; }
.bt-row-range .bt-row-ctl { flex: 0 1 50%; min-width: 220px; }
.bt-row-range input[type=range] { flex: 1; min-width: 100px; }
.bt-row-value { color: var(--bt-ui-sub); font-size: 13px; font-variant-numeric: tabular-nums; }
.bt-row-stacked > input { display: block; box-sizing: border-box; width: 100%; margin: 6px 0 2px; }

/* values: blue numbers you drag left/right to change (Shift = ×10), click to type, arrow keys to nudge */
.bt-scrub {
  flex: none; min-width: 52px; padding: 0 2px; text-align: right; outline: none; cursor: ew-resize; user-select: none;
  font: 500 13px/20px var(--bt-ui-mono); color: var(--bt-ui-value); font-variant-numeric: tabular-nums;
  text-decoration: underline dotted color-mix(in srgb, var(--bt-ui-value) 50%, transparent); text-underline-offset: 3px;
}
.bt-scrub:hover { filter: brightness(1.2); }
.bt-scrub:focus-visible { outline: 1px solid var(--bt-ui-brand); border-radius: 3px; }
.bt-scrub[contenteditable="true"] {
  cursor: text; user-select: text; text-decoration: none; border-radius: 3px; color: var(--bt-ui-head);
  background: var(--bt-ui-input); box-shadow: inset 0 0 0 1px var(--bt-ui-brand);
}
.bt-hex { font: 500 13px/20px var(--bt-ui-mono); color: var(--bt-ui-value); letter-spacing: .02em; }

/* controls */
.bt-switch {
  appearance: none; margin: 0; flex: none; position: relative; width: 40px; height: 24px; border-radius: 14px;
  background: var(--bt-ui-off); cursor: pointer; transition: background .2s ease;
}
.bt-switch::after {
  content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%;
  background: #fff; box-shadow: 0 1px 2px rgb(0 0 0 / .25); transition: transform .2s cubic-bezier(.3, 1.4, .5, 1);
}
.bt-switch:checked { background: var(--bt-ui-on); }
.bt-switch:checked::after { transform: translateX(16px); }

.bt-panel input[type=range] {
  appearance: none; height: 4px; border-radius: 2px; cursor: pointer; outline: none;
  background: linear-gradient(90deg, var(--bt-ui-brand) var(--bt-fill, 50%), var(--bt-ui-input) var(--bt-fill, 50%));
}
.bt-panel input[type=range]::-webkit-slider-thumb {
  appearance: none; width: 8px; height: 18px; border-radius: 2px; background: #fff;
  border: 1px solid #dcddde; box-shadow: 0 1px 2px rgb(0 0 0 / .3);
}
.bt-panel input[type=range]:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 2px var(--bt-ui-brand); }

.bt-panel input[type=color] { width: 40px; height: 20px; padding: 0; border: 0; border-radius: 3px; cursor: pointer; background: none; }
.bt-panel input[type=color]::-webkit-color-swatch-wrapper { padding: 0; }
.bt-panel input[type=color]::-webkit-color-swatch { border: 1px solid rgb(255 255 255 / .18); border-radius: 3px; }

/* Colour picker popout (Discord popout look, After Effects-style controls) */
/* invisible copies of cached wallpapers, painted so they stay decoded (instant swap between servers and home) */
.bt-wall-keep { position: fixed; inset: 0; z-index: -2147483647; opacity: .001; pointer-events: none; background: center / cover no-repeat; contain: strict; }
.bt-cp {
  position: fixed; z-index: 100002; width: 244px; box-sizing: border-box; padding: 10px;
  display: flex; flex-direction: column; gap: 8px;
  /* themes make Discord's surfaces see-through; the solid colour underneath keeps the picker opaque */
  background: linear-gradient(var(--background-floating, #111214), var(--background-floating, #111214)), #111214;
  isolation: isolate; color: var(--bt-ui-text);
  border: 1px solid var(--border-subtle, rgb(255 255 255 / .08)); border-radius: 8px;
  box-shadow: 0 8px 16px rgb(0 0 0 / .24), 0 0 0 1px rgb(0 0 0 / .1);
  font: 14px/1.3 var(--bt-ui-font); animation: bt-cp-in .12s cubic-bezier(.2, .9, .3, 1.2); outline: none; user-select: none;
}
.bt-cp.bt-cp-out { opacity: 0; transform: scale(.97); transition: opacity .1s, transform .1s; }
@keyframes bt-cp-in { from { opacity: 0; transform: translateY(-4px) scale(.97); } }
.bt-cp-scrubbing, .bt-cp-scrubbing * { cursor: ew-resize !important; }
.bt-cp-top { display: flex; gap: 8px; height: 116px; }
.bt-cp-field {
  position: relative; flex: 1; border-radius: 6px; cursor: crosshair; outline: none; touch-action: none;
  background: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, var(--bt-cp-hue, red));
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .06);
}
.bt-cp-field:focus-visible { box-shadow: 0 0 0 2px var(--bt-ui-brand); }
.bt-cp-knob {
  position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; pointer-events: none; box-sizing: border-box;
  border: 2px solid #fff; box-shadow: 0 0 0 1px rgb(0 0 0 / .35), 0 2px 6px rgb(0 0 0 / .4);
}
.bt-cp-hue {
  position: relative; width: 14px; border-radius: 7px; cursor: ns-resize; touch-action: none;
  background: linear-gradient(to bottom, #f00, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00);
}
.bt-cp-hue-knob {
  position: absolute; left: -3px; right: -3px; height: 6px; margin-top: -3px; border-radius: 3px; pointer-events: none;
  background: #fff; box-shadow: 0 0 0 1px rgb(0 0 0 / .35), 0 1px 4px rgb(0 0 0 / .4);
}
.bt-cp-row { display: flex; align-items: center; gap: 8px; }
.bt-cp-compare {
  display: flex; flex-direction: column; width: 40px; height: 32px; flex: none; border-radius: 6px; overflow: hidden;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .08);
}
.bt-cp-new { flex: 1; }
.bt-cp-old { flex: 1; border: 0; padding: 0; cursor: pointer; }
.bt-cp-old:hover { filter: brightness(1.15); }
.bt-cp > * { min-width: 0; }
.bt-cp input { box-sizing: border-box; margin: 0; user-select: text; -webkit-user-select: text; }
.bt-cp-hexwrap {
  flex: 1; min-width: 0; display: flex; align-items: center; height: 32px; padding: 0 10px; box-sizing: border-box; border-radius: 6px;
  background: var(--bt-ui-input); border: 1px solid transparent; color: var(--bt-ui-muted); font-family: var(--bt-ui-mono);
}
.bt-cp-hexwrap:focus-within { border-color: var(--bt-ui-brand); }
.bt-cp-hex { flex: 1; width: 0; min-width: 0; padding: 0 0 0 2px; border: 0; outline: 0; background: none; color: var(--bt-ui-head); font: inherit; text-transform: uppercase; }
.bt-cp-icon {
  display: grid; place-items: center; width: 32px; height: 32px; flex: none; border: 0; border-radius: 6px; cursor: pointer;
  background: var(--bt-ui-input); color: var(--bt-ui-sub);
}
.bt-cp-icon:hover { background: var(--bt-ui-hover); color: var(--bt-ui-head); }
.bt-cp-tabs { display: flex; flex: 1; min-width: 0; gap: 2px; padding: 2px; border-radius: 6px; background: var(--bt-ui-input); }
.bt-cp-tabs button {
  flex: 1; height: 24px; border: 0; border-radius: 4px; cursor: pointer; background: none;
  color: var(--bt-ui-muted); font: 600 12px var(--bt-ui-font); letter-spacing: .02em;
}
.bt-cp-tabs button:hover { color: var(--bt-ui-text); }
.bt-cp-tabs button.bt-cp-on { background: var(--bt-ui-selected); color: var(--bt-ui-head); }
.bt-cp-chans { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.bt-cp-chan { display: flex; align-items: center; height: 30px; overflow: hidden; border-radius: 6px; background: var(--bt-ui-input); border: 1px solid transparent; }
.bt-cp-chan:focus-within { border-color: var(--bt-ui-brand); }
.bt-cp-lab {
  display: grid; place-items: center; align-self: stretch; width: 22px; flex: none; cursor: ew-resize; touch-action: none;
  color: var(--bt-ui-muted); font: 700 11px var(--bt-ui-font);
}
.bt-cp-lab:hover { color: var(--bt-ui-value); }
.bt-cp-num {
  flex: 1; width: 0; min-width: 0; padding: 0 8px 0 2px; border: 0; outline: 0; background: none; text-align: left;
  color: var(--bt-ui-value); font: 500 13px var(--bt-ui-mono);
}
.bt-cp-title { margin: 0 0 6px; color: var(--bt-ui-muted); font: 700 11px var(--bt-ui-font); text-transform: uppercase; letter-spacing: .02em; }
.bt-cp-grid { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 4px; }
.bt-cp-sw {
  aspect-ratio: 1; padding: 0; border: 0; border-radius: 4px; cursor: pointer;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / .08); transition: transform .08s;
}
.bt-cp-sw:hover { transform: scale(1.15); }
.bt-cp-sw:focus-visible { outline: 2px solid var(--bt-ui-brand); outline-offset: 1px; }
.bt-cp-title { margin-bottom: 5px; }
.bt-cp-compare, .bt-cp-hexwrap, .bt-cp-icon { height: 30px; }
.bt-cp-chan { height: 28px; }
.bt-cp-tabs button { height: 22px; }
/* eyedropper: covers the window (which it sampled), pipette cursor + a sample chip like After Effects' info readout */
.bt-cp-drop { position: fixed; inset: 0; z-index: 100003; }
.bt-cp-drop-sample {
  position: fixed; left: 0; top: 0; display: flex; align-items: center; gap: 6px; padding: 4px 8px 4px 4px; pointer-events: none;
  background: #111214; border: 1px solid rgb(255 255 255 / .1); border-radius: 6px; box-shadow: 0 4px 12px rgb(0 0 0 / .4);
  color: #f2f3f5; font: 600 12px var(--font-code, Consolas, monospace);
}
.bt-cp-drop-sample::before { content: ""; width: 20px; height: 20px; border-radius: 4px; background: var(--c, #000); box-shadow: inset 0 0 0 1px rgb(255 255 255 / .15); }

.bt-panel select {
  appearance: none; min-width: 180px; max-width: 300px; height: 28px; padding: 0 28px 0 8px; border-radius: 4px; cursor: pointer; outline: none;
  color: var(--bt-ui-text); font: 13px/18px var(--bt-ui-font); border: 1px solid var(--bt-ui-line);
  background: var(--bt-ui-input) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Cpath fill='%23b5bac1' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 6px center;
}
.bt-panel select option { color: #dbdee1; background: #2b2d31; }

.bt-text {
  box-sizing: border-box; flex: 1; min-width: 0; height: 32px; padding: 0 10px; border-radius: 4px; outline: none;
  color: var(--bt-ui-text); font: 14px var(--bt-ui-font); background: var(--bt-ui-input); border: 1px solid var(--bt-ui-line);
}
.bt-text::placeholder { color: var(--bt-ui-muted); }
.bt-text:focus, .bt-panel select:focus { border-color: var(--bt-ui-brand); }
.bt-search { width: 100%; margin: 0 0 8px; }

.bt-btns { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 4px 0 8px; }
.bt-b {
  all: unset; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  min-height: 28px; padding: 2px 12px; border-radius: 4px; cursor: pointer; white-space: nowrap;
  font: 500 13px/16px var(--bt-ui-font); color: #fff; background: var(--bt-ui-btn); transition: background .12s ease, color .12s ease;
}
.bt-b:hover { background: var(--bt-ui-btn-hover); }
.bt-b.bt-primary { background: var(--bt-ui-brand); }
.bt-b.bt-primary:hover { filter: brightness(1.1); }
.bt-b.bt-danger { color: #fa777c; background: transparent; box-shadow: inset 0 0 0 1px var(--bt-ui-danger); }
.bt-b.bt-danger:hover { color: #fff; background: var(--bt-ui-danger); }
.bt-b.bt-small { min-height: 24px; padding: 2px 10px; font-size: 12px; }
.bt-b.bt-picked { background: var(--bt-ui-selected); box-shadow: inset 0 0 0 2px var(--bt-ui-brand); }

/* colour presets: a grid of gradient tiles */
.bt-presets { display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 6px; margin: 4px 0 8px; }
.bt-b.bt-preset {
  flex-direction: column; align-items: stretch; gap: 4px; min-height: 0; padding: 3px 3px 4px; border-radius: 4px;
  font-size: 12px; font-weight: 500; color: var(--bt-ui-sub); background: transparent; box-shadow: inset 0 0 0 1px var(--bt-ui-line);
}
.bt-b.bt-preset:hover { color: var(--bt-ui-head); background: var(--bt-ui-hover); }
.bt-b.bt-preset.bt-picked { color: var(--bt-ui-head); background: var(--bt-ui-selected); box-shadow: inset 0 0 0 2px var(--bt-ui-brand); }
.bt-preset .bt-swatch { width: auto; height: 26px; border-radius: 2px; }
.bt-switch:focus-visible, .bt-b:focus-visible, .bt-tab:focus-visible, .bt-server-title:focus-visible { outline: 2px solid var(--bt-ui-brand); outline-offset: 2px; }
.bt-swatch { flex: none; width: 16px; height: 16px; border-radius: 50%; }
.bt-check { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; color: var(--bt-ui-text); font-size: 14px; }

/* plugin and theme cards */
.bt-list { display: flex; flex-direction: column; gap: 4px; margin: 0 0 12px; }
.bt-card { border-radius: 4px; background: var(--bt-ui-card); border: 1px solid transparent; }
.bt-card:hover { border-color: var(--bt-ui-line); }
.bt-card[hidden] { display: none; }
.bt-item { display: flex; align-items: center; gap: 14px; padding: 8px 12px; }
.bt-item-info { flex: 1; min-width: 0; }
.bt-item-title { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 8px; }
.bt-item b { color: var(--bt-ui-head); font-size: 14px; font-weight: 600; }
.bt-item small { color: var(--bt-ui-muted); font-size: 12px; }
.bt-item p { margin: 2px 0 0; color: var(--bt-ui-muted); font-size: 13px; line-height: 16px; }
.bt-item .bt-err { color: #fa777c; }
.bt-item-side { flex: none; display: flex; align-items: center; gap: 12px; }
.bt-tag {
  padding: 0 6px; border-radius: 4px; font: 700 10px/16px var(--bt-ui-font); letter-spacing: .02em; text-transform: uppercase;
  color: var(--bt-ui-sub); background: var(--bt-ui-selected);
}
.bt-plugin-settings { padding: 2px 12px 4px 24px; border-top: 1px solid var(--bt-ui-line); }
.bt-plugin-settings[hidden] { display: none; }
.bt-plugin-settings.bt-off > .bt-row { opacity: .5; }
.bt-plugin-off-note {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: 8px 0 4px; padding: 8px 10px 8px 12px; border-radius: 4px;
  font-size: 13px; line-height: 17px; color: var(--bt-ui-text); background: rgb(240 177 50 / .08); border-left: 3px solid #f0b232;
}
.bt-plugin-off-note > span { flex: 1 1 220px; }

/* notices */
.bt-warn, .bt-off-warn, .bt-server-notice {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: 0 0 12px; padding: 8px 10px 8px 12px;
  border-radius: 4px; border-left: 3px solid; color: var(--bt-ui-text); font-size: 13px; line-height: 17px;
}
.bt-warn > span, .bt-off-warn > span, .bt-server-notice > span { flex: 1 1 260px; }
.bt-warn { background: rgb(240 177 50 / .08); border-color: #f0b232; }
.bt-off-warn { background: rgb(242 63 67 / .08); border-color: #f23f43; }
.bt-server-notice { background: rgb(88 101 242 / .08); border-color: var(--bt-ui-brand); }
.bt-warn .bt-b, .bt-off-warn .bt-b, .bt-server-notice .bt-b { min-height: 24px; padding: 2px 10px; font-size: 12px; }
.bt-warn[hidden], .bt-off-warn[hidden], .bt-server-notice[hidden] { display: none; }
.bt-wall-glass-note {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: 0 0 10px; padding: 8px 10px 8px 12px; border-radius: 4px;
  font-size: 13px; line-height: 17px; color: var(--bt-ui-text); background: rgb(240 177 50 / .08); border-left: 3px solid #f0b232;
}
.bt-wall-glass-note > span { flex: 1 1 240px; }
.bt-wall-glass-note[hidden] { display: none; }

/* server looks */
.bt-server-status { margin: 12px 0; }
.bt-server-list { display: flex; flex-direction: column; gap: 4px; }
.bt-server { border-radius: 4px; background: var(--bt-ui-card); border: 1px solid transparent; }
.bt-server-here { border-color: var(--bt-ui-brand); }
.bt-server-off .bt-server-title { opacity: .6; }
.bt-server-list-off .bt-server { opacity: .5; }
.bt-server-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px 12px; }
.bt-server-title { all: unset; display: flex; align-items: center; gap: 10px; min-width: 0; cursor: pointer; color: var(--bt-ui-head); font-size: 14px; }
.bt-server-title b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bt-server-title small { color: var(--bt-ui-muted); font-size: 12px; }
.bt-server-caret { width: 12px; color: var(--bt-ui-sub); }
.bt-server-preview { width: 28px; height: 16px; border-radius: 2px; box-shadow: inset 0 0 0 1px rgb(255 255 255 / .2); }
.bt-server-actions { flex: none; display: flex; align-items: center; gap: 10px; }
.bt-server-actions .bt-b { min-height: 24px; padding: 2px 10px; font-size: 12px; }
.bt-server-body { padding: 0 12px 12px 34px; border-top: 1px solid var(--bt-ui-line); }
.bt-server-label { margin: 14px 0 6px; font: 700 11px/14px var(--bt-ui-font); letter-spacing: .02em; text-transform: uppercase; color: var(--bt-ui-sub); }
.bt-server-tune { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.bt-server-tune .bt-b { min-height: 24px; padding: 2px 12px; font-size: 13px; letter-spacing: 0; text-transform: none; }
.bt-server-group { margin: 10px 0 2px; color: var(--bt-ui-sub); font-size: 12px; font-weight: 600; }
.bt-server-rows .bt-row-title { font-size: 13px; line-height: 17px; }
.bt-server-hint { margin: 8px 0 0; }
.bt-server-themes { display: flex; flex-wrap: wrap; gap: 8px 20px; }
.bt-server-opts { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 18px; margin-top: 8px; }
.bt-server-wall { margin: 8px 0 0; }

/* shiny role colours (html[data-bt-roles]); Discord's own gradient roles are left alone */
html:is([data-bt-roles="shine"], [data-bt-roles="gradient"], [data-bt-roles="holo"]) :is(${ROLE_NAMES}) {
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: none;
}
html[data-bt-roles="shine"] :is(${ROLE_NAMES}) {
  background-image: linear-gradient(110deg, currentColor 0 40%, color-mix(in srgb, currentColor 25%, #fff) 50%, currentColor 60% 100%);
  background-size: 300% 100%; animation: bt-role-shine var(--bt-role-speed, 4s) linear infinite;
}
html[data-bt-roles="gradient"] :is(${ROLE_NAMES}) {
  background-image: linear-gradient(90deg, currentColor, color-mix(in srgb, currentColor 35%, var(--bt-accent-2, #a78bfa)), currentColor);
  background-size: 200% 100%; animation: bt-role-flow var(--bt-role-speed, 4s) ease-in-out infinite alternate;
}
html[data-bt-roles="holo"] :is(${ROLE_NAMES}) {
  background-image: linear-gradient(90deg, currentColor, #ff9ecf, #ffe08a, #8ef0ff, #b79bff, currentColor);
  background-size: 300% 100%; animation: bt-role-flow var(--bt-role-speed, 4s) ease-in-out infinite alternate;
}
html[data-bt-roles="glow"] :is(${ROLE_NAMES}) {
  text-shadow: 0 0 6px color-mix(in srgb, currentColor 80%, transparent), 0 0 14px color-mix(in srgb, currentColor 45%, transparent);
  animation: bt-role-pulse var(--bt-role-speed, 4s) ease-in-out infinite alternate;
}
@keyframes bt-role-shine { 0% { background-position: 100% 0; } 70%, 100% { background-position: 0 0; } }
@keyframes bt-role-flow { from { background-position: 0 0; } to { background-position: 100% 0; } }
@keyframes bt-role-pulse { from { filter: brightness(1); } to { filter: brightness(1.25); } }

/* screen effects never show on Discord's loading screen (html[data-bt-loading] until the app is up) */
html[data-bt-loading] :is(#bt-petals, #bt-fx, .bt-pet, .bt-meow-recbar) { display: none !important; }
html:has(#bt-splash) :is(#bt-petals, #bt-fx, .bt-pet, .bt-meow-recbar) { display: none !important; }

/* splash: Be Themer's loading screen */
#bt-splash {
  position: fixed; inset: 0; z-index: 2147483646; display: grid; place-items: center; overflow: hidden; cursor: pointer;
  color: #fff; font-family: var(--font-primary, "gg sans", "Noto Sans", sans-serif);
  background: var(--sp-bg, #111214);
  transition: opacity .45s ease, visibility .45s ease;
}
#bt-splash.bt-out { opacity: 0; visibility: hidden; }
[data-bt-splash-host] > :not(#bt-splash) { visibility: hidden !important; }
[data-bt-splash-host] > #bt-splash { cursor: default; }
/* Discord's own loading screen: solid, as Discord draws it (not see-through over the app) */
[data-bt-discord-loading] { background-color: var(--bt-grad-base, #111214) !important; isolation: isolate; }
#bt-splash .bt-sp-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: var(--sp-fit, cover); }
#bt-splash .bt-sp-dim { position: absolute; inset: 0; background: rgb(0 0 0 / var(--sp-dim, .25)); pointer-events: none; }
#bt-splash:not([data-style="media"]) .bt-sp-dim { display: none; }
#bt-splash .bt-sp-center { position: relative; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; padding: 24px; }
#bt-splash .bt-sp-text { min-height: 20px; font-size: 15px; font-weight: 500; opacity: .9; text-shadow: 0 1px 4px rgb(0 0 0 / .5); transition: opacity .25s ease; }
#bt-splash .bt-sp-text.bt-fade { opacity: 0; }
#bt-splash .bt-sp-skip { position: absolute; bottom: 18px; font-size: 12px; opacity: .55; }
@keyframes bt-sp-spin { to { transform: rotate(360deg); } }


/* the motion design video (dist/splash/: an intro, then a seamless loop) */
/* Discord's loading screen hides the videos inside it (visibility: hidden): never ours */
#bt-splash:not(.bt-out) .bt-sp-media { visibility: visible !important; opacity: 1 !important; display: block !important; }
#bt-splash .bt-sp-center:not(:has(.bt-sp-logo-wrap)) { position: absolute; z-index: 2; bottom: 56px; }
/* your logo: over your wallpaper or picture (or if the video can't play) */
#bt-splash .bt-sp-logo-wrap { width: 112px; height: 112px; margin-bottom: 6px; animation: bt-sp-float-in .9s cubic-bezier(.2, .8, .2, 1) .1s both; }
#bt-splash .bt-sp-logo { display: block; width: 100%; height: 100%; border-radius: 24px; box-shadow: 0 18px 50px rgb(0 0 0 / .45); animation: bt-sp-bob 4s ease-in-out 1s infinite; }
@keyframes bt-sp-float-in { from { opacity: 0; transform: translateY(16px) scale(.94); } }
@keyframes bt-sp-bob { 50% { transform: translateY(-6px); } }
/* ── the flat loading screens: one background colour, one main colour, one second colour. No gradients. ── */
#bt-splash { --sp-k: 1; --sp-scale: 1; --sp-ts: 13px; --sp-to: .55; }
#bt-splash[data-pattern] { background-image: var(--sp-pattern); background-repeat: repeat; }
#bt-splash .bt-k { position: relative; display: flex; flex-direction: column; align-items: center; gap: calc(26px * var(--sp-scale)); color: var(--sp-fg); }
#bt-splash .bt-k-stage { position: relative; display: grid; place-items: center; }
#bt-splash .bt-k svg { display: block; overflow: visible; }
/* where it sits */
#bt-splash[data-place="low"] { place-items: end center; padding-bottom: 14vh; }
#bt-splash[data-place="high"] { place-items: start center; padding-top: 14vh; }
#bt-splash[data-place="left"] { place-items: end start; padding: 0 0 56px 64px; }
#bt-splash[data-place="right"] { place-items: end end; padding: 0 64px 56px 0; }
#bt-splash[data-place="left"] .bt-k { align-items: flex-start; }
#bt-splash[data-place="right"] .bt-k { align-items: flex-end; }
/* your text: quietly, just under it */
#bt-splash .bt-k-caption {
  margin-top: calc(-8px * var(--sp-scale)); max-width: 60vw; text-align: center; color: var(--sp-fg); opacity: var(--sp-to);
  font: 500 var(--sp-ts) / 1.4 var(--font-primary, "gg sans", sans-serif); letter-spacing: .02em; transition: opacity .25s ease;
}
#bt-splash .bt-k-caption.bt-fade { opacity: 0; }
#bt-splash[data-place="left"] .bt-k-caption { text-align: left; }
#bt-splash[data-place="right"] .bt-k-caption { text-align: right; }

/* shapes into Discord's logo */
#bt-splash .bt-k-morph-svg { width: calc(200px * var(--sp-scale)); height: calc(200px * var(--sp-scale)); }
/* Discord logo */
#bt-splash .bt-k-logo { position: relative; }
#bt-splash .bt-k-logo svg { width: calc(84px * var(--sp-scale)); height: auto; fill: var(--sp-fg); }
#bt-splash .bt-k-logo[data-look="outline"] svg { fill: none; stroke: var(--sp-fg); stroke-width: .55; stroke-linejoin: round; }
#bt-splash .bt-k-logo[data-look="duotone"] svg { fill: var(--sp-accent); stroke: var(--sp-fg); stroke-width: .9; stroke-linejoin: round; paint-order: stroke; }
#bt-splash .bt-k-logo[data-anim="pulse"] { animation: bt-k-pulse calc(1.6s / var(--sp-k)) ease-in-out infinite; }
#bt-splash .bt-k-logo[data-anim="breathe"] { animation: bt-k-breathe calc(2.2s / var(--sp-k)) ease-in-out infinite; }
#bt-splash .bt-k-logo[data-anim="bounce"] { animation: bt-k-bounce calc(.9s / var(--sp-k)) cubic-bezier(.3, 0, .3, 1) infinite; transform-origin: 50% 100%; }
#bt-splash .bt-k-logo[data-anim="float"] { animation: bt-k-float calc(3s / var(--sp-k)) ease-in-out infinite; }
#bt-splash .bt-k-logo[data-anim="flip"] { animation: bt-k-flip calc(2s / var(--sp-k)) cubic-bezier(.6, 0, .4, 1) infinite; }
#bt-splash .bt-k-logo[data-anim="wobble"] { animation: bt-k-wobble calc(1.2s / var(--sp-k)) ease-in-out infinite; }
#bt-splash .bt-k-logo[data-anim="heartbeat"] { animation: bt-k-heart calc(1.3s / var(--sp-k)) ease-in-out infinite; }
#bt-splash .bt-k-logo[data-anim="glitch"] { animation: bt-k-glitch calc(2.4s / var(--sp-k)) steps(1) infinite; }
@keyframes bt-k-pulse { 50% { transform: scale(1.08); } }
@keyframes bt-k-breathe { 50% { opacity: .3; } }
@keyframes bt-k-bounce { 0%, 100% { transform: none; } 15% { transform: scale(1.08, .9); } 45% { transform: translateY(calc(-26px * var(--sp-scale))) scale(.96, 1.05); } 75% { transform: scale(1.05, .95); } }
@keyframes bt-k-float { 50% { transform: translateY(calc(-12px * var(--sp-scale))); } }
@keyframes bt-k-flip { 0% { transform: perspective(500px) rotateY(0); } 60%, 100% { transform: perspective(500px) rotateY(360deg); } }
@keyframes bt-k-wobble { 25% { transform: rotate(-9deg); } 75% { transform: rotate(9deg); } }
@keyframes bt-k-heart { 0%, 50%, 100% { transform: scale(1); } 12%, 36% { transform: scale(1.12); } 24% { transform: scale(1.02); } }
@keyframes bt-k-glitch { 0%, 100% { transform: none; } 82% { transform: translate(-3px, 1px) skewX(6deg); } 84% { transform: translate(3px, -1px); } 86% { transform: none; } 90% { transform: translate(2px, 0) skewX(-4deg); } 92% { transform: none; } }
/* ripples (behind the logo, or on their own) */
#bt-splash .bt-k-ripple { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
#bt-splash .bt-k-ripple i {
  position: absolute; width: calc(84px * var(--sp-scale)); aspect-ratio: 1; border-radius: 50%;
  border: calc(var(--sp-thick, 2px) * 1) solid var(--sp-accent); opacity: 0; animation: bt-k-ripple calc(2.4s / var(--sp-k)) cubic-bezier(.2, .6, .3, 1) infinite;
}
#bt-splash .bt-k-ripple i:nth-child(2) { animation-delay: calc(.8s / var(--sp-k)); }
#bt-splash .bt-k-ripple i:nth-child(3) { animation-delay: calc(1.6s / var(--sp-k)); }
#bt-splash .bt-k-ripple-solo { position: relative; width: calc(64px * var(--sp-scale)); height: calc(64px * var(--sp-scale)); }
#bt-splash .bt-k-ripple-solo i { width: calc(18px * var(--sp-scale)); }
@keyframes bt-k-ripple { 0% { opacity: .9; transform: scale(.7); } 100% { opacity: 0; transform: scale(2.2); } }
/* small loaders (under the logo) */
#bt-splash .bt-k-dots { display: flex; gap: calc(9px * var(--sp-scale)); }
#bt-splash .bt-k-dots i { width: calc(8px * var(--sp-scale)); height: calc(8px * var(--sp-scale)); border-radius: 50%; background: var(--sp-accent); animation: bt-k-dot calc(1.2s / var(--sp-k)) ease-in-out infinite; }
#bt-splash .bt-k-dots i:nth-child(2) { animation-delay: calc(.15s / var(--sp-k)); }
#bt-splash .bt-k-dots i:nth-child(3) { animation-delay: calc(.3s / var(--sp-k)); }
@keyframes bt-k-dot { 0%, 70%, 100% { opacity: .25; transform: scale(.75); } 35% { opacity: 1; transform: none; } }
#bt-splash .bt-k-bar { width: calc(150px * var(--sp-scale)); height: calc(2px * var(--sp-scale)); border-radius: 2px; overflow: hidden; background: color-mix(in srgb, var(--sp-fg) 12%, transparent); }
#bt-splash .bt-k-bar i { display: block; width: 30%; height: 100%; border-radius: 2px; background: var(--sp-accent); animation: bt-k-slide calc(1.3s / var(--sp-k)) cubic-bezier(.6, 0, .4, 1) infinite; }
@keyframes bt-k-slide { from { transform: translateX(-105%); } to { transform: translateX(340%); } }
/* spinners */
#bt-splash .bt-k-spin { width: calc(40px * var(--sp-scale)); height: calc(40px * var(--sp-scale)); animation: bt-sp-spin calc(2s / var(--sp-k)) linear infinite; }
#bt-splash .bt-k-track { fill: none; stroke: color-mix(in srgb, var(--sp-fg) 12%, transparent); stroke-width: var(--sp-thick, 4px); }
#bt-splash .bt-k-arc { fill: none; stroke: var(--sp-accent); stroke-width: var(--sp-thick, 4px); stroke-linecap: round; stroke-dasharray: 90 150; animation: bt-k-dash calc(1.5s / var(--sp-k)) ease-in-out infinite; }
@keyframes bt-k-dash { 0% { stroke-dasharray: 1 150; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90 150; stroke-dashoffset: -35; } 100% { stroke-dasharray: 90 150; stroke-dashoffset: -124; } }
#bt-splash .bt-k-minimal .bt-k-spin { width: calc(52px * var(--sp-scale)); height: calc(52px * var(--sp-scale)); }
#bt-splash .bt-k-wheel { position: relative; width: calc(52px * var(--sp-scale)); height: calc(52px * var(--sp-scale)); }
#bt-splash .bt-k-wheel i {
  position: absolute; left: 50%; top: 50%; background: var(--sp-accent); opacity: .15;
  animation: bt-k-wheel calc(1s / var(--sp-k)) linear infinite; animation-delay: calc((var(--i) / var(--n)) * 1s / var(--sp-k) - 1s / var(--sp-k));
}
#bt-splash .bt-k-wheel-dots i { width: calc(var(--sp-thick, 4px) * 1.6); aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%) rotate(var(--a)) translateY(calc(-22px * var(--sp-scale))); }
#bt-splash .bt-k-wheel-ticks i { width: var(--sp-thick, 4px); height: calc(12px * var(--sp-scale)); border-radius: 4px; transform: translate(-50%, -50%) rotate(var(--a)) translateY(calc(-18px * var(--sp-scale))); }
@keyframes bt-k-wheel { 0% { opacity: 1; } 100% { opacity: .15; } }
#bt-splash .bt-k-squares { position: relative; width: calc(44px * var(--sp-scale)); height: calc(44px * var(--sp-scale)); animation: bt-k-sq-turn calc(2.4s / var(--sp-k)) cubic-bezier(.7, 0, .3, 1) infinite; }
#bt-splash .bt-k-squares i { position: absolute; width: 46%; height: 46%; border-radius: calc(3px * var(--sp-scale)); background: var(--sp-fg); animation: bt-k-sq calc(2.4s / var(--sp-k)) cubic-bezier(.7, 0, .3, 1) infinite; }
#bt-splash .bt-k-squares i:nth-child(2) { background: var(--sp-accent); animation-delay: calc(-1.2s / var(--sp-k)); }
@keyframes bt-k-sq { 0%, 100% { left: 0; top: 0; } 25% { left: 54%; top: 0; } 50% { left: 54%; top: 54%; } 75% { left: 0; top: 54%; } }
@keyframes bt-k-sq-turn { to { transform: rotate(90deg); } }
/* terminal */
#bt-splash .bt-k-win {
  width: min(calc(600px * var(--sp-scale)), 88vw); text-align: left; border-radius: 10px; overflow: hidden;
  background: color-mix(in srgb, var(--sp-fg) 4%, var(--sp-bg)); border: 1px solid color-mix(in srgb, var(--sp-fg) 10%, transparent);
  box-shadow: 0 24px 60px rgb(0 0 0 / .35);
}
#bt-splash .bt-k-win-bare { background: none; border: 0; box-shadow: none; }
#bt-splash .bt-k-winbar { display: flex; align-items: center; gap: 7px; height: 34px; padding: 0 14px; border-bottom: 1px solid color-mix(in srgb, var(--sp-fg) 8%, transparent); }
#bt-splash .bt-k-winbar i { width: 11px; height: 11px; border-radius: 50%; background: color-mix(in srgb, var(--sp-fg) 18%, transparent); }
#bt-splash .bt-k-winbar span { flex: 1; margin-right: 50px; text-align: center; font: 500 12px var(--font-primary, sans-serif); opacity: .45; }
#bt-splash .bt-k-term {
  padding: 16px 20px 18px; white-space: pre; overflow: hidden; min-height: calc(8.4em);
  font: 500 calc(14px * var(--sp-scale)) / 1.7 ui-monospace, "Cascadia Mono", Consolas, "Courier New", monospace; color: var(--sp-fg);
}
#bt-splash .bt-k-win-bare .bt-k-term { padding: 0; }
#bt-splash .bt-k-term b { font-weight: 700; color: var(--sp-accent); }
#bt-splash .bt-k-term .bt-k-dim { opacity: .42; }
#bt-splash .bt-k-cursor { display: inline-block; width: .6em; height: 1.15em; margin-left: 2px; vertical-align: -.2em; background: var(--sp-accent); animation: bt-k-blink 1s steps(1) infinite; }
#bt-splash .bt-k-term[data-cursor="underline"] .bt-k-cursor { height: 2px; vertical-align: -.1em; }
#bt-splash .bt-k-term[data-cursor="bar"] .bt-k-cursor { width: 2px; }
@keyframes bt-k-blink { 50% { opacity: 0; } }
/* equalizer */
#bt-splash .bt-k-eq { display: flex; align-items: center; gap: calc(var(--bw, 8px) * .9 * var(--sp-scale)); height: calc(64px * var(--sp-scale)); }
#bt-splash .bt-k-eq[data-grow="up"] { align-items: flex-end; }
#bt-splash .bt-k-eq i {
  width: calc(var(--bw, 8px) * var(--sp-scale)); height: 100%; border-radius: var(--br, 3px); background: var(--sp-accent); transform: scaleY(.16);
  animation: bt-k-eq calc(var(--d) / var(--sp-k)) ease-in-out calc(var(--delay) / var(--sp-k)) infinite alternate;
}
#bt-splash .bt-k-eq[data-grow="up"] i { transform-origin: 50% 100%; }
#bt-splash .bt-k-eq[data-colors="alternate"] i:nth-child(odd), #bt-splash .bt-k-eq[data-colors="main"] i { background: var(--sp-fg); }
@keyframes bt-k-eq { to { transform: scaleY(1); } }
/* shapes */
#bt-splash .bt-k-shapes { position: relative; display: flex; align-items: flex-end; gap: calc(20px * var(--sp-scale)); height: calc(90px * var(--sp-scale)); }
#bt-splash .bt-k-shapes i { width: calc(32px * var(--sp-scale)); height: calc(32px * var(--sp-scale)); background: var(--sp-accent); }
#bt-splash .bt-k-shapes i:nth-child(1) { border-radius: 50%; }
#bt-splash .bt-k-shapes i:nth-child(2) { border-radius: calc(4px * var(--sp-scale)); background: var(--sp-fg); }
#bt-splash .bt-k-shapes i:nth-child(3) { clip-path: polygon(50% 4%, 100% 96%, 0 96%); }
#bt-splash .bt-k-shapes[data-motion="hop"] i { animation: bt-k-hop calc(1.5s / var(--sp-k)) cubic-bezier(.5, 0, .5, 1) infinite; }
#bt-splash .bt-k-shapes[data-motion="hop"] i:nth-child(2) { animation-name: bt-k-hop-turn; animation-delay: calc(.18s / var(--sp-k)); }
#bt-splash .bt-k-shapes[data-motion="hop"] i:nth-child(3) { animation-name: bt-k-hop-flip; animation-delay: calc(.36s / var(--sp-k)); }
@keyframes bt-k-hop { 0%, 60%, 100% { transform: none; } 30% { transform: translateY(calc(-44px * var(--sp-scale))); } }
@keyframes bt-k-hop-turn { 0%, 60%, 100% { transform: none; } 30% { transform: translateY(calc(-44px * var(--sp-scale))) rotate(90deg); } }
@keyframes bt-k-hop-flip { 0%, 60%, 100% { transform: none; } 30% { transform: translateY(calc(-44px * var(--sp-scale))) rotate(180deg); } }
#bt-splash .bt-k-shapes[data-motion="spin"] { align-items: center; }
#bt-splash .bt-k-shapes[data-motion="spin"] i { animation: bt-k-spin-step calc(2.4s / var(--sp-k)) cubic-bezier(.7, 0, .3, 1) infinite; }
#bt-splash .bt-k-shapes[data-motion="spin"] i:nth-child(2) { animation-delay: calc(.2s / var(--sp-k)); }
#bt-splash .bt-k-shapes[data-motion="spin"] i:nth-child(3) { animation-delay: calc(.4s / var(--sp-k)); }
@keyframes bt-k-spin-step { 0% { transform: none; } 40%, 100% { transform: rotate(360deg); } }
#bt-splash .bt-k-shapes[data-motion="orbit"] { display: block; width: calc(96px * var(--sp-scale)); height: calc(96px * var(--sp-scale)); animation: bt-sp-spin calc(3s / var(--sp-k)) linear infinite; }
#bt-splash .bt-k-shapes[data-motion="orbit"] i { position: absolute; width: calc(24px * var(--sp-scale)); height: calc(24px * var(--sp-scale)); animation: bt-sp-spin calc(3s / var(--sp-k)) linear infinite reverse; }
#bt-splash .bt-k-shapes[data-motion="orbit"] i:nth-child(1) { left: calc(50% - 12px * var(--sp-scale)); top: 0; }
#bt-splash .bt-k-shapes[data-motion="orbit"] i:nth-child(2) { left: 4%; bottom: 8%; }
#bt-splash .bt-k-shapes[data-motion="orbit"] i:nth-child(3) { right: 4%; bottom: 8%; }
#bt-splash .bt-k-shapes[data-motion="morph"] { align-items: center; }
#bt-splash .bt-k-shapes[data-motion="morph"] i {
  width: calc(44px * var(--sp-scale)); height: calc(44px * var(--sp-scale)); border-radius: 50%; background: var(--sp-accent); clip-path: none;
  animation: bt-k-morph calc(3.2s / var(--sp-k)) cubic-bezier(.7, 0, .3, 1) infinite;
}
@keyframes bt-k-morph {
  0%, 100% { border-radius: 50%; transform: none; background: var(--sp-accent); }
  25% { border-radius: 12%; transform: rotate(90deg); background: var(--sp-fg); }
  50% { border-radius: 12%; transform: rotate(225deg) scale(.8); background: var(--sp-accent); }
  75% { border-radius: 50% 0 50% 0; transform: rotate(360deg); background: var(--sp-fg); }
}
/* counter */
#bt-splash .bt-k-num { font: 800 calc(112px * var(--sp-scale)) / 1 var(--font-display, var(--font-primary, "gg sans", sans-serif)); font-variant-numeric: tabular-nums; letter-spacing: -.04em; color: var(--sp-fg); }
#bt-splash .bt-k-num[data-font="mono"] { font-family: ui-monospace, "Cascadia Mono", Consolas, monospace; font-weight: 600; letter-spacing: -.02em; }
#bt-splash .bt-k-num[data-font="thin"] { font-weight: 200; letter-spacing: -.05em; }
#bt-splash .bt-k-num small { font-size: .3em; margin-left: .12em; letter-spacing: 0; font-weight: 600; color: var(--sp-accent); }
#bt-splash .bt-k-line { width: calc(240px * var(--sp-scale)); height: calc(2px * var(--sp-scale)); background: color-mix(in srgb, var(--sp-fg) 12%, transparent); }
#bt-splash .bt-k-line i { display: block; height: 100%; width: var(--p, 0%); background: var(--sp-accent); transition: width .2s linear; }
@media (prefers-reduced-motion: reduce) {
  #bt-splash *, #bt-splash { animation: none !important; }
}
/* toasts */
#bt-toasts {
  position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 2147483003;
  display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none;
}
.bt-toast {
  padding: 10px 16px; border-radius: 8px; color: var(--bt-ui-text); font: 500 14px/18px var(--bt-ui-font);
  background: var(--background-floating, #111214); border: 1px solid var(--bt-ui-line);
  box-shadow: var(--elevation-high, 0 8px 16px rgb(0 0 0 / .24)); animation: bt-fade .18s ease;
}

/* inside Discord's settings (fallback tab) */
#bt-settings-inline {
  position: absolute; inset: 0; z-index: 50; overflow-y: auto; box-sizing: border-box;
  padding: 60px 40px 80px; background: var(--background-primary, #313338);
}
#bt-settings-inline .bt-panel { max-width: 740px; }
.bt-settings-tab.bt-active {
  background: var(--background-modifier-selected) !important;
  color: var(--interactive-active, #fff) !important;
}
html[data-bt-inline] [role="tab"][aria-selected="true"]:not(.bt-settings-tab) {
  background: transparent !important; color: var(--interactive-normal) !important;
}

/* native Discord settings pages */
.bt-native { padding-bottom: 40px; }
.bt-native .bt-panel { max-width: 740px; }

/* page tabs (floating window) */
.bt-tabs { display: flex; flex-wrap: wrap; gap: 20px; margin: 0 0 14px; border-bottom: 1px solid var(--bt-ui-line); }
.bt-tab {
  all: unset; padding: 6px 0 8px; margin-bottom: -1px; cursor: pointer; border-bottom: 2px solid transparent;
  color: var(--interactive-normal, #b5bac1); font: 500 14px/18px var(--bt-ui-font); transition: color .12s, border-color .12s;
}
.bt-tab:hover { color: var(--interactive-hover, #dbdee1); }
.bt-tab.bt-tab-active { color: var(--interactive-active, #fff); border-bottom-color: var(--bt-ui-brand); }

/* Custom CSS editor */
.bt-code {
  display: block; width: 100%; min-height: 360px; box-sizing: border-box; resize: vertical; margin: 0 0 12px;
  padding: 12px 14px; border-radius: 8px; outline: none; tab-size: 4;
  font: 14px/1.5 var(--font-code, Consolas, "Cascadia Mono", "Lucida Console", monospace); color: var(--bt-ui-text);
  background: var(--bt-ui-input); border: 1px solid var(--bt-ui-line);
}
.bt-code:focus { border-color: var(--bt-ui-brand); }

/* floating window */
#bt-window {
  position: fixed; z-index: 2147483002; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: min(740px, calc(100vw - 32px)); max-height: 86vh; overflow-y: auto; box-sizing: border-box;
  padding: 20px; border-radius: 8px; background: var(--modal-background, var(--background-primary, #313338));
  backdrop-filter: blur(24px); border: 1px solid var(--bt-ui-line); box-shadow: var(--elevation-high, 0 8px 16px rgb(0 0 0 / .24));
}
#bt-window .bt-window-title { display: flex; align-items: center; gap: 10px; }
.bt-logo { flex: none; width: 28px; height: 28px; border-radius: 7px; box-shadow: 0 1px 4px rgb(0 0 0 / .3); }
#bt-window .bt-x {
  all: unset; position: absolute; top: 16px; right: 16px; display: grid; place-items: center; width: 32px; height: 32px;
  border-radius: 50%; cursor: pointer; color: var(--bt-ui-sub); font-size: 16px;
}
#bt-window .bt-x:hover { color: var(--bt-ui-head); background: var(--bt-ui-hover); }
#bt-window::-webkit-scrollbar, #bt-settings-inline::-webkit-scrollbar { width: 8px; }
#bt-window::-webkit-scrollbar-track, #bt-settings-inline::-webkit-scrollbar-track { background: transparent; }
#bt-window::-webkit-scrollbar-thumb, #bt-settings-inline::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thin-thumb, #1a1b1e); background-clip: padding-box; border: 2px solid transparent; border-radius: 4px;
}

@keyframes bt-fade { from { opacity: 0; transform: translateY(4px); } }
@media (prefers-reduced-motion: reduce) {
  .bt-panel, .bt-toast { animation: none; }
  html[data-bt-roles] :is(${ROLE_NAMES}) { animation: none; }
}
`;
    const toast = (text, ms = 2600) => {
        if (!document.body) return;
        let box = document.getElementById("bt-toasts");
        if (!box) document.body.append((box = $("div", { id: "bt-toasts" })));
        const t = $("div", { className: "bt-toast", textContent: String(text) });
        box.append(t);
        setTimeout(() => t.remove(), ms);
    };

    const plugins = new Map();
    let currentFile = null;
    const fileErrors = new Map();

    const pluginState = id => {
        const st = (S.plugins[id] ??= { settings: {} });
        if (!st.settings || typeof st.settings !== "object") st.settings = {};
        return st;
    };
    const isPluginEnabled = rec => pluginState(rec.def.id).enabled ?? !!rec.def.enabledByDefault;

    const normaliseOptions = opts => (opts || []).map(o => (Array.isArray(o) ? o : typeof o === "object" ? [o.value, o.label ?? o.value] : [o, o]));
    const pluginSpec = (key, s) => [
        key,
        s.label ?? key,
        s.type,
        s.type === "select" ? normaliseOptions(s.options) : s.type === "button" ? s.text ?? s.label ?? key : s.min ?? 0,
        s.max ?? 100,
        s.unit ?? "",
    ];

    const safeCall = (rec, what, fn) => {
        try {
            return fn();
        } catch (e) {
            rec.error = e;
            warn(`plugin "${rec.def.id}" ${what} failed:`, e);
            return undefined;
        }
    };

    const pluginCssText = rec => {
        const { css } = rec.def;
        if (!css) return "";
        return typeof css === "function" ? String(css(rec.api.settings, rec.api) ?? "") : String(css);
    };

    const makeApi = rec => {
        const id = rec.def.id;
        const st = pluginState(id);
        const onDispose = fn => {
            if (typeof fn === "function") rec.disposers.push(fn);
        };

        const css = (text = "") => {
            const sheet = newSheet();
            setCss(sheet, String(text), `plugin ${id}`);
            pluginSheets.add(sheet);
            mountSheets();
            const handle = {
                update: t => setCss(sheet, String(t ?? ""), `plugin ${id}`),
                remove: () => {
                    if (pluginSheets.delete(sheet)) mountSheets();
                },
            };
            onDispose(handle.remove);
            return handle;
        };

        const observe = (selector, callback) => {
            const seen = new WeakSet();
            const hit = el => {
                if (seen.has(el)) return;
                seen.add(el);
                try {
                    callback(el);
                } catch (e) {
                    warn(`plugin "${id}" observe callback failed:`, e);
                }
            };
            const scan = node => {
                if (node.nodeType !== 1) return;
                if (node.matches(selector)) hit(node);
                for (const el of node.querySelectorAll(selector)) hit(el);
            };
            scan(document.body);
            const stop = domWatch(muts => {
                for (const m of muts) for (const n of m.addedNodes) scan(n);
            });
            onDispose(stop);
            return stop;
        };

        const onKey = (combo, fn) => {
            const parts = String(combo).toLowerCase().split("+").map(s => s.trim());
            const key = parts.pop();
            const want = { ctrl: parts.includes("ctrl"), alt: parts.includes("alt"), shift: parts.includes("shift"), meta: parts.includes("meta") };
            const handler = e => {
                if (e.ctrlKey !== want.ctrl || e.altKey !== want.alt || e.shiftKey !== want.shift || e.metaKey !== want.meta) return;
                const k = e.key.toLowerCase();
                const code = e.code.toLowerCase();
                if (k === key || code === `key${key}` || code === `digit${key}` || code === key) {
                    e.preventDefault();
                    try {
                        fn(e);
                    } catch (err) {
                        warn(`plugin "${id}" hotkey failed:`, err);
                    }
                }
            };
            document.addEventListener("keydown", handler, true);
            const stop = () => document.removeEventListener("keydown", handler, true);
            onDispose(stop);
            return stop;
        };

        const settingsPage = (pageId, render) => {
            pagePanels.set(pageId, render);
            refreshPageHosts(pageId);
            const stop = () => {
                if (pagePanels.get(pageId) !== render) return;
                pagePanels.delete(pageId);
                refreshPageHosts(pageId);
            };
            onDispose(stop);
            return stop;
        };

        const contextMenu = (navIds, build) => {
            ctxSetup();
            if (!ctxMenus.css) {
                ctxMenus.css = true;
                const st = document.createElement("style");
                st.id = "bt-menu-css";
                st.textContent = ctxCss;
                ready(() => document.head.append(st));
            }
            const h = { navIds: navIds === "*" ? "*" : [].concat(navIds), build, plugin: id };
            ctxMenus.handlers.add(h);
            const stop = () => ctxMenus.handlers.delete(h);
            onDispose(stop);
            return stop;
        };

        const addMenuItem = (label, fn) => {
            const item = { label: String(label), fn, plugin: id };
            menuItems.add(item);
            queueMicrotask(refreshQuickActions);
            const remove = () => {
                menuItems.delete(item);
                queueMicrotask(refreshQuickActions);
            };
            onDispose(remove);
            return remove;
        };

        const storage = {
            get: key => idb.get(`plugin:${id}:${key}`),
            set: (key, value) => idb.set(`plugin:${id}:${key}`, value),
            delete: key => idb.del(`plugin:${id}:${key}`),
        };

        const webpack = Object.freeze({
            find: wpFind,
            findByProps: (...props) => wpFind(byProps(...props)),
            findStore: name => wpFind(storeNamed(name)),
            waitFor(filter, cb) {
                const stop = wpWaitFor(filter, cb);
                onDispose(stop);
                return stop;
            },
            waitForStore(name, cb) {
                return webpack.waitFor(storeNamed(name), cb);
            },
        });

        const fluxApi = Object.freeze({
            get dispatcher() {
                return flux.dispatcher;
            },
            intercept(fn) {
                flux.interceptors.add(fn);
                const stopWait = withDispatcher(() => {});
                const stop = () => {
                    stopWait();
                    flux.interceptors.delete(fn);
                };
                onDispose(stop);
                return stop;
            },
            subscribe(type, cb) {
                let d = null;
                const stopWait = withDispatcher(disp => {
                    d = disp;
                    disp.subscribe(type, cb);
                });
                const stop = () => {
                    stopWait();
                    if (d) d.unsubscribe(type, cb);
                    d = null;
                };
                onDispose(stop);
                return stop;
            },
        });

        const netApi = Object.freeze({
            onRequest(handler) {
                net.handlers.add(handler);
                const stop = () => net.handlers.delete(handler);
                onDispose(stop);
                return stop;
            },
        });

        const api = {
            id,
            settings: st.settings,
            webpack,
            flux: fluxApi,
            net: netApi,
            discord: discordApi,
            copy: copyText,
            spotify: Object.freeze({
                login: (clientId, port) => Native.spotifyLogin(clientId, port),
                refresh: (clientId, refreshToken) => Native.spotifyRefresh(clientId, refreshToken),
                request: (token, method, path, body, via) => Native.spotifyApi(token, method, path, body, via),
                cookieToken: cookie => Native.spotifyCookieToken(cookie),
                keepAlive: on => Native.spotifyKeepAlive(on),
                launch: () => Native.spotifyLaunch(),
                webLogin: () => Native.spotifyWebLogin(),
                webToken: force => Native.spotifyWebToken(force),
                webLogout: () => Native.spotifyWebLogout(),
                webStatus: () => Native.spotifyWebStatus(),
                log: msg => Native.spotifyLog?.(msg),
                library: (kind, id) => Native.spotifyLibrary(kind, id),
                like: (id, want) => Native.spotifyLike(id, want),
                lyrics: query => Native.lyrics(query),
            }),
            lazy: Object.freeze({
                shields: (level, force) => Native.lazyShields(level, force),
                open: (url, newTab) => Native.lazyOpen(url, newTab),
                tab: (action, id) => Native.lazyTab(action, id),
                search: (q, page, kind) => Native.lazySearch(q, page, kind),
                summary: q => Native.lazySummary(q),
                zoom: f => Native.lazyZoom(f),
                suggest: q => Native.lazySuggest(q),
                viewport: vp => Native.lazyViewport(vp),
                input: ev => Native.lazyInput(ev),
                edit: cmd => Native.lazyEdit(cmd),
                onFrame: cb => {
                    const off = Native.onLazyFrame(cb);
                    onDispose(off);
                    return off;
                },
                nav: action => Native.lazyNav(action),
                state: () => Native.lazyState(),
                close: () => Native.lazyClose(),
                popout: url => Native.lazyPopout(url),
                clear: () => Native.lazyClear(),
                onEvent: cb => {
                    const off = Native.onLazyEvent(cb);
                    onDispose(off);
                    return off;
                },
            }),
            kick: Object.freeze({
                login: () => Native.kickLogin(),
                status: () => Native.kickStatus(),
                logout: () => Native.kickLogout(),
                list: (kind, q) => Native.kickList(kind, q),
            }),
            twitch: Object.freeze({
                login: () => Native.twLogin(),
                status: () => Native.twStatus(),
                logout: () => Native.twLogout(),
                list: (kind, q) => Native.twList(kind, q),
            }),
            youtube: Object.freeze({
                search: q => Native.ytSearch(q),
                resolveChannel: text => Native.ytResolveChannel(text),
                channelVideos: (ids, includeShorts) => Native.ytChannelVideos(ids, includeShorts),
            }),
            openWindow: (title, content) => openContentWindow(title, content),
            setSetting(key, value) {
                st.settings[key] = value;
                onPluginSettingChange(rec, key, value);
                refreshControls();
            },
            get core() {
                const { plugins: _p, enabledThemes: _t, serverThemes: _s, serverThemesEnabled: _se, uiCollapsed: _uc, ...core } = effective();
                return core;
            },
            css,
            observe,
            onKey,
            addMenuItem,
            contextMenu,
            settingsPage,
            toast,
            storage,
            onDispose,
            el: $,
            log: (...a) => console.log(`%c[${rec.def.name}]`, "color:#a78bfa;font-weight:700", ...a),
            warn: (...a) => console.warn(`%c[${rec.def.name}]`, "color:#a78bfa;font-weight:700", ...a),
        };
        return Object.freeze(api);
    };

    const startPlugin = rec => {
        if (rec.running || !enabled || !started) return;
        rec.error = null;
        rec.disposers = [];
        rec.api = makeApi(rec);
        rec.cssHandle = rec.def.css ? rec.api.css(safeCall(rec, "css", () => pluginCssText(rec)) || "") : null;
        safeCall(rec, "start", () => rec.def.start?.call(rec.def, rec.api));
        if (rec.error) cleanupPlugin(rec);
        else rec.running = true;
        refreshPluginLists();
    };

    const cleanupPlugin = rec => {
        for (const fn of (rec.disposers || []).splice(0).reverse()) {
            try {
                fn();
            } catch (e) {
                warn(`plugin "${rec.def.id}" cleanup failed:`, e);
            }
        }
        rec.cssHandle = null;
    };

    const stopPlugin = rec => {
        if (!rec.running) return;
        safeCall(rec, "stop", () => rec.def.stop?.call(rec.def, rec.api));
        cleanupPlugin(rec);
        rec.running = false;
        refreshPluginLists();
    };

    const onPluginSettingChange = (rec, key, value) => {
        if (rec.running) {
            if (rec.cssHandle) rec.cssHandle.update(safeCall(rec, "css", () => pluginCssText(rec)) || "");
            safeCall(rec, "onSettingChange", () => rec.def.onSettingChange?.call(rec.def, key, value, rec.api));
        }
        save();
    };

    const setPluginEnabled = (id, on) => {
        const rec = plugins.get(id);
        if (!rec) return false;
        pluginState(id).enabled = !!on;
        on ? startPlugin(rec) : stopPlugin(rec);
        save();
        return true;
    };

    function definePlugin(def) {
        if (!def || typeof def !== "object") throw new TypeError("definePlugin needs an object");
        if (typeof def.id !== "string" || !/^[A-Za-z][\w-]{0,63}$/.test(def.id)) {
            throw new TypeError('Plugin "id" must start with a letter and contain only letters, digits, "-" or "_".');
        }
        const full = { name: def.id, description: "", author: "", version: "", settings: {}, enabledByDefault: false, ...def };

        const st = pluginState(full.id);
        for (const [key, s] of Object.entries(full.settings || {})) {
            if (!(key in st.settings) && s && "default" in s) st.settings[key] = s.default;
        }

        const old = plugins.get(full.id);
        if (old) {
            stopPlugin(old);
            log(`plugin "${full.id}" reloaded`);
        }
        const rec = { def: full, file: currentFile || "console", running: false, error: null, disposers: [] };
        plugins.set(full.id, rec);
        if (isPluginEnabled(rec)) startPlugin(rec);
        refreshPluginLists();
        return full;
    }

    const withFile = (file, fn) => {
        const prev = currentFile;
        currentFile = String(file);
        fileErrors.delete(currentFile);
        try {
            fn();
        } catch (e) {
            fileErrors.set(currentFile, e);
            warn(`${currentFile} crashed while loading:`, e);
        } finally {
            currentFile = prev;
        }
        refreshPluginLists();
    };

    const syncUserPlugins = files => {
        const keep = new Set((files || []).map(f => `user:${f}`));
        for (const [id, rec] of plugins) {
            if (rec.file.startsWith("user:") && !keep.has(rec.file)) {
                stopPlugin(rec);
                plugins.delete(id);
                log(`plugin "${id}" unloaded (file removed)`);
            }
        }
        for (const f of fileErrors.keys()) if (f.startsWith("user:") && !keep.has(f)) fileErrors.delete(f);
        refreshPluginLists();
    };

    const startAllPlugins = () => {
        for (const rec of plugins.values()) if (isPluginEnabled(rec)) startPlugin(rec);
    };
    const stopAllPlugins = () => {
        for (const rec of plugins.values()) stopPlugin(rec);
    };

    let applyQueued = false;
    let saveTimer = 0;

    const apply = () => {
        const E = effective();
        setCss(sheets.vars, featureOn("themes") ? varsCss() : "", "variables");
        setRootAttr("data-bt-bubbles", E.bubbles ? null : "off");
        setRootAttr("data-bt-hover", E.hoverEffect === "glow" ? null : E.hoverEffect);
        setRootAttr("data-bt-notif", E.notifAccent === false ? "discord" : null);
        setRootAttr("data-bt-roles", enabled && ROLE_STYLES.some(([v]) => v === E.roleStyle) && E.roleStyle !== "off" ? E.roleStyle : null);
        updateThemeWarning();
        for (const rec of plugins.values()) {
            if (rec.running && rec.def.onCoreChange) safeCall(rec, "onCoreChange", () => rec.def.onCoreChange.call(rec.def, rec.api.core, rec.api));
        }
    };

    const save = () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => Native.setSettings(S).catch(e => warn("Couldn't save settings:", e)), 300);
    };

    const update = () => {
        if (!applyQueued) {
            applyQueued = true;
            requestAnimationFrame(() => {
                applyQueued = false;
                apply();
            });
        }
        save();
    };

    let wallpaperObjectUrl = null;
    const say = msg => document.querySelectorAll(".bt-status").forEach(el => (el.textContent = msg));

    const canLoad = src => new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });
    const blobToDataUrl = blob => new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
    });

    const showWallpaper = async blob => {
        if (wallpaperObjectUrl && ![...wallpaperCache.values()].includes(wallpaperObjectUrl)) URL.revokeObjectURL(wallpaperObjectUrl);
        wallpaperObjectUrl = null;

        if (!blob) {
            hasWallpaper = false;
            wallpaperCss = "none";
            apply();
            return true;
        }

        let src = URL.createObjectURL(blob);
        if (await canLoad(src)) {
            wallpaperObjectUrl = src;
        } else {
            URL.revokeObjectURL(src);
            src = await blobToDataUrl(blob);
            if (!(await canLoad(src))) return false;
        }
        hasWallpaper = true;
        wallpaperCss = `url("${src}")`;
        apply();
        return true;
    };

    let shownWallpaperKey = null;
    const wallpaperKeyNow = (guild = currentGuild) => {
        const p = activeProfile(guild);
        if (!p) return "wallpaper";
        if (p.background === "gradient") return "none";
        if (p.background === "image" && p.wallpaper) return `wallpaper:${guild}`;
        return "wallpaper";
    };
    const wallpaperCache = new Map([["none", null]]);
    const wallpaperKeepers = new Map();
    const keepDecoded = (key, src) => {
        for (const [k, el] of wallpaperKeepers) {
            if (k === key) continue;
            el.remove();
            wallpaperKeepers.delete(k);
        }
        wallpaperKeepers.get(key)?.remove();
        wallpaperKeepers.delete(key);
        if (!src) return;
        const el = $("div", { className: "bt-wall-keep", ariaHidden: "true" });
        el.style.backgroundImage = `url("${src}")`;
        (document.body || document.documentElement).append(el);
        wallpaperKeepers.set(key, el);
    };
    const forgetWallpaper = key => {
        if (key === "none") return;
        const src = wallpaperCache.get(key);
        wallpaperCache.delete(key);
        keepDecoded(key, null);
        if (src && src.startsWith("blob:") && src !== wallpaperObjectUrl) URL.revokeObjectURL(src);
    };
    const loadWallpaper = async key => {
        if (key === "none") return null;
        if (wallpaperCache.has(key)) return wallpaperCache.get(key);
        const blob = await idb.get(key);
        let src = null;
        if (blob instanceof Blob) {
            src = URL.createObjectURL(blob);
            if (!(await canLoad(src))) {
                URL.revokeObjectURL(src);
                src = await blobToDataUrl(blob);
                if (!(await canLoad(src))) {
                    warn(`Wallpaper "${key}" couldn't be displayed.`);
                    src = null;
                }
            }
        }
        if (wallpaperCache.has(key)) {
            if (src && src.startsWith("blob:")) URL.revokeObjectURL(src);
            return wallpaperCache.get(key);
        }
        wallpaperCache.set(key, src);
        keepDecoded(key, src);
        return src;
    };
    const warmWallpapers = () => {
        const key = wallpaperKeyNow();
        if (!wallpaperCache.has(key)) loadWallpaper(key).catch(() => {});
    };
    const setWallpaperState = (key, src) => {
        shownWallpaperKey = key;
        hasWallpaper = !!src;
        wallpaperCss = src ? `url("${src}")` : "none";
        wallpaperObjectUrl = src && src.startsWith("blob:") ? src : null;
    };
    const syncWallpaper = async (force = false) => {
        const key = wallpaperKeyNow();
        if (!force && key === shownWallpaperKey) return;
        if (force) forgetWallpaper(key);
        shownWallpaperKey = key;
        const src = await loadWallpaper(key);
        if (shownWallpaperKey !== key) return;
        setWallpaperState(key, src);
        apply();
    };

    const useWallpaperBlob = async (blob, label) => {
        say("Loading…");
        if (!(await showWallpaper(blob))) {
            say("Discord refused to display that image.");
            return;
        }
        try {
            await idb.set("wallpaper", blob);
            forgetWallpaper("wallpaper");
            say(`Wallpaper set: ${label}`);
        } catch {
            say("Wallpaper shown, but it couldn't be saved (image too large?).");
        }
        syncWallpaper(true);
    };

    const wallpaperFromFile = file => {
        if (!file) return;
        if (!file.type.startsWith("image/")) return say("That file isn't an image.");
        useWallpaperBlob(new Blob([file], { type: file.type }), file.name);
    };

    const wallpaperFromUrl = async url => {
        if (!url) return;
        say("Downloading…");
        try {
            const { type, data } = await Native.fetchImage(url);
            await useWallpaperBlob(new Blob([data], { type }), "from link");
        } catch (e) {
            say(String(e?.message || e).replace(/^Error invoking remote method '[^']+': (Error: )?/, ""));
        }
    };

    const clearWallpaper = async () => {
        await idb.del("wallpaper");
        forgetWallpaper("wallpaper");
        await syncWallpaper(true);
        say(S.gradEnabled === false ? "Wallpaper removed (your gradient is switched off, so a plain colour shows)" : "Back to the gradient");
    };

    const fileInput = $("input", { type: "file", accept: "image/*", hidden: true });
    fileInput.addEventListener("change", () => {
        wallpaperFromFile(fileInput.files?.[0]);
        fileInput.value = "";
    });

    const colorPicker = (() => {
        const ROLE_COLORS = ["#1abc9c", "#2ecc71", "#3498db", "#9b59b6", "#e91e63", "#f1c40f", "#e67e22", "#e74c3c", "#95a5a6", "#607d8b",
            "#11806a", "#1f8b4c", "#206694", "#71368a", "#ad1457", "#c27c0e", "#a84300", "#992d22", "#979c9f", "#546e7a"];
        const RECENT_KEY = "bt-color-recent";
        const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
        const toHex = rgb => "#" + rgb.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
        const parseHex = str => {
            let x = String(str || "").trim().replace(/^#/, "");
            if (/^[0-9a-f]{3}$/i.test(x)) x = x.replace(/./g, "$&$&");
            return /^[0-9a-f]{6}$/i.test(x) ? [0, 2, 4].map(i => parseInt(x.slice(i, i + 2), 16)) : null;
        };
        const hsvToRgb = (h, s, v) => {
            s /= 100; v /= 100;
            const f = n => { const k = (n + h / 60) % 6; return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255; };
            return [f(5), f(3), f(1)];
        };
        const rgbToHsv = ([r, g, b], prevH = 0) => {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
            let h = prevH;
            if (d) h = 60 * (max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4);
            return [h, max ? (d / max) * 100 : 0, max * 100];
        };
        const recents = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; } };
        const pushRecent = hex => {
            try { localStorage.setItem(RECENT_KEY, JSON.stringify([hex, ...recents().filter(c => c !== hex)].slice(0, 10))); } catch {}
        };

        let open = null;

        const DROPPER_PATH = "M20.7 5.6 18.4 3.3a1 1 0 0 0-1.4 0l-3.1 3.1-1.3-1.3-1.4 1.4 1.4 1.4L4 16.5V20h3.5l8.6-8.6 1.4 1.4 1.4-1.4-1.3-1.3 3.1-3.1a1 1 0 0 0 0-1.4ZM6.7 18H6v-.7l8-8 .7.7-8 8Z";
        const DROPPER_SVG = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="${DROPPER_PATH}"/></svg>`;
        const DROPPER_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="${DROPPER_PATH}" fill="#fff" stroke="#000" stroke-width="1.2" paint-order="stroke"/></svg>`)}") 4 20, crosshair`;
        const eyedropper = async (root, done) => {
            root.style.visibility = "hidden";
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            let img;
            try {
                img = new Image();
                img.src = await Native.captureWindow();
                await img.decode();
            } catch (e) {
                root.style.visibility = "";
                warn("Eyedropper couldn't capture the window:", e);
                return;
            }
            const canvas = $("canvas", { width: img.naturalWidth, height: img.naturalHeight });
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            const sx = img.naturalWidth / innerWidth, sy = img.naturalHeight / innerHeight;
            const pick = (x, y) => {
                const d = ctx.getImageData(clamp(Math.floor(x * sx), 0, canvas.width - 1), clamp(Math.floor(y * sy), 0, canvas.height - 1), 1, 1).data;
                return toHex([d[0], d[1], d[2]]);
            };
            const overlay = $("div", { className: "bt-cp-drop" });
            overlay.style.cursor = DROPPER_CURSOR;
            const sample = $("div", { className: "bt-cp-drop-sample" });
            const label = $("span");
            sample.append(label);
            overlay.append(sample);
            const move = e => {
                const hex = pick(e.clientX, e.clientY);
                sample.style.setProperty("--c", hex);
                label.textContent = hex.toUpperCase();
                sample.style.transform = `translate(${Math.min(e.clientX + 18, innerWidth - 110)}px, ${Math.min(e.clientY + 18, innerHeight - 40)}px)`;
            };
            const finish = hex => {
                overlay.remove();
                removeEventListener("keydown", onKey, true);
                root.style.visibility = "";
                if (hex) done(hex);
                root.querySelector(".bt-cp-field")?.focus({ preventScroll: true });
            };
            const onKey = e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(null); } };
            overlay.addEventListener("pointermove", move);
            overlay.addEventListener("pointerdown", e => {
                e.preventDefault();
                e.stopPropagation();
                finish(e.button === 0 ? pick(e.clientX, e.clientY) : null);
            });
            overlay.addEventListener("contextmenu", e => e.preventDefault());
            addEventListener("keydown", onKey, true);
            document.body.append(overlay);
        };

        const close = commit => {
            if (!open) return;
            const o = open;
            open = null;
            if (!commit) o.set(o.original);
            else if (o.hex !== o.original) {
                pushRecent(o.hex);
                o.input.dispatchEvent(new Event("change", { bubbles: true }));
            }
            o.cleanup();
            o.root.classList.add("bt-cp-out");
            setTimeout(() => o.root.remove(), 100);
        };

        const show = input => {
            close(true);
            const original = parseHex(input.value) ? toHex(parseHex(input.value)) : "#000000";
            let [h, s, v] = rgbToHsv(parseHex(original));
            let mode = "hsb";

            const root = $("div", { className: "bt-cp", tabIndex: -1 });
            root.setAttribute("role", "dialog");
            root.setAttribute("data-no-focus-lock", "true");
            root.setAttribute("aria-label", input.title || "Colour picker");

            const field = $("div", { className: "bt-cp-field", tabIndex: 0 });
            const fieldKnob = $("div", { className: "bt-cp-knob" });
            field.append(fieldKnob);
            const hue = $("div", { className: "bt-cp-hue" });
            const hueKnob = $("div", { className: "bt-cp-hue-knob" });
            hue.append(hueKnob);
            const top = $("div", { className: "bt-cp-top" });
            top.append(field, hue);

            const swNew = $("div", { className: "bt-cp-new", title: "New" });
            const swOld = $("button", { className: "bt-cp-old", title: "Current (click to revert)", type: "button" });
            swOld.style.background = original;
            const compare = $("div", { className: "bt-cp-compare" });
            compare.append(swNew, swOld);
            const hexWrap = $("label", { className: "bt-cp-hexwrap" });
            const hexIn = $("input", { className: "bt-cp-hex", spellcheck: false, maxLength: 7 });
            hexWrap.append($("span", { textContent: "#" }), hexIn);
            const tools = $("div", { className: "bt-cp-row" });
            tools.append(compare, hexWrap);
            if (Native?.captureWindow) {
                const drop = $("button", { className: "bt-cp-icon", type: "button", title: "Eyedropper: pick a colour from Discord" });
                drop.innerHTML = DROPPER_SVG;
                drop.onclick = () => eyedropper(root, set);
                tools.append(drop);
            }

            const tabs = $("div", { className: "bt-cp-tabs" });
            const tabBtns = ["hsb", "rgb"].map(m => {
                const b = $("button", { type: "button", textContent: m.toUpperCase() });
                b.onclick = () => { mode = m; render(); };
                tabs.append(b);
                return [m, b];
            });
            const modeRow = $("div", { className: "bt-cp-row" });
            modeRow.append(tabs);

            const chans = $("div", { className: "bt-cp-chans" });
            const chanEls = [0, 1, 2].map(i => {
                const lab = $("span", { className: "bt-cp-lab", title: "Drag to adjust (Shift = faster, Ctrl = finer)" });
                const num = $("input", { className: "bt-cp-num", type: "text", inputMode: "numeric" });
                const cell = $("label", { className: "bt-cp-chan" });
                cell.append(lab, num);
                chans.append(cell);
                const read = () => Math.round(mode === "hsb" ? [h, s, v][i] : hsvToRgb(h, s, v)[i]);
                const write = val => {
                    const hi = mode === "hsb" ? (i ? 100 : 359) : 255;
                    val = clamp(Math.round(val), 0, hi);
                    if (mode === "hsb") {
                        if (i === 0) h = val; else if (i === 1) s = val; else v = val;
                    } else {
                        const rgb = hsvToRgb(h, s, v).map(Math.round);
                        rgb[i] = val;
                        [h, s, v] = rgbToHsv(rgb, h);
                    }
                    render(true);
                };
                num.addEventListener("change", () => { const n = Number(num.value); if (num.value.trim() && Number.isFinite(n)) write(n); else render(); });
                num._btKey = e => {
                    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
                    e.preventDefault();
                    write(read() + (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : 1));
                };
                lab.addEventListener("pointerdown", e => {
                    e.preventDefault();
                    lab.setPointerCapture(e.pointerId);
                    const start = read(), x0 = e.clientX;
                    root.classList.add("bt-cp-scrubbing");
                    const move = ev => write(start + (ev.clientX - x0) * (ev.shiftKey ? 2 : ev.ctrlKey ? 0.1 : 0.5));
                    const up = () => { lab.removeEventListener("pointermove", move); root.classList.remove("bt-cp-scrubbing"); };
                    lab.addEventListener("pointermove", move);
                    lab.addEventListener("pointerup", up, { once: true });
                    lab.addEventListener("pointercancel", up, { once: true });
                });
                return { lab, num, read };
            });

            const swatchGrid = (title, list) => {
                if (!list.length) return null;
                const wrap = $("div", { className: "bt-cp-swatches" });
                const grid = $("div", { className: "bt-cp-grid" });
                for (const c of list) {
                    const b = $("button", { type: "button", className: "bt-cp-sw", title: c.toUpperCase() });
                    b.style.background = c;
                    b.onclick = () => set(c);
                    grid.append(b);
                }
                wrap.append($("div", { className: "bt-cp-title", textContent: title }), grid);
                return wrap;
            };

            root.append(top, tools, modeRow, chans);
            const rec = swatchGrid("Recent", recents());
            if (rec) root.append(rec);
            root.append(swatchGrid("Discord colours", ROLE_COLORS.slice(0, 10)));

            const o = { input, root, original, hex: original };
            function render(keepFocus) {
                const hex = toHex(hsvToRgb(h, s, v));
                field.style.setProperty("--bt-cp-hue", `hsl(${h} 100% 50%)`);
                fieldKnob.style.left = `${s}%`;
                fieldKnob.style.top = `${100 - v}%`;
                fieldKnob.style.background = hex;
                hueKnob.style.top = `${(h / 360) * 100}%`;
                swNew.style.background = hex;
                if (document.activeElement !== hexIn) hexIn.value = hex.slice(1).toUpperCase();
                for (const [m, b] of tabBtns) b.classList.toggle("bt-cp-on", m === mode);
                const labels = mode === "hsb" ? ["H", "S", "B"] : ["R", "G", "B"];
                chanEls.forEach((c, i) => {
                    c.lab.textContent = labels[i];
                    if (!(keepFocus && document.activeElement === c.num)) c.num.value = c.read();
                });
                o.hex = hex;
                if (input.value !== hex) {
                    input.value = hex;
                    input.dispatchEvent(new Event("input", { bubbles: true }));
                }
            }
            const set = hexStr => {
                const rgb = parseHex(hexStr);
                if (!rgb) return;
                [h, s, v] = rgbToHsv(rgb, h);
                render();
            };
            o.set = set;
            swOld.onclick = () => set(original);
            hexIn.addEventListener("input", () => {
                const rgb = parseHex(hexIn.value);
                if (rgb) { [h, s, v] = rgbToHsv(rgb, h); render(true); }
            });
            hexIn.addEventListener("blur", () => render());

            const drag = (el, fn) => el.addEventListener("pointerdown", e => {
                e.preventDefault();
                el.focus({ preventScroll: true });
                el.setPointerCapture(e.pointerId);
                const r = el.getBoundingClientRect();
                const at = ev => fn(clamp((ev.clientX - r.left) / r.width, 0, 1), clamp((ev.clientY - r.top) / r.height, 0, 1));
                at(e);
                el.addEventListener("pointermove", at);
                el.addEventListener("pointerup", () => el.removeEventListener("pointermove", at), { once: true });
            });
            drag(field, (x, y) => { s = x * 100; v = (1 - y) * 100; render(); });
            drag(hue, (_x, y) => { h = Math.min(359.9, y * 360); render(); });
            field._btKey = e => {
                const step = e.shiftKey ? 10 : 1;
                const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
                if (!d) return;
                e.preventDefault();
                s = clamp(s + d[0], 0, 100); v = clamp(v + d[1], 0, 100); render();
            };
            o.onKey = e => {
                if (e.key === "Escape") { e.preventDefault(); close(false); input.focus({ preventScroll: true }); }
                else if (e.key === "Enter") {
                    e.preventDefault();
                    e.target.dispatchEvent?.(new Event("change", { bubbles: true }));
                    close(true);
                    input.focus({ preventScroll: true });
                }
                else e.target._btKey?.(e);
            };
            const onDown = e => { if (!root.contains(e.target) && e.target !== input) close(true); };
            const onResize = () => close(true);
            document.addEventListener("pointerdown", onDown, true);
            window.addEventListener("resize", onResize);
            o.cleanup = () => {
                document.removeEventListener("pointerdown", onDown, true);
                window.removeEventListener("resize", onResize);
            };

            for (const type of ["focusin", "focusout", "input", "paste", "beforeinput", "pointerdown", "mousedown"]) {
                root.addEventListener(type, e => e.stopPropagation());
            }
            document.body.append(root);
            render();
            const r = input.getBoundingClientRect(), pw = root.offsetWidth, ph = root.offsetHeight;
            let y = r.bottom + 8;
            if (y + ph > innerHeight - 8) y = r.top - ph - 8;
            const want = { x: clamp(r.right - pw, 8, innerWidth - pw - 8), y: clamp(y, 8, innerHeight - ph - 8) };
            root.style.left = `${want.x}px`;
            root.style.top = `${want.y}px`;
            const got = root.getBoundingClientRect();
            if (Math.abs(got.left - want.x) > 0.5 || Math.abs(got.top - want.y) > 0.5) {
                root.style.left = `${2 * want.x - got.left}px`;
                root.style.top = `${2 * want.y - got.top}px`;
            }
            open = o;
            field.focus({ preventScroll: true });
        };

        const inPicker = n => n instanceof Element && !!n.closest(".bt-cp, .bt-cp-drop");
        for (const type of ["keydown", "keyup", "keypress"]) {
            window.addEventListener(type, e => {
                if (!open || !inPicker(e.target)) return;
                e.stopImmediatePropagation();
                if (type === "keydown") open.onKey(e);
            }, true);
        }
        for (const type of ["focusout", "blur"]) {
            window.addEventListener(type, e => {
                if (open && inPicker(e.relatedTarget) && !inPicker(e.target)) e.stopImmediatePropagation();
            }, true);
        }
        for (const type of ["focusin"]) {
            window.addEventListener(type, e => {
                if (open && inPicker(e.target)) e.stopImmediatePropagation();
            }, true);
        }

        const isOurs = el => el instanceof HTMLInputElement && el.type === "color" && !el.disabled &&
            (el.classList.contains("bt-node-color") || !!el.closest(".bt-panel, #bt-window, #bt-settings-inline, .bt-native"));
        document.addEventListener("click", e => {
            if (!isOurs(e.target)) return;
            e.preventDefault();
            if (open && open.input === e.target) close(true);
            else show(e.target);
        }, true);
        document.addEventListener("keydown", e => {
            if ((e.key === "Enter" || e.key === " ") && isOurs(e.target)) { e.preventDefault(); show(e.target); }
        }, true);
        return { show, close };
    })();

    const FLAT_SPLASHES = ["clyde", "morph", "minimal", "terminal", "equalizer", "shapes", "counter"];
    const SPLASH_ONLY = {
        splashBg: FLAT_SPLASHES, splashFg: FLAT_SPLASHES, splashAccent: FLAT_SPLASHES, splashSize: FLAT_SPLASHES, splashSpeed: FLAT_SPLASHES,
        splashPlace: FLAT_SPLASHES, splashPattern: FLAT_SPLASHES, splashPatternOpacity: FLAT_SPLASHES, splashTextSize: FLAT_SPLASHES, splashTextOpacity: FLAT_SPLASHES,
        splashClydeAnim: ["clyde"], splashClydeLook: ["clyde"], splashLoader: ["clyde"],
        splashSpinner: ["minimal"], splashThickness: ["minimal"],
        splashTermLines: ["terminal"], splashTermWindow: ["terminal"], splashTermCursor: ["terminal"], splashTermTimes: ["terminal"],
        splashBars: ["equalizer"], splashBarWidth: ["equalizer"], splashBarRound: ["equalizer"], splashEqColors: ["equalizer"], splashEqMirror: ["equalizer"],
        splashShapesMotion: ["shapes"], splashMorphStay: ["morph"], splashCounterMode: ["counter"], splashCounterFont: ["counter"], splashCounterLine: ["counter"],
        splashLogo: ["wallpaper", "media"], splashFit: ["media"], splashDim: ["wallpaper", "media"],
        splashText: ["wallpaper", "media", ...FLAT_SPLASHES],
    };
    if (!["wallpaper", "media", "discord", ...FLAT_SPLASHES].includes(S.splashStyle)) S.splashStyle = "clyde";
    const syncSplashRows = () => {
        for (const [k, kinds] of Object.entries(SPLASH_ONLY)) {
            document.querySelectorAll(`.bt-panel [data-k="${k}"]`).forEach(i => {
                const r = i.closest(".bt-row");
                if (r) r.hidden = !kinds.includes(S.splashStyle);
            });
        }
    };
    const refreshControls = () => {
        document.querySelectorAll(".bt-panel [data-k]").forEach(i => i._btSync?.());
        syncSplashRows();
    };

    const rowShell = (label, forId, hint, controls, extra = "", stacked = null) => {
        const r = $("div", { className: `bt-row ${extra}`.trim() });
        const main = $("div", { className: "bt-row-main" });
        const text = $("div", { className: "bt-row-text" });
        text.append($("label", { className: "bt-row-title", textContent: label, htmlFor: forId || "" }));
        if (hint) text.append($("div", { className: "bt-row-desc", textContent: hint }));
        const ctl = $("div", { className: "bt-row-ctl" });
        for (const c of [].concat(controls || [])) if (c) ctl.append(c);
        main.append(text, ctl);
        r.append(main);
        if (stacked) r.append(stacked);
        return r;
    };

    const makeScrubby = (el, label, get, set) => {
        el.tabIndex = 0;
        el.setAttribute("role", "spinbutton");
        el.setAttribute("aria-label", label);
        el.title = "Drag left or right to change (hold Shift to go faster). Click to type a value.";
        const editing = () => el.getAttribute("contenteditable") === "true";
        let drag = null;
        const beginEdit = () => {
            el.setAttribute("contenteditable", "true");
            el.textContent = String(get());
            el.focus();
            try {
                const r = document.createRange();
                r.selectNodeContents(el);
                const sel = getSelection();
                sel.removeAllRanges();
                sel.addRange(r);
            } catch { }
        };
        const endEdit = commit => {
            if (!editing()) return;
            const v = parseFloat(el.textContent.replace(",", "."));
            el.removeAttribute("contenteditable");
            if (commit && Number.isFinite(v)) set(v);
            el._btShow?.();
        };
        el.addEventListener("pointerdown", e => {
            if (e.button !== 0 || editing()) return;
            drag = { x: e.clientX, v: get(), moved: false };
            try {
                el.setPointerCapture(e.pointerId);
            } catch { }
            e.preventDefault();
        });
        el.addEventListener("pointermove", e => {
            if (!drag) return;
            const dx = e.clientX - drag.x;
            if (!drag.moved && Math.abs(dx) < 3) return;
            drag.moved = true;
            set(drag.v + Math.round(dx / 2) * (e.shiftKey ? 10 : 1));
        });
        el.addEventListener("pointerup", () => {
            if (!drag) return;
            const clicked = !drag.moved;
            drag = null;
            if (clicked) beginEdit();
        });
        el.addEventListener("pointercancel", () => (drag = null));
        el.addEventListener("keydown", e => {
            e.stopPropagation();
            if (editing()) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    endEdit(true);
                } else if (e.key === "Escape") {
                    e.preventDefault();
                    endEdit(false);
                }
                return;
            }
            const step = e.shiftKey ? 10 : 1;
            if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                e.preventDefault();
                set(get() + step);
            } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                e.preventDefault();
                set(get() - step);
            } else if (e.key === "Enter") {
                e.preventDefault();
                beginEdit();
            }
        });
        el.addEventListener("blur", () => endEdit(true));
    };

    const row = (spec, store, onChange, hint = HINTS[spec[0]]) => {
        const [key, label, type, a, b, unit = ""] = spec;
        const out = $(type === "range" ? "span" : "output", { className: type === "range" ? "bt-scrub" : type === "color" ? "bt-hex" : "bt-row-value" });
        let input;
        if (type === "range") input = $("input", { type: "range", min: a, max: b, step: 1 });
        else if (type === "color") input = $("input", { type: "color" });
        else if (type === "text") input = $("input", { type: "text", className: "bt-text", spellcheck: false });
        else if (type === "button") {
            input = $("button", { className: "bt-b bt-small", type: "button", textContent: a });
            input.addEventListener("click", () => onChange(key, store[key]));
        } else if (type === "info") input = $("span", { className: "bt-row-value bt-row-info" });
        else if (type === "select") {
            input = $("select");
            for (const [value, text] of a) input.append($("option", { value, textContent: text }));
        } else input = $("input", { type: "checkbox", className: "bt-switch" });

        input.dataset.k = key;
        const id = `bt-${key}-${Math.random().toString(36).slice(2, 7)}`;
        input.id = id;
        if (type === "text") input.addEventListener("keydown", e => e.stopPropagation());
        const show = () => {
            if (out.getAttribute("contenteditable") !== "true") {
                out.textContent = type === "range" ? store[key] + unit : type === "color" ? String(store[key] ?? "").toUpperCase() : "";
            }
            if (type === "range") {
                input.style.setProperty("--bt-fill", `${((Number(store[key]) - a) / ((b - a) || 1)) * 100}%`);
                out.setAttribute("aria-valuenow", String(store[key]));
            }
        };
        out._btShow = show;
        input._btSync = () => {
            if (type === "button") return;
            if (type === "info") { input.textContent = String(store[key] ?? ""); return; }
            if (type === "toggle") input.checked = !!store[key];
            else input.value = store[key] ?? "";
            show();
        };
        input._btSync();
        input.addEventListener(type === "select" ? "change" : "input", () => {
            store[key] = type === "toggle" ? input.checked : type === "range" ? +input.value : input.value;
            show();
            onChange(key, store[key]);
        });
        if (type === "range") {
            out.setAttribute("aria-valuemin", String(a));
            out.setAttribute("aria-valuemax", String(b));
            makeScrubby(out, label, () => Number(store[key]), v => {
                v = Math.min(b, Math.max(a, Math.round(v)));
                if (v === Number(store[key])) return;
                store[key] = v;
                input.value = v;
                show();
                onChange(key, v);
            });
        }
        const stacked = type === "text";
        const controls = stacked ? [] : type === "range" ? [input, out] : type === "color" ? [out, input] : [input];
        return rowShell(label, id, hint, controls, `bt-row-${type}${stacked ? " bt-row-stacked" : ""}`, stacked ? input : null);
    };

    const button = (text, onClick, extra = "") => {
        const b = $("button", { className: `bt-b ${extra}`.trim(), textContent: text });
        b.onclick = onClick;
        return b;
    };

    const switchRow = (key, label, get, set, hint = "") => {
        const input = $("input", { type: "checkbox", className: "bt-switch", id: `bt-${key}-sw-${Math.random().toString(36).slice(2, 7)}` });
        input.dataset.k = `__${key}`;
        input._btSync = () => (input.checked = !!get());
        input._btSync();
        input.addEventListener("change", () => set(input.checked));
        return rowShell(label, input.id, hint, [input], "bt-row-toggle");
    };

    const renderThemeList = list => {
        list.replaceChildren();
        if (!state.themes.length) {
            list.append($("div", { className: "bt-empty", textContent: "No themes found. Drop .css files into the themes folder." }));
            return;
        }
        for (const t of state.themes) {
            const item = $("div", { className: "bt-item bt-card" });
            const sw = $("input", { type: "checkbox", className: "bt-switch", checked: S.enabledThemes.includes(t.file) });
            sw.setAttribute("aria-label", `${t.name}: ${sw.checked ? "on" : "off"}`);
            sw.onchange = () => {
                setThemeEnabled(t.file, sw.checked);
                refreshControls();
            };
            const info = $("div", { className: "bt-item-info" });
            const title = $("div", { className: "bt-item-title" });
            title.append($("b", { textContent: t.name }));
            if (t.version) title.append($("small", { textContent: `v${t.version}` }));
            if (t.author) title.append($("small", { textContent: `by ${t.author}` }));
            title.append($("span", { className: "bt-tag", textContent: t.source }));
            info.append(title, $("p", { textContent: t.description || t.file }));
            const side = $("div", { className: "bt-item-side" });
            side.append(sw);
            item.append(info, side);
            list.append(item);
        }
    };
    const refreshThemeLists = () => document.querySelectorAll(".bt-themes-list").forEach(renderThemeList);

    function setThemeEnabled(file, on) {
        S.enabledThemes = on ? [...new Set([...S.enabledThemes, file])] : S.enabledThemes.filter(f => f !== file);
        applyThemes();
        updateThemeWarning();
        save();
    }

    const serverCardOpen = new Map();

    const applyServerChange = (reloadWallpaper = false) => {
        applyThemes();
        apply();
        save();
        syncWallpaper(reloadWallpaper);
        refreshServerSections();
    };

    const profileSwatch = p =>
        `linear-gradient(135deg, ${profileValue(p, "grad1")}, ${profileValue(p, "grad2")} 50%, ${profileValue(p, "grad3")})`;

    const profileView = p => new Proxy(p, {
        get: (t, k) => (SERVER_KEYS.includes(k) ? profileValue(t, k) : t[k]),
        set: (t, k, v) => {
            t[k] = v;
            return true;
        },
    });

    const BACKGROUNDS = [
        ["gradient", "This server's gradient"],
        ["image", "This server's own picture"],
        ["global", "Same as everywhere else (your picture or gradient)"],
    ];

    const renderServerCard = (id, here, hereName) => {
        const p = S.serverThemes[id];
        const isHere = id === here;
        const on = p.enabled !== false;
        if (isHere && hereName && hereName !== p.name) {
            p.name = hereName;
            save();
        }
        const open = serverCardOpen.has(id) ? serverCardOpen.get(id) : isHere;
        const card = $("div", { className: `bt-server${isHere ? " bt-server-here" : ""}${on ? "" : " bt-server-off"}` });
        card.dataset.server = id;

        const head = $("div", { className: "bt-server-head" });
        const title = $("button", { className: "bt-server-title", type: "button", title: open ? "Hide settings" : "Show settings" });
        const preview = $("span", { className: "bt-swatch bt-server-preview" });
        preview.style.background = profileSwatch(p);
        title.append($("span", { className: "bt-server-caret", textContent: open ? "▾" : "▸" }), preview, $("b", { textContent: p.name || id }), $("small", { textContent: id }));
        if (isHere) title.append($("span", { className: "bt-tag", textContent: "you're here" }));
        if (!on) title.append($("span", { className: "bt-tag", textContent: "off" }));
        title.onclick = () => {
            serverCardOpen.set(id, !open);
            refreshServerSections();
        };

        const actions = $("div", { className: "bt-server-actions" });
        const enable = $("label", { className: "bt-check", title: "Turn this server's look on or off without deleting it" });
        const ecb = $("input", { type: "checkbox", className: "bt-switch", checked: on });
        ecb.onchange = () => {
            p.enabled = ecb.checked;
            applyServerChange();
        };
        enable.append(ecb, $("span", { textContent: "On" }));
        let armed = 0;
        const remove = button("Remove", () => {
            if (!armed) {
                remove.textContent = "Click again to remove";
                armed = setTimeout(() => {
                    armed = 0;
                    remove.textContent = "Remove";
                }, 3000);
                return;
            }
            clearTimeout(armed);
            if (p.wallpaper) idb.del(`wallpaper:${id}`);
            forgetWallpaper(`wallpaper:${id}`);
            delete S.serverThemes[id];
            serverCardOpen.delete(id);
            applyServerChange(true);
        }, "bt-danger");
        actions.append(enable, remove);
        head.append(title, actions);
        card.append(head);
        if (!open) return card;

        const body = $("div", { className: "bt-server-body" });
        card.append(body);

        body.append($("div", { className: "bt-server-label", textContent: "Background" }));
        const bgRow = $("div", { className: "bt-server-opts" });
        const bgSelect = $("select");
        for (const [value, text] of BACKGROUNDS) bgSelect.append($("option", { value, textContent: text }));
        bgSelect.value = p.background;
        bgSelect.onchange = () => {
            p.background = bgSelect.value;
            applyServerChange();
        };
        bgRow.append(bgSelect);
        body.append(bgRow);
        if (p.background === "global") {
            body.append($("div", { className: "bt-note bt-server-hint", textContent: S.gradEnabled === false
                ? "Your gradient is switched off, so this server's gradient colours only show with \"This server's gradient\"."
                : "Your wallpaper image (if you have one) covers the gradient here. Pick \"This server's gradient\" to always see it." }));
        }
        if (p.background === "image") {
            const wall = $("div", { className: "bt-btns bt-server-wall" });
            const pick = $("input", { type: "file", accept: "image/*", hidden: true });
            pick.addEventListener("change", async () => {
                const file = pick.files && pick.files[0];
                pick.value = "";
                if (!file) return;
                if (!file.type.startsWith("image/")) return toast("That file isn't an image.");
                try {
                    await idb.set(`wallpaper:${id}`, new Blob([file], { type: file.type }));
                    forgetWallpaper(`wallpaper:${id}`);
                } catch {
                    toast("That image is too large to save.");
                    return;
                }
                p.wallpaper = true;
                p.background = "image";
                applyServerChange(true);
                toast(`Wallpaper set for ${p.name || "this server"}`);
            });
            wall.append(pick, button(p.wallpaper ? "Change this server's image" : "Choose an image for this server…", () => pick.click()));
            if (p.wallpaper) {
                wall.append(button("Delete this server's image", async () => {
                    await idb.del(`wallpaper:${id}`);
                    forgetWallpaper(`wallpaper:${id}`);
                    p.wallpaper = false;
                    p.background = "gradient";
                    applyServerChange(true);
                }));
            } else {
                wall.append($("span", { className: "bt-note", textContent: "Until you choose one, your own wallpaper is shown." }));
            }
            body.append(wall);
        }

        body.append($("div", { className: "bt-server-label", textContent: "Colour preset" }));
        const swatches = $("div", { className: "bt-presets bt-server-presets" });
        const swatchButton = (name, label, preset) => {
            const b = button("", () => {
                p.preset = name;
                for (const k of PRESET_KEYS) delete p[k];
                if (name && p.background === "global") p.background = "gradient";
                applyServerChange();
            });
            if ((p.preset || "") === name) b.classList.add("bt-picked");
            b.classList.add("bt-preset");
            const sw = $("span", { className: "bt-swatch" });
            sw.style.background = preset
                ? `linear-gradient(135deg, ${preset.grad1}, ${preset.grad2} 50%, ${preset.grad3})`
                : `linear-gradient(135deg, ${S.grad1}, ${S.grad2} 50%, ${S.grad3})`;
            b.append(sw, label);
            return b;
        };
        swatches.append(swatchButton("", "My colours", null));
        for (const [name, preset] of Object.entries(PRESETS)) swatches.append(swatchButton(name, name, preset));
        for (const [name, t] of Object.entries(S.customThemes || {})) if (t && t.values) swatches.append(swatchButton(name, `${name} ✦`, t.values));
        body.append(swatches);

        const tuneHead = $("div", { className: "bt-server-label bt-server-tune", textContent: "Customise this server" });
        const customised = SERVER_KEYS.some(k => hasOwn(p, k));
        if (customised) {
            tuneHead.append(button(p.preset ? `Reset to ${p.preset}` : "Reset to my settings", () => {
                for (const k of SERVER_KEYS) delete p[k];
                applyServerChange();
            }));
        }
        body.append(tuneHead);
        const view = profileView(p);
        const rows = $("div", { className: "bt-server-rows" });
        for (const [group, specs] of SERVER_GROUPS) {
            rows.append($("div", { className: "bt-server-group", textContent: group }));
            for (const spec of specs) {
                rows.append(row(spec, view, () => {
                    preview.style.background = profileSwatch(p);
                    update();
                }));
            }
        }
        rows.addEventListener("change", () => {
            if (!customised && SERVER_KEYS.some(k => hasOwn(p, k))) refreshServerSections();
        });
        body.append(rows);

        body.append($("div", { className: "bt-server-label", textContent: "Extra themes in this server" }));
        const themes = $("div", { className: "bt-server-themes" });
        if (!state.themes.length) themes.append($("div", { className: "bt-empty", textContent: "No themes found. Add .css files to the themes folder." }));
        for (const t of state.themes) {
            const label = $("label", { className: "bt-check" });
            const cb = $("input", { type: "checkbox", className: "bt-switch", checked: p.themes.includes(t.file) });
            cb.onchange = () => {
                p.themes = cb.checked ? [...new Set([...p.themes, t.file])] : p.themes.filter(f => f !== t.file);
                applyServerChange();
            };
            label.append(cb, $("span", { textContent: t.name }));
            themes.append(label);
        }
        body.append(themes);
        const opts = $("div", { className: "bt-server-opts" });
        const replace = $("label", { className: "bt-check" });
        const rcb = $("input", { type: "checkbox", className: "bt-switch", checked: !!p.replace });
        rcb.onchange = () => {
            p.replace = rcb.checked;
            applyServerChange();
        };
        replace.append(rcb, $("span", { textContent: "Only use these themes here (turn your other themes off)" }));
        opts.append(replace);
        body.append(opts);
        return card;
    };

    const createServerProfile = (id, name) => {
        if (!id || S.serverThemes[id]) return;
        S.serverThemes[id] = { name: name || id, enabled: true, themes: [], preset: "", replace: false, background: "gradient" };
        serverCardOpen.set(id, true);
        applyServerChange();
    };

    const renderHereLook = el => {
        el.replaceChildren();
        const id = currentGuild;
        const p = id && S.serverThemes[id];
        if (!id) {
            el.append(rowShell("This server's look", null, "Open a server to give it one.", null, "bt-row-toggle"));
            return;
        }
        if (!p) {
            el.append(rowShell("This server's look", null, `“${currentGuildName() || id}” uses your look.`,
                button("Give it its own look", () => createServerProfile(id, currentGuildName()), "bt-small"), "bt-row-toggle"));
            return;
        }
        const off = S.serverThemesEnabled === false;
        el.append(switchRow("hereLook", "This server's look", () => p.enabled !== false, on => {
            p.enabled = on;
            applyServerChange();
            refreshControls();
        }, off ? `“${p.name || id}”. Server looks are off for every server, so it isn't showing.` : `Its own look for “${p.name || id}”. Off uses your look here.`));
    };

    const renderServers = box => {
        box.replaceChildren();
        const here = currentGuild;
        const hereName = currentGuildName();

        box.append(switchRow("serverThemesEnabled", "Server looks", () => S.serverThemesEnabled !== false, v => {
            S.serverThemesEnabled = v;
            applyServerChange();
        }, "Off uses your own look in every server. Each server's settings are kept."));

        const status = $("div", { className: "bt-note bt-server-status" });
        status.textContent = here
            ? `You're in ${hereName ? `“${hereName}”` : `server ${here}`}${S.serverThemes[here] ? ". It has its own look (below)." : "."}`
            : "Open a server to give it its own look. (You're in DMs or Home right now.)";
        box.append(status);
        if (here && !S.serverThemes[here]) {
            const add = button("Give this server its own look", () => createServerProfile(here, hereName));
            const btns = $("div", { className: "bt-btns" });
            btns.append(add);
            box.append(btns);
        }

        const ids = Object.keys(S.serverThemes);
        if (!ids.length) {
            box.append($("div", { className: "bt-empty", textContent: "No servers have their own look yet." }));
            return;
        }
        const list = $("div", { className: "bt-server-list" });
        list.classList.toggle("bt-server-list-off", S.serverThemesEnabled === false);
        ids.sort((a, b) => (b === here) - (a === here) || String(S.serverThemes[a].name || a).localeCompare(String(S.serverThemes[b].name || b)));
        for (const id of ids) list.append(renderServerCard(id, here, hereName));
        box.append(list);
    };

    const renderServerNotice = el => {
        el.replaceChildren();
        const p = activeProfile();
        el.hidden = !p;
        if (!p) return;
        const overrides = p.background === "gradient" ? "its own gradient and colours" : p.background === "image" ? "its own image and colours" : "its own colours";
        el.append(
            $("span", { textContent: `You're in “${p.name || currentGuild}”, which has ${overrides}. Changes on this page still apply everywhere else.` }),
            button("Edit this server", () => openWindow("servers")),
            button("Turn it off here", () => {
                p.enabled = false;
                applyServerChange();
                refreshControls();
            }),
        );
    };
    const refreshServerSections = () => {
        document.querySelectorAll(".bt-servers").forEach(renderServers);
        document.querySelectorAll(".bt-server-notice").forEach(renderServerNotice);
        document.querySelectorAll(".bt-here-look").forEach(renderHereLook);
    };

    let guildSwitch = 0;
    let switchingTo;
    const checkGuild = async () => {
        const next = guildFromUrl();
        if (next === currentGuild || next === switchingTo) return;
        const token = ++guildSwitch;
        const key = wallpaperKeyNow(next);
        warmWallpapers();
        if (key !== shownWallpaperKey && !wallpaperCache.has(key)) {
            switchingTo = next;
            await Promise.race([loadWallpaper(key).catch(() => null), new Promise(r => setTimeout(r, 400))]);
            if (token !== guildSwitch) return;
            switchingTo = undefined;
        }
        const before = activeProfile();
        currentGuild = next;
        const themesChanged = !!(before || activeProfile());
        if (themesChanged) applyThemes();
        if (key !== shownWallpaperKey) {
            if (wallpaperCache.has(key)) setWallpaperState(key, wallpaperCache.get(key));
            else syncWallpaper();
        }
        if (themesChanged || shownWallpaperKey === key) apply();
        refreshServerSections();
    };

    const sourceTag = file => (file.startsWith("builtin:") ? "built-in" : file.startsWith("user:") ? "user" : "console");

    const openPluginSettings = new Set();
    let pluginQuery = "";
    const filterPlugins = list => {
        let shown = 0;
        for (const card of list.querySelectorAll(".bt-card")) {
            card.hidden = !!pluginQuery && !card.dataset.search.includes(pluginQuery);
            if (!card.hidden) shown++;
        }
        let none = list.querySelector(".bt-no-match");
        if (!shown && pluginQuery) {
            if (!none) list.append((none = $("div", { className: "bt-empty bt-no-match" })));
            none.textContent = `No plugins match “${pluginQuery}”.`;
        } else none?.remove();
    };

    const renderPluginList = list => {
        list.replaceChildren();
        const recs = [...plugins.values()].sort((x, y) => x.def.name.localeCompare(y.def.name));
        if (!recs.length) list.append($("div", { className: "bt-empty", textContent: "No plugins loaded." }));

        for (const rec of recs) {
            const { def } = rec;
            const wrap = $("div", { className: "bt-card" });
            wrap.dataset.search = `${def.name} ${def.description || ""} ${def.id}`.toLowerCase();
            const item = $("div", { className: "bt-item" });
            const on = isPluginEnabled(rec);
            const sw = $("input", { type: "checkbox", className: "bt-switch", checked: on, title: on ? "Turn off" : "Turn on" });
            sw.setAttribute("aria-label", `${def.name}: ${on ? "on" : "off"}`);
            sw.onchange = () => setPluginEnabled(def.id, sw.checked);
            const info = $("div", { className: "bt-item-info" });
            const title = $("div", { className: "bt-item-title" });
            title.append($("b", { textContent: def.name }));
            if (def.version) title.append($("small", { textContent: `v${def.version}` }));
            if (def.author) title.append($("small", { textContent: `by ${def.author}` }));
            title.append($("span", { className: "bt-tag", textContent: sourceTag(rec.file) }));
            info.append(title, $("p", { textContent: def.description || def.id }));
            if (rec.error) info.append($("p", { className: "bt-err", textContent: `Error: ${rec.error.message || rec.error}` }));
            const side = $("div", { className: "bt-item-side" });
            wrap.append(item);

            const entries = Object.entries(def.settings || {}).filter(([, s]) => s && s.type);
            if (entries.length) {
                const box = $("div", { className: `bt-plugin-settings${on ? "" : " bt-off"}`, hidden: !openPluginSettings.has(def.id) });
                const store = pluginState(def.id).settings;
                if (!on) {
                    const note = $("div", { className: "bt-plugin-off-note" });
                    note.append(
                        $("span", { textContent: `${def.name} is off, so these settings won't show until you turn it on.` }),
                        button("Turn it on", () => setPluginEnabled(def.id, true), "bt-small bt-primary"),
                    );
                    box.append(note);
                }
                for (const [key, s] of entries) {
                    box.append(row(pluginSpec(key, s), store, (k, v) => onPluginSettingChange(rec, k, v), s.description || s.note || ""));
                }
                const gear = button(box.hidden ? "Settings" : "Hide settings", () => {
                    box.hidden = !box.hidden;
                    box.hidden ? openPluginSettings.delete(def.id) : openPluginSettings.add(def.id);
                    gear.textContent = box.hidden ? "Settings" : "Hide settings";
                }, "bt-small");
                gear.setAttribute("aria-expanded", String(!box.hidden));
                side.append(gear);
                wrap.append(box);
            }
            side.append(sw);
            item.append(info, side);
            list.append(wrap);
        }
        filterPlugins(list);
        const recsAll = [...plugins.values()];
        document.querySelectorAll(".bt-plugin-count").forEach(el => (el.textContent = `${recsAll.length} plugins · ${recsAll.filter(isPluginEnabled).length} on`));

        for (const [file, err] of fileErrors) {
            const item = $("div", { className: "bt-item bt-card" });
            const info = $("div");
            info.append($("b", { textContent: file.replace(/^\w+:/, "") }), $("span", { className: "bt-tag", textContent: sourceTag(file) }));
            info.append($("p", { className: "bt-err", textContent: `Failed to load: ${err.message || err}` }));
            item.append(info);
            list.append(item);
        }
    };
    let pluginRefreshQueued = false;
    const refreshPluginLists = () => {
        if (pluginRefreshQueued) return;
        pluginRefreshQueued = true;
        queueMicrotask(() => {
            pluginRefreshQueued = false;
            document.querySelectorAll(".bt-plugins-list").forEach(renderPluginList);
        });
    };

    const updateThemeWarning = () => {
        const off = !effectiveThemes().includes(MAIN_THEME);
        document.querySelectorAll(".bt-warn").forEach(el => (el.hidden = !off || !enabled));
        document.querySelectorAll(".bt-off-warn").forEach(el => (el.hidden = enabled));
    };

    const hexToRgb = hex => {
        const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || "").trim());
        if (!m) return [0, 0, 0];
        let h = m[1];
        if (h.length === 3) h = [...h].map(c => c + c).join("");
        const n = parseInt(h, 16);
        return [n >> 16, (n >> 8) & 255, n & 255];
    };
    const rgbToHex = ([r, g, b]) => "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
    const rgbToHsl = ([r, g, b]) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
        if (max === min) return [0, 0, l];
        const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
        return [h * 60, s, l];
    };
    const hslToRgb = ([h, s, l]) => {
        h = (((h % 360) + 360) % 360) / 360;
        if (!s) return [l * 255, l * 255, l * 255];
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
        const f = t => {
            t = (t + 1) % 1;
            return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
        };
        return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
    };
    const withHsl = (hex, fn) => rgbToHex(hslToRgb(fn(rgbToHsl(hexToRgb(hex)))));
    const clamp01 = x => Math.min(1, Math.max(0, x));

    const MAKER_OUT = [
        ["accent", "Accent", "c", "#ff7eb6"],
        ["accent2", "Second accent", "c", "#a78bfa"],
        ["grad1", "Top-left glow", "c", "#ff9ecf"],
        ["grad2", "Top-right glow", "c", "#9d8cff"],
        ["grad3", "Bottom-right glow", "c", "#ffb38a"],
        ["grad4", "Bottom-left glow", "c", "#6ad7ff"],
        ["gradBase", "Background", "c", "#1e1233"],
        ["glassTint", "Glass tint", "c", "#140c24"],
        ["gradIntensity", "Glow strength %", "n", 100],
        ["glassOpacity", "Glass opacity %", "n", 38],
        ["glassBlur", "Glass blur px", "n", 4],
        ["radius", "Corner roundness px", "n", 8],
    ];
    const MAKER_RANGES = { gradIntensity: [0, 200], glassOpacity: [0, 95], glassBlur: [0, 40], radius: [0, 24] };

    const NODE_TYPES = {
        color: { title: "Color", cat: "Input", outputs: [["color", "Color", "c"]], params: [["color", "c", "#ff5fa2"]], run: (i, p) => ({ color: p.color }) },
        value: { title: "Value", cat: "Input", outputs: [["value", "Value", "n"]], params: [["value", "n", 50]], run: (i, p) => ({ value: Number(p.value) || 0 }) },
        mix: {
            title: "Mix", cat: "Colour",
            inputs: [["a", "A", "c", "#ffffff"], ["b", "B", "c", "#000000"], ["fac", "Factor %", "n", 50]],
            outputs: [["color", "Color", "c"]],
            run: i => {
                const t = clamp01(i.fac / 100), a = hexToRgb(i.a), b = hexToRgb(i.b);
                return { color: rgbToHex(a.map((v, k) => v + (b[k] - v) * t)) };
            },
        },
        brightness: {
            title: "Brightness", cat: "Colour",
            inputs: [["color", "Color", "c", "#808080"], ["amount", "Amount ±%", "n", 20]],
            outputs: [["color", "Color", "c"]],
            run: i => ({ color: withHsl(i.color, ([h, s, l]) => [h, s, clamp01(l + i.amount / 100)]) }),
        },
        hue: {
            title: "Hue Shift", cat: "Colour",
            inputs: [["color", "Color", "c", "#ff5fa2"], ["degrees", "Degrees", "n", 30]],
            outputs: [["color", "Color", "c"]],
            run: i => ({ color: withHsl(i.color, ([h, s, l]) => [h + i.degrees, s, l]) }),
        },
        saturation: {
            title: "Saturation", cat: "Colour",
            inputs: [["color", "Color", "c", "#ff5fa2"], ["amount", "Amount ±%", "n", -20]],
            outputs: [["color", "Color", "c"]],
            run: i => ({ color: withHsl(i.color, ([h, s, l]) => [h, clamp01(s + i.amount / 100), l]) }),
        },
        invert: {
            title: "Invert", cat: "Colour",
            inputs: [["color", "Color", "c", "#ffffff"]],
            outputs: [["color", "Color", "c"]],
            run: i => ({ color: rgbToHex(hexToRgb(i.color).map(v => 255 - v)) }),
        },
        harmony: {
            title: "Harmony", cat: "Colour",
            inputs: [["color", "Color", "c", "#ff5fa2"]],
            outputs: [["base", "Base", "c"], ["analog1", "Analogous +30°", "c"], ["analog2", "Analogous −30°", "c"], ["complement", "Complement", "c"], ["triad1", "Triad +120°", "c"], ["triad2", "Triad +240°", "c"]],
            run: i => {
                const at = d => withHsl(i.color, ([h, s, l]) => [h + d, s, l]);
                return { base: i.color, analog1: at(30), analog2: at(-30), complement: at(180), triad1: at(120), triad2: at(240) };
            },
        },
        math: {
            title: "Math", cat: "Number",
            inputs: [["a", "A", "n", 50], ["b", "B", "n", 2]],
            outputs: [["value", "Value", "n"]],
            params: [["op", "op", "multiply"]],
            run: (i, p) => ({ value: { add: i.a + i.b, subtract: i.a - i.b, multiply: i.a * i.b, divide: i.b ? i.a / i.b : 0, min: Math.min(i.a, i.b), max: Math.max(i.a, i.b) }[p.op] ?? i.a }),
        },
        output: { title: "Theme Output", cat: "Output", inputs: MAKER_OUT, outputs: [], unique: true },
    };

    const evalGraph = graph => {
        const byId = new Map(graph.nodes.map(n => [n.id, n]));
        const into = new Map(graph.links.map(l => [`${l.to}:${l.in}`, l]));
        const memo = new Map(), busy = new Set();
        const outputsOf = node => {
            if (memo.has(node.id)) return memo.get(node.id);
            if (busy.has(node.id)) return {};
            busy.add(node.id);
            const T = NODE_TYPES[node.type];
            const inputs = {};
            for (const [id, , type, def] of T.inputs || []) inputs[id] = inputValue(node, id, type, def);
            let out = {};
            try {
                out = T.run ? T.run(inputs, { ...Object.fromEntries((T.params || []).map(([k, , d]) => [k, d])), ...(node.p || {}) }) : {};
            } catch { }
            busy.delete(node.id);
            memo.set(node.id, out);
            return out;
        };
        const inputValue = (node, id, type, def) => {
            const link = into.get(`${node.id}:${id}`);
            if (link && byId.has(link.from)) {
                const v = outputsOf(byId.get(link.from))[link.out];
                if (v !== undefined) return type === "n" ? Number(v) || 0 : v;
            }
            const own = node.p && node.p[id];
            return own !== undefined ? (type === "n" ? Number(own) || 0 : own) : def;
        };
        const out = graph.nodes.find(n => n.type === "output");
        if (!out) return {};
        const values = {};
        for (const [key, , type, def] of MAKER_OUT) {
            let v = inputValue(out, key, type, def);
            if (type === "n") {
                const [lo, hi] = MAKER_RANGES[key] || [0, 1000];
                v = Math.round(Math.min(hi, Math.max(lo, v)));
            } else v = rgbToHex(hexToRgb(v));
            values[key] = v;
        }
        return values;
    };

    let makerSeq = 0;
    const newNodeId = () => `n${Date.now().toString(36)}${(makerSeq++).toString(36)}`;
    const graphFromPreset = preset => {
        const out = { id: newNodeId(), type: "output", x: 520, y: 30, p: {} };
        const nodes = [out], links = [];
        MAKER_OUT.forEach(([key, , type, def], i) => {
            if (type === "n") {
                out.p[key] = S[key] ?? def;
                return;
            }
            const n = { id: newNodeId(), type: "color", x: 40 + (i % 2) * 210, y: 20 + Math.floor(i / 2) * 104, p: { color: preset[key] || def } };
            nodes.push(n);
            links.push({ from: n.id, out: "color", to: out.id, in: key });
        });
        return { nodes, links, view: { x: 0, y: 0, z: 0.85 } };
    };
    const starterGraph = () => {
        const base = { id: newNodeId(), type: "color", x: 30, y: 60, p: { color: "#ff5fa2" } };
        const harmony = { id: newNodeId(), type: "harmony", x: 250, y: 40, p: {} };
        const bg = { id: newNodeId(), type: "color", x: 30, y: 330, p: { color: "#1b1230" } };
        const tint = { id: newNodeId(), type: "brightness", x: 250, y: 330, p: { amount: -4 } };
        const out = { id: newNodeId(), type: "output", x: 540, y: 20, p: { gradIntensity: 100, glassOpacity: 38, glassBlur: 4, radius: 8 } };
        const L = (from, o, to, i) => ({ from: from.id, out: o, to: to.id, in: i });
        return {
            nodes: [base, harmony, bg, tint, out],
            links: [
                L(base, "color", harmony, "color"), L(harmony, "base", out, "accent"), L(harmony, "analog1", out, "accent2"),
                L(harmony, "base", out, "grad1"), L(harmony, "analog1", out, "grad2"), L(harmony, "complement", out, "grad3"), L(harmony, "analog2", out, "grad4"),
                L(bg, "color", out, "gradBase"), L(bg, "color", tint, "color"), L(tint, "color", out, "glassTint"),
            ],
            view: { x: 0, y: 0, z: 0.85 },
        };
    };

    const themeMaker = () => {
        if (!S.customThemes || typeof S.customThemes !== "object") S.customThemes = {};
        const root = $("div", { className: "bt-maker" });
        const bar = $("div", { className: "bt-maker-bar" });
        const pick = $("select", { className: "bt-maker-pick" });
        const nameBox = $("input", { type: "text", className: "bt-text bt-maker-name", placeholder: "Theme name", spellcheck: false });
        nameBox.addEventListener("keydown", e => e.stopPropagation());
        const startFrom = $("select", { className: "bt-maker-start" });
        startFrom.append($("option", { value: "", textContent: "New theme from…" }), $("option", { value: "__starter", textContent: "Starter (one colour → everything)" }));
        for (const name of Object.keys(PRESETS)) startFrom.append($("option", { value: name, textContent: `Preset: ${name}` }));
        const addSel = $("select", { className: "bt-maker-add" });
        addSel.append($("option", { value: "", textContent: "Add node (Shift+A)" }));
        for (const cat of ["Input", "Colour", "Number"]) {
            const g = $("optgroup");
            g.label = cat;
            for (const [type, T] of Object.entries(NODE_TYPES)) if (T.cat === cat) g.append($("option", { value: type, textContent: T.title }));
            addSel.append(g);
        }
        const serverSel = $("select", { className: "bt-maker-server" });
        const applyMe = button("Apply to me", () => applyToMe(), "bt-small bt-primary");
        const applyServer = button("Apply to server", () => applyToServer(), "bt-small");
        const del = button("Delete", () => deleteTheme(), "bt-small bt-danger");
        bar.append(pick, nameBox, startFrom, addSel, applyMe, serverSel, applyServer, del);

        const canvas = $("div", { className: "bt-nodes", tabIndex: 0 });
        const world = $("div", { className: "bt-nodes-world" });
        const wires = svgMarkup("0 0 10 10", "", "bt-nodes-wires");
        wires.removeAttribute("viewBox");
        world.append(wires);
        canvas.append(world);
        const preview = $("div", { className: "bt-maker-preview" });
        const hint = $("div", { className: "bt-note", textContent: "Drag from a socket to another to connect them (yellow: colours, grey: numbers). Drag an input's wire away to disconnect it. Drag the background to pan, scroll to zoom, Shift+A to add a node, Delete to remove the selected one." });
        root.append(bar, canvas, preview, hint);

        let current = null;
        let graph = null;
        let selected = null;
        const nodeEls = new Map();

        const themeNames = () => Object.keys(S.customThemes).sort((a, b) => a.localeCompare(b));
        const fillPick = () => {
            pick.replaceChildren($("option", { value: "", textContent: themeNames().length ? "My themes…" : "No themes yet" }));
            for (const n of themeNames()) pick.append($("option", { value: n, textContent: n }));
            pick.value = current || "";
        };
        const fillServers = () => {
            serverSel.replaceChildren($("option", { value: "", textContent: "Server…" }));
            if (currentGuild) serverSel.append($("option", { value: currentGuild, textContent: `This server${currentGuildName() ? ` (${currentGuildName()})` : ""}` }));
            for (const [id, p] of Object.entries(S.serverThemes || {})) if (id !== currentGuild && p) serverSel.append($("option", { value: id, textContent: p.name || id }));
        };

        const store = () => {
            if (!current || !graph) return;
            const values = evalGraph(graph);
            S.customThemes[current] = { graph, values, updated: Date.now() };
            renderPreview(values);
            if (S.makerApplied === current) Object.assign(S, values);
            save();
            update();
            refreshServerSections();
        };
        const applyToMe = () => {
            if (!current) return toast("Give the theme a name first.");
            store();
            Object.assign(S, S.customThemes[current].values);
            S.makerApplied = current;
            setThemeEnabled(MAIN_THEME, true);
            refreshControls();
            update();
            toast(`"${current}" is your theme now. Edits here apply right away.`);
        };
        const applyToServer = () => {
            if (!current) return toast("Give the theme a name first.");
            const id = serverSel.value;
            if (!id) return toast("Pick a server first (open one to see \"This server\").");
            store();
            S.serverThemes[id] ||= { name: id === currentGuild ? currentGuildName() || id : id, themes: [], background: "gradient" };
            const p = S.serverThemes[id];
            p.preset = current;
            p.enabled = true;
            if (p.background === "global") p.background = "gradient";
            S.serverThemesEnabled = true;
            save();
            applyThemes();
            update();
            refreshServerSections();
            toast(`${p.name || "That server"} now uses "${current}".`);
        };
        const deleteTheme = () => {
            if (!current) return;
            const name = current;
            delete S.customThemes[name];
            for (const p of Object.values(S.serverThemes || {})) if (p && p.preset === name) p.preset = "";
            if (S.makerApplied === name) delete S.makerApplied;
            current = null;
            graph = null;
            save();
            update();
            refreshServerSections();
            render();
            fillPick();
            toast(`Deleted "${name}".`);
        };
        const open = name => {
            current = name;
            graph = JSON.parse(JSON.stringify(S.customThemes[name].graph));
            nameBox.value = name;
            selected = null;
            render();
            renderPreview(evalGraph(graph));
            fillPick();
        };
        const create = template => {
            let name = nameBox.value.trim();
            if (!name || S.customThemes[name] || PRESETS[name]) {
                const baseName = template === "__starter" ? "My theme" : `My ${template}`;
                name = baseName;
                for (let k = 2; S.customThemes[name] || PRESETS[name]; k++) name = `${baseName} ${k}`;
            }
            current = name;
            graph = template === "__starter" ? starterGraph() : graphFromPreset(PRESETS[template]);
            nameBox.value = name;
            store();
            open(name);
        };
        pick.addEventListener("change", () => pick.value && open(pick.value));
        startFrom.addEventListener("change", () => {
            if (startFrom.value) create(startFrom.value);
            startFrom.value = "";
        });
        nameBox.addEventListener("change", () => {
            const next = nameBox.value.trim();
            if (!current || !next || next === current) return;
            if (S.customThemes[next] || PRESETS[next]) {
                nameBox.value = current;
                return toast(`There's already a theme called "${next}".`);
            }
            S.customThemes[next] = S.customThemes[current];
            delete S.customThemes[current];
            for (const p of Object.values(S.serverThemes || {})) if (p && p.preset === current) p.preset = next;
            if (S.makerApplied === current) S.makerApplied = next;
            current = next;
            store();
            fillPick();
        });

        const view = () => graph.view || (graph.view = { x: 0, y: 0, z: 0.85 });
        const applyView = () => {
            const v = view();
            world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
            canvas.style.setProperty("--bt-grid", `${24 * v.z}px`);
            canvas.style.backgroundPosition = `${v.x}px ${v.y}px`;
        };
        const socketEl = (node, id, side) => nodeEls.get(node.id)?.querySelector(`.bt-socket[data-side="${side}"][data-id="${id}"]`);
        const socketPos = el => {
            const w = world.getBoundingClientRect(), r = el.getBoundingClientRect(), z = view().z;
            return [(r.left + r.width / 2 - w.left) / z, (r.top + r.height / 2 - w.top) / z];
        };
        const noodle = ([x1, y1], [x2, y2]) => {
            const dx = Math.max(40, Math.abs(x2 - x1) / 2);
            return `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
        };
        const drawWires = (temp = null) => {
            let d = "";
            const parts = [];
            for (const l of graph.links) {
                const a = graph.nodes.find(n => n.id === l.from), b = graph.nodes.find(n => n.id === l.to);
                const sa = a && socketEl(a, l.out, "out"), sb = b && socketEl(b, l.in, "in");
                if (!sa || !sb) continue;
                const type = sa.dataset.type;
                parts.push(`<path class="bt-wire bt-wire-${type}" d="${noodle(socketPos(sa), socketPos(sb))}"/>`);
            }
            if (temp) parts.push(`<path class="bt-wire bt-wire-${temp.type} bt-wire-temp" d="${noodle(temp.a, temp.b)}"/>`);
            d = parts.join("");
            wires.innerHTML = d;
            for (const [id, el] of nodeEls) {
                for (const row of el.querySelectorAll(".bt-node-in")) {
                    row.classList.toggle("bt-linked", graph.links.some(l => l.to === id && l.in === row.dataset.id));
                }
            }
        };
        const paramInput = (node, key, type, def, label) => {
            const val = node.p && node.p[key] !== undefined ? node.p[key] : def;
            const set = v => {
                node.p ||= {};
                node.p[key] = v;
                store();
                renderValues();
            };
            if (key === "op") {
                const sel = $("select", { className: "bt-node-field" });
                for (const op of ["add", "subtract", "multiply", "divide", "min", "max"]) sel.append($("option", { value: op, textContent: op }));
                sel.value = val;
                sel.addEventListener("change", () => set(sel.value));
                return sel;
            }
            if (type === "c") {
                const inp = $("input", { type: "color", className: "bt-node-color", value: rgbToHex(hexToRgb(val)) });
                inp.title = label || "Colour";
                inp.addEventListener("input", () => set(inp.value));
                return inp;
            }
            const inp = $("input", { type: "number", className: "bt-node-field", value: String(val), step: "1" });
            inp.addEventListener("keydown", e => e.stopPropagation());
            inp.addEventListener("change", () => set(Number(inp.value) || 0));
            return inp;
        };
        const renderValues = () => {
            const byId = new Map(graph.nodes.map(n => [n.id, n]));
            const into = new Map(graph.links.map(l => [`${l.to}:${l.in}`, l]));
            const memo = new Map();
            const outs = node => {
                if (memo.has(node.id)) return memo.get(node.id);
                memo.set(node.id, {});
                const T = NODE_TYPES[node.type];
                const inputs = {};
                for (const [id, , type, def] of T.inputs || []) {
                    const l = into.get(`${node.id}:${id}`);
                    const from = l && byId.get(l.from);
                    const v = from ? outs(from)[l.out] : undefined;
                    inputs[id] = v !== undefined ? v : node.p && node.p[id] !== undefined ? (type === "n" ? Number(node.p[id]) || 0 : node.p[id]) : def;
                }
                let r = {};
                try {
                    r = T.run ? T.run(inputs, { ...Object.fromEntries((T.params || []).map(([k, , d]) => [k, d])), ...(node.p || {}) }) : {};
                } catch { }
                memo.set(node.id, r);
                return r;
            };
            for (const node of graph.nodes) {
                const el = nodeEls.get(node.id);
                if (!el) continue;
                const r = outs(node);
                for (const chip of el.querySelectorAll(".bt-out-val")) {
                    const v = r[chip.dataset.id];
                    if (chip.dataset.type === "c") chip.style.background = v || "transparent";
                    else chip.textContent = v === undefined ? "" : String(Math.round(v * 100) / 100);
                }
            }
        };
        const renderPreview = values => {
            preview.replaceChildren();
            for (const [key, label, type] of MAKER_OUT) {
                const chip = $("div", { className: "bt-maker-chip" });
                if (type === "c") {
                    const sw = $("span", { className: "bt-maker-sw" });
                    sw.style.background = values[key];
                    chip.append(sw, $("span", { textContent: `${label} ${values[key]}` }));
                } else chip.append($("span", { textContent: `${label}: ${values[key]}` }));
                preview.append(chip);
            }
        };

        const render = () => {
            for (const el of nodeEls.values()) el.remove();
            nodeEls.clear();
            canvas.classList.toggle("bt-nodes-empty", !graph);
            if (!graph) {
                wires.innerHTML = "";
                preview.replaceChildren($("div", { className: "bt-maker-empty", textContent: "Pick one of your themes above, or start a new one from the starter or a preset." }));
                return;
            }
            applyView();
            for (const node of graph.nodes) {
                const T = NODE_TYPES[node.type];
                if (!T) continue;
                const el = $("div", { className: `bt-node bt-node-${node.type}` });
                el.dataset.id = node.id;
                el.style.left = `${node.x}px`;
                el.style.top = `${node.y}px`;
                const head = $("div", { className: "bt-node-head", textContent: T.title });
                head.dataset.cat = T.cat;
                el.append(head);
                for (const [id, label, type] of T.outputs || []) {
                    const row = $("div", { className: "bt-node-out" });
                    const chip = $("span", { className: "bt-out-val" });
                    chip.dataset.id = id;
                    chip.dataset.type = type;
                    const sock = $("span", { className: `bt-socket bt-socket-${type}` });
                    Object.assign(sock.dataset, { side: "out", id, type });
                    row.append(chip, $("span", { className: "bt-node-label", textContent: label }), sock);
                    el.append(row);
                }
                for (const [key, type, def] of T.params || []) {
                    if (key === "op") el.append(paramInput(node, key, type, def));
                    else {
                        const row = $("div", { className: "bt-node-param" });
                        row.append(paramInput(node, key, type, def, T.title));
                        el.append(row);
                    }
                }
                for (const [id, label, type, def] of T.inputs || []) {
                    const row = $("div", { className: "bt-node-in" });
                    row.dataset.id = id;
                    const sock = $("span", { className: `bt-socket bt-socket-${type}` });
                    Object.assign(sock.dataset, { side: "in", id, type });
                    const field = paramInput(node, id, type, def, label);
                    field.classList.add("bt-node-own");
                    row.append(sock, $("span", { className: "bt-node-label", textContent: label }), field);
                    el.append(row);
                }
                if (node.id === selected) el.classList.add("bt-selected");
                world.append(el);
                nodeEls.set(node.id, el);
            }
            requestAnimationFrame(() => {
                drawWires();
                renderValues();
            });
        };

        const toWorld = e => {
            const w = world.getBoundingClientRect(), z = view().z;
            return [(e.clientX - w.left) / z, (e.clientY - w.top) / z];
        };
        const select = id => {
            selected = id;
            for (const [nid, el] of nodeEls) el.classList.toggle("bt-selected", nid === id);
        };
        const addNode = (type, at) => {
            if (!graph || !NODE_TYPES[type]) return;
            if (NODE_TYPES[type].unique && graph.nodes.some(n => n.type === type)) return toast("A theme has one Theme Output.");
            const r = canvas.getBoundingClientRect(), v = view();
            const [x, y] = at || [(r.width / 2 - v.x) / v.z - 90, (r.height / 2 - v.y) / v.z - 40];
            const node = { id: newNodeId(), type, x: Math.round(x), y: Math.round(y), p: {} };
            graph.nodes.push(node);
            store();
            render();
            select(node.id);
        };
        addSel.addEventListener("change", () => {
            if (addSel.value) addNode(addSel.value);
            addSel.value = "";
        });
        let lastPointer = null;
        canvas.addEventListener("pointermove", e => (lastPointer = e), { passive: true });
        canvas.addEventListener("keydown", e => {
            e.stopPropagation();
            if (!graph) return;
            if (e.shiftKey && e.key.toLowerCase() === "a") {
                e.preventDefault();
                addSel.focus();
                addSel.showPicker?.();
            } else if ((e.key === "Delete" || e.key === "x" || e.key === "X") && selected && !/input|select/i.test(document.activeElement?.tagName || "")) {
                const node = graph.nodes.find(n => n.id === selected);
                if (!node || node.type === "output") return;
                graph.nodes = graph.nodes.filter(n => n.id !== selected);
                graph.links = graph.links.filter(l => l.from !== selected && l.to !== selected);
                selected = null;
                store();
                render();
            }
        });
        canvas.addEventListener("wheel", e => {
            if (!graph) return;
            e.preventDefault();
            const v = view(), r = canvas.getBoundingClientRect();
            const z = Math.min(2, Math.max(0.35, v.z * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
            const mx = e.clientX - r.left, my = e.clientY - r.top;
            v.x = mx - ((mx - v.x) / v.z) * z;
            v.y = my - ((my - v.y) / v.z) * z;
            v.z = z;
            applyView();
            drawWires();
        }, { passive: false });
        canvas.addEventListener("pointerdown", e => {
            if (!graph || e.button !== 0 && e.button !== 1) return;
            canvas.focus({ preventScroll: true });
            const sock = e.target.closest(".bt-socket");
            const head = e.target.closest(".bt-node-head");
            const nodeEl = e.target.closest(".bt-node");
            if (e.target.closest("input, select")) return;
            e.preventDefault();
            let move, end;
            if (sock) {
                let fromNode, fromOut, type = sock.dataset.type;
                const nodeId = sock.closest(".bt-node").dataset.id;
                if (sock.dataset.side === "out") {
                    fromNode = nodeId;
                    fromOut = sock.dataset.id;
                } else {
                    const existing = graph.links.find(l => l.to === nodeId && l.in === sock.dataset.id);
                    if (!existing) return;
                    graph.links = graph.links.filter(l => l !== existing);
                    fromNode = existing.from;
                    fromOut = existing.out;
                }
                const fromEl = socketEl(graph.nodes.find(n => n.id === fromNode), fromOut, "out");
                const a = socketPos(fromEl);
                move = ev => drawWires({ a, b: toWorld(ev), type });
                end = ev => {
                    const hit = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('.bt-socket[data-side="in"]');
                    const toId = hit && hit.closest(".bt-node").dataset.id;
                    if (hit && hit.dataset.type === type && toId !== fromNode && !reaches(toId, fromNode)) {
                        graph.links = graph.links.filter(l => !(l.to === toId && l.in === hit.dataset.id));
                        graph.links.push({ from: fromNode, out: fromOut, to: toId, in: hit.dataset.id });
                    } else if (hit && hit.dataset.type !== type) toast("Colours connect to colours, numbers to numbers.");
                    store();
                    drawWires();
                    renderValues();
                };
            } else if (head || (nodeEl && !e.target.closest(".bt-node-in, .bt-node-out, .bt-node-param"))) {
                const node = graph.nodes.find(n => n.id === nodeEl.dataset.id);
                select(node.id);
                const [sx, sy] = toWorld(e), [nx, ny] = [node.x, node.y];
                move = ev => {
                    const [x, y] = toWorld(ev);
                    node.x = Math.round(nx + x - sx);
                    node.y = Math.round(ny + y - sy);
                    nodeEl.style.left = `${node.x}px`;
                    nodeEl.style.top = `${node.y}px`;
                    drawWires();
                };
                end = () => store();
            } else {
                select(null);
                const v = view(), sx = e.clientX, sy = e.clientY, ox = v.x, oy = v.y;
                canvas.classList.add("bt-panning");
                move = ev => {
                    v.x = ox + ev.clientX - sx;
                    v.y = oy + ev.clientY - sy;
                    applyView();
                };
                end = () => {
                    canvas.classList.remove("bt-panning");
                    store();
                };
            }
            const up = ev => {
                removeEventListener("pointermove", move);
                removeEventListener("pointerup", up);
                end(ev);
            };
            addEventListener("pointermove", move);
            addEventListener("pointerup", up);
        });
        const reaches = (from, to) => {
            const seen = new Set(), stack = [from];
            while (stack.length) {
                const id = stack.pop();
                if (id === to) return true;
                if (seen.has(id)) continue;
                seen.add(id);
                for (const l of graph.links) if (l.from === id) stack.push(l.to);
            }
            return false;
        };

        fillPick();
        fillServers();
        const first = S.makerApplied && S.customThemes[S.makerApplied] ? S.makerApplied : themeNames()[0];
        if (first) open(first);
        else render();
        return root;
    };

    const CUSTOM = {
        themeMaker() {
            return themeMaker();
        },
        presets() {
            const wrap = $("div", { className: "bt-presets" });
            const isPicked = preset => PRESET_KEYS.every(k => String(S[k]).toLowerCase() === String(preset[k]).toLowerCase());
            const all = [...Object.entries(PRESETS), ...Object.entries(S.customThemes || {}).filter(([, t]) => t && t.values).map(([n, t]) => [n, t.values, true])];
            for (const [name, preset, mine] of all) {
                const b = button("", () => {
                    Object.assign(S, preset);
                    for (const t of wrap.children) t.classList.toggle("bt-picked", t === b);
                    refreshControls();
                    update();
                }, "bt-preset");
                if (isPicked(preset)) b.classList.add("bt-picked");
                b.title = mine ? `${name}: your theme from the Theme Maker` : `${name}: sets your accent, gradient and glass colours`;
                const swatch = $("span", { className: "bt-swatch" });
                swatch.style.background = `linear-gradient(90deg, ${preset.grad1}, ${preset.grad2} 50%, ${preset.grad3}), ${preset.gradBase}`;
                b.append(swatch, name);
                wrap.append(b);
            }
            return wrap;
        },
        wallpaper() {
            const frag = document.createDocumentFragment();
            const glassNote = $("div", { className: "bt-wall-glass-note" });
            glassNote.dataset.k = "__wallGlass";
            glassNote.append(
                $("span", { textContent: "Liquid glass is off, so Discord's panels are solid and cover your wallpaper. Turn it on to see your picture (or gradient) through them." }),
                button("Turn liquid glass on", () => {
                    S.translucent = true;
                    update();
                    refreshControls();
                }, "bt-small bt-primary"),
            );
            glassNote._btSync = () => (glassNote.hidden = effective().translucent !== false);
            glassNote._btSync();
            frag.append(glassNote);
            const btns = $("div", { className: "bt-btns" });
            btns.append(button("Choose image…", () => fileInput.click()), button("Use gradient", clearWallpaper));
            const urlRow = $("div", { className: "bt-btns" });
            const url = $("input", { className: "bt-text", placeholder: "…or paste an image link and press Enter", spellcheck: false });
            url.addEventListener("keydown", e => {
                e.stopPropagation();
                if (e.key === "Enter") wallpaperFromUrl(url.value.trim());
            });
            urlRow.append(url, button("Set", () => wallpaperFromUrl(url.value.trim())));
            frag.append(btns, urlRow, $("div", { className: "bt-status" }));
            return frag;
        },
        plugins() {
            const frag = document.createDocumentFragment();
            frag.append($("div", { className: "bt-note", textContent: "Turn plugins on or off here. Your own plugins go in the plugins folder and reload when you save them." }));
            const on = [...plugins.values()].filter(isPluginEnabled).sort((a, b) => a.def.name.localeCompare(b.def.name));
            const enabledBox = $("div", { className: "bt-enabled-plugins" });
            enabledBox.append($("div", { className: "bt-enabled-head", textContent: `Enabled (${on.length})` }));
            const chips = $("div", { className: "bt-enabled-chips" });
            if (!on.length) chips.append($("span", { className: "bt-enabled-none", textContent: "No plugins are on." }));
            for (const rec of on) chips.append($("span", { className: "bt-enabled-chip", textContent: rec.def.name }));
            enabledBox.append(chips);
            frag.append(enabledBox);
            const search = $("input", { type: "search", className: "bt-text bt-search", placeholder: "Search plugins", spellcheck: false, value: pluginQuery });
            search.setAttribute("aria-label", "Search plugins");
            search.addEventListener("keydown", e => e.stopPropagation());
            search.addEventListener("input", () => {
                pluginQuery = search.value.trim().toLowerCase();
                document.querySelectorAll(".bt-plugins-list").forEach(filterPlugins);
            });
            const count = $("div", { className: "bt-note bt-plugin-count" });
            const recs = [...plugins.values()];
            count.textContent = `${recs.length} plugins · ${recs.filter(isPluginEnabled).length} on`;
            const list = $("div", { className: "bt-list bt-plugins-list" });
            renderPluginList(list);
            frag.append(search, count);
            const btns = $("div", { className: "bt-btns" });
            btns.append(
                button("Open plugins folder", () => Native.openPath("plugins")),
                button("Reload user plugins", () => Native.reloadPlugins()),
            );
            frag.append(list, btns, row(["userPlugins", "Load my own plugins", "toggle"], S, () => save()));
            return frag;
        },
        themes() {
            const frag = document.createDocumentFragment();
            frag.append($("div", { className: "bt-note", textContent: "Put .css files in the themes folder. Saved changes show straight away." }));
            const list = $("div", { className: "bt-list bt-themes-list" });
            renderThemeList(list);
            const btns = $("div", { className: "bt-btns" });
            btns.append(
                button("Open themes folder", () => Native.openPath("themes")),
                button("Open bundled themes", () => Native.openPath("bundled")),
                button("Reload", reloadThemes),
            );
            frag.append(list, btns);
            return frag;
        },
        quickcss() {
            const frag = document.createDocumentFragment();
            frag.append($("div", { className: "bt-note", textContent: "CSS you write here loads after every theme and plugin. It applies as you type and is saved to quickcss.css." }));
            const editor = $("textarea", { className: "bt-code bt-quickcss", spellcheck: false, value: state.quickCss || "" });
            let saveQuick = 0;
            editor.addEventListener("keydown", e => {
                e.stopPropagation();
                if (e.key === "Tab") {
                    e.preventDefault();
                    editor.setRangeText("    ", editor.selectionStart, editor.selectionEnd, "end");
                    editor.dispatchEvent(new Event("input"));
                }
            });
            editor.addEventListener("input", () => {
                state.quickCss = editor.value;
                setCss(sheets.quick, editor.value, "QuickCSS");
                clearTimeout(saveQuick);
                saveQuick = setTimeout(() => Native.setQuickCss(editor.value).catch(e => warn("Couldn't save QuickCSS:", e)), 400);
            });
            const btns = $("div", { className: "bt-btns" });
            btns.append(button("Open in your editor", () => Native.openPath("quickcss")), button("Open data folder", () => Native.openPath("data")));
            frag.append(editor, btns);
            return frag;
        },
        themeOnOff() {
            const frag = document.createDocumentFragment();
            frag.append(
                switchRow("theme", "My theme", () => S.enabledThemes.includes(MAIN_THEME), on => {
                    setThemeEnabled(MAIN_THEME, on);
                    refreshServerSections();
                    refreshControls();
                }, "Your glass panels, picture and gradient everywhere. Servers with their own look (Server Theme page) keep theirs."),
                switchRow("glass", "Liquid glass", () => S.translucent, on => {
                    S.translucent = on;
                    update();
                    refreshControls();
                }, "See-through, blurred panels. Off makes them solid."),
            );
            return frag;
        },
        themeSwitch() {
            const frag = document.createDocumentFragment();
            const sw = switchRow;
            const here = $("div", { className: "bt-here-look" });
            renderHereLook(here);
            frag.append(
                sw("theme", "My theme", () => S.enabledThemes.includes(MAIN_THEME), on => {
                    setThemeEnabled(MAIN_THEME, on);
                    refreshServerSections();
                    refreshControls();
                }, "Your glass panels, picture and gradient. When it's off, servers with their own look stay themed."),
                here,
                sw("serverLooks", "Server looks", () => S.serverThemesEnabled !== false, on => {
                    S.serverThemesEnabled = on;
                    applyServerChange();
                    refreshControls();
                }, "Lets servers have their own look. Set them up on the Server Theme page."),
                sw("glass", "Liquid glass", () => S.translucent, on => {
                    S.translucent = on;
                    update();
                    refreshControls();
                }, "See-through, blurred panels. Off makes them solid."),
                sw("everything", "Be Themer", () => enabled, on => {
                    if (on !== enabled) toggle();
                }, "Everything: themes, custom CSS and plugins. Shortcut: Ctrl+Alt+A."),
            );
            return frag;
        },
        servers() {
            const box = $("div", { className: "bt-servers" });
            renderServers(box);
            return box;
        },
        splash() {
            const frag = document.createDocumentFragment();
            frag.append($("div", { className: "bt-note", textContent: "Replaces Discord's loading screen with your own: Be Themer's animated one, or any picture, GIF or video, in your theme's colours. It shows exactly while Discord's would, when Discord starts and when it reconnects." }));
            const btns = $("div", { className: "bt-btns" });
            const status = $("div", { className: "bt-status bt-splash-status", textContent: S.splashMediaName ? `Your picture or video: ${S.splashMediaName}` : "No picture or video chosen." });
            btns.append(
                button("Preview", () => showSplash(true), "bt-small bt-primary"),
                button("Choose picture or video…", () => splashInput.click(), "bt-small"),
            );
            if (S.splashMediaName) {
                btns.append(button("Remove it", async () => {
                    await idb.del("splash");
                    S.splashMediaName = "";
                    if (S.splashStyle === "media") S.splashStyle = "clyde";
                    save();
                    refreshControls();
                    document.querySelectorAll(".bt-splash-status").forEach(el => (el.textContent = "No picture or video chosen."));
                    toast("Removed the splash picture or video.");
                }, "bt-small bt-danger"));
            }
            frag.append(btns, status);
            if (S.splashStyle === "media" && S.splashMediaName) {
                const note = $("div", { className: "bt-warn bt-splash-lowres", hidden: true });
                frag.append(note);
                idb.get("splash").then(async blob => {
                    if (!(blob instanceof Blob)) return;
                    const size = await mediaSize(blob).catch(() => null);
                    const need = Math.round((screen.width || 1920) * (devicePixelRatio || 1) * 0.75);
                    if (!size || size.w >= need) return;
                    note.replaceChildren(
                        $("span", { textContent: `Your splash picture is only ${size.w}×${size.h}, so it can only look blurry on your screen (it needs to be at least ${need} pixels wide). Your wallpaper is sharp.` }),
                        button("Use my wallpaper instead", () => {
                            S.splashStyle = "wallpaper";
                            save();
                            refreshControls();
                            note.hidden = true;
                            toast("The splash now uses your wallpaper.");
                        }, "bt-small bt-primary"),
                    );
                    note.classList.remove("bt-warn");
                    note.classList.add("bt-off-warn");
                    note.hidden = false;
                });
            }
            return frag;
        },
        meowPage() {
            const host = $("div", { className: "bt-page-host" });
            host.dataset.page = "meow";
            fillPageHost(host);
            return host;
        },
        owliePage() {
            const host = $("div", { className: "bt-page-host" });
            host.dataset.page = "owlie";
            fillPageHost(host);
            return host;
        },
        quickActions() {
            const box = $("div", { className: "bt-btns bt-quick-actions" });
            renderQuickActions(box);
            return box;
        },
        other() {
            const frag = document.createDocumentFragment();
            const btns = $("div", { className: "bt-btns" });
            btns.append(
                button("Open data folder", () => Native.openPath("data")),
                button("Reset appearance", () => {
                    const keep = {
                        enabledThemes: S.enabledThemes, userPlugins: S.userPlugins, plugins: S.plugins, enabled: S.enabled,
                        serverThemes: S.serverThemes, serverThemesEnabled: S.serverThemesEnabled,
                    };
                    Object.assign(S, DEFAULTS, keep);
                    refreshControls();
                    update();
                }, "bt-danger"),
            );
            frag.append(btns, $("div", { className: "bt-note", textContent: `Be Themer v${state.version} · settings are in ${state.dataDir}` }));
            return frag;
        },
    };

    const buildPanel = (page = "general", embedded = false, part = undefined) => {
        const pageTitle = PAGES.find(p => p.id === page)?.title;
        const whole = part === undefined, head = whole || part === "head";
        const root = $("div", { className: `bt-panel bt-page-${page}` });
        if (!embedded) {
            root.append(
                $("h2", { textContent: "Be Themer" }),
                $("div", { className: "bt-sub", textContent: "Changes save automatically. Ctrl+Alt+A turns Be Themer on or off. Ctrl+Alt+B opens this window." }),
            );
        }
        const offWarn = $("div", { className: "bt-off-warn", hidden: enabled });
        offWarn.append(
            $("span", { textContent: "Everything is switched off (Ctrl+Alt+A), so no theme, per-server look or plugin is showing. Your settings are kept." }),
            button("Turn everything back on", () => {
                if (!enabled) toggle();
            }),
        );
        if (head) root.append(offWarn);
        if (page === "general" && head) root.prepend(githubButton());
        if (page === "theme" && head) {
            const warn = $("div", { className: "bt-warn" });
            warn.append(
                $("span", { textContent: "Your theme is off, so these settings won't show (except in servers with their own look)." }),
                button("Turn my theme on", () => {
                    setThemeEnabled(MAIN_THEME, true);
                    refreshServerSections();
                    refreshControls();
                }, "bt-small bt-primary"),
            );
            root.append(warn);
            const notice = $("div", { className: "bt-server-notice" });
            renderServerNotice(notice);
            root.append(notice);
        }
        if (!S.uiCollapsed || typeof S.uiCollapsed !== "object") S.uiCollapsed = {};
        const sections = SCHEMA.filter(s => (s.page || "general") === page)
            .filter(s => whole || (part === "head" ? s.title === pageTitle : s.title === part));
        const built = [];
        for (const sec of sections) {
            const id = `${page}:${sec.title}`;
            const solo = sections.length === 1;
            const box = $("div", { className: `bt-sec${solo ? " bt-sec-solo" : ""}${!solo && S.uiCollapsed[id] ? " bt-collapsed" : ""}` });
            const body = $("div", { className: "bt-sec-body" });
            if (!solo) {
                const head = $("button", { className: "bt-sec-head", type: "button" });
                head.setAttribute("aria-expanded", String(!S.uiCollapsed[id]));
                head.append($("span", { className: "bt-twirl" }), $("span", { textContent: sec.title }));
                head.onclick = () => {
                    const closed = box.classList.toggle("bt-collapsed");
                    if (closed) S.uiCollapsed[id] = true;
                    else delete S.uiCollapsed[id];
                    head.setAttribute("aria-expanded", String(!closed));
                    save();
                };
                box.append(head);
                built.push({ sec, id, box, head });
            }
            if (sec.note) body.append($("div", { className: "bt-note", textContent: sec.note }));
            if (sec.custom) body.append(CUSTOM[sec.custom]());
            for (const item of sec.items || []) body.append(row(item, S, () => (update(), item[0] === "splashStyle" && syncSplashRows())));
            box.append(body);
            root.append(box);
        }
        queueMicrotask(updateThemeWarning);
        queueMicrotask(syncSplashRows);
        return root;
    };

    const GITHUB_MARK = "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z";
    const githubButton = () => {
        const ICE = ["#f2f9ff", "#dceefc", "#c8e4f8", "#e8f4fe", "#b9dcf5", "#d3eafb", "#a9d3f2", "#e0f1fd", "#c2e0f7", "#eef7ff", "#b2d8f4", "#d9edfc"];
        const R = 30, apex = [-7, -9];
        const pts = Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            return [(Math.cos(a) * R * 1.2).toFixed(2), (Math.sin(a) * R * 1.2).toFixed(2)];
        });
        const facets = pts.map((p, i) => {
            const q = pts[(i + 1) % 12];
            return `<polygon points="${apex.join(",")} ${p.join(",")} ${q.join(",")}" fill="${ICE[i]}"/>`;
        }).join("");
        const wrap = $("div", { className: "bt-gh-wrap" });
        const btn = $("button", { className: "bt-gh", type: "button" });
        btn.setAttribute("aria-label", REPO_URL ? `GitHub: ${REPO_URL.replace("https://", "")}` : "GitHub (not published yet)");
        btn.title = REPO_URL ? REPO_URL.replace("https://", "") : "Not published yet";
        if (!REPO_URL) btn.classList.add("bt-gh-off");
        const t = $("div");
        t.innerHTML = `<svg class="bt-gh-crystal" viewBox="-32 -32 64 64" aria-hidden="true">
            <defs><clipPath id="bt-gh-clip"><circle r="${R}"/></clipPath></defs>
            <g clip-path="url(#bt-gh-clip)">${facets}<polygon class="bt-gh-shine" points="-46,-40 -36,-40 4,40 -6,40" fill="#fff"/></g>
            <circle r="${R - 0.75}" fill="none" stroke="#ffffff" stroke-opacity=".85" stroke-width="1.5"/>
            <circle r="${R + 1.6}" fill="none" stroke="#9fd0f5" stroke-opacity=".45" stroke-width="1.2"/>
            <path d="${GITHUB_MARK}" transform="translate(-12.5 -12.5) scale(1.5625)" fill="#15283b"/>
        </svg>`;
        btn.append(t.firstElementChild);
        btn.addEventListener("click", () => {
            if (!REPO_URL) return toast("The GitHub link appears here once Be Themer is published.");
            Promise.resolve(Native.openExternal ? Native.openExternal(REPO_URL) : window.open(REPO_URL, "_blank")).catch(() => toast("Couldn't open the browser."));
        });
        wrap.append(btn, $("div", { className: "bt-gh-label", textContent: "GitHub" }));
        return wrap;
    };

    const tabbedPanel = (startPage = "general") => {
        const wrap = $("div", { className: "bt-tabbed" });
        const bar = $("div", { className: "bt-tabs", role: "tablist" });
        const body = $("div");
        const show = page => {
            for (const b of bar.children) b.classList.toggle("bt-tab-active", b.dataset.page === page);
            body.replaceChildren(buildPanel(page, true));
        };
        for (const p of PAGES) {
            const b = $("button", { className: "bt-tab", textContent: p.title, role: "tab" });
            b.dataset.page = p.id;
            b.onclick = () => show(p.id);
            bar.append(b);
        }
        wrap.append(bar, body);
        show(PAGES.some(p => p.id === startPage) ? startPage : "general");
        return wrap;
    };

    let win = null;
    const closeWindow = () => {
        win?.remove();
        win = null;
    };
    function openContentWindow(title, content) {
        if (!document.body) return null;
        closeWindow();
        win = $("div", { id: "bt-window", role: "dialog", ariaLabel: title });
        const x = $("button", { className: "bt-x", textContent: "✕", title: "Close" });
        x.onclick = closeWindow;
        const body = $("div", { className: "bt-panel" });
        if (content) body.append(content);
        win.append(x, $("h2", { className: "bt-window-title", textContent: title }), body);
        document.body.append(win);
        return win;
    }

    const openWindow = (page = "general") => {
        if (page === "themes") page = "theme";
        if (!document.body) return;
        closeWindow();
        win = $("div", { id: "bt-window", role: "dialog", ariaLabel: "Be Themer settings" });
        const x = $("button", { className: "bt-x", textContent: "✕", title: "Close" });
        x.onclick = closeWindow;
        win.append(
            x,
            (() => {
                const h = $("h2", { className: "bt-window-title" });
                if (LOGO) h.append($("img", { className: "bt-logo", src: LOGO, alt: "" }));
                h.append("Be Themer");
                return h;
            })(),
            $("div", { className: "bt-sub", textContent: "Changes save automatically. Ctrl+Alt+A turns Be Themer on or off." }),
            tabbedPanel(page),
        );
        document.body.append(win);
    };

    let inline = null;
    const settingsView = () => document.querySelector(cls("standardSidebarView"));

    const closeInline = () => {
        inline?.remove();
        inline = null;
        document.querySelectorAll(".bt-settings-tab").forEach(t => t.classList.remove("bt-active"));
        setRootAttr("data-bt-inline", null);
    };
    const openInline = page => {
        const region = settingsView()?.querySelector(cls("contentRegion"));
        if (!region) return openWindow(page);
        closeInline();
        if (getComputedStyle(region).position === "static") region.style.position = "relative";
        inline = $("div", { id: "bt-settings-inline" });
        inline.append($("h2", { className: "bt-window-title", textContent: PAGES.find(p => p.id === page)?.title || "Be Themer" }), buildPanel(page, true));
        region.append(inline);
        document.querySelector(`.bt-settings-tab[data-page="${page}"]`)?.classList.add("bt-active");
        setRootAttr("data-bt-inline", true);
    };

    const injectTab = () => {
        if (wp.settingsPatched) return;
        const view = settingsView();
        if (!view || view.querySelector(".bt-settings-tab")) return;
        const tabs = [...view.querySelectorAll('[role="tab"]')];
        if (!tabs.length) return;
        const list = tabs[0].parentElement;
        const sample = tabs.find(t => t.getAttribute("aria-selected") !== "true") || tabs[0];
        const header = [...list.children].find(c => hasCls(c, "header"));
        const separator = [...list.children].find(c => hasCls(c, "separator"));
        const tabClass = sample.className.split(/\s+/).filter(c => !/selected/i.test(c)).join(" ");

        const nodes = [];
        if (header) nodes.push($("div", { className: `${header.className} bt-injected`, textContent: "Be Themer" }));
        for (const p of PAGES) {
            const tab = $("div", { className: `${tabClass} bt-settings-tab`, textContent: p.title, tabIndex: 0 });
            tab.dataset.page = p.id;
            tab.setAttribute("role", "tab");
            tab.addEventListener("click", () => openInline(p.id));
            tab.addEventListener("keydown", e => e.key === "Enter" && openInline(p.id));
            nodes.push(tab);
        }
        if (separator) nodes.push($("div", { className: `${separator.className} bt-injected` }));
        list.prepend(...nodes);

        if (!list._btBound) {
            list._btBound = true;
            list.addEventListener("click", e => {
                const t = e.target.closest('[role="tab"]');
                if (t && !t.classList.contains("bt-settings-tab")) closeInline();
            }, true);
        }
    };

    const pagePanels = new Map();
    const PAGE_EMPTY = { meow: "Turn on the Meow plugin (Plugins page) to record voice calls.", owlie: "Turn on the Owlie plugin (Plugins page) to record your screen." };
    function fillPageHost(host) {
        const id = host.dataset.page;
        host.replaceChildren();
        const render = pagePanels.get(id);
        if (!render) {
            host.append($("div", { className: "bt-empty", textContent: PAGE_EMPTY[id] || "Nothing here yet." }));
            return;
        }
        try {
            render(host);
        } catch (e) {
            warn(`the "${id}" page failed:`, e);
            host.append($("div", { className: "bt-empty", textContent: `This page couldn't be shown (${e.message || e}).` }));
        }
    }
    function refreshPageHosts(id) {
        document.querySelectorAll(`.bt-page-host[data-page="${id}"]`).forEach(fillPageHost);
    }

    const menuItems = new Set();

    const renderQuickActions = box => {
        box.replaceChildren();
        const add = (label, fn) => box.append(button(label, () => {
            try {
                fn();
            } catch (e) {
                warn("quick action failed:", e);
            }
        }));
        add(enabled ? "⏻ Turn everything off" : "⏻ Turn everything on", () => {
            toggle();
            refreshQuickActions();
        });
        add("Open in a window (Ctrl+Alt+B)", () => openWindow("general"));
        add("Reload Discord", () => location.reload());
        for (const item of menuItems) add(item.label, item.fn);
    };
    const refreshQuickActions = () => document.querySelectorAll(".bt-quick-actions").forEach(renderQuickActions);

    const soundboardGlowCss = ring => `
.bt-sb-playing, .bt-sb-playing * { --status-speaking: ${ring} !important; --green-360: ${ring} !important; --brand-500: ${ring} !important; }
:is([class*="tile_"], [class*="videoWrapper_"]).bt-sb-playing {
  outline: 2px solid ${ring} !important; outline-offset: -2px;
  animation: bt-sb-glow .9s ease-in-out infinite alternate;
}
.bt-sb-playing > img[src*="/avatars/"], img.bt-sb-playing { animation: bt-sb-avatar .9s ease-in-out infinite alternate; }
@keyframes bt-sb-glow {
  from { box-shadow: 0 0 0 2px ${ring}, 0 0 10px 1px color-mix(in srgb, ${ring} 40%, transparent); }
  to { box-shadow: 0 0 0 2px ${ring}, 0 0 30px 7px color-mix(in srgb, ${ring} 70%, transparent); }
}
@keyframes bt-sb-avatar {
  from { filter: drop-shadow(0 0 2px ${ring}); }
  to { filter: drop-shadow(0 0 9px ${ring}); }
}
@media (prefers-reduced-motion: reduce) {
  :is([class*="tile_"], [class*="videoWrapper_"]).bt-sb-playing { animation: none; box-shadow: 0 0 0 2px ${ring}, 0 0 18px 4px color-mix(in srgb, ${ring} 55%, transparent); }
  .bt-sb-playing > img[src*="/avatars/"], img.bt-sb-playing { animation: none; filter: drop-shadow(0 0 6px ${ring}); }
}`;
    const sbPlaying = new Map();
    const sbTimers = new Map();
    let sbInterval = 0;
    const sbMark = () => {
        const want = new Set();
        if (enabled) {
            for (const id of sbPlaying.keys()) {
                if (!/^\d{1,25}$/.test(id)) continue;
                for (const img of document.querySelectorAll(`img[src*="/avatars/${id}/"], [style*="/avatars/${id}/"]`)) {
                    const tile = img.closest('[class*="tile_"], [class*="videoWrapper_"]');
                    if (tile) want.add(tile);
                    want.add(img.parentElement || img);
                    if (img.tagName === "IMG") want.add(img);
                }
            }
        }
        for (const el of document.querySelectorAll(".bt-sb-playing")) if (!want.has(el)) el.classList.remove("bt-sb-playing");
        for (const el of want) el.classList.add("bt-sb-playing");
    };
    const sbTick = () => {
        sbMark();
        if (sbPlaying.size && !sbInterval) sbInterval = setInterval(sbMark, 250);
        if (!sbPlaying.size && sbInterval) {
            clearInterval(sbInterval);
            sbInterval = 0;
        }
    };
    const sbStart = action => {
        const id = action && String(action.userId || "");
        if (!id) return;
        sbPlaying.set(id, (sbPlaying.get(id) || 0) + 1);
        clearTimeout(sbTimers.get(id));
        sbTimers.set(id, setTimeout(() => sbPlaying.delete(id) && sbTick(), 12_000));
        sbTick();
    };
    const sbEnd = action => {
        const id = action && String(action.userId || "");
        if (!id || !sbPlaying.has(id)) return;
        const n = sbPlaying.get(id) - 1;
        if (n > 0) sbPlaying.set(id, n);
        else {
            sbPlaying.delete(id);
            clearTimeout(sbTimers.get(id));
        }
        sbTick();
    };
    const startSoundboardGlow = () =>
        withDispatcher(d => {
            d.subscribe("GUILD_SOUNDBOARD_SOUND_PLAY_START", sbStart);
            d.subscribe("GUILD_SOUNDBOARD_SOUND_PLAY_END", sbEnd);
        });

    let splash = null;
    const splashInput = $("input", { type: "file", accept: "image/*,video/mp4,video/webm,video/quicktime", hidden: true });
    splashInput.addEventListener("change", async () => {
        const file = splashInput.files && splashInput.files[0];
        splashInput.value = "";
        if (!file) return;
        if (!/^(image|video)\//.test(file.type)) return toast("Choose a picture, GIF or video.");
        try {
            await idb.set("splash", new Blob([file], { type: file.type }));
        } catch {
            return toast("Couldn't save that file.");
        }
        S.splashMediaName = file.name;
        S.splashStyle = "media";
        S.splashLowResSwitched = true;
        save();
        refreshControls();
        document.querySelectorAll(".bt-splash-status").forEach(el => (el.textContent = `Your picture or video: ${file.name}`));
        const size = await mediaSize(file).catch(() => null);
        const need = Math.round((screen.width || 1920) * (devicePixelRatio || 1) * 0.75);
        if (size && size.w < need) {
            toast(`Splash set, but this ${file.type.startsWith("video/") ? "video" : "picture"} is only ${size.w}×${size.h}, so it will look blurry on your screen. Use one at least ${need} pixels wide (or choose My wallpaper).`, 8000);
        } else toast("Splash set. Press Preview to see it.");
    });
    const splashLogo = () => {
        const wrap = $("div", { className: "bt-sp-logo-wrap" });
        wrap.append($("img", { className: "bt-sp-logo", src: LOGO_HD || LOGO, alt: "" }));
        return wrap;
    };
    const CLYDE = "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z";
    const svgMarkup = (viewBox, inner, cls = "") => {
        const t = $("div");
        t.innerHTML = `<svg class="${cls}" viewBox="${viewBox}" aria-hidden="true">${inner}</svg>`;
        return t.firstElementChild;
    };
    const spinnerSvg = () => svgMarkup("0 0 50 50", '<circle class="bt-k-track" cx="25" cy="25" r="20"/><circle class="bt-k-arc" cx="25" cy="25" r="20"/>', "bt-k-spin");
    const morphScene = (box, speed) => {
        const ns = "http://www.w3.org/2000/svg";
        const svg = svgMarkup("-60 -60 120 120", "<path/><path/><path/>", "bt-k-morph-svg");
        const [body, eyeA, eyeB] = svg.querySelectorAll("path");
        const N = 90;
        const parts = CLYDE.split(/(?=[Mm])/);
        const eye2 = parts[2].replace(/^m7\.9748 0/, "M15.9948 15.3312");
        const LOGO_SCALE = 3.1;
        const shapes = {
            square: "M-13-13H13V13H-13Z",
            triangle: "M0-15L14 11H-14Z",
            circle: "M0-13A13 13 0 1 1 0 13A13 13 0 1 1 0-13Z",
        };
        const sample = (d, map = p => p) => {
            const p = document.createElementNS(ns, "path");
            p.setAttribute("d", d);
            svg.append(p);
            const len = p.getTotalLength();
            const pts = [];
            for (let i = 0; i < N; i++) {
                const q = p.getPointAtLength((len * i) / N);
                pts.push(map([q.x, q.y]));
            }
            p.remove();
            let area = 0;
            for (let i = 0; i < N; i++) {
                const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % N];
                area += x1 * y2 - x2 * y1;
            }
            if (area < 0) pts.reverse();
            const cx = pts.reduce((a, q) => a + q[0], 0) / N, cy = pts.reduce((a, q) => a + q[1], 0) / N;
            let best = 0, bestScore = Infinity;
            pts.forEach(([x, y], i) => {
                const score = Math.abs(Math.atan2(x - cx, cy - y));
                if (score < bestScore) (bestScore = score), (best = i);
            });
            return pts.slice(best).concat(pts.slice(0, best)).map(([x, y]) => [x - cx, y - cy]).concat([[cx, cy]]);
        };
        const toLogo = ([x, y]) => [(x - 12) * LOGO_SCALE, (y - 12) * LOGO_SCALE];
        const hex = c => {
            const m = /^#?([0-9a-f]{6})$/i.exec(String(c).trim());
            const n = m ? parseInt(m[1], 16) : 0xffffff;
            return [n >> 16, (n >> 8) & 255, n & 255];
        };
        const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
        const fg = hex(S.splashFg || "#ffffff"), accent = hex(S.splashAccent || "#5865f2"), bg = hex(S.splashBg || "#111214");
        const stay = S.splashMorphStay === true;
        const ease = x => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
        const clamp = x => Math.min(1, Math.max(0, x));
        const CYCLE = 4.8, PLAY = 1.6, MORPH = 0.9, HOLD = 1.6;
        let geo = null;
        const frame = (from, to, k, ox, oy, rot, scale) => {
            const [fcx, fcy] = from[N], [tcx, tcy] = to[N];
            const cx = fcx + ox + (tcx - fcx - ox) * k, cy = fcy + oy + (tcy - fcy - oy) * k;
            const c = Math.cos(rot), s = Math.sin(rot);
            let d = "";
            for (let i = 0; i < N; i++) {
                const ax = from[i][0] * c - from[i][1] * s, ay = from[i][0] * s + from[i][1] * c;
                const x = (ax + (to[i][0] - ax) * k) * scale + cx, y = (ay + (to[i][1] - ay) * k) * scale + cy;
                d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
            }
            return d + "Z";
        };
        const t0 = performance.now();
        const tick = now => {
            if (!svg.isConnected) {
                if (geo) return;
                return requestAnimationFrame(tick);
            }
            if (!geo) {
                try {
                    geo = {
                        body: [sample(shapes.square), sample(parts[0], toLogo)],
                        eyeA: [sample(shapes.triangle), sample(parts[1], toLogo)],
                        eyeB: [sample(shapes.circle), sample(eye2, toLogo)],
                    };
                } catch {
                    svg.replaceChildren();
                    const p = document.createElementNS(ns, "path");
                    p.setAttribute("d", CLYDE);
                    p.setAttribute("transform", `scale(${LOGO_SCALE}) translate(-12 -12)`);
                    p.setAttribute("fill", mix(fg, fg, 0));
                    svg.append(p);
                    return;
                }
            }
            let t = ((now - t0) / 1000) * speed;
            if (stay && t > PLAY + MORPH) t = PLAY + MORPH + ((t - PLAY - MORPH) % HOLD);
            else t %= CYCLE;
            const k = t < PLAY ? 0 : t < PLAY + MORPH ? ease((t - PLAY) / MORPH) : t < PLAY + MORPH + HOLD ? 1 : ease(1 - (t - PLAY - MORPH - HOLD) / (CYCLE - PLAY - MORPH - HOLD));
            const play = 1 - k;
            const w = t * 2.4;
            const spots = [[-38, 12], [0, -26], [38, 12]];
            const bob = i => Math.sin(w + i * 2.1) * 7 * play;
            const logoPulse = k === 1 ? 1 + 0.05 * Math.sin(((t - PLAY - MORPH) / HOLD) * Math.PI * 2) : 1;
            const blinkAt = (t - PLAY - MORPH) / HOLD;
            const blink = k === 1 && blinkAt > 0.45 && blinkAt < 0.6 ? 1 - Math.sin(((blinkAt - 0.45) / 0.15) * Math.PI) * 0.9 : 1;
            const draw = (el, [from, to], i, colourFrom, colourTo) => {
                const [sx, sy] = spots[i];
                const rot = play * (i === 1 ? w * 0.9 : i === 0 ? Math.sin(w) * 0.8 : 0);
                el.setAttribute("d", frame(from, to, k, sx * play + (1 - play) * 0 - from[N][0] * 0, sy * play + bob(i), rot, logoPulse));
                el.setAttribute("fill", mix(colourFrom, colourTo, k));
                if (i > 0 && blink < 1) {
                    const [cx, cy] = to[N];
                    el.setAttribute("transform", `translate(0 ${cy * logoPulse}) scale(1 ${blink.toFixed(3)}) translate(0 ${-cy * logoPulse})`);
                } else el.removeAttribute("transform");
            };
            draw(body, geo.body, 0, fg, fg);
            draw(eyeA, geo.eyeA, 1, accent, bg);
            draw(eyeB, geo.eyeB, 2, accent, bg);
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        return svg;
    };
    const splashScene = (kind, timers) => {
        const box = $("div", { className: `bt-k bt-k-${kind}` });
        const speed = Math.min(3, Math.max(0.25, (Number(S.splashSpeed) || 100) / 100));
        const num = (v, d, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(Number(v)) && v !== "" ? Number(v) : d));
        const stage = $("div", { className: "bt-k-stage" });
        box.append(stage);

        if (kind === "clyde") {
            const logo = $("div", { className: "bt-k-logo" });
            logo.dataset.anim = S.splashClydeAnim || "pulse";
            logo.dataset.look = ["outline", "duotone"].includes(S.splashClydeLook) ? S.splashClydeLook : "solid";
            logo.append(svgMarkup("0 0 24 24", `<path d="${CLYDE}"/>`));
            const loader = S.splashLoader || "none";
            if (loader === "ripple") {
                const rip = $("div", { className: "bt-k-ripple" });
                rip.append($("i"), $("i"));
                stage.append(rip);
            }
            stage.append(logo);
            if (loader === "dots") {
                const d = $("div", { className: "bt-k-dots" });
                d.append($("i"), $("i"), $("i"));
                box.append(d);
            } else if (loader === "bar") {
                const b = $("div", { className: "bt-k-bar" });
                b.append($("i"));
                box.append(b);
            } else if (loader === "ring") box.append(spinnerSvg());
        } else if (kind === "morph") {
            stage.append(morphScene(box, speed));
        } else if (kind === "minimal") {
            const style = S.splashSpinner || "arc";
            box.dataset.spinner = style;
            if (style === "arc") stage.append(spinnerSvg());
            else if (style === "dots" || style === "ticks") {
                const wheel = $("div", { className: `bt-k-wheel bt-k-wheel-${style}` });
                const n = style === "dots" ? 8 : 12;
                for (let i = 0; i < n; i++) {
                    const it = $("i");
                    it.style.setProperty("--a", `${(360 / n) * i}deg`);
                    it.style.setProperty("--i", String(i));
                    it.style.setProperty("--n", String(n));
                    wheel.append(it);
                }
                stage.append(wheel);
            } else if (style === "squares") {
                const sq = $("div", { className: "bt-k-squares" });
                sq.append($("i"), $("i"));
                stage.append(sq);
            } else {
                const rip = $("div", { className: "bt-k-ripple bt-k-ripple-solo" });
                rip.append($("i"), $("i"), $("i"));
                stage.append(rip);
            }
        } else if (kind === "terminal") {
            const win = $("div", { className: "bt-k-win" });
            if (S.splashTermWindow !== false) {
                const bar = $("div", { className: "bt-k-winbar" });
                bar.append($("i"), $("i"), $("i"), $("span", { textContent: "be-themer — boot" }));
                win.append(bar);
            } else win.classList.add("bt-k-win-bare");
            const term = $("div", { className: "bt-k-term" });
            term.dataset.cursor = ["underline", "bar"].includes(S.splashTermCursor) ? S.splashTermCursor : "block";
            win.append(term);
            stage.append(win);
            const own = String(S.splashTermLines || "").split("|").map(t => t.trim()).filter(Boolean);
            const lines = own.length
                ? own.map((t, i) => [i === own.length - 1 ? ".." : "ok", () => t])
                : [
                    [null, () => `be-themer ${state.version}`],
                    ["ok", () => `themes      ${state.themes.filter(t => S.enabledThemes.includes(t.file)).length} on`],
                    ["ok", () => `plugins     ${[...plugins.values()].filter(isPluginEnabled).length} enabled`],
                    ["ok", () => "colours, fonts and glass"],
                    ["..", () => "connecting to discord"],
                ];
            const t0 = performance.now();
            const stamp = () => `[${((performance.now() - t0) / 1000).toFixed(3).padStart(8)}] `;
            const cursor = $("span", { className: "bt-k-cursor" });
            let li = 0;
            const next = () => {
                if (li >= lines.length) return;
                const [tag, textOf] = lines[li++];
                const line = $("div");
                if (S.splashTermTimes !== false) line.append($("span", { className: "bt-k-dim", textContent: stamp() }));
                if (tag) line.append($("span", { className: "bt-k-dim", textContent: "[ " }), $("b", { textContent: tag }), $("span", { className: "bt-k-dim", textContent: " ] " }));
                const out = $("span");
                line.append(out, cursor);
                term.append(line);
                const full = textOf();
                let c = 0;
                const type = setInterval(() => {
                    out.textContent = full.slice(0, ++c);
                    if (c < full.length) return;
                    clearInterval(type);
                    if (li < lines.length) timers.push(setTimeout(next, 160 / speed));
                    else if (tag === "..") {
                        const frames = ["|", "/", "-", "\\"];
                        let k = 0;
                        const spin = $("span", { className: "bt-k-dim" });
                        line.insertBefore(spin, cursor);
                        timers.push(setInterval(() => (spin.textContent = " " + frames[k++ % 4]), 110 / speed));
                    }
                }, 22 / speed);
                timers.push(type);
            };
            timers.push(setTimeout(next, 150 / speed));
        } else if (kind === "equalizer") {
            const eq = $("div", { className: "bt-k-eq" });
            const n = Math.round(num(S.splashBars, 7, 3, 24));
            eq.dataset.colors = ["main", "second"].includes(S.splashEqColors) ? S.splashEqColors : "alternate";
            eq.dataset.grow = S.splashEqMirror === false ? "up" : "centre";
            eq.style.setProperty("--bw", `${num(S.splashBarWidth, 8, 2, 24)}px`);
            eq.style.setProperty("--br", `${num(S.splashBarRound, 3, 0, 12)}px`);
            for (let i = 0; i < n; i++) {
                const bar = $("i");
                bar.style.setProperty("--d", `${(0.42 + ((i * 37) % 29) / 100).toFixed(2)}s`);
                bar.style.setProperty("--delay", `${(-((i * 53) % 41) / 100).toFixed(2)}s`);
                eq.append(bar);
            }
            stage.append(eq);
        } else if (kind === "shapes") {
            const motion = ["morph", "orbit", "spin"].includes(S.splashShapesMotion) ? S.splashShapesMotion : "hop";
            const row = $("div", { className: "bt-k-shapes" });
            row.dataset.motion = motion;
            if (motion === "morph") row.append($("i"));
            else row.append($("i"), $("i"), $("i"));
            stage.append(row);
        } else if (kind === "counter") {
            const mode = ["elapsed", "count"].includes(S.splashCounterMode) ? S.splashCounterMode : "percent";
            const numEl = $("div", { className: "bt-k-num" });
            numEl.dataset.font = ["mono", "thin"].includes(S.splashCounterFont) ? S.splashCounterFont : "discord";
            const n = document.createTextNode(mode === "elapsed" ? "0.00" : "0");
            numEl.append(n);
            if (mode !== "count") numEl.append($("small", { textContent: mode === "elapsed" ? "s" : "%" }));
            stage.append(numEl);
            let fill = null;
            if (S.splashCounterLine !== false) {
                const line = $("div", { className: "bt-k-line" });
                fill = $("i");
                line.append(fill);
                box.append(line);
            }
            const t0 = performance.now();
            timers.push(setInterval(() => {
                const sec = (performance.now() - t0) / 1000;
                const p = Math.min(99, Math.floor(99 * (1 - Math.exp(-sec * 0.9 * speed))));
                n.textContent = mode === "elapsed" ? sec.toFixed(2) : String(p);
                fill?.style.setProperty("--p", `${mode === "elapsed" ? Math.min(100, (sec / 10) * 100) : p}%`);
            }, 40));
        }
        return box;
    };
    const splashPattern = (kind, color, opacity) => {
        const o = (opacity / 100).toFixed(2);
        const c = String(color || "#ffffff");
        const svg = {
            dots: `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'><circle cx='11' cy='11' r='1.1' fill='${c}' fill-opacity='${o}'/></svg>`,
            grid: `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36'><path d='M36 .5H.5V36' fill='none' stroke='${c}' stroke-opacity='${o}'/></svg>`,
            lines: `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M-4 4l8-8M0 16L16 0M12 20l8-8' stroke='${c}' stroke-opacity='${o}'/></svg>`,
            plus: `<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44'><path d='M22 18v8M18 22h8' stroke='${c}' stroke-opacity='${o}' stroke-linecap='round'/></svg>`,
        }[kind];
        return svg ? `url("data:image/svg+xml,${encodeURIComponent(svg)}")` : "";
    };
    const mediaSize = async blob => {
        if (blob.type.startsWith("image/") && typeof createImageBitmap === "function") {
            const bmp = await createImageBitmap(blob);
            const out = { w: bmp.width, h: bmp.height };
            bmp.close?.();
            return out;
        }
        if (blob.type.startsWith("video/")) {
            const url = URL.createObjectURL(blob);
            try {
                return await new Promise(resolve => {
                    const v = $("video", { muted: true, preload: "metadata" });
                    v.onloadedmetadata = () => resolve(v.videoWidth ? { w: v.videoWidth, h: v.videoHeight } : null);
                    v.onerror = () => resolve(null);
                    v.src = url;
                    setTimeout(() => resolve(null), 3000);
                });
            } finally {
                URL.revokeObjectURL(url);
            }
        }
        return null;
    };
    const splashMediaEl = async blob => {
        const video = blob.type.startsWith("video/");
        const el = $(video ? "video" : "img", { className: "bt-sp-media" });
        if (video) Object.assign(el, { muted: true, loop: true, autoplay: true, playsInline: true });
        let url = URL.createObjectURL(blob);
        const ok = await new Promise(resolve => {
            const done = v => resolve(v);
            el.addEventListener(video ? "loadeddata" : "load", () => done(true), { once: true });
            el.addEventListener("error", () => done(false), { once: true });
            el.src = url;
            setTimeout(() => done(true), 4000);
        });
        if (!ok) {
            URL.revokeObjectURL(url);
            url = null;
            el.src = await blobToDataUrl(blob);
        }
        if (video) el.play?.().catch?.(() => {});
        el._btUrl = url;
        return el;
    };
    const findLoadingHost = () => {
        const spinner = document.querySelector('video[data-testid="app-spinner"]');
        if (!spinner) return null;
        let host = spinner.parentElement;
        const only = el => [...el.children].filter(c => c.id !== "bt-splash").length === 1;
        while (host && host.parentElement && host.parentElement !== document.body && host.parentElement.id !== "app-mount" && only(host.parentElement)) host = host.parentElement;
        return host;
    };
    const hideSplash = () => {
        if (!splash) return;
        const sp = splash;
        splash = null;
        clearInterval(sp.lines);
        for (const t of sp.timers || []) clearTimeout(t), clearInterval(t);
        clearTimeout(sp.auto);
        removeEventListener("keydown", sp.onKey, true);
        sp.host?.removeAttribute("data-bt-splash-host");
        const done = () => {
            for (const v of sp.el.querySelectorAll("video")) {
                try {
                    v.pause();
                    v.removeAttribute("src");
                    v.load();
                } catch { }
            }
            sp.el.remove();
            const media = sp.el.querySelector(".bt-sp-media");
            if (media && media._btUrl) URL.revokeObjectURL(media._btUrl);
        };
        if (sp.preview || sp.boot) {
            sp.el.classList.add("bt-out");
            setTimeout(done, 500);
        } else done();
    };
    const appLoaded = () => !!document.querySelector('nav[class*="guilds_"], [class*="sidebar_"], [class*="standardSidebarView_"]');
    const showSplash = (preview = false, host = null, boot = false) => {
        if (splash) hideSplash();
        if (!preview && (!enabled || S.splashStyle === "discord" || (!host && !boot))) return;
        const el = $("div", { id: "bt-splash", role: "status" });
        el.setAttribute("aria-label", "Discord is loading");
        const media = S.splashStyle === "media" || S.splashStyle === "wallpaper";
        const kind = FLAT_SPLASHES.includes(S.splashStyle) ? S.splashStyle : media ? null : "clyde";
        el.dataset.style = media ? "media" : kind;
        for (const [k, v] of [["--sp-a", S.accent], ["--sp-b", S.accent2], ["--sp-1", S.grad1], ["--sp-2", S.grad2], ["--sp-3", S.grad3], ["--sp-base", S.gradBase], ["--sp-dim", String((Number(S.splashDim) || 0) / 100)]]) {
            el.style.setProperty(k, String(v));
        }
        el.style.setProperty("--sp-fit", S.splashFit === "contain" ? "contain" : "cover");
        if (kind) {
            el.style.setProperty("--sp-bg", S.splashBg || "#111214");
            el.style.setProperty("--sp-fg", S.splashFg || "#ffffff");
            el.style.setProperty("--sp-accent", S.splashAccent || "#5865f2");
            el.style.setProperty("--sp-scale", String(Math.min(2, Math.max(0.5, (Number(S.splashSize) || 100) / 100))));
            el.style.setProperty("--sp-k", String(Math.min(3, Math.max(0.25, (Number(S.splashSpeed) || 100) / 100))));
            el.style.setProperty("--sp-thick", `${Math.min(10, Math.max(1, Number(S.splashThickness) || 4))}px`);
            el.style.setProperty("--sp-ts", `${Math.min(24, Math.max(10, Number(S.splashTextSize) || 13))}px`);
            el.style.setProperty("--sp-to", String(Math.min(100, Math.max(10, Number(S.splashTextOpacity) || 55)) / 100));
            el.dataset.place = ["high", "low", "left", "right"].includes(S.splashPlace) ? S.splashPlace : "center";
            const pattern = splashPattern(S.splashPattern, S.splashFg || "#ffffff", Math.min(40, Math.max(2, Number(S.splashPatternOpacity) || 8)));
            if (pattern) {
                el.dataset.pattern = S.splashPattern;
                el.style.setProperty("--sp-pattern", pattern);
            }
        }
        el.append($("div", { className: "bt-sp-dim" }));
        const timers = [];
        const scene = kind ? splashScene(kind, timers) : null;
        if (scene) el.append(scene);
        const center = $("div", { className: "bt-sp-center" });
        if (el.dataset.style === "media" && S.splashLogo !== false && LOGO) center.append(splashLogo());
        const pool = String(S.splashText || "").split("|").map(t => t.trim()).filter(Boolean);
        const text = pool.length ? $("div", { className: scene ? "bt-k-caption" : "bt-sp-text", textContent: pool[0] }) : null;
        if (text) (scene || center).append(text);
        el.append(center);
        const sp = { el, preview, host, boot, timers };
        if (boot) {
            el.style.cursor = "default";
            document.documentElement.append(el);
            sp.auto = setTimeout(hideSplash, 60_000);
        } else if (preview) {
            el.append($("div", { className: "bt-sp-skip", textContent: "Preview · click to close" }));
            (document.body || document.documentElement).append(el);
            sp.onKey = e => e.key === "Escape" && hideSplash();
            addEventListener("keydown", sp.onKey, true);
            el.addEventListener("click", hideSplash);
            sp.auto = setTimeout(hideSplash, 8000);
        } else {
            host.setAttribute("data-bt-splash-host", "");
            host.append(el);
        }
        let n = 0;
        sp.lines = setInterval(() => {
            if (pool.length < 2) return;
            text.classList.add("bt-fade");
            setTimeout(() => {
                text.textContent = pool[++n % pool.length];
                text.classList.remove("bt-fade");
            }, 250);
        }, 2600);
        splash = sp;
        if (S.splashStyle === "media" || S.splashStyle === "wallpaper") {
            idb.get(S.splashStyle === "wallpaper" ? "wallpaper" : "splash").then(async blob => {
                if (splash !== sp || !(blob instanceof Blob)) return;
                if (S.splashStyle === "media" && !S.splashLowResSwitched) {
                    const size = await mediaSize(blob).catch(() => null);
                    const need = Math.round((screen.width || 1920) * (devicePixelRatio || 1) * 0.75);
                    if (size && size.w < need) {
                        S.splashStyle = "clyde";
                        S.splashLowResSwitched = true;
                        save();
                        refreshControls();
                        if (splash === sp) {
                            const { preview, host: h, boot: b } = sp;
                            hideSplash();
                            showSplash(preview, h, b);
                        }
                        setTimeout(() => toast(`Your splash picture is only ${size.w}×${size.h}, so it looked blurry. The splash now shows Discord's logo instead (you can pick a bigger picture on the Splash page).`, 9000), preview ? 0 : 4000);
                        return;
                    }
                }
                const media = await splashMediaEl(blob).catch(() => null);
                if (media && splash === sp) el.prepend(media);
            });
        }
    };
    const markDiscordLoading = () => {
        const spinner = document.querySelector('video[data-testid="app-spinner"]');
        const prev = document.querySelector("[data-bt-discord-loading]");
        let target = null;
        if (spinner) {
            const vw = innerWidth * 0.9, vh = innerHeight * 0.9;
            for (let el = spinner.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
                const r = el.getBoundingClientRect();
                if (r.width >= vw && r.height >= vh) {
                    target = el;
                    break;
                }
            }
        }
        if (prev && prev !== target) prev.removeAttribute("data-bt-discord-loading");
        if (target && target !== prev) target.setAttribute("data-bt-discord-loading", "");
    };
    const syncSplash = () => {
        markDiscordLoading();
        if (!featureOn("splash")) return splash && hideSplash();
        if (splash && splash.preview) return;
        if (splash && splash.boot) {
            if (!enabled || S.splashStyle === "discord" || appLoaded()) hideSplash();
            return;
        }
        const host = enabled && S.splashStyle !== "discord" ? findLoadingHost() : null;
        if (!host) return splash && hideSplash();
        if (splash && splash.host === host && splash.el.isConnected) return;
        showSplash(false, host);
    };

    function toggle() {
        enabled = !enabled;
        S.enabled = enabled;
        sheets.themes.disabled = sheets.quick.disabled = !enabled;
        enabled ? startAllPlugins() : stopAllPlugins();
        sbMark();
        syncSplash();
        apply();
        save();
        refreshControls();
        refreshQuickActions();
        toast(enabled ? "Be Themer is on" : "Be Themer is off. Press Ctrl+Alt+A to turn it back on.");
    }

    window.BThemer = Object.freeze({
        version: state.version,
        settings: S,
        definePlugin,
        plugins: Object.freeze({
            list: () => [...plugins.values()].map(r => ({ id: r.def.id, name: r.def.name, running: r.running, file: r.file, error: r.error })),
            enable: id => setPluginEnabled(id, true),
            disable: id => setPluginEnabled(id, false),
            toggle: id => setPluginEnabled(id, !(plugins.get(id) && isPluginEnabled(plugins.get(id)))),
        }),
        open: openWindow,
        toggle,
        toast,
        reloadThemes,
        setWallpaperFromUrl: wallpaperFromUrl,
        debug: () => ({
            patchesApplied: [...wp.applied],
            patchesPending: wp.patches.filter(p => !p.applied).map(p => p.name),
            reactFound: !!wp.React,
            layoutTypesFound: wp.layoutTypesFound,
            settingsSectionAdded: wp.settingsPatched,
            stores: Object.fromEntries(["SelectedChannelStore", "ChannelStore", "GuildStore", "UserStore", "MessageStore", "MediaEngineStore", "AuthenticationStore"].map(n => [n, !!discordStore(n)])),
            discordHttpClient: !!discordHttp(),
            modulesSeen: wp.modules.length,
        }),
        __wp: Object.freeze({ ...wp.api }),
        __withFile: withFile,
        __syncUserPlugins: syncUserPlugins,
    });

    setCss(sheets.ui, uiCss, "Be Themer UI");

    if (featureOn("splash") && document.readyState === "loading" && enabled && S.splashStyle !== "discord" && document.documentElement && !appLoaded()) {
        try {
            mountSheets();
            setRootAttr("data-bt-loading", true);
            showSplash(false, null, true);
        } catch (e) {
            warn("Couldn't show the splash early:", e);
        }
    }

    ready(async () => {
        currentGuild = guildFromUrl();
        for (const method of ["pushState", "replaceState"]) {
            const original = history[method];
            history[method] = function (...args) {
                const result = original.apply(this, args);
                queueMicrotask(checkGuild);
                return result;
            };
        }
        addEventListener("popstate", checkGuild);
        setInterval(checkGuild, 2000);

        mountSheets();
        if (!appLoaded()) {
            setRootAttr("data-bt-loading", true);
            setTimeout(() => setRootAttr("data-bt-loading", null), 90_000);
        }
        syncSplash();

        applyThemes();
        document.body.append(fileInput, splashInput);
        apply();

        started = true;
        startAllPlugins();
        startSoundboardGlow();

        let queued = false;
        domWatch(() => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                if (document.documentElement.hasAttribute("data-bt-loading") && appLoaded()) setRootAttr("data-bt-loading", null);
                syncSplash();
                injectTab();
                if (inline && !inline.isConnected) closeInline();
            });
        });

        document.addEventListener("keydown", e => {
            if (e.ctrlKey && e.altKey && !e.shiftKey && e.code === "KeyA") {
                e.preventDefault();
                toggle();
            } else if (e.ctrlKey && e.altKey && !e.shiftKey && e.code === "KeyB") {
                e.preventDefault();
                win ? closeWindow() : openWindow();
            } else if (e.key === "Escape" && win && !(e.target && e.target.closest && e.target.closest('[contenteditable="true"]'))) {
                e.stopPropagation();
                closeWindow();
            }
        }, true);

        Native.onThemesChanged(() => {
            reloadThemes();
            log("themes reloaded");
        });
        Native.onRendererChanged(() => toast("Be Themer was updated. Press Ctrl+R (or F5, or Shortcuts → Reload Discord) to load it.", 6000));

        await syncWallpaper(true);
        setTimeout(warmWallpapers, 1500);

        log(`v${state.version} loaded · ${state.themes.length} theme(s) · ${plugins.size} plugin(s)`);
    });
})();
