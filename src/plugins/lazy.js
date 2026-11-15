const LZ_FOX = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(0 8) scale(0.85)"><path d="M5 4 L25 16 Q32 14.5 39 16 L59 4 L62 30 Q62 40 52 46 L41 57 Q32 62 23 57 L12 46 Q2 40 2 30 Z" fill="#F4811F" stroke="#B85410" stroke-width="2" stroke-linejoin="round"/><path d="M2 31 Q10 33 21 40 Q27 43 32 43 Q37 43 43 40 Q54 33 62 31 Q62 40 52 46 L41 57 Q32 62 23 57 L12 46 Q2 40 2 31 Z" fill="#FFF6E8"/><path d="M9 10 L22 18 L11 30 Z M55 10 L42 18 L53 30 Z" fill="#6B2E0C"/><path d="M14 30 Q20 37 27 30 M37 30 Q44 37 50 30" fill="none" stroke="#2E1406" stroke-width="3" stroke-linecap="round"/><path d="M27.5 44 Q32 41.5 36.5 44 Q34.5 49 32 49.5 Q29.5 49 27.5 44 Z" fill="#2E1406"/></g><path d="M46 3 h10 l-10 9 h10" fill="none" stroke="#4F7BE8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M57 16 h5 l-5 5 h5" fill="none" stroke="#4F7BE8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const LZ_ICONS = {
    shield: ["fill", '<path d="M12 2.5 4.5 5.3v6.1c0 4.6 3.2 8.9 7.5 10.1 4.3-1.2 7.5-5.5 7.5-10.1V5.3L12 2.5Z"/>'],
    back: ["line", '<path d="m15 18-6-6 6-6"/>'],
    forward: ["line", '<path d="m9 18 6-6-6-6"/>'],
    reload: ["line", '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>'],
    stop: ["line", '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'],
    home: ["line", '<path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/>'],
    external: ["line", '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'],
    chevron: ["line", '<path d="m6 9 6 6 6-6"/>'],
    search: ["line", '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'],
    list: ["line", '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>'],
    spark: ["fill", '<path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9z"/>'],
    plus: ["line", '<path d="M12 5v14"/><path d="M5 12h14"/>'],
    globe: ["line", '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>'],
};
const lzIcon = (name, size = 15) => {
    const [kind, inner] = LZ_ICONS[name];
    const paint = kind === "fill" ? 'fill="currentColor" stroke="currentColor" stroke-width="1.5"' : 'fill="none" stroke="currentColor" stroke-width="2"';
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" ${paint} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
};
const LZ_RECOMMENDED = {
    Popular: [["YouTube", "https://www.youtube.com/"], ["Reddit", "https://www.reddit.com/"], ["Wikipedia", "https://www.wikipedia.org/"],
        ["GitHub", "https://github.com/"], ["X", "https://x.com/"], ["Twitch", "https://www.twitch.tv/"],
        ["Instagram", "https://www.instagram.com/"], ["Netflix", "https://www.netflix.com/"]],
    News: [["BBC News", "https://www.bbc.com/news"], ["Reuters", "https://www.reuters.com/"], ["The Verge", "https://www.theverge.com/"],
        ["Hacker News", "https://news.ycombinator.com/"], ["Ars Technica", "https://arstechnica.com/"], ["The Guardian", "https://www.theguardian.com/"],
        ["AP News", "https://apnews.com/"], ["TechCrunch", "https://techcrunch.com/"]],
    Learn: [["MDN", "https://developer.mozilla.org/"], ["Stack Overflow", "https://stackoverflow.com/"], ["Khan Academy", "https://www.khanacademy.org/"],
        ["Coursera", "https://www.coursera.org/"], ["freeCodeCamp", "https://www.freecodecamp.org/"], ["Duolingo", "https://www.duolingo.com/"],
        ["W3Schools", "https://www.w3schools.com/"], ["Wolfram", "https://www.wolframalpha.com/"]],
    Fun: [["Pinterest", "https://www.pinterest.com/"], ["IMDb", "https://www.imdb.com/"], ["Steam", "https://store.steampowered.com/"],
        ["Letterboxd", "https://letterboxd.com/"], ["Genius", "https://genius.com/"], ["itch.io", "https://itch.io/"],
        ["Crunchyroll", "https://www.crunchyroll.com/"], ["9GAG", "https://9gag.com/"]],
    Shopping: [["Amazon", "https://www.amazon.com/"], ["eBay", "https://www.ebay.com/"], ["Etsy", "https://www.etsy.com/"],
        ["AliExpress", "https://www.aliexpress.com/"], ["Best Buy", "https://www.bestbuy.com/"], ["IKEA", "https://www.ikea.com/"],
        ["Walmart", "https://www.walmart.com/"], ["Target", "https://www.target.com/"]],
};
const LZ_PALETTES = {
    brown: ["#24170e", "#3d2a1d", "#f4811f", "#f7eadb"],
    night: ["#11131c", "#232737", "#7c8cff", "#e6e9f5"],
    forest: ["#101a14", "#1f3127", "#4fc77f", "#e3f2e8"],
    rose: ["#1f1218", "#38202b", "#ff6f9f", "#f8e4ec"],
    ocean: ["#0c1a22", "#16313e", "#2fc1d3", "#ddf3f7"],
};
const lzHex = h => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h || "")); return m ? [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)) : null; };
const lzMix = (a, b, t) => { const x = lzHex(a), y = lzHex(b); return x && y ? `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(" ")})` : a; };
const lzRgba = (h, alpha) => { const x = lzHex(h); return x ? `rgb(${x.join(" ")} / ${alpha})` : h; };
const lzFavicon = url => { try { return `https://icons.duckduckgo.com/ip3/${new URL(url).hostname}.ico`; } catch { return ""; } };

BThemer.definePlugin({
    id: "lazy",
    name: "Lazy",
    description: "A small browser inside Discord with its own search and Shields: ads, trackers and annoyances blocked with the standard ad-block filter lists. Pop it out to a big window any time.",
    author: "Be Themer",
    version: "1.1.0",
    settings: {
        shieldStatus: { type: "info", label: "Shields", default: "Starting…" },
        shieldsOn: { type: "toggle", label: "Shields: block ads and trackers", default: true },
        shields: {
            type: "select", label: "Shields level",
            options: [["standard", "Standard: block ads and trackers"], ["aggressive", "Aggressive: also cookie banners, popups and annoyances"]],
            default: "standard",
        },
        summary: { type: "toggle", label: "Show a summary above search results", default: true },
        suggestions: { type: "toggle", label: "Show search suggestions while typing", default: true },
        height: { type: "range", label: "Browser height", min: 220, max: 700, unit: "px", default: 380 },
        palette: {
            type: "select", label: "Colours",
            options: [["brown", "Cocoa (brown)"], ["night", "Midnight"], ["forest", "Forest"], ["rose", "Rose"], ["ocean", "Ocean"], ["custom", "Custom (the colours below)"]],
            default: "brown",
        },
        colorBg: { type: "color", label: "Custom: background", default: "#24170e" },
        colorCard: { type: "color", label: "Custom: panels and inputs", default: "#3d2a1d" },
        colorAccent: { type: "color", label: "Custom: accent", default: "#f4811f" },
        colorText: { type: "color", label: "Custom: text", default: "#f7eadb" },
        zoom: { type: "range", label: "Page zoom (smaller fits more of a site in the widget)", min: 30, max: 100, unit: "%", default: 50 },
        rememberLast: { type: "toggle", label: "Reopen the last page after restarting Discord", default: true },
        updateBtn: { type: "button", label: "Refresh the filter lists now (they refresh by themselves every 3 days)", text: "Update" },
        clearBtn: { type: "button", label: "Clear browsing data (cookies, logins, cache) for Lazy", text: "Clear" },
    },
    css: `
        .bt-lz { --lz-bg: #24170e; --lz-bg2: #2c1d12; --lz-card: #312117; --lz-card2: #3d2a1d; --lz-line: rgb(255 214 170 / .12); --lz-text: #f7eadb;
            --lz-muted: #b99d84; --lz-desc: #d9c4ae; --lz-accent: #f4811f; --lz-accent2: #ffb36b; --lz-link: #ffc58a; --lz-accent-a15: rgb(244 129 31 / .15);
            --lz-accent-a22: rgb(244 129 31 / .22); --lz-accent-a50: rgb(244 129 31 / .5); --lz-hover: rgb(255 214 170 / .08); --lz-on-accent: #2a1408;
            position: relative; margin: 8px; padding: 10px; border-radius: 22px; border: 1px solid var(--lz-line);
            background: linear-gradient(180deg, var(--lz-bg2), var(--lz-bg)); color: var(--lz-text);
            box-shadow: 0 10px 28px rgb(0 0 0 / .32), inset 0 1px 0 rgb(255 255 255 / .04); font: 14px/1.3 var(--font-primary, "gg sans", sans-serif); }
        .bt-lz[hidden], .bt-lz [hidden] { display: none !important; }
        .bt-lz-head { display: flex; align-items: center; gap: 8px; min-width: 0; height: 32px; padding: 0 2px; }
        .bt-lz-logo { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--lz-card2);
            box-shadow: inset 0 0 0 1px var(--lz-line); }
        .bt-lz-logo svg { width: 22px; height: 22px; display: block; transform: translateY(1px); }
        .bt-lz-title { flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 13px; line-height: 32px; }
        .bt-lz-title img { width: 14px; height: 14px; flex: none; border-radius: 3px; }
        .bt-lz-title span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-lz-badge { flex: none; display: flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 999px; background: var(--lz-accent-a22);
            color: var(--lz-accent2); font: 700 11px var(--font-primary, sans-serif); font-variant-numeric: tabular-nums; cursor: default; }
        .bt-lz-badge.bt-lz-off { background: var(--lz-hover); color: var(--lz-muted); }
        .bt-lz .bt-lz-btn { display: grid; place-items: center; width: 28px; height: 28px; flex: none; padding: 0; border: 0; border-radius: 50% !important;
            background: none; color: var(--lz-muted); cursor: pointer; transition: background .12s, color .12s; }
        .bt-lz .bt-lz-btn:hover:not(:disabled) { background: var(--lz-hover); color: var(--lz-text); }
        .bt-lz .bt-lz-btn:disabled { opacity: .3; cursor: default; }
        .bt-lz-chevron svg { transition: transform .2s ease; transform: rotate(180deg); }
        .bt-lz-collapsed .bt-lz-chevron svg { transform: rotate(0deg); }
        .bt-lz-striprow { display: flex; align-items: center; gap: 6px; margin-top: 8px; min-width: 0; }
        .bt-lz-tabs { flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px; overflow-x: auto; scrollbar-width: none; }
        .bt-lz-zoom { flex: none; display: flex; align-items: center; height: 26px; padding: 0 2px; border-radius: 999px; background: var(--lz-card);
            border: 1px solid var(--lz-line); }
        .bt-lz-zoom:focus-within { border-color: var(--lz-accent); }
        .bt-lz .bt-lz-zbtn { width: 20px; height: 20px; display: grid; place-items: center; padding: 0; border: 0; border-radius: 50%; background: none;
            color: var(--lz-muted); cursor: pointer; font: 700 14px/1 var(--font-primary, sans-serif); }
        .bt-lz .bt-lz-zbtn:hover:not(:disabled) { background: var(--lz-hover); color: var(--lz-text); }
        .bt-lz .bt-lz-zbtn:disabled { opacity: .3; cursor: default; }
        .bt-lz-zval { width: 36px; padding: 0; border: 0; outline: none; background: none; text-align: center; color: var(--lz-text);
            font: 700 11px var(--font-primary, sans-serif); font-variant-numeric: tabular-nums; cursor: text; }
        .bt-lz-tabs::-webkit-scrollbar { display: none; }
        .bt-lz-tab { flex: 0 1 140px; min-width: 64px; display: flex; align-items: center; gap: 5px; height: 28px; padding: 0 4px 0 9px; border-radius: 999px;
            background: var(--lz-hover); border: 1px solid transparent; color: var(--lz-muted); cursor: pointer; font-size: 12px; position: relative; }
        .bt-lz-tab:hover { color: var(--lz-text); }
        .bt-lz-tab.bt-lz-on { background: var(--lz-card2); border-color: var(--lz-accent-a50); color: var(--lz-text); }
        .bt-lz-tab.bt-lz-busy::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: 1px; height: 2px; border-radius: 1px;
            background: linear-gradient(90deg, transparent, var(--lz-accent), transparent); background-size: 200% 100%; animation: bt-lz-busy 1s linear infinite; }
        @keyframes bt-lz-busy { from { background-position: 100% 0; } to { background-position: -100% 0; } }
        .bt-lz-tabicon { flex: none; width: 14px; height: 14px; display: grid; place-items: center; }
        .bt-lz-tabicon img { width: 14px; height: 14px; border-radius: 3px; }
        .bt-lz-tabtitle { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-lz .bt-lz-tabx { flex: none; width: 18px; height: 18px; display: grid; place-items: center; padding: 0; border: 0; border-radius: 50%;
            background: none; color: inherit; opacity: .55; cursor: pointer; }
        .bt-lz .bt-lz-tabx:hover { opacity: 1; background: var(--lz-hover); }
        .bt-lz .bt-lz-newtab { width: 26px; height: 26px; }
        .bt-lz-collapsed .bt-lz-tabs, .bt-lz-collapsed .bt-lz-striprow { display: none !important; }
        .bt-lz-bar { display: flex; align-items: center; gap: 2px; margin-top: 8px; }
        .bt-lz-addrwrap { flex: 1; min-width: 0; position: relative; }
        .bt-lz-addr { width: 100%; height: 30px; box-sizing: border-box; padding: 0 12px 0 30px; border: 1px solid var(--lz-line); border-radius: 999px; outline: none;
            background: var(--lz-card); color: var(--lz-text); font: 13px var(--font-primary, sans-serif); }
        .bt-lz-addr:focus { border-color: var(--lz-accent); box-shadow: 0 0 0 3px var(--lz-accent-a15); }
        .bt-lz-addr::placeholder { color: var(--lz-muted); }
        .bt-lz-addricon { position: absolute; left: 10px; top: 8px; color: var(--lz-muted); pointer-events: none; }
        .bt-lz-view { position: relative; margin-top: 8px; border-radius: 18px; overflow: hidden; background: var(--lz-card); border: 1px solid var(--lz-line);
            isolation: isolate; }
        .bt-lz-screen { position: absolute; inset: 0; width: 100%; height: 100%; display: block; outline: none; background: #fff; }
        .bt-lz-screen:focus-visible { box-shadow: inset 0 0 0 2px var(--lz-accent); }
        .bt-lz-pane > .bt-lz-msg { position: absolute; inset: 0; z-index: 1; background: var(--lz-card); }
        .bt-lz-pane > .bt-lz-msg:empty { display: none; }
        .bt-lz-progress { position: absolute; left: 0; top: 0; height: 2px; width: 0; background: var(--lz-accent); z-index: 2; transition: width .3s; }
        .bt-lz-loading .bt-lz-progress { width: 70%; transition: width 4s cubic-bezier(.1, .7, .2, 1); }
        .bt-lz-pane { position: absolute; inset: 0; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #6b4a33 transparent; }
        /* start page */
        .bt-lz-start { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 18px 14px;
            background: radial-gradient(circle at 50% 0%, var(--lz-accent-a22), transparent 62%); }
        .bt-lz-start-logo { display: grid; place-items: center; width: 88px; height: 88px; border-radius: 50%; background: var(--lz-card2);
            box-shadow: 0 10px 24px rgb(0 0 0 / .3), inset 0 0 0 1px var(--lz-line); }
        .bt-lz-start-logo svg { width: 60px !important; height: 60px !important; transform: translateY(3px); }
        .bt-lz-start-logo svg { width: 100%; height: 100%; display: block; }
        .bt-lz-start h3 { margin: 0; font: 800 20px var(--font-display, var(--font-primary, sans-serif)); letter-spacing: .02em; color: var(--lz-text); }
        .bt-lz-start p { margin: -6px 0 0; font-size: 12px; color: var(--lz-muted); text-align: center; }
        .bt-lz-bigsearch { width: 100%; max-width: 340px; position: relative; }
        .bt-lz-bigsearch input { width: 100%; height: 38px; box-sizing: border-box; padding: 0 14px 0 36px; border-radius: 999px; border: 1px solid var(--lz-line);
            background: var(--lz-card2); color: var(--lz-text); font: 14px var(--font-primary, sans-serif); outline: none; }
        .bt-lz-bigsearch input:focus { border-color: var(--lz-accent); box-shadow: 0 0 0 3px var(--lz-accent-a15); }
        .bt-lz-bigsearch input::placeholder { color: var(--lz-muted); }
        .bt-lz-bigsearch span { position: absolute; left: 12px; top: 11px; color: var(--lz-muted); }
        .bt-lz-quick { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: 100%; max-width: 340px; }
        .bt-lz-quick button { border: 1px solid var(--lz-line); padding: 10px 4px; border-radius: 16px; cursor: pointer; background: var(--lz-card2);
            color: var(--lz-text); font: 600 11px var(--font-primary, sans-serif); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-lz-quick button:hover { border-color: var(--lz-accent-a50); background: var(--lz-hover); transform: translateY(-1px); }
        .bt-lz-start { justify-content: flex-start; }
        .bt-lz-starttop { display: flex; flex-direction: column; align-items: center; gap: 10px; width: 100%; padding-top: 6px; }
        .bt-lz-section { width: 100%; max-width: 340px; margin-top: 4px; font: 800 11px var(--font-primary, sans-serif); text-transform: uppercase;
            letter-spacing: .05em; color: var(--lz-muted); }
        .bt-lz-chips { display: flex; gap: 5px; flex-wrap: wrap; width: 100%; max-width: 340px; margin-top: -4px; }
        .bt-lz-chips button { border: 1px solid var(--lz-line); padding: 3px 10px; border-radius: 999px; cursor: pointer; background: transparent;
            color: var(--lz-muted); font: 600 11px var(--font-primary, sans-serif); }
        .bt-lz-chips button:hover { color: var(--lz-text); }
        .bt-lz-chips button.bt-lz-on { background: var(--lz-accent); border-color: var(--lz-accent); color: var(--lz-on-accent); }
        .bt-lz-tile { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 0; }
        .bt-lz-tile img, .bt-lz-tileglobe { width: 24px; height: 24px; border-radius: 50%; background: #fff; padding: 2px; box-sizing: border-box; }
        .bt-lz-tileglobe { display: grid; place-items: center; background: var(--lz-card); color: var(--lz-muted); }
        .bt-lz-tile span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bt-lz-badge { cursor: pointer; }
        .bt-lz-suggest { position: absolute; z-index: 5; padding: 5px; border-radius: 16px; background: var(--lz-card2); border: 1px solid var(--lz-line);
            box-shadow: 0 10px 24px rgb(0 0 0 / .45); }
        .bt-lz-sugg { display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-radius: 11px; cursor: pointer; font-size: 13px; color: var(--lz-text); }
        .bt-lz-sugg span:first-child { color: var(--lz-muted); display: grid; }
        .bt-lz-sugg span:last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bt-lz-sugg:hover, .bt-lz-sugg.bt-lz-sel { background: var(--lz-accent-a22); }
        .bt-lz-kinds { margin: 2px 4px 8px; max-width: none; }
        .bt-lz-summary { margin: 0 4px 8px; padding: 12px 13px; border-radius: 18px; background: linear-gradient(160deg, var(--lz-accent-a22), var(--lz-card2) 70%);
            border: 1px solid var(--lz-accent-a50); }
        .bt-lz-sumhead { display: flex; align-items: center; gap: 6px; font: 800 12px var(--font-primary, sans-serif); color: var(--lz-accent2); }
        .bt-lz-sumsub { margin-top: 3px; font-size: 11px; color: var(--lz-muted); }
        .bt-lz-sumtext { margin-top: 6px; font-size: 12.5px; line-height: 1.45; color: var(--lz-text); white-space: pre-line;
            display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
        .bt-lz-summary.bt-lz-open .bt-lz-sumtext { -webkit-line-clamp: unset; display: block; }
        .bt-lz-summore { margin-top: 6px; border: 0; padding: 0; background: none; cursor: pointer; color: var(--lz-accent2); font: 700 11px var(--font-primary, sans-serif); }
        .bt-lz-sumwait { margin-top: 8px; height: 46px; border-radius: 10px;
            background: linear-gradient(90deg, var(--lz-hover), var(--lz-accent-a15), var(--lz-hover)); background-size: 200% 100%; animation: bt-lz-busy 1.2s linear infinite; }
        .bt-lz-images { columns: 2; column-gap: 6px; padding: 0 4px 6px; }
        .bt-lz-image { break-inside: avoid; margin-bottom: 6px; border-radius: 14px; overflow: hidden; cursor: pointer; position: relative; background: var(--lz-card2); }
        .bt-lz-image img { display: block; width: 100%; height: auto; min-height: 60px; object-fit: cover; transition: transform .2s; }
        .bt-lz-image:hover img { transform: scale(1.04); }
        .bt-lz-image span { position: absolute; left: 6px; right: 6px; bottom: 6px; padding: 2px 7px; border-radius: 999px; background: rgb(0 0 0 / .55);
            color: #fff; font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; transition: opacity .15s; }
        .bt-lz-image:hover span { opacity: 1; }
        .bt-lz-menu { position: absolute; z-index: 9; min-width: 170px; padding: 5px; border-radius: 14px; background: var(--lz-card2); border: 1px solid var(--lz-line);
            box-shadow: 0 12px 28px rgb(0 0 0 / .45); }
        .bt-lz-menu button { display: block; width: 100%; padding: 7px 10px; border: 0; border-radius: 9px; background: none; text-align: left; cursor: pointer;
            color: var(--lz-text); font: 13px var(--font-primary, sans-serif); }
        .bt-lz-menu button:hover { background: var(--lz-accent-a22); }
        .bt-lz-menu button.bt-lz-danger { color: #ff8a80; }
        .bt-lz-menu button.bt-lz-danger:hover { background: rgb(255 80 80 / .18); }
        /* results */
        .bt-lz-results { padding: 6px; display: flex; flex-direction: column; gap: 2px; }
        .bt-lz-rhead { padding: 4px 6px 6px; font-size: 11px; color: var(--lz-muted); }
        .bt-lz-result { display: block; padding: 9px 10px 10px; border-radius: 14px; cursor: pointer; }
        .bt-lz-result:hover { background: var(--lz-hover); }
        .bt-lz-rsite { display: flex; align-items: center; gap: 6px; min-width: 0; font-size: 11px; color: var(--lz-muted); }
        .bt-lz-rsite img { width: 16px; height: 16px; flex: none; border-radius: 4px; background: #fff; }
        .bt-lz-rsite span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-lz-rtitle { margin-top: 3px; font-size: 14px; font-weight: 700; color: var(--lz-link); line-height: 1.25; }
        .bt-lz-result:hover .bt-lz-rtitle { text-decoration: underline; }
        .bt-lz-rdesc { margin-top: 3px; font-size: 12px; color: var(--lz-desc); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .bt-lz-more { margin: 6px auto 4px; display: block; border: 1px solid var(--lz-line); padding: 6px 14px; border-radius: 999px; cursor: pointer;
            background: var(--lz-card2); color: var(--lz-text); font: 600 12px var(--font-primary, sans-serif); }
        .bt-lz-more:hover { border-color: var(--lz-accent-a50); }
        .bt-lz-msg { display: grid; place-items: center; align-content: center; gap: 10px; padding: 18px; text-align: center; font-size: 12px; color: var(--lz-muted); }
        .bt-lz-msg .bt-lz-more { margin: 0; }
        .bt-lz-spin { width: 22px; height: 22px; border-radius: 50%; border: 3px solid var(--lz-accent-a22); border-top-color: var(--lz-accent); animation: bt-lz-spin .8s linear infinite; }
        @keyframes bt-lz-spin { to { transform: rotate(360deg); } }
        .bt-lz.bt-lz-collapsed { padding: 6px 8px; border-radius: 999px; }

        /* start page: plain and dense, like a real new-tab page */
        .bt-lz .bt-lz-start { justify-content: flex-start; align-items: stretch; gap: 0; padding: 14px 12px 12px; background: none; scrollbar-width: none; }
        .bt-lz .bt-lz-start::-webkit-scrollbar { display: none; }
        .bt-lz .bt-lz-starttop { align-items: stretch; gap: 12px; padding: 0 0 14px; }
        .bt-lz-brand { display: flex; align-items: center; gap: 8px; }
        .bt-lz-brandmark { width: 26px; height: 26px; flex: none; }
        .bt-lz-brandmark svg { width: 100%; height: 100%; display: block; }
        .bt-lz-brandname { font: 800 17px/1 var(--font-display, var(--font-primary, sans-serif)); letter-spacing: -.01em; color: var(--lz-text); }
        .bt-lz .bt-lz-bigsearch { max-width: none; }
        .bt-lz .bt-lz-bigsearch input { height: 36px; border-radius: 10px; background: var(--lz-bg); border-color: var(--lz-line); font-size: 13px; }
        .bt-lz .bt-lz-bigsearch input:focus { box-shadow: none; }
        .bt-lz .bt-lz-bigsearch span { top: 10px; }
        .bt-lz .bt-lz-section { max-width: none; margin: 0; padding: 0; font: 600 12px var(--font-primary, sans-serif); text-transform: none;
            letter-spacing: 0; color: var(--lz-muted); }
        .bt-lz-sechead { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; min-width: 0; }
        .bt-lz-cats { display: flex; gap: 10px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
        .bt-lz-cats::-webkit-scrollbar { display: none; }
        .bt-lz-cats button { flex: none; padding: 0 0 3px; border: 0; border-bottom: 2px solid transparent; background: none; cursor: pointer;
            color: var(--lz-muted); font: 600 12px var(--font-primary, sans-serif); }
        .bt-lz-cats button:hover { color: var(--lz-text); }
        .bt-lz-cats button.bt-lz-on { color: var(--lz-text); border-bottom-color: var(--lz-accent); }
        .bt-lz .bt-lz-quick { max-width: none; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; margin: 8px 0 14px; }
        .bt-lz .bt-lz-quick .bt-lz-tile { gap: 6px; padding: 8px 2px 6px; border: 0; border-radius: 10px; background: none; color: var(--lz-desc);
            font: 500 11px var(--font-primary, sans-serif); transform: none; }
        .bt-lz .bt-lz-quick .bt-lz-tile:hover { background: var(--lz-hover); color: var(--lz-text); }
        .bt-lz .bt-lz-tile img, .bt-lz .bt-lz-tileglobe { width: 36px; height: 36px; padding: 8px; border-radius: 10px; box-sizing: border-box;
            background: var(--lz-card2); box-shadow: inset 0 0 0 1px var(--lz-line); }
        .bt-lz .bt-lz-tile span:last-child { width: 100%; text-align: center; }
        .bt-lz-collapsed .bt-lz-bar, .bt-lz-collapsed .bt-lz-view, .bt-lz-collapsed .bt-lz-suggest,
        .bt-lz-collapsed .bt-lz-head .bt-lz-btn:not(.bt-lz-chevron) { display: none !important; }
    `,

    start(api) {
        const el = api.el;
        let stopped = false;
        let collapsed = false;
        let mode = "start";
        let page = { open: false, url: "", title: "", loading: false, canBack: false, canForward: false, blocked: 0, failed: false };
        let tabs = [];
        let activeTab = null;
        let pendingNew = false;
        let favicon = "";
        if (api.settings.shields === "off") { api.setSetting("shieldsOn", false); api.setSetting("shields", "standard"); }
        const wantedLevel = () => (api.settings.shieldsOn === false ? "off" : api.settings.shields === "aggressive" ? "aggressive" : "standard");
        let shieldsLevel = wantedLevel();
        let search = null;
        let searchSeq = 0;

        const root = el("div", { className: "bt-lz" });
        const btn = (name, title, onClick, extra = "") => {
            const b = el("button", { className: `bt-lz-btn ${extra}`.trim(), type: "button", title, innerHTML: lzIcon(name) });
            b.setAttribute("aria-label", title);
            b.onclick = e => { e.stopPropagation(); onClick(e, b); };
            return b;
        };
        const logo = el("span", { className: "bt-lz-logo", innerHTML: LZ_FOX });
        const title = el("div", { className: "bt-lz-title" });
        const badge = el("span", { className: "bt-lz-badge" });
        badge.onclick = e => {
            e.stopPropagation();
            api.setSetting("shieldsOn", api.settings.shieldsOn === false);
            api.toast(api.settings.shieldsOn === false ? "Shields off for Lazy" : "Shields on for Lazy");
        };
        const popBtn = btn("external", "Open in a big window", () => api.lazy.popout(mode === "page" && page.url ? page.url : undefined));
        const chevronBtn = btn("chevron", "Collapse", () => setCollapsed(!collapsed), "bt-lz-chevron");
        const head = el("div", { className: "bt-lz-head" });
        head.append(logo, title, badge, popBtn, chevronBtn);

        const backBtn = btn("back", "Back", () => goBack());
        const fwdBtn = btn("forward", "Forward", () => api.lazy.nav("forward"));
        const reloadBtn = btn("reload", "Reload", () => {
            if (mode === "page") api.lazy.nav(page.loading ? "stop" : "reload");
            else if (mode === "results" && search) runSearch(search.query, 0);
        });
        const resultsBtn = btn("list", "Back to the search results", () => setMode("results"));
        const homeBtn = btn("home", "Start page", () => setMode("start"));
        const addr = el("input", { className: "bt-lz-addr", type: "text", placeholder: "Search or type a web address", spellcheck: false });
        const addrWrap = el("div", { className: "bt-lz-addrwrap" });
        addrWrap.append(el("span", { className: "bt-lz-addricon", innerHTML: lzIcon("search", 13) }), addr);
        const bar = el("div", { className: "bt-lz-bar" });
        bar.append(backBtn, fwdBtn, reloadBtn, addrWrap, resultsBtn, homeBtn);

        const view = el("div", { className: "bt-lz-view" });
        const progress = el("div", { className: "bt-lz-progress" });

        const startPane = el("div", { className: "bt-lz-pane bt-lz-start" });
        const bigInput = el("input", { type: "text", placeholder: "Search or enter address", spellcheck: false });
        const big = el("div", { className: "bt-lz-bigsearch" });
        big.append(el("span", { innerHTML: lzIcon("search", 15) }), bigInput);
        const tile = (label, url, menu) => {
            const b = el("button", { type: "button", className: "bt-lz-tile", title: url });
            const img = el("img", { src: lzFavicon(url), alt: "", loading: "lazy" });
            img.onerror = () => img.replaceWith(el("span", { className: "bt-lz-tileglobe", innerHTML: lzIcon("globe", 16) }));
            b.append(img, el("span", { textContent: label }));
            b.onclick = () => openPage(url);
            b.onauxclick = e => { if (e.button === 1) { e.preventDefault(); openPage(url, true); } };
            if (menu) b.oncontextmenu = e => { e.preventDefault(); e.stopPropagation(); showMenu(e, menu()); };
            return b;
        };
        const menuBox = el("div", { className: "bt-lz-menu" });
        menuBox.hidden = true;
        const hideMenu = () => { menuBox.hidden = true; };
        function showMenu(e, items) {
            menuBox.replaceChildren(...items.map(it => {
                const b = el("button", { type: "button", className: it.danger ? "bt-lz-danger" : "", textContent: it.label });
                b.onclick = ev => { ev.stopPropagation(); hideMenu(); it.action(); };
                return b;
            }));
            menuBox.hidden = false;
            const rr = root.getBoundingClientRect();
            const w = menuBox.offsetWidth, h = menuBox.offsetHeight;
            menuBox.style.left = `${Math.max(4, Math.min(e.clientX - rr.left, rr.width - w - 4))}px`;
            menuBox.style.top = `${Math.max(4, Math.min(e.clientY - rr.top, rr.height - h - 4))}px`;
        }
        const onDownOutside = e => { if (!menuBox.hidden && !menuBox.contains(e.target)) hideMenu(); };
        document.addEventListener("pointerdown", onDownOutside, true);
        const section = name => el("div", { className: "bt-lz-section", textContent: name });
        const recentTitle = section("Recent");
        const recentGrid = el("div", { className: "bt-lz-quick" });
        let history = [];
        const drawRecent = () => {
            recentGrid.replaceChildren(...history.slice(0, 8).map(h => tile(h.title || host(h.url), h.url, () => [
                { label: "Open in a new tab", action: () => openPage(h.url, true) },
                { label: "Remove from history", action: () => forget(h.url) },
                { label: "Clear all history", danger: true, action: () => forget(null) },
            ])));
            recentTitle.hidden = recentGrid.hidden = !history.length;
        };
        const remember = (url, pageTitle) => {
            if (!/^https?:/i.test(url || "")) return;
            const hst = host(url);
            history = [{ url, title: pageTitle || hst }, ...history.filter(h => host(h.url) !== hst)].slice(0, 24);
            api.storage.set("history", history).catch(() => {});
            drawRecent();
        };
        const forget = url => {
            history = url ? history.filter(h => host(h.url) !== host(url)) : [];
            api.storage.set("history", history).catch(() => {});
            drawRecent();
            api.toast(url ? `Removed ${host(url)} from history` : "History cleared");
        };
        api.storage.get("history").then(v => { if (Array.isArray(v)) { history = v.filter(h => h && h.url); drawRecent(); } }).catch(() => {});
        const recChips = el("div", { className: "bt-lz-cats" });
        const recGrid = el("div", { className: "bt-lz-quick" });
        let recCat = "Popular";
        const drawRecommended = () => {
            recChips.replaceChildren(...Object.keys(LZ_RECOMMENDED).map(cat => {
                const c = el("button", { type: "button", textContent: cat, className: cat === recCat ? "bt-lz-on" : "" });
                c.onclick = () => { recCat = cat; drawRecommended(); };
                return c;
            }));
            recGrid.replaceChildren(...LZ_RECOMMENDED[recCat].map(([label, url]) => tile(label, url)));
        };
        drawRecommended();
        const brand = el("div", { className: "bt-lz-brand" });
        brand.append(el("span", { className: "bt-lz-brandmark", innerHTML: LZ_FOX }), el("span", { className: "bt-lz-brandname", textContent: "Lazy" }));
        const startTop = el("div", { className: "bt-lz-starttop" });
        startTop.append(brand, big);
        const recHead = el("div", { className: "bt-lz-sechead" });
        recHead.append(section("Sites"), recChips);
        startPane.append(startTop, recentTitle, recentGrid, recHead, recGrid);
        recentTitle.hidden = recentGrid.hidden = true;

        const resultsPane = el("div", { className: "bt-lz-pane" });
        const pagePane = el("div", { className: "bt-lz-pane" });
        const pageMsg = el("div", { className: "bt-lz-msg" });
        const screen = el("canvas", { className: "bt-lz-screen", tabIndex: 0 });
        const screenCtx = screen.getContext("2d");
        pagePane.append(screen, pageMsg);
        view.append(progress, startPane, resultsPane, pagePane);
        const tabStrip = el("div", { className: "bt-lz-tabs" });
        const newTabBtn = btn("plus", "New tab", () => newTab(), "bt-lz-newtab");
        const ZOOM_MIN = 30, ZOOM_MAX = 100, ZOOM_DEFAULT = 50;
        const zoomNow = () => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(Number(api.settings.zoom) || ZOOM_DEFAULT)));
        const zoomBox = el("div", { className: "bt-lz-zoom", title: "Page zoom: smaller fits more of a site. Scroll here, or type a value." });
        const zoomOut = el("button", { type: "button", className: "bt-lz-zbtn", textContent: "−", title: "Zoom out" });
        const zoomIn = el("button", { type: "button", className: "bt-lz-zbtn", textContent: "+", title: "Zoom in" });
        const zoomInput = el("input", { className: "bt-lz-zval", type: "text", inputMode: "numeric", spellcheck: false });
        zoomBox.append(zoomOut, zoomInput, zoomIn);
        const setZoom = v => {
            v = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(v)));
            if (v !== zoomNow()) api.setSetting("zoom", v);
            drawZoom();
        };
        const drawZoom = () => {
            if (document.activeElement !== zoomInput) zoomInput.value = `${zoomNow()}%`;
            zoomOut.disabled = zoomNow() <= ZOOM_MIN;
            zoomIn.disabled = zoomNow() >= ZOOM_MAX;
        };
        zoomOut.onclick = e => { e.stopPropagation(); setZoom(zoomNow() - 5); };
        zoomIn.onclick = e => { e.stopPropagation(); setZoom(zoomNow() + 5); };
        zoomInput.addEventListener("focus", () => { zoomInput.value = String(zoomNow()); zoomInput.select(); });
        zoomInput.addEventListener("blur", () => { const n = parseInt(zoomInput.value, 10); if (Number.isFinite(n)) setZoom(n); else drawZoom(); });
        for (const type of ["keyup", "keypress"]) zoomInput.addEventListener(type, e => e.stopPropagation());
        zoomInput.addEventListener("keydown", e => {
            e.stopPropagation();
            if (e.key === "Enter") { e.preventDefault(); zoomInput.blur(); }
            else if (e.key === "Escape") { zoomInput.value = String(zoomNow()); zoomInput.blur(); }
            else if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); setZoom(zoomNow() + (e.key === "ArrowUp" ? 5 : -5)); zoomInput.value = String(zoomNow()); zoomInput.select(); }
        });
        zoomBox.addEventListener("wheel", e => { e.preventDefault(); setZoom(zoomNow() + (e.deltaY < 0 ? 5 : -5)); }, { passive: false });
        zoomInput.addEventListener("dblclick", () => { setZoom(ZOOM_DEFAULT); zoomInput.value = String(zoomNow()); zoomInput.select(); });
        const stripRow = el("div", { className: "bt-lz-striprow" });
        stripRow.append(tabStrip, zoomBox);
        root.append(head, stripRow, bar, view, menuBox);

        const isUrl = t => /^https?:\/\//i.test(t) || (!/\s/.test(t) && /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(t)) || /^localhost(:\d+)?(\/.*)?$/.test(t);
        const toUrl = t => (/^https?:\/\//i.test(t) ? t : /^localhost/.test(t) ? `http://${t}` : `https://${t}`);
        const host = url => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url || ""; } };
        const clean = e => String(e?.message || e).replace(/^Error invoking remote method '[^']+': (Error: )?/, "");
        function submit(text) {
            const t = String(text || "").trim();
            if (!t) return;
            if (isUrl(t)) openPage(toUrl(t));
            else runSearch(t, 0);
        }
        function setMode(m) {
            if (m !== "page" && typeof screenCtx !== "undefined") { screenCtx.clearRect(0, 0, screen.width, screen.height); shownTab = null; }
            mode = m;
            startPane.hidden = m !== "start";
            resultsPane.hidden = m !== "results";
            pagePane.hidden = m !== "page";
            render();
        }
        async function openPage(url, inNewTab = false) {
            const fresh = inNewTab || pendingNew || !tabs.length;
            pendingNew = false;
            pageMsg.replaceChildren();
            page.failed = false;
            setMode("page");
            Object.assign(page, { open: true, loading: true, url, title: "", blocked: fresh ? 0 : page.blocked });
            favicon = "";
            render();
            try {
                applyState(await api.lazy.open(url, fresh));
            } catch (error) {
                pageMessage(clean(error));
            }
            render();
        }
        function applyState(st) {
            if (!st) return;
            if (Array.isArray(st.tabs)) tabs = st.tabs;
            if ("active" in st) activeTab = st.active;
            for (const k of ["open", "url", "title", "loading", "canBack", "canForward", "blocked"]) if (k in st) page[k] = st[k];
            if ("favicon" in st) favicon = st.favicon || "";
            if (!tabs.length && mode === "page" && !pendingNew) setMode("start");
        }
        function newTab() {
            pendingNew = true;
            search = null;
            resultsPane.replaceChildren();
            setMode("start");
            drawTabs();
            setTimeout(() => bigInput.focus(), 0);
        }
        async function switchTab(id) {
            pendingNew = false;
            if (id === activeTab && mode === "page") return;
            applyState(await api.lazy.tab("switch", id).catch(() => null));
            page.failed = false;
            pageMsg.replaceChildren();
            setMode("page");
        }
        async function closeTab(id) {
            const wasActive = id === activeTab;
            applyState(await api.lazy.tab("close", id).catch(() => null));
            if (!tabs.length) { if (!pendingNew) setMode("start"); }
            else if (wasActive && !pendingNew) { page.failed = false; pageMsg.replaceChildren(); setMode("page"); }
            render();
        }
        function closePending() {
            pendingNew = false;
            setMode(tabs.length ? "page" : "start");
        }
        const tabPill = ({ id, label, icon, loading, active, onClose, onClick }) => {
            const t = el("div", { className: `bt-lz-tab${active ? " bt-lz-on" : ""}${loading ? " bt-lz-busy" : ""}`, title: label });
            const ic = el("span", { className: "bt-lz-tabicon" });
            if (icon) {
                const img = el("img", { src: icon, alt: "" });
                img.onerror = () => { ic.innerHTML = lzIcon("globe", 12); };
                ic.append(img);
            } else ic.innerHTML = lzIcon("globe", 12);
            const x = el("button", { className: "bt-lz-tabx", type: "button", title: "Close tab", innerHTML: lzIcon("stop", 11) });
            x.onclick = e => { e.stopPropagation(); onClose(); };
            t.append(ic, el("span", { className: "bt-lz-tabtitle", textContent: label }), x);
            t.onclick = onClick;
            t.onauxclick = e => { if (e.button === 1) { e.preventDefault(); onClose(); } };
            if (id != null) t.dataset.id = id;
            return t;
        };
        function drawTabs() {
            const pills = tabs.map(t => tabPill({
                id: t.id,
                label: t.title || host(t.url) || "New tab",
                icon: t.favicon,
                loading: t.loading,
                active: !pendingNew && t.id === activeTab && mode !== "start",
                onClose: () => closeTab(t.id),
                onClick: () => switchTab(t.id),
            }));
            if (pendingNew || !tabs.length) {
                pills.push(tabPill({
                    label: mode === "results" && search ? search.query : "New tab",
                    icon: "", loading: false, active: true,
                    onClose: () => closePending(),
                    onClick: () => {},
                }));
            }
            tabStrip.replaceChildren(...pills, newTabBtn);
            tabStrip.querySelector(".bt-lz-on")?.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
        function goBack() {
            if (mode === "page" && page.canBack) return api.lazy.nav("back");
            if (mode === "page" && search) return setMode("results");
            if (mode !== "start") setMode("start");
        }
        const pageMessage = text => {
            pageMsg.replaceChildren(el("div", { textContent: text }));
            page.failed = true;
        };

        async function runSearch(query, pageNo, kind = search?.query === query ? search.kind || "all" : "all") {
            const my = ++searchSeq;
            const same = search?.query === query && search?.kind === kind;
            const keep = pageNo > 0 && same ? search.results : [];
            const summary = same && pageNo > 0 ? search.summary : kind === "all" ? undefined : search?.query === query ? search.summary : undefined;
            search = { query, kind, page: pageNo, results: keep, images: [], summary, loading: true, error: "", more: false };
            setMode("results");
            drawResults(pageNo === 0);
            try {
                const r = await api.lazy.search(query, pageNo, kind === "images" ? "images" : "web");
                if (my !== searchSeq) return;
                if (r.verifyUrl) {
                    search.loading = false;
                    search.error = "The search engine wants to check you're human first. Do that in the page, then search again.";
                    openPage(r.verifyUrl);
                    return;
                }
                if (kind === "images") {
                    search.images = r.images || [];
                    search.loading = false;
                    search.error = search.images.length ? "" : "No images.";
                } else {
                    search.results = [...keep, ...r.results.filter(x => !keep.some(k => k.url === x.url))];
                    search.more = r.results.length >= 8 && pageNo < 9;
                    search.loading = false;
                    search.error = search.results.length ? "" : "No results.";
                    if (pageNo === 0 && search.summary === undefined && api.settings.summary !== false) {
                        search.summary = null;
                        const forSearch = search;
                        api.lazy.summary(query).then(sum => {
                            if (search !== forSearch) return;
                            forSearch.summary = sum || false;
                            if (mode === "results") drawResults(false);
                        }).catch(() => { forSearch.summary = false; });
                    }
                }
            } catch (error) {
                if (my !== searchSeq) return;
                search.loading = false;
                search.error = `Search failed: ${clean(error)}`;
            }
            drawResults(false);
            render();
        }
        function drawResults(toTop) {
            const scroll = resultsPane.scrollTop;
            resultsPane.replaceChildren();
            if (!search) return;
            const list = el("div", { className: "bt-lz-results" });
            const kinds = el("div", { className: "bt-lz-chips bt-lz-kinds" });
            for (const [k, label] of [["all", "All"], ["images", "Images"]]) {
                const c = el("button", { type: "button", textContent: label, className: search.kind === k ? "bt-lz-on" : "" });
                c.onclick = () => { if (search.kind !== k) runSearch(search.query, 0, k); };
                kinds.append(c);
            }
            list.append(kinds);
            if (search.kind !== "images" && api.settings.summary !== false && (search.summary || search.summary === null) && !search.page) {
                const card = el("div", { className: "bt-lz-summary" });
                const head = el("div", { className: "bt-lz-sumhead" });
                head.append(el("span", { innerHTML: lzIcon("spark", 13) }), el("span", { textContent: search.summary?.kind === "info" ? search.summary.title || "Summary" : "Summary" }));
                card.append(head);
                if (search.summary === null) {
                    card.append(el("div", { className: "bt-lz-sumwait" }));
                } else {
                    if (search.summary.sub) card.append(el("div", { className: "bt-lz-sumsub", textContent: search.summary.sub }));
                    const body = el("div", { className: "bt-lz-sumtext", textContent: search.summary.text });
                    card.append(body);
                    if (search.summary.text.length > 260) {
                        const more = el("button", { type: "button", className: "bt-lz-summore", textContent: "Show more" });
                        more.onclick = () => { const open = card.classList.toggle("bt-lz-open"); more.textContent = open ? "Show less" : "Show more"; };
                        card.append(more);
                    }
                }
                list.append(card);
            }
            if (search.kind === "images" && search.images.length) {
                const grid = el("div", { className: "bt-lz-images" });
                for (const im of search.images) {
                    const cell = el("div", { className: "bt-lz-image", title: `${im.title}\n${im.site}` });
                    const img = el("img", { src: im.thumb, alt: im.title, loading: "lazy" });
                    img.onerror = () => cell.remove();
                    cell.append(img, el("span", { textContent: im.site || host(im.full) }));
                    cell.onclick = () => openPage(im.full, true);
                    cell.oncontextmenu = e => {
                        e.preventDefault();
                        showMenu(e, [
                            { label: "Open image in a new tab", action: () => openPage(im.full, true) },
                            { label: "Open the site", action: () => openPage(`https://${im.site || host(im.full)}/`, true) },
                            { label: "Copy image address", action: () => { api.copy(im.full); api.toast("Image address copied"); } },
                        ]);
                    };
                    grid.append(cell);
                }
                list.append(grid);
            }
            if (search.kind !== "images" && search.results.length) list.append(el("div", { className: "bt-lz-rhead", textContent: `Results for “${search.query}”` }));
            for (const r of search.results) {
                const row = el("div", { className: "bt-lz-result", title: r.url });
                const site = el("div", { className: "bt-lz-rsite" });
                const globe = () => el("span", { innerHTML: lzIcon("globe", 14) });
                if (r.icon) {
                    const img = el("img", { src: r.icon, alt: "", loading: "lazy" });
                    img.onerror = () => img.replaceWith(globe());
                    site.append(img);
                } else site.append(globe());
                const name = (r.site || "").split(/\s+(?=\S+\.\S+)/)[0] || host(r.url);
                site.append(el("span", { textContent: name === host(r.url) ? name : `${name} · ${host(r.url)}` }));
                row.append(site, el("div", { className: "bt-lz-rtitle", textContent: r.title }));
                if (r.desc) row.append(el("div", { className: "bt-lz-rdesc", textContent: r.desc }));
                row.onclick = () => openPage(r.url);
                row.onauxclick = e => { if (e.button === 1) { e.preventDefault(); openPage(r.url, true); } };
                list.append(row);
            }
            if (search.loading) {
                const m = el("div", { className: "bt-lz-msg" });
                m.append(el("div", { className: "bt-lz-spin" }), el("div", { textContent: search.page > 0 ? "Loading more…" : search.kind === "images" ? "Finding images…" : "Searching…" }));
                list.append(m);
            } else if (search.error) {
                const m = el("div", { className: "bt-lz-msg" });
                const again = el("button", { className: "bt-lz-more", type: "button", textContent: "Try again" });
                again.onclick = () => runSearch(search.query, 0, search.kind);
                m.append(el("div", { textContent: search.error }), again);
                list.append(m);
            } else if (search.more && search.kind !== "images") {
                const more = el("button", { className: "bt-lz-more", type: "button", textContent: "More results" });
                more.onclick = () => runSearch(search.query, search.page + 1);
                list.append(more);
            }
            resultsPane.append(list);
            resultsPane.scrollTop = toTop ? 0 : scroll;
        }

        const suggestBox = el("div", { className: "bt-lz-suggest" });
        suggestBox.hidden = true;
        root.append(suggestBox);
        let suggestFor = null, suggestTimer = null, suggestSeq = 0, suggestions = [], suggestSel = -1;
        const hideSuggest = () => { suggestBox.hidden = true; suggestions = []; suggestSel = -1; suggestFor = null; };
        const placeSuggest = input => {
            const r = input.getBoundingClientRect(), rr = root.getBoundingClientRect();
            suggestBox.style.left = `${r.left - rr.left}px`;
            suggestBox.style.top = `${r.bottom - rr.top + 4}px`;
            suggestBox.style.width = `${r.width}px`;
        };
        const drawSuggest = () => {
            suggestBox.replaceChildren(...suggestions.map((text, i) => {
                const row = el("div", { className: `bt-lz-sugg${i === suggestSel ? " bt-lz-sel" : ""}` });
                row.append(el("span", { innerHTML: lzIcon(isUrl(text) ? "globe" : "search", 13) }), el("span", { textContent: text }));
                row.onmousedown = e => { e.preventDefault(); const inp = suggestFor; hideSuggest(); inp?.blur(); if (inp === bigInput) bigInput.value = ""; submit(text); };
                return row;
            }));
            suggestBox.hidden = !suggestions.length;
        };
        const askSuggest = input => {
            clearTimeout(suggestTimer);
            const q = input.value.trim();
            if (api.settings.suggestions === false || !q || isUrl(q)) return hideSuggest();
            suggestTimer = setTimeout(async () => {
                const my = ++suggestSeq;
                const list = await api.lazy.suggest(q).catch(() => []);
                if (my !== suggestSeq || document.activeElement !== input) return;
                suggestFor = input;
                suggestions = list;
                suggestSel = -1;
                placeSuggest(input);
                drawSuggest();
            }, 140);
        };

        for (const input of [addr, bigInput]) {
            for (const type of ["keyup", "keypress"]) input.addEventListener(type, e => e.stopPropagation());
            input.addEventListener("input", () => askSuggest(input));
            input.addEventListener("blur", () => setTimeout(hideSuggest, 120));
            input.addEventListener("keydown", e => {
                e.stopPropagation();
                if ((e.key === "ArrowDown" || e.key === "ArrowUp") && suggestions.length && suggestFor === input) {
                    e.preventDefault();
                    if (e.key === "ArrowDown") suggestSel = suggestSel + 1 >= suggestions.length ? -1 : suggestSel + 1;
                    else suggestSel = suggestSel - 1 < -1 ? suggestions.length - 1 : suggestSel - 1;
                    drawSuggest();
                    return;
                }
                if (e.key === "Enter") {
                    e.preventDefault();
                    const v = suggestSel >= 0 && suggestFor === input ? suggestions[suggestSel] : input.value;
                    hideSuggest();
                    input.blur();
                    if (input === bigInput) bigInput.value = "";
                    submit(v);
                } else if (e.key === "Escape") { hideSuggest(); input.blur(); render(); }
            });
        }
        addr.addEventListener("focus", () => addr.select());
        const onPasteFirst = e => { if (e.target === addr || e.target === bigInput) e.stopImmediatePropagation(); };
        window.addEventListener("paste", onPasteFirst, true);

        api.lazy.onEvent(data => {
            if (stopped || !data) return;
            if ("favicon" in data) favicon = data.favicon || "";
            if (data.error) { if (!/ERR_BLOCKED_BY_CLIENT/.test(data.error)) pageMessage(`Couldn't open this page: ${data.error}`); }
            else if ("url" in data) { page.failed = false; pageMsg.replaceChildren(); }
            applyState(data);
            if (data.url && api.settings.rememberLast !== false) api.storage.set("last", data.url).catch(() => {});
            if (data.title && page.url && mode === "page") remember(page.url, data.title);
            render();
        });

        function applyColors() {
            const set = api.settings.palette === "custom"
                ? [api.settings.colorBg, api.settings.colorCard, api.settings.colorAccent, api.settings.colorText]
                : LZ_PALETTES[api.settings.palette] || LZ_PALETTES.brown;
            const [bg, card, accent, text] = set.map((c, i) => (lzHex(c) ? c : LZ_PALETTES.brown[i]));
            const v = {
                "--lz-bg": bg, "--lz-bg2": lzMix(bg, card, 0.35), "--lz-card": lzMix(bg, card, 0.6), "--lz-card2": card,
                "--lz-line": lzRgba(text, 0.12), "--lz-text": text, "--lz-muted": lzMix(text, bg, 0.38), "--lz-desc": lzMix(text, bg, 0.18),
                "--lz-accent": accent, "--lz-accent2": lzMix(accent, "#ffffff", 0.35), "--lz-link": lzMix(accent, text, 0.45),
                "--lz-accent-a15": lzRgba(accent, 0.15), "--lz-accent-a22": lzRgba(accent, 0.22), "--lz-accent-a50": lzRgba(accent, 0.5),
                "--lz-hover": lzRgba(text, 0.08), "--lz-on-accent": lzMix(bg, "#000000", 0.4),
            };
            for (const [k, val] of Object.entries(v)) root.style.setProperty(k, val);
        }
        function render() {
            applyColors();
            drawTabs();
            drawZoom();
            const blocking = shieldsLevel !== "off";
            title.replaceChildren();
            if (mode === "page" && favicon) {
                const img = el("img", { src: favicon, alt: "" });
                img.onerror = () => img.remove();
                title.append(img);
            }
            const label = mode === "page" ? (page.title || host(page.url) || "Loading…") : mode === "results" && search ? search.query : "Lazy";
            title.append(el("span", { textContent: label }));
            title.title = mode === "page" ? page.url : "";
            badge.innerHTML = lzIcon("shield", 11);
            badge.append(document.createTextNode(blocking ? String(page.blocked || 0) : "off"));
            badge.classList.toggle("bt-lz-off", !blocking);
            badge.title = blocking ? `Shields up (${shieldsLevel}): ${page.blocked || 0} ads and trackers blocked on this page. Click to turn Shields off.` : "Shields are off. Click to turn them on.";
            backBtn.disabled = mode === "start";
            fwdBtn.disabled = !(mode === "page" && page.canForward);
            const loading = (mode === "page" && page.loading) || (mode === "results" && search?.loading);
            reloadBtn.innerHTML = lzIcon(loading && mode === "page" ? "stop" : "reload");
            reloadBtn.title = loading && mode === "page" ? "Stop" : "Reload";
            reloadBtn.disabled = mode === "start";
            resultsBtn.hidden = !(mode === "page" && search?.results?.length);
            if (document.activeElement !== addr) addr.value = mode === "page" ? page.url : mode === "results" && search ? search.query : "";
            root.classList.toggle("bt-lz-loading", !!loading);
            view.style.height = `${Math.max(220, Math.min(700, Number(api.settings.height) || 380))}px`;
        }

        function setCollapsed(on, save = true) {
            collapsed = !!on;
            root.classList.toggle("bt-lz-collapsed", collapsed);
            chevronBtn.title = collapsed ? "Expand" : "Collapse";
            chevronBtn.setAttribute("aria-expanded", String(!collapsed));
            if (save) api.storage.set("collapsed", collapsed).catch(() => {});
        }

        let shownTab = null;
        let decoding = false, pendingFrame = null;
        const drawFrame = async f => {
            if (decoding) { pendingFrame = f; return; }
            decoding = true;
            try {
                const bmp = await createImageBitmap(new Blob([f.data], { type: "image/jpeg" }));
                if (f.id === activeTab && mode === "page") {
                    if (screen.width !== bmp.width || screen.height !== bmp.height) { screen.width = bmp.width; screen.height = bmp.height; }
                    screenCtx.drawImage(bmp, 0, 0);
                    shownTab = f.id;
                }
                bmp.close?.();
            } catch {}
            decoding = false;
            if (pendingFrame) { const next = pendingFrame; pendingFrame = null; drawFrame(next); }
        };
        api.lazy.onFrame(f => { if (!stopped) drawFrame(f); });

        let lastVp = "";
        const reportViewport = () => {
            if (stopped) return;
            const r = pagePane.getBoundingClientRect();
            const visible = mode === "page" && page.open && !page.failed && !collapsed && view.isConnected && r.width > 20 && r.height > 20;
            const vp = { width: Math.round(r.width) || 320, height: Math.round(r.height) || 380, visible };
            const key = `${vp.width}x${vp.height}:${vp.visible}`;
            if (key !== lastVp) { lastVp = key; api.lazy.viewport(vp); }
        };
        const vpTimer = setInterval(reportViewport, 250);
        new ResizeObserver(reportViewport).observe(pagePane);

        const at = e => { const r = screen.getBoundingClientRect(); return { x: Math.round(e.clientX - r.left), y: Math.round(e.clientY - r.top) }; };
        const mods = e => [e.shiftKey && "shift", e.ctrlKey && "control", e.altKey && "alt", e.metaKey && "meta"].filter(Boolean);
        const BUTTONS = ["left", "middle", "right"];
        let moveQueued = null;
        screen.addEventListener("pointerdown", e => {
            e.preventDefault();
            screen.focus({ preventScroll: true });
            screen.setPointerCapture(e.pointerId);
            api.lazy.input({ type: "mouseDown", ...at(e), button: BUTTONS[e.button] || "left", clickCount: e.detail || 1, modifiers: mods(e) });
        });
        screen.addEventListener("pointerup", e => {
            api.lazy.input({ type: "mouseUp", ...at(e), button: BUTTONS[e.button] || "left", clickCount: e.detail || 1, modifiers: mods(e) });
        });
        screen.addEventListener("pointermove", e => {
            const first = !moveQueued;
            moveQueued = { type: "mouseMove", ...at(e), modifiers: mods(e), button: e.buttons & 1 ? "left" : undefined };
            if (first) requestAnimationFrame(() => { if (moveQueued) api.lazy.input(moveQueued); moveQueued = null; });
        });
        screen.addEventListener("pointerleave", e => api.lazy.input({ type: "mouseLeave", ...at(e) }));
        screen.addEventListener("contextmenu", e => e.preventDefault());
        screen.addEventListener("wheel", e => {
            e.preventDefault();
            const k = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 400 : 1;
            api.lazy.input({ type: "mouseWheel", ...at(e), deltaX: -e.deltaX * k, deltaY: -e.deltaY * k, canScroll: true, modifiers: mods(e) });
        }, { passive: false });

        const KEYS = { ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right", " ": "Space", Escape: "Escape", Enter: "Enter",
            Backspace: "Backspace", Delete: "Delete", Tab: "Tab", Home: "Home", End: "End", PageUp: "PageUp", PageDown: "PageDown", Insert: "Insert" };
        const EDIT = { c: "copy", x: "cut", v: "paste", a: "selectAll", z: "undo", y: "redo" };
        for (const type of ["keydown", "keyup", "keypress"]) {
            screen.addEventListener(type, e => {
                e.stopPropagation();
                if (type === "keypress") return;
                e.preventDefault();
                const key = e.key;
                if (type === "keydown" && (e.ctrlKey || e.metaKey) && !e.altKey && EDIT[key.toLowerCase()]) {
                    const cmd = key.toLowerCase() === "z" && e.shiftKey ? "redo" : EDIT[key.toLowerCase()];
                    api.lazy.edit(cmd);
                    return;
                }
                const code = KEYS[key] || (key.length === 1 ? key : /^F\d{1,2}$/.test(key) ? key : null);
                if (!code) return;
                api.lazy.input({ type: type === "keydown" ? "keyDown" : "keyUp", keyCode: code, modifiers: mods(e) });
                if (type === "keydown" && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    if (key.length === 1) api.lazy.input({ type: "char", keyCode: key, modifiers: mods(e) });
                    else if (key === "Enter") api.lazy.input({ type: "char", keyCode: "\r", modifiers: mods(e) });
                }
            });
        }
        const onPasteIntoPage = e => { if (e.target === screen) { e.stopImmediatePropagation(); e.preventDefault(); api.lazy.edit("paste"); } };
        window.addEventListener("paste", onPasteIntoPage, true);

        const CURSORS = { hand: "pointer", ibeam: "text", wait: "wait", progress: "progress", crosshair: "crosshair", move: "move", help: "help",
            "not-allowed": "not-allowed", "col-resize": "col-resize", "row-resize": "row-resize", grab: "grab", grabbing: "grabbing" };
        api.lazy.onEvent(d => { if (d && d.cursor) screen.style.cursor = CURSORS[d.cursor] || "default"; });

        const mount = panels => {
            if (stopped || !panels) return;
            const above = [...panels.querySelectorAll(":scope > .bt-sp, :scope > .bt-yt")].pop();
            if (above ? above.nextElementSibling === root : panels.firstElementChild === root) return;
            if (above) above.after(root);
            else panels.prepend(root);
        };
        api.observe('section[class*="panels_"]', mount);
        const mountTimer = setInterval(() => mount(document.querySelector('section[class*="panels_"]')), 2000);

        const LEVEL_NAMES = { standard: "Standard (ads and trackers)", aggressive: "Aggressive (ads, trackers, cookie banners, annoyances)" };
        async function applyShields(reload, force) {
            shieldsLevel = wantedLevel();
            api.setSetting("shieldStatus", shieldsLevel === "off" ? "Off" : "Loading the filter lists…");
            render();
            try {
                const r = await api.lazy.shields(shieldsLevel, force);
                api.setSetting("shieldStatus", r.level === "off" ? "Off: nothing is blocked" : `Up: ${LEVEL_NAMES[r.level]}`);
            } catch (error) {
                api.setSetting("shieldStatus", `Couldn't load the filter lists: ${clean(error)}`);
            }
            if (reload && mode === "page") api.lazy.nav("reload");
            render();
        }
        this.applyShields = applyShields;
        this.clearData = async () => {
            await api.lazy.clear().catch(() => {});
            api.toast("Lazy's cookies, logins and cache were cleared.");
            if (mode === "page") api.lazy.nav("reload");
        };
        this.refresh = () => render();
        this.applyZoom = () => api.lazy.zoom((Number(api.settings.zoom) || 50) / 100).catch(() => {});
        this.applyZoom();

        setMode("start");
        api.storage.get("collapsed").then(v => { if (v) setCollapsed(true, false); }).catch(() => {});
        applyShields(false).then(async () => {
            const state = await api.lazy.state().catch(() => null);
            if (state?.tabs?.length) { applyState(state); setMode("page"); return; }
            if (api.settings.rememberLast !== false) {
                const last = await api.storage.get("last").catch(() => null);
                if (last && mode === "start") openPage(last);
            }
        });

        api.onDispose(() => {
            stopped = true;
            clearInterval(vpTimer);
            window.removeEventListener("paste", onPasteIntoPage, true);
            clearInterval(mountTimer);
            window.removeEventListener("paste", onPasteFirst, true);
            document.removeEventListener("pointerdown", onDownOutside, true);
            api.lazy.viewport({ width: 320, height: 380, visible: false });
            api.lazy.close().catch(() => {});
            root.remove();
            delete this.applyShields;
            delete this.clearData;
            delete this.refresh;
            delete this.applyZoom;
        });
    },
    onSettingChange(key) {
        if (key === "shields" || key === "shieldsOn") this.applyShields?.(true);
        else if (key === "updateBtn") this.applyShields?.(true, true);
        else if (key === "clearBtn") this.clearData?.();
        else if (key === "zoom") this.applyZoom?.();
        else if (["height", "palette", "colorBg", "colorCard", "colorAccent", "colorText"].includes(key)) this.refresh?.();
    },
});
