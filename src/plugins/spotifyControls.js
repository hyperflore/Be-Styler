const BUILTIN_CLIENT_ID = "";
const BUILTIN_PORT = 8888;

const ICONS = {
    play: ["fill", '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z"/>'],
    pause: ["fill", '<rect x="6" y="4.5" width="4" height="15" rx="1.2"/><rect x="14" y="4.5" width="4" height="15" rx="1.2"/>'],
    prev: ["fill", '<path d="M18.5 5.2v13.6a.8.8 0 0 1-1.25.66L8.6 12.66a.8.8 0 0 1 0-1.32l8.65-6.8a.8.8 0 0 1 1.25.66Z"/><rect x="4.5" y="5" width="2.6" height="14" rx="1.3"/>'],
    next: ["fill", '<path d="M5.5 5.2v13.6a.8.8 0 0 0 1.25.66l8.65-6.8a.8.8 0 0 0 0-1.32L6.75 4.54a.8.8 0 0 0-1.25.66Z"/><rect x="16.9" y="5" width="2.6" height="14" rx="1.3"/>'],
    shuffle: ["line", '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.97a4 4 0 0 0 3.3-1.7l5.45-7.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.97a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.04a4 4 0 0 1-3.3-1.8l-.36-.45"/>'],
    repeat: ["line", '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'],
    repeatOne: ["line", '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/>'],
    heart: ["fill", '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'],
    heartOutline: ["line", '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'],
    volume: ["line", '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.41 7.59A1.4 1.4 0 0 1 5.42 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.42a1.4 1.4 0 0 1 .99.41l3.39 3.39a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.36 18.36a9 9 0 0 0 0-12.73"/>'],
    volumeLow: ["line", '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.41 7.59A1.4 1.4 0 0 1 5.42 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.42a1.4 1.4 0 0 1 .99.41l3.39 3.39a.7.7 0 0 0 1.2-.5z"/><path d="M16 9a5 5 0 0 1 0 6"/>'],
    mute: ["line", '<path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.41 7.59A1.4 1.4 0 0 1 5.42 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.42a1.4 1.4 0 0 1 .99.41l3.39 3.39a.7.7 0 0 0 1.2-.5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>'],
    lyrics: ["line", '<path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/>'],
    library: ["line", '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>'],
    plus: ["line", '<path d="M5 12h14"/><path d="M12 5v14"/>'],
    back: ["line", '<path d="m15 18-6-6 6-6"/>'],
    chevron: ["line", '<path d="m6 9 6 6 6-6"/>'],
    device: ["line", '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>'],
    spotify: ["path", '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.4a.6.6 0 0 1-.9.2c-2.4-1.5-5.4-1.8-8.9-1a.6.6 0 1 1-.3-1.2c3.9-.9 7.2-.5 9.9 1.1.3.2.4.6.2.9Zm1.2-2.8a.8.8 0 0 1-1.1.3c-2.7-1.7-6.9-2.2-10.2-1.2a.8.8 0 1 1-.5-1.5c3.7-1.1 8.3-.6 11.5 1.3.4.2.5.7.3 1.1Zm.1-2.9C14.7 8.8 9.4 8.6 6.3 9.5a1 1 0 1 1-.6-1.8c3.5-1.1 9.4-.9 13.1 1.3a1 1 0 0 1-.9 1.7Z"/>'],
};
const icon = (name, size = 18) => {
    const [kind, inner] = ICONS[name];
    const paint = kind === "fill" ? 'fill="currentColor" stroke="currentColor" stroke-width="1.5"'
        : kind === "line" ? 'fill="none" stroke="currentColor" stroke-width="2"' : "";
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" ${paint} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
};
const fmtTime = ms => {
    const t = Math.max(0, Math.floor((ms || 0) / 1000));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

BThemer.definePlugin({
    id: "spotifyControls",
    name: "Spotify Controls",
    description: "Control Spotify from Discord: a player above your user panel. Press \"Log in with Spotify\" and approve in your browser. Controls need Spotify Premium.",
    author: "Be Themer",
    version: "1.0.0",
    settings: {
        loginStatus: { type: "info", label: "Spotify account (for Liked Songs and playlists)", default: "Not logged in" },
        loginBtn: { type: "button", label: "Log in to Spotify", text: "Log in", description: "Opens Spotify's login page in a small window. Playback keeps using Discord's Spotify link." },
        logoutBtn: { type: "button", label: "Log out of Spotify", text: "Log out" },
        keepTray: { type: "toggle", label: "Keep Spotify running in the tray (restarts it minimised if closed)", default: true },
        hideWhenIdle: { type: "toggle", label: "Hide the player when nothing is playing", default: false },
        showSearch: { type: "toggle", label: "Show song search", default: true },
    },
    css: `
        .bt-sp { position: relative; padding: 10px 10px 8px; border-bottom: 1px solid var(--background-modifier-accent, rgb(78 80 88 / .48));
            color: var(--text-normal, #dbdee1); font: 14px/1.25 var(--font-primary, "gg sans", sans-serif); user-select: none; }
        .bt-sp[hidden], .bt-sp [hidden] { display: none !important; }
        .bt-sp-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .bt-sp-chevron svg { transition: transform .2s ease; transform: rotate(180deg); }
        .bt-sp-collapsed .bt-sp-chevron svg { transform: rotate(0deg); }
        .bt-sp .bt-sp-mini-play { display: none; width: 30px !important; height: 30px !important; border-radius: 50% !important;
            background: var(--interactive-active, #f2f3f5); color: #111214; }
        .bt-sp .bt-sp-mini-play:hover { background: #fff; color: #000; }
        .bt-sp-minibar { display: none; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: rgb(255 255 255 / .08); }
        .bt-sp-minifill { height: 100%; width: 0; background: #1ed760; transition: width .5s linear; }
        /* collapsed: one compact row */
        .bt-sp.bt-sp-collapsed { padding: 6px 8px 8px; }
        .bt-sp-collapsed .bt-sp-progress, .bt-sp-collapsed .bt-sp-controls, .bt-sp-collapsed .bt-sp-volrow,
        .bt-sp-collapsed .bt-sp-searchbox, .bt-sp-collapsed .bt-sp-devrow,
        .bt-sp-collapsed .bt-sp-like, .bt-sp-collapsed .bt-sp-main > .bt-sp-btn:not(.bt-sp-chevron):not(.bt-sp-mini-play) { display: none !important; }
        .bt-sp-collapsed .bt-sp-art { width: 32px; height: 32px; border-radius: 4px; }
        .bt-sp-collapsed .bt-sp-main { gap: 8px; }
        .bt-sp-collapsed .bt-sp-title { font-size: 13px; }
        .bt-sp.bt-sp-collapsed .bt-sp-mini-play { display: grid; }
        .bt-sp-collapsed .bt-sp-minibar { display: block; }
        .bt-sp-art { width: 44px; height: 44px; flex: none; border-radius: 6px; background: var(--background-modifier-accent, #3f4147) center / cover;
            box-shadow: 0 2px 6px rgb(0 0 0 / .3); cursor: pointer; display: grid; place-items: center; color: #1ed760; }
        .bt-sp-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
        .bt-sp-title, .bt-sp-artist { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-sp-title { color: var(--header-primary, var(--text-strong, #f2f3f5)); font-weight: 600; font-size: 14px; }
        .bt-sp-artist { color: var(--text-muted, #949ba4); font-size: 12px; }
        .bt-sp-title a, .bt-sp-artist a { color: inherit; text-decoration: none; cursor: pointer; }
        .bt-sp-title a:hover, .bt-sp-artist a:hover { text-decoration: underline; color: var(--header-primary, #f2f3f5); }
        .bt-sp-btn { display: grid; place-items: center; width: 34px; height: 34px; flex: none; border: 0; border-radius: 50%; padding: 0; transition: background .12s, color .12s, transform .08s;
            background: none; color: var(--interactive-normal, #b5bac1); cursor: pointer; position: relative; }
        .bt-sp-btn:hover { background: var(--background-modifier-hover, rgb(78 80 88 / .3)); color: var(--interactive-hover, #dbdee1); }
        .bt-sp-btn:disabled { opacity: .4; cursor: not-allowed; background: none; }
        .bt-sp-btn.bt-sp-on { color: #1ed760; }
        .bt-sp-btn.bt-sp-on::after { content: ""; position: absolute; bottom: 3px; left: 50%; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: currentColor; }

        .bt-sp .bt-sp-play { width: 34px !important; height: 34px !important; min-width: 34px; padding: 0 !important; border-radius: 50% !important;
            display: grid; place-items: center; align-self: center; background: var(--interactive-active, #f2f3f5); color: #111214;
            box-shadow: 0 2px 6px rgb(0 0 0 / .3); line-height: 0; }
        .bt-sp .bt-sp-play svg { display: block; }
        .bt-sp .bt-sp-play:hover { background: #fff; color: #000; transform: scale(1.06); }
        .bt-sp-like.bt-sp-on { color: #1ed760; }
        .bt-sp-progress { display: flex; align-items: center; gap: 8px; margin: 8px 0 2px; font: 11px var(--font-code, Consolas, monospace); color: var(--text-muted, #949ba4); font-variant-numeric: tabular-nums; }
        .bt-sp-bar, .bt-sp-vol { flex: 1; position: relative; height: 12px; cursor: pointer; touch-action: none; }
        .bt-sp-bar::before, .bt-sp-vol::before { content: ""; position: absolute; left: 0; right: 0; top: 4px; height: 4px; border-radius: 2px; background: rgb(255 255 255 / .16); }
        .bt-sp-fill { position: absolute; left: 0; top: 4px; height: 4px; border-radius: 2px; background: var(--interactive-normal, #b5bac1); pointer-events: none; }
        .bt-sp-bar:hover .bt-sp-fill, .bt-sp-vol:hover .bt-sp-fill, .bt-sp-dragging .bt-sp-fill { background: #1ed760; }
        .bt-sp-knob { position: absolute; top: 1px; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgb(0 0 0 / .4);
            opacity: 0; transition: opacity .1s; pointer-events: none; }
        .bt-sp-bar:hover .bt-sp-knob, .bt-sp-vol:hover .bt-sp-knob, .bt-sp-dragging .bt-sp-knob { opacity: 1; }
        .bt-sp-controls { display: grid; grid-template-columns: repeat(5, 1fr); align-items: center; justify-items: center; margin: 2px 0; }
        .bt-sp .bt-sp-btn { border-radius: 50% !important; }
        .bt-sp-volrow { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
        .bt-sp-devrow { display: flex; align-items: center; gap: 4px; min-width: 0; }
        .bt-sp-devrow .bt-sp-btn { width: 26px; height: 26px; }
        .bt-sp-btn:active:not(:disabled) { transform: scale(.92); }
        .bt-sp-volbox { display: flex; align-items: center; gap: 6px; width: 100%; min-width: 0; }
        .bt-sp-volbox .bt-sp-vol { flex: 1; min-width: 60px; }
        .bt-sp-vol .bt-sp-fill { background: #1ed760; }
        .bt-sp-volbox.bt-sp-disabled { opacity: .6; pointer-events: none; }
        .bt-sp-volbox[hidden] { display: none; }
        .bt-sp-volpct { width: 32px; flex: none; text-align: right; font: 11px var(--font-code, Consolas, monospace); color: var(--text-muted, #949ba4); font-variant-numeric: tabular-nums; }
        .bt-sp-searchbox { position: relative; margin: 6px 0 4px; }
        .bt-sp-searchbox[hidden] { display: none; }
        .bt-sp-search { width: 100%; box-sizing: border-box; height: 28px; padding: 0 10px; border: 1px solid transparent; border-radius: 6px; outline: none;
            background: var(--input-background, var(--background-tertiary, #1e1f22)); color: var(--text-normal, #dbdee1); font: 13px var(--font-primary, sans-serif); }
        .bt-sp-search:focus { border-color: #1ed760; }
        .bt-sp-search::placeholder { color: var(--text-muted, #949ba4); }
        .bt-sp-results { margin-top: 4px; max-height: 240px; overflow-y: auto; border-radius: 6px; background: #111214; border: 1px solid rgb(255 255 255 / .06); }
        .bt-sp-results[hidden] { display: none; }
        .bt-sp-result { display: flex; align-items: center; gap: 8px; padding: 5px 6px; cursor: pointer; }
        .bt-sp-result:hover, .bt-sp-result.bt-sp-sel { background: var(--background-modifier-hover, rgb(78 80 88 / .3)); }
        .bt-sp-result-art { width: 32px; height: 32px; flex: none; border-radius: 4px; background: #2b2d31 center / cover; }
        .bt-sp-result-text { flex: 1; min-width: 0; }
        .bt-sp-result-title, .bt-sp-result-artist { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-sp-result-title { font-size: 13px; font-weight: 600; color: var(--header-primary, #f2f3f5); }
        .bt-sp-result-artist { font-size: 11px; color: var(--text-muted, #949ba4); }
        .bt-sp-result-time { font: 11px var(--font-code, Consolas, monospace); color: var(--text-muted, #949ba4); }
        .bt-sp-queue { width: 24px; height: 24px; font: 700 16px/1 var(--font-primary, sans-serif); }
        .bt-sp-device { flex: 1; min-width: 0; text-align: right; font-size: 11px; color: #1ed760; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-sp-empty { display: flex; align-items: center; gap: 10px; }
        .bt-sp-empty-text { flex: 1; min-width: 0; font-size: 12px; color: var(--text-muted, #949ba4); }
        .bt-sp-upgrade { flex: none; border: 0; padding: 2px 8px; border-radius: 999px; background: rgb(30 215 96 / .15); color: #1ed760;
            font: 600 11px var(--font-primary, sans-serif); cursor: pointer; }
        .bt-sp-upgrade:hover { background: rgb(30 215 96 / .28); }
        .bt-sp-lib-title { flex: 1; min-width: 0; font-weight: 700; color: var(--header-primary, #f2f3f5); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-sp-lib-tabs { display: flex; gap: 6px; }
        .bt-sp-lib-tabs button { border: 0; padding: 4px 12px; border-radius: 999px; cursor: pointer; background: rgb(255 255 255 / .07);
            color: var(--text-normal, #dbdee1); font: 600 12px var(--font-primary, sans-serif); }
        .bt-sp-lib-tabs button:hover { background: rgb(255 255 255 / .12); }
        .bt-sp-lib-tabs button.bt-sp-on { background: #1ed760; color: #000; }
        .bt-sp-lib-body { height: 260px; overflow-y: auto; scrollbar-width: thin; display: flex; flex-direction: column; gap: 1px; }
        .bt-sp-lib-body .bt-sp-result { border-radius: 6px; }
        .bt-sp-lib-login { align-self: center; }
        .bt-sp-lyrics { display: flex; flex-direction: column; gap: 8px; }
        .bt-sp-ly-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .bt-sp-ly-head .bt-sp-btn { width: 30px; height: 30px; }
        .bt-sp-ly-art { width: 34px; height: 34px; flex: none; border-radius: 6px; background: var(--background-modifier-accent, #3f4147) center / cover; }
        .bt-sp-ly-play { background: var(--interactive-active, #f2f3f5); color: #111214; }
        .bt-sp-ly-play:hover { background: #fff; color: #000; }
        .bt-sp-ly-body { height: 230px; overflow-y: auto; padding: 4px 2px 40px; scrollbar-width: thin; scroll-behavior: smooth;
            mask-image: linear-gradient(transparent, #000 12%, #000 82%, transparent); }
        .bt-sp-ly-line { padding: 4px 6px; border-radius: 6px; font: 600 14px/1.35 var(--font-primary, sans-serif); color: var(--text-muted, #949ba4);
            transition: color .2s, transform .2s; transform-origin: left center; }
        .bt-sp-ly-synced .bt-sp-ly-line { cursor: pointer; }
        .bt-sp-ly-synced .bt-sp-ly-line:hover { background: var(--background-modifier-hover, rgb(78 80 88 / .3)); color: var(--text-normal, #dbdee1); }
        .bt-sp-ly-line.bt-sp-ly-on { color: var(--header-primary, #fff); transform: scale(1.04); }
        .bt-sp-ly-body:not(.bt-sp-ly-synced) .bt-sp-ly-line { color: var(--text-normal, #dbdee1); font-weight: 500; }
        .bt-sp-ly-msg { padding: 40px 8px; text-align: center; color: var(--text-muted, #949ba4); font-size: 13px; }
        .bt-sp-ly-foot { font-size: 10px; text-align: right; color: var(--text-muted, #949ba4); opacity: .7; }
        .bt-sp-art.bt-sp-idle { color: #1ed760; display: grid; place-items: center; }
        .bt-sp-connect { display: flex; align-items: center; gap: 6px; border: 0; border-radius: 999px; padding: 6px 12px; background: #1ed760; color: #000;
            font: 700 12px var(--font-primary, sans-serif); cursor: pointer; flex: none; white-space: nowrap; }
        .bt-sp-connect:disabled { opacity: .6; cursor: progress; }
        .bt-sp-connect:hover { background: #3be477; }
        .bt-sp-menu { position: fixed; z-index: 100002; min-width: 200px; padding: 6px; border-radius: 8px; background: #111214;
            border: 1px solid rgb(255 255 255 / .08); box-shadow: 0 8px 16px rgb(0 0 0 / .3); font: 14px var(--font-primary, sans-serif); }
        .bt-sp-menu-title { padding: 6px 8px; font: 700 11px var(--font-primary, sans-serif); text-transform: uppercase; color: #949ba4; }
        .bt-sp-menu button { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px; border: 0; border-radius: 4px; background: none;
            color: #dbdee1; font: inherit; text-align: left; cursor: pointer; }
        .bt-sp-menu button:hover { background: var(--brand-500, #5865f2); color: #fff; }
        .bt-sp-menu button.bt-sp-on { color: #1ed760; }
        .bt-sp-menu button.bt-sp-on:hover { color: #fff; }
    `,

    start(api) {
        const el = api.el;
        let own = null;
        let discordToken = null;
        let using = null;
        let webLoggedIn = null;
        let webForce = false;
        let linkedKnown = false;
        let connectedEver = false;
        let player = null;
        let liked = null;
        let likedFor = null;
        let fetchedAt = 0;
        let lastError = "";
        let busyUntil = 0;
        let stopped = false;
        let lastToast = { text: "", at: 0 };
        const toastOnce = (text, ms) => {
            if (lastToast.text === text && Date.now() - lastToast.at < 5000) return;
            lastToast = { text, at: Date.now() };
            api.toast(text, ms);
        };
        let pendingPlay = null;
        let pendingVolume = null;
        let discordProblem = "";

        const ready = api.storage.get("auth").then(v => { if (v && v.refreshToken) own = v; }).catch(() => {});
        const saveOwn = () => (own ? api.storage.set("auth", own) : api.storage.delete("auth")).catch(() => {});

        const clientId = () => BUILTIN_CLIENT_ID;
        const callbackPort = () => BUILTIN_PORT;
        const allowOwn = () => !!BUILTIN_CLIENT_ID;
        const allowDiscord = () => true;

        async function ownAccess() {
            if (!allowOwn() || !own || !clientId() || own.clientId !== clientId()) return null;
            if (own.expiresAt - Date.now() > 60_000) return own.accessToken;
            try {
                const t = await api.spotify.refresh(own.clientId, own.refreshToken);
                own = { ...own, ...t };
                saveOwn();
                return own.accessToken;
            } catch (error) {
                api.warn("Spotify token refresh failed", error);
                if (/invalid_grant|revoked/i.test(String(error?.message))) { own = null; saveOwn(); }
                return null;
            }
        }
        async function webAccess() {
            if (webLoggedIn === null) webLoggedIn = await api.spotify.webStatus().catch(() => false);
            if (!webLoggedIn) return null;
            try {
                const t = await api.spotify.webToken(webForce);
                webForce = false;
                return t.accessToken;
            } catch (error) {
                if (/not-logged-in/.test(String(error?.message))) webLoggedIn = false;
                else api.warn("Couldn't get a token from the Spotify login", error);
                return null;
            }
        }
        async function discordAccess() {
            if (!allowDiscord()) return null;
            if (discordToken && discordToken.expiresAt - Date.now() > 60_000) return discordToken.accessToken;
            discordProblem = "";
            const accept = (accessToken, source) => {
                if (typeof accessToken !== "string" || accessToken.length < 20) return null;
                discordToken = { accessToken, expiresAt: Date.now() + 50 * 60_000, source };
                return accessToken;
            };
            try {
                const sp = api.discord.store("SpotifyStore");
                const socket = sp?.getActiveSocketAndDevice?.()?.socket;
                const t = accept(socket?.accessToken, "discord-socket");
                if (t) return t;
                api.spotify.log?.(`discord: no live socket token (store ${sp ? "found" : "missing"}, socket ${socket ? "yes" : "no"})`);
            } catch (error) { api.spotify.log?.(`discord: socket check failed ${error?.message || error}`); }
            const accounts = await spotifyAccounts();
            api.spotify.log?.(`discord: ${accounts.length} linked Spotify account(s)`);
            if (!accounts.length) { discordProblem = "not-linked"; return null; }
            linkedKnown = true;
            for (const account of accounts) {
                try {
                    let res = await api.discord.rest.get(`/users/@me/connections/spotify/${encodeURIComponent(account.id)}/access-token`);
                    if (res && typeof res === "object" && res.body && !res.access_token) res = res.body;
                    const t = accept(res?.access_token, "discord-api");
                    if (t) return t;
                    discordProblem = "no-token";
                    api.spotify.log?.(`discord: access-token answer had no token (${res ? Object.keys(res).join(",") : "empty"})`);
                } catch (error) {
                    api.spotify.log?.(`discord: access-token request failed ${error?.status || ""} ${error?.message || error}`);
                    discordProblem = `Discord refused the Spotify token (${error?.status || error?.message || error}). Try removing and re-adding Spotify in Discord Settings → Connections.`;
                    api.warn("Couldn't get Spotify access from Discord's connection", error);
                }
            }
            return null;
        }
        async function spotifyAccounts() {
            let list = [];
            try {
                const store = api.discord.store("ConnectedAccountsStore");
                const all = store?.getAccounts?.() || [];
                list = (Array.isArray(all) ? all : Object.values(all)).filter(a => a?.type === "spotify");
            } catch {}
            if (!list.length) {
                try {
                    let res = await api.discord.rest.get("/users/@me/connections");
                    if (res && !Array.isArray(res) && Array.isArray(res.body)) res = res.body;
                    list = (Array.isArray(res) ? res : []).filter(a => a?.type === "spotify");
                } catch (error) {
                    api.warn("Couldn't list Discord connections", error);
                }
            }
            return list.filter(a => !a.revoked && a.id);
        }
        const SOURCES = { own: ownAccess, web: webAccess, discord: discordAccess };
        const ORDER = { player: ["own", "discord", "web"], library: ["web", "own", "discord"] };
        const LIBRARY_PATH = /^(me\/(tracks|playlists|albums|following)|playlists\/|users\/|me(\?|$))/;
        async function token(purpose = "player") {
            await ready;
            const order = purpose === "library" && webLoggedIn ? ["web"] : ORDER[purpose];
            for (const src of order) {
                if (Date.now() < coolUntil[src]) continue;
                const t = await SOURCES[src]();
                if (t) {
                    if (purpose === "player") using = src;
                    connectedEver = true;
                    return { t, src };
                }
            }
            if (purpose === "player") using = null;
            return { t: null, src: null };
        }
        const dropToken = src => {
            if (src === "own" && own) own.expiresAt = 0;
            if (src === "web") webForce = true;
            if (src === "discord") discordToken = null;
        };

        const coolUntil = { own: 0, web: 0, discord: 0 };
        async function spotify(method, path, body) {
            const purpose = LIBRARY_PATH.test(path) ? "library" : "player";

            for (let attempt = 0; attempt < 2; attempt++) {
                const { t, src } = await token(purpose);
                if (!t) {
                    if (purpose === "player") lastError = "not-connected";
                    return { status: 0, data: null };
                }
                const res = await api.spotify.request(t, method, path, body, src);
                if (res.status === 429) {
                    const wait = Math.min(300, Math.max(30, Number(res.retryAfter) || 30));
                    coolUntil[src] = Date.now() + wait * 1000;
                    if (method !== "GET") toastOnce(`Spotify is busy; try again in ${wait} seconds.`, 5000);
                    return res;
                }
                if (res.status === 401 && attempt === 0) {
                    dropToken(src);
                    continue;
                }
                if (res.status === 403 && /PREMIUM/i.test(JSON.stringify(res.data || ""))) {
                    lastError = "premium";
                    api.toast("Spotify Premium is needed to control playback.");
                } else if (res.status === 404 && /NO_ACTIVE_DEVICE/i.test(JSON.stringify(res.data || ""))) {
                    api.toast("No active Spotify device. Start Spotify somewhere, or pick a device.");
                } else if (res.status >= 400 && method !== "GET") {
                    const msg = res.data?.error?.message || `HTTP ${res.status}`;
                    if (purpose === "library") {
                        toastOnce(webLoggedIn
                            ? `Spotify refused that (${res.status}: ${msg}).`
                            : "Log in to Spotify in Be Themer → Plugins → Spotify Controls → Settings to use your Liked Songs and playlists.", 7000);
                        return res;
                    }
                    api.toast(/restriction/i.test(msg) ? "Spotify doesn't allow that right now (nothing to skip to on this device)." : `Spotify: ${msg}`);
                }
                return res;
            }
            return { status: 401, data: null };
        }

        async function poll() {
            if (stopped || Date.now() < busyUntil) return;
            const res = await spotify("GET", "me/player?additional_types=episode").catch(error => { api.warn(error); return null; });
            if (!res || stopped) return;
            if (res.status === 200 && res.data && typeof res.data === "object") {
                player = res.data;
                if (pendingPlay) {
                    if (Date.now() > pendingPlay.until || player.is_playing === pendingPlay.value) pendingPlay = null;
                    else player.is_playing = pendingPlay.value;
                }
                if (pendingVolume && player.device) {
                    if (Date.now() > pendingVolume.until || player.device.volume_percent === pendingVolume.value) pendingVolume = null;
                    else player.device.volume_percent = pendingVolume.value;
                }
                lastError = "";
            } else if (res.status === 204 || res.status === 202) {
                player = null;
                lastError = "";
            } else if (res.status === 0) {
                player = null;
            }
            fetchedAt = Date.now();
            const id = player?.item?.id;
            if (id && id !== likedFor && player.item.type === "track") {
                likedFor = id;
                liked = null;
                if (webLoggedIn) api.spotify.like(id, null).then(v => { if (likedFor === id) { liked = !!v; render(); } }).catch(() => { if (likedFor === id) { liked = false; render(); } });
                else { liked = false; render(); }
            }
            render();
        }
        const position = () => {
            if (!player) return 0;
            const p = player.progress_ms || 0;
            return Math.min(player.item?.duration_ms || 0, player.is_playing ? p + (Date.now() - fetchedAt) : p);
        };
        async function command(optimistic, method, path, body) {
            busyUntil = Date.now() + 1500;
            if (player && optimistic) { optimistic(player); fetchedAt = Date.now(); render(); }
            const res = await spotify(method, path, body).catch(error => { api.warn(error); return null; });
            busyUntil = 0;
            setTimeout(poll, 350);
            return res;
        }

        const root = el("div", { className: "bt-sp" });
        const ICON_SIZE = { play: 18, pause: 18, prev: 20, next: 20, shuffle: 17, repeat: 17, heartOutline: 18, volume: 18, device: 16 };
        const btn = (name, title, onClick, extra = "") => {
            const b = el("button", { className: `bt-sp-btn ${extra}`.trim(), type: "button", title, innerHTML: icon(name, ICON_SIZE[name]) });
            b.setAttribute("aria-label", title);
            b.onclick = e => { e.stopPropagation(); onClick(e, b); };
            return b;
        };
        const slider = (cls, onSeek, onInput) => {
            const bar = el("div", { className: cls });
            const fill = el("div", { className: "bt-sp-fill" });
            const knob = el("div", { className: "bt-sp-knob" });
            bar.append(fill, knob);
            bar.set = f => { const pct = `${Math.max(0, Math.min(1, f)) * 100}%`; fill.style.width = pct; knob.style.left = pct; };
            bar.addEventListener("pointerdown", e => {
                e.preventDefault();
                bar.setPointerCapture(e.pointerId);
                bar.classList.add("bt-sp-dragging");
                bar.dragging = true;
                const r = bar.getBoundingClientRect();
                const at = ev => Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
                bar.set(at(e));
                onInput?.(at(e));
                const move = ev => { bar.set(at(ev)); onInput?.(at(ev)); };
                bar.addEventListener("pointermove", move);
                bar.addEventListener("pointerup", ev => {
                    bar.removeEventListener("pointermove", move);
                    bar.classList.remove("bt-sp-dragging");
                    bar.dragging = false;
                    onSeek(at(ev));
                }, { once: true });
            });
            return bar;
        };

        const art = el("div", { className: "bt-sp-art" });
        const title = el("div", { className: "bt-sp-title" });
        const artist = el("div", { className: "bt-sp-artist" });
        const meta = el("div", { className: "bt-sp-meta" });
        meta.append(title, artist);
        const likeBtn = btn("heartOutline", "Save to Liked Songs", () => {
            const id = player?.item?.id;
            if (!id) return;
            const next = !liked;
            liked = next;
            render();
            if (!webLoggedIn) { liked = !next; render(); return api.toast("Log in to Spotify in Be Themer → Plugins → Spotify Controls → Settings to use Liked Songs."); }
            api.spotify.like(id, next).then(v => {
                liked = !!v;
                render();
                libCache.delete("liked:");
                api.toast(v === next ? (next ? "Added to Liked Songs" : "Removed from Liked Songs") : "Spotify didn't take that; try again.");
            }).catch(error => { liked = !next; render(); api.toast(String(error?.message || error).replace(/^Error invoking remote method '[^']+': (Error: )?/, "")); });
        }, "bt-sp-like");
        const main = el("div", { className: "bt-sp-main" });
        const lyricsBtn = btn("lyrics", "Lyrics", () => openLyrics());
        const libraryBtn = btn("library", "Your library: Liked Songs and playlists", () => openLibrary());
        let collapsed = false;
        const miniPlay = btn("play", "Play", () => playBtn.click(), "bt-sp-mini-play");
        const chevronBtn = btn("chevron", "Collapse", () => setCollapsed(!collapsed), "bt-sp-chevron");
        const miniBar = el("div", { className: "bt-sp-minibar" });
        const miniFill = el("div", { className: "bt-sp-minifill" });
        miniBar.append(miniFill);
        function setCollapsed(on, save = true) {
            collapsed = !!on;
            if (collapsed) {
                if (lyricsOpen) closeLyrics();
                if (libraryOpen) { libraryOpen = false; libraryView.hidden = true; }
                clearSearch?.();
            }
            root.classList.toggle("bt-sp-collapsed", collapsed);
            chevronBtn.title = collapsed ? "Expand" : "Collapse";
            chevronBtn.setAttribute("aria-expanded", String(!collapsed));
            if (save) api.storage.set("collapsed", collapsed).catch(() => {});
            render();
        }
        api.storage.get("collapsed").then(v => { if (v) setCollapsed(true, false); }).catch(() => {});
        main.append(art, meta, likeBtn, lyricsBtn, libraryBtn, miniPlay, chevronBtn);

        const elapsed = el("span", { textContent: "0:00" });
        const total = el("span", { textContent: "0:00" });
        const bar = slider("bt-sp-bar", f => {
            const ms = Math.round(f * (player?.item?.duration_ms || 0));
            command(p => { p.progress_ms = ms; }, "PUT", `me/player/seek?position_ms=${ms}`);
        });
        const progress = el("div", { className: "bt-sp-progress" });
        progress.append(elapsed, bar, total);

        const shuffleBtn = btn("shuffle", "Shuffle", () => {
            const next = !player?.shuffle_state;
            command(p => { p.shuffle_state = next; }, "PUT", `me/player/shuffle?state=${next}`);
        });
        async function skip(direction) {
            const id = player?.device?.id || await ensureDevice();
            if (!id) return;
            busyUntil = Date.now() + 1200;
            const r = await spotify("POST", `me/player/${direction}?device_id=${encodeURIComponent(id)}`).catch(error => { api.warn(error); return null; });
            if (r && r.status >= 400) api.warn(`Spotify ${direction} failed`, r.status, r.data);
            busyUntil = 0;
            for (const ms of [300, 900, 1800]) setTimeout(poll, ms);
        }
        const prevBtn = btn("prev", "Previous song", () => skip("previous"));
        async function ensureDevice() {
            if (player?.device?.id) return player.device.id;
            const pick = async () => {
                const r = await spotify("GET", "me/player/devices").catch(() => null);
                const list = r?.status === 200 ? r.data?.devices || [] : [];
                return (list.find(d => d.is_active) || list.find(d => d.type === "Computer") || list[0])?.id || null;
            };
            let id = await pick();
            if (!id) {
                api.toast("Starting Spotify…");
                await api.spotify.launch().catch(() => {});
                for (let i = 0; i < 8 && !id && !stopped; i++) {
                    await new Promise(r => setTimeout(r, 1500));
                    id = await pick();
                }
            }
            if (!id) api.toast("Couldn't find a Spotify device. Open Spotify once, then try again.");
            return id;
        }
        const playBtn = btn("play", "Play", async () => {
            if (!player?.device) {
                const id = await ensureDevice();
                if (id) command(null, "PUT", "me/player", { device_ids: [id], play: true });
                return;
            }
            const playing = !!player?.is_playing;
            pendingPlay = { value: !playing, until: Date.now() + 5000 };
            const res = await command(p => { p.progress_ms = position(); p.is_playing = !playing; }, "PUT", playing ? "me/player/pause" : "me/player/play");
            if (!res || res.status >= 400) { pendingPlay = null; setTimeout(poll, 100); }
        }, "bt-sp-play");
        const nextBtn = btn("next", "Next song", () => skip("next"));
        const REPEAT = ["off", "context", "track"];
        const repeatBtn = btn("repeat", "Repeat", () => {
            const next = REPEAT[(REPEAT.indexOf(player?.repeat_state || "off") + 1) % 3];
            command(p => { p.repeat_state = next; }, "PUT", `me/player/repeat?state=${next}`);
        });
        const controls = el("div", { className: "bt-sp-controls" });
        controls.append(shuffleBtn, prevBtn, playBtn, nextBtn, repeatBtn);

        let volumeBefore = 50;
        const volIcon = v => (v <= 0 ? "mute" : v < 50 ? "volumeLow" : "volume");
        let volTimer = null, volSentAt = 0, volQueued = null;
        const volPct = el("span", { className: "bt-sp-volpct" });
        const sendVolume = v => {
            pendingVolume = { value: v, until: Date.now() + 4000 };
            if (player?.device) player.device.volume_percent = v;
            volPct.textContent = `${v}%`;
            volBtn.innerHTML = icon(volIcon(v), 18);
            volQueued = v;
            const wait = Math.max(0, 200 - (Date.now() - volSentAt));
            clearTimeout(volTimer);
            volTimer = setTimeout(async () => {
                const value = volQueued;
                volQueued = null;
                volSentAt = Date.now();
                busyUntil = Date.now() + 1500;
                const r = await spotify("PUT", `me/player/volume?volume_percent=${value}`).catch(() => null);
                if (r && r.status >= 400 && r.status !== 429) {
                    pendingVolume = null;
                    if (r.status === 403 && !/PREMIUM/i.test(JSON.stringify(r.data || ""))) api.toast("This Spotify device doesn't allow changing its volume.");
                    setTimeout(poll, 300);
                }
            }, wait);
        };
        const volBtn = btn("volume", "Mute", () => {
            const v = player?.device?.volume_percent ?? 0;
            if (v > 0) volumeBefore = v;
            sendVolume(v > 0 ? 0 : volumeBefore || 50);
            vol.set((player?.device?.volume_percent ?? 0) / 100);
        });
        const vol = slider("bt-sp-vol", f => sendVolume(Math.round(f * 100)), f => {
            volPct.textContent = `${Math.round(f * 100)}%`;
        });
        vol.addEventListener("wheel", e => {
            e.preventDefault();
            const v = Math.max(0, Math.min(100, (player?.device?.volume_percent ?? 0) + (e.deltaY < 0 ? 5 : -5)));
            vol.set(v / 100);
            sendVolume(v);
        }, { passive: false });
        const deviceBtn = btn("device", "Devices", (_e, b) => openDevices(b));
        const deviceName = el("div", { className: "bt-sp-device" });
        const volBox = el("div", { className: "bt-sp-volbox" });
        volBox.append(volBtn, vol, volPct);
        const deviceRow = el("div", { className: "bt-sp-devrow" });
        const upgradeBtn = el("button", { className: "bt-sp-upgrade", type: "button", textContent: "Log in for library" });
        upgradeBtn.title = "Log in to Spotify once to use your Liked Songs and playlists here";
        upgradeBtn.onclick = () => login();
        deviceRow.append(deviceName, deviceBtn);
        const volRow = el("div", { className: "bt-sp-volrow" });
        volRow.append(volBox);

        const searchInput = el("input", { className: "bt-sp-search", type: "search", placeholder: "Search songs", spellcheck: false });
        const searchResults = el("div", { className: "bt-sp-results" });
        searchResults.hidden = true;
        const searchBox = el("div", { className: "bt-sp-searchbox" });
        searchBox.append(searchInput, searchResults);
        let searchTimer = null, searchSeq = 0, results = [], selected = 0;
        const clearSearch = () => { searchInput.value = ""; results = []; searchResults.replaceChildren(); searchResults.hidden = true; };
        const playTrack = async track => {
            clearSearch();
            const id = player?.device?.id || await ensureDevice();
            if (!id) return;
            const body = track.album?.uri ? { context_uri: track.album.uri, offset: { uri: track.uri } } : { uris: [track.uri] };
            command(p => { p.item = track; p.progress_ms = 0; p.is_playing = true; }, "PUT", `me/player/play?device_id=${encodeURIComponent(id)}`, body);
        };
        const queueTrack = async track => {
            const r = await spotify("POST", `me/player/queue?uri=${encodeURIComponent(track.uri)}`).catch(() => null);
            if (r && r.status < 300) api.toast(`Added to queue: ${track.name}`);
        };
        const showResults = () => {
            searchResults.replaceChildren();
            searchResults.hidden = !results.length;
            results.forEach((t, i) => {
                const row = el("div", { className: `bt-sp-result${i === selected ? " bt-sp-sel" : ""}`, title: "Click to play" });
                const img = el("div", { className: "bt-sp-result-art" });
                const pic = (t.album?.images || []).slice(-1)[0]?.url;
                if (pic) img.style.backgroundImage = `url("${pic}")`;
                const text = el("div", { className: "bt-sp-result-text" });
                text.append(el("div", { className: "bt-sp-result-title", textContent: t.name }),
                    el("div", { className: "bt-sp-result-artist", textContent: (t.artists || []).map(a => a.name).join(", ") }));
                const q = el("button", { className: "bt-sp-btn bt-sp-queue", type: "button", title: "Add to queue", textContent: "+" });
                q.onclick = e => { e.stopPropagation(); queueTrack(t); };
                row.append(img, text, el("span", { className: "bt-sp-result-time", textContent: fmtTime(t.duration_ms) }), q);
                row.onclick = () => playTrack(t);
                searchResults.append(row);
            });
        };
        const runSearch = async () => {
            const q = searchInput.value.trim();
            const seq = ++searchSeq;
            if (!q) { results = []; showResults(); return; }
            const r = await spotify("GET", `search?type=track&limit=6&q=${encodeURIComponent(q)}`).catch(() => null);
            if (seq !== searchSeq) return;
            results = r?.status === 200 ? r.data?.tracks?.items || [] : [];
            selected = 0;
            showResults();
        };
        searchInput.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(runSearch, 300); });
        for (const type of ["keyup", "keypress"]) searchInput.addEventListener(type, e => e.stopPropagation());
        searchInput.addEventListener("keydown", e => {
            e.stopPropagation();
            if (e.key === "Escape") { clearSearch(); searchInput.blur(); }
            else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                if (!results.length) return;
                selected = (selected + (e.key === "ArrowDown" ? 1 : results.length - 1)) % results.length;
                showResults();
            } else if (e.key === "Enter" && results[selected]) {
                e.preventDefault();
                if (e.shiftKey) queueTrack(results[selected]);
                else playTrack(results[selected]);
            }
        });
        const onPasteFirst = e => { if (e.target === searchInput) e.stopImmediatePropagation(); };
        window.addEventListener("paste", onPasteFirst, true);
        api.onDispose(() => window.removeEventListener("paste", onPasteFirst, true));
        const outsideSearch = e => { if (!searchBox.contains(e.target)) { results = []; showResults(); } };
        document.addEventListener("pointerdown", outsideSearch, true);
        api.onDispose(() => { document.removeEventListener("pointerdown", outsideSearch, true); clearTimeout(searchTimer); clearTimeout(volTimer); });

        const playerView = el("div");
        playerView.append(main, progress, controls, volRow, searchBox, deviceRow);

        const emptyText = el("div", { className: "bt-sp-empty-text" });
        const connectBtn = el("button", { className: "bt-sp-connect", type: "button", innerHTML: icon("spotify", 14) });
        connectBtn.append(document.createTextNode("Log in with Spotify"));
        connectBtn.title = "Opens Spotify's login page";
        connectBtn.onclick = () => login();
        const emptyIcon = el("div", { className: "bt-sp-art", innerHTML: icon("spotify", 26) });
        const emptyView = el("div", { className: "bt-sp-empty" });
        emptyView.append(emptyIcon, emptyText);
        const lyBack = btn("back", "Back to the player", () => closeLyrics());
        const lyArt = el("div", { className: "bt-sp-ly-art" });
        const lyTitle = el("div", { className: "bt-sp-title" });
        const lyArtist = el("div", { className: "bt-sp-artist" });
        const lyMeta = el("div", { className: "bt-sp-meta" });
        lyMeta.append(lyTitle, lyArtist);
        const lyPlay = btn("play", "Play", () => playBtn.click(), "bt-sp-ly-play");
        const lyHead = el("div", { className: "bt-sp-ly-head" });
        lyHead.append(lyBack, lyArt, lyMeta, lyPlay);
        const lyBody = el("div", { className: "bt-sp-ly-body" });
        const lyFoot = el("div", { className: "bt-sp-ly-foot", textContent: "Lyrics from LRCLIB" });
        const lyricsView = el("div", { className: "bt-sp-lyrics" });
        lyricsView.append(lyHead, lyBody, lyFoot);
        lyricsView.hidden = true;

        let lyricsOpen = false;
        let lyricsFor = null;
        let lyricLines = [];
        let lyricActive = -1;
        let lyricUserScroll = 0;
        const lyricsCache = new Map();
        lyBody.addEventListener("wheel", () => { lyricUserScroll = Date.now(); }, { passive: true });

        const parseSynced = text => {
            const out = [];
            for (const raw of String(text).split(/\r?\n/)) {
                const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
                if (!stamps.length) continue;
                const words = raw.replace(/\[[^\]]*\]/g, "").trim();
                for (const m of stamps) out.push({ t: (Number(m[1]) * 60 + Number(m[2])) * 1000, text: words });
            }
            return out.sort((a, b) => a.t - b.t);
        };
        const lyricsMessage = text => {
            lyricLines = [];
            lyricActive = -1;
            lyBody.replaceChildren(el("div", { className: "bt-sp-ly-msg", textContent: text }));
        };
        async function loadLyrics() {
            const item = player?.item;
            if (!item) { lyricsFor = null; lyricsMessage("Nothing playing."); return; }
            if (lyricsFor === item.id) return;
            lyricsFor = item.id;
            const id = item.id;
            lyricsMessage("Loading lyrics…");
            let data = lyricsCache.get(id);
            if (data === undefined) {
                try {
                    data = await api.spotify.lyrics({
                        track: item.name,
                        artist: (item.artists || [])[0]?.name || item.show?.publisher || "",
                        album: item.album?.name,
                        duration: (item.duration_ms || 0) / 1000,
                    });
                } catch (error) {
                    api.warn("Lyrics lookup failed", error);
                    data = null;
                }
                lyricsCache.set(id, data);
            }
            if (lyricsFor !== id) return;
            if (data?.instrumental) return lyricsMessage("♪ Instrumental ♪");
            const synced = data?.synced ? parseSynced(data.synced) : [];
            const lines = synced.length ? synced
                : String(data?.plain || "").split(/\r?\n/).map(text => ({ t: null, text: text.trim() }));
            if (!lines.some(l => l.text)) return lyricsMessage("No lyrics found for this song.");
            lyricLines = lines;
            lyricActive = -1;
            lyBody.replaceChildren();
            lyBody.classList.toggle("bt-sp-ly-synced", !!synced.length);
            for (const line of lines) {
                line.el = el("div", { className: "bt-sp-ly-line", textContent: line.text || "♪" });
                if (line.t != null) {
                    line.el.title = "Jump here";
                    line.el.onclick = () => {
                        lyricUserScroll = 0;
                        command(p => { p.progress_ms = line.t; }, "PUT", `me/player/seek?position_ms=${Math.round(line.t)}`);
                    };
                }
                lyBody.append(line.el);
            }
            lyBody.scrollTop = 0;
            syncLyrics();
        }
        function syncLyrics() {
            if (!lyricsOpen || !lyricLines.length || lyricLines[0].t == null) return;
            const pos = position() + 250;
            let i = -1;
            for (let k = 0; k < lyricLines.length; k++) { if (lyricLines[k].t <= pos) i = k; else break; }
            if (i === lyricActive) return;
            lyricLines[lyricActive]?.el.classList.remove("bt-sp-ly-on");
            lyricActive = i;
            const line = lyricLines[i];
            if (!line) return;
            line.el.classList.add("bt-sp-ly-on");
            if (Date.now() - lyricUserScroll > 3000) {
                lyBody.scrollTo({ top: line.el.offsetTop - lyBody.clientHeight / 2 + line.el.offsetHeight / 2, behavior: "smooth" });
            }
        }
        function renderLyricsHead() {
            const item = player?.item;
            const image = (item?.album?.images || item?.images || []).slice(-1)[0]?.url;
            lyArt.style.backgroundImage = image ? `url("${image}")` : "";
            lyTitle.textContent = item?.name || "Not playing";
            lyArtist.textContent = (item?.artists || []).map(a => a.name).join(", ");
            lyPlay.innerHTML = icon(player?.is_playing ? "pause" : "play", 16);
            lyPlay.title = player?.is_playing ? "Pause" : "Play";
        }
        function openLyrics() {
            if (collapsed) setCollapsed(false);
            libraryOpen = false;
            libraryView.hidden = true;
            lyricsOpen = true;
            playerView.hidden = true;
            lyricsView.hidden = false;
            renderLyricsHead();
            loadLyrics();
        }
        function closeLyrics() {
            lyricsOpen = false;
            lyricsView.hidden = true;
            render();
        }

        const libBack = btn("back", "Back", () => libraryBack());
        const libTitle = el("div", { className: "bt-sp-lib-title" });
        const libAction = el("button", { className: "bt-sp-upgrade bt-sp-lib-action", type: "button" });
        const libHead = el("div", { className: "bt-sp-ly-head" });
        libHead.append(libBack, libTitle, libAction);
        const libTabs = el("div", { className: "bt-sp-lib-tabs" });
        const tabLiked = el("button", { type: "button", textContent: "Liked Songs" });
        const tabLists = el("button", { type: "button", textContent: "Playlists" });
        libTabs.append(tabLiked, tabLists);
        const libBody = el("div", { className: "bt-sp-lib-body" });
        const libraryView = el("div", { className: "bt-sp-lyrics bt-sp-library" });
        libraryView.append(libHead, libTabs, libBody);
        libraryView.hidden = true;

        let libraryOpen = false;
        let libPage = "liked";
        let libPlaylist = null;
        let meId = null;
        const libCache = new Map();

        let libError = "";
        const libMessage = (text, notLoggedIn) => {
            const msg = notLoggedIn ? "Log in to Spotify in Be Themer → Plugins → Spotify Controls → Settings to see your Liked Songs and playlists."
                : libError ? `${text} (${libError})` : text;
            libBody.replaceChildren(el("div", { className: "bt-sp-ly-msg", textContent: msg }));
        };
        async function libGet(path) {
            if (libCache.has(path)) return libCache.get(path);
            const r = await spotify("GET", path).catch(() => null);
            libError = !r ? "no answer" : r.status === 0 ? "not logged in" : r.status !== 200 ? `${r.status}: ${r.data?.error?.message || "error"}` : "";
            if (!r || r.status !== 200) return null;
            libCache.set(path, r.data);
            return r.data;
        }
        const pic = images => (images || []).slice(-1)[0]?.url || (images || [])[0]?.url;
        const trackRow = (t, onPlay) => {
            const row = el("div", { className: "bt-sp-result", title: "Click to play" });
            const img = el("div", { className: "bt-sp-result-art" });
            const url = pic(t.album?.images);
            if (url) img.style.backgroundImage = `url("${url}")`;
            const text = el("div", { className: "bt-sp-result-text" });
            text.append(el("div", { className: "bt-sp-result-title", textContent: t.name }),
                el("div", { className: "bt-sp-result-artist", textContent: (t.artists || []).map(a => a.name).join(", ") }));
            const q = el("button", { className: "bt-sp-btn bt-sp-queue", type: "button", title: "Add to queue", innerHTML: icon("plus", 14) });
            q.onclick = e => { e.stopPropagation(); queueTrack(t); };
            row.append(img, text, el("span", { className: "bt-sp-result-time", textContent: fmtTime(t.duration_ms) }), q);
            row.onclick = onPlay;
            if (player?.item?.id === t.id) row.classList.add("bt-sp-sel");
            return row;
        };
        async function playContext(contextUri, trackUri) {
            const id = player?.device?.id || await ensureDevice();
            if (!id) return;
            const body = { context_uri: contextUri, ...(trackUri ? { offset: { uri: trackUri } } : {}) };
            const res = await command(p => { p.is_playing = true; }, "PUT", `me/player/play?device_id=${encodeURIComponent(id)}`, body);
            if (res && res.status < 300) setTimeout(poll, 600);
        }
        const toTrack = t => ({ id: t.id, uri: t.uri, name: t.title, artists: (t.artists || []).map(name => ({ name })),
            album: { images: t.image ? [{ url: t.image }] : [] },
            duration_ms: (t.duration || "0:00").split(":").reduce((acc, n) => acc * 60 + Number(n), 0) * 1000 });
        async function playUris(uris, startUri) {
            const id = player?.device?.id || await ensureDevice();
            if (!id || !uris.length) return;
            const body = { uris: uris.slice(0, 100), ...(startUri ? { offset: { uri: startUri } } : {}) };
            const res = await command(p => { p.is_playing = true; }, "PUT", `me/player/play?device_id=${encodeURIComponent(id)}`, body);
            if (res && res.status < 300) setTimeout(poll, 600);
        }
        async function libRead(kind, id) {
            const key = `${kind}:${id || ""}`;
            if (libCache.has(key)) return libCache.get(key);
            try {
                const r = await api.spotify.library(kind, id);
                libCache.set(key, r);
                libError = "";
                return r;
            } catch (error) {
                libError = String(error?.message || error).replace(/^Error invoking remote method '[^']+': (Error: )?/, "");
                return null;
            }
        }
        async function showTracks(label, kind, id, pageName) {
            libPage = pageName;
            libTitle.textContent = label;
            libMessage("Loading…");
            const r = await libRead(kind, id);
            if (libPage !== pageName) return;
            if (!r) return libMessage("Couldn't load this.", /not-logged-in/.test(libError));
            const tracks = (r.items || []).map(toTrack);
            if (!tracks.length) return libMessage("Nothing here yet.");
            const uris = tracks.map(t => t.uri);
            libAction.hidden = false;
            libAction.textContent = "Play all";
            libAction.onclick = () => playUris(uris);
            libBody.replaceChildren(...tracks.map(t => trackRow(t, () => playUris(uris, t.uri))));
        }
        const showLiked = () => showTracks("Liked Songs", "liked", "", "liked");
        async function showPlaylists() {
            libPage = "playlists";
            libTitle.textContent = "Playlists";
            libAction.hidden = true;
            libMessage("Loading…");
            const r = await libRead("playlists");
            if (libPage !== "playlists") return;
            if (!r) return libMessage("Couldn't load your playlists.", /not-logged-in/.test(libError));
            const lists = (r.items || []).filter(x => x.kind === "playlist");
            if (!lists.length) return libMessage("You don't have any playlists yet.");
            libBody.replaceChildren(...lists.map(pl => {
                const row = el("div", { className: "bt-sp-result", title: "Open playlist" });
                const img = el("div", { className: "bt-sp-result-art" });
                if (pl.image) img.style.backgroundImage = `url("${pl.image}")`;
                const text = el("div", { className: "bt-sp-result-text" });
                text.append(el("div", { className: "bt-sp-result-title", textContent: pl.title }),
                    el("div", { className: "bt-sp-result-artist", textContent: pl.subtitle }));
                const play = el("button", { className: "bt-sp-btn bt-sp-queue", type: "button", title: "Play playlist", innerHTML: icon("play", 13) });
                play.onclick = e => { e.stopPropagation(); playContext(pl.uri); };
                row.append(img, text, play);
                row.onclick = () => showPlaylist(pl);
                return row;
            }));
        }
        async function showPlaylist(pl) {
            libPlaylist = pl;
            await showTracks(pl.title, "playlist", pl.id, "playlist");
            if (libPage === "playlist" && libPlaylist === pl) libAction.onclick = () => playContext(pl.uri);
        }
        function showLibrary() {
            tabLiked.classList.toggle("bt-sp-on", libPage === "liked");
            tabLists.classList.toggle("bt-sp-on", libPage !== "liked");
            libTabs.hidden = libPage === "playlist";
            if (webLoggedIn === false) return libMessage("Log in to Spotify to see your Liked Songs and playlists.", true);
            if (libPage === "liked") showLiked();
            else if (libPage === "playlists") showPlaylists();
            else if (libPlaylist) showPlaylist(libPlaylist);
        }
        tabLiked.onclick = () => { libPage = "liked"; showLibrary(); };
        tabLists.onclick = () => { libPage = "playlists"; showLibrary(); };
        async function openLibrary() {
            if (collapsed) setCollapsed(false);
            if (lyricsOpen) closeLyrics();
            libraryOpen = true;
            libCache.clear();
            playerView.hidden = true;
            emptyView.hidden = true;
            libraryView.hidden = false;
            if (webLoggedIn === null) webLoggedIn = await api.spotify.webStatus().catch(() => false);
            if (libPage === "playlist") libPage = "playlists";
            showLibrary();
        }
        function libraryBack() {
            if (libPage === "playlist") { libPage = "playlists"; showLibrary(); return; }
            libraryOpen = false;
            libraryView.hidden = true;
            render();
        }

        root.append(playerView, lyricsView, libraryView, emptyView, miniBar);

        const openSpotify = url => { if (url) window.open(url, "_blank", "noopener"); };
        art.onclick = () => openSpotify(player?.item?.album?.external_urls?.spotify || player?.item?.show?.external_urls?.spotify);

        function render() {
            upgradeBtn.hidden = webLoggedIn === true;
            if (libraryOpen) {
                emptyView.hidden = playerView.hidden = lyricsView.hidden = true;
                libraryView.hidden = false;
                root.hidden = false;
                return;
            }
            if (lyricsOpen) {
                emptyView.hidden = true;
                playerView.hidden = true;
                lyricsView.hidden = false;
                root.hidden = false;
                renderLyricsHead();
                loadLyrics();
                return;
            }
            const item = player?.item;
            const connected = connectedEver || linkedKnown;
            if (!item && !connected) {
                root.hidden = false;
                playerView.hidden = true;
                emptyView.hidden = false;
                connectBtn.hidden = false;
                emptyText.textContent = "Link Spotify in Discord (Settings → Connections), or log in from Be Themer → Plugins → Spotify Controls.";
                return;
            }
            emptyView.hidden = true;
            playerView.hidden = false;
            searchBox.hidden = api.settings.showSearch === false;
            if (!item) {
                root.hidden = !!api.settings.hideWhenIdle;
                art.style.backgroundImage = "";
                art.innerHTML = icon("spotify", 26);
                art.classList.add("bt-sp-idle");
                title.textContent = "Not playing";
                artist.textContent = !connectedEver && discordProblem && discordProblem !== "not-linked" && discordProblem !== "no-token"
                    ? discordProblem
                    : "Press play, or search for a song below";
                playBtn.innerHTML = icon("play", 16);
                miniPlay.innerHTML = icon("play", 14);
                miniFill.style.width = "0%";
                playBtn.title = "Play";
                likeBtn.hidden = true;
                for (const b of [shuffleBtn, repeatBtn]) b.classList.remove("bt-sp-on");
                for (const b of [prevBtn, nextBtn, shuffleBtn, repeatBtn]) b.disabled = false;
                elapsed.textContent = total.textContent = "0:00";
                bar.set(0);
                volBox.hidden = false;
                volBox.classList.add("bt-sp-disabled");
                volBox.title = "Start playing to change the volume";
                if (!vol.dragging) vol.set(0);
                volPct.textContent = "";
                deviceName.textContent = "";
                return;
            }
            root.hidden = false;
            art.innerHTML = "";
            art.classList.remove("bt-sp-idle");
            const image = (item.album?.images || item.images || item.show?.images || []).slice(-2)[0]?.url;
            art.style.backgroundImage = image ? `url("${image}")` : "";
            art.title = item.album?.name || item.show?.name || "";
            const link = (text, url) => {
                const a = el("a", { textContent: text, title: text });
                a.onclick = e => { e.preventDefault(); e.stopPropagation(); openSpotify(url); };
                return a;
            };
            title.replaceChildren(link(item.name || "Unknown", item.external_urls?.spotify));
            const people = item.artists || (item.show ? [{ name: item.show.publisher || item.show.name, external_urls: item.show.external_urls }] : []);
            artist.replaceChildren();
            people.forEach((a, i) => {
                if (i) artist.append(", ");
                artist.append(link(a.name, a.external_urls?.spotify));
            });

            const playing = !!player.is_playing;
            playBtn.innerHTML = icon(playing ? "pause" : "play", 16);
            miniPlay.innerHTML = icon(playing ? "pause" : "play", 14);
            miniPlay.title = playing ? "Pause" : "Play";
            playBtn.title = playing ? "Pause" : "Play";
            shuffleBtn.classList.toggle("bt-sp-on", !!player.shuffle_state);
            repeatBtn.classList.toggle("bt-sp-on", player.repeat_state && player.repeat_state !== "off");
            repeatBtn.dataset.repeat = player.repeat_state || "off";
            repeatBtn.innerHTML = icon(player.repeat_state === "track" ? "repeatOne" : "repeat", 17);
            repeatBtn.title = { off: "Repeat", context: "Repeat one", track: "Repeat off" }[player.repeat_state || "off"];
            const restricted = player.actions?.disallows || {};
            prevBtn.disabled = nextBtn.disabled = false;
            shuffleBtn.disabled = repeatBtn.disabled = false;

            likeBtn.hidden = item.type !== "track";
            likeBtn.classList.toggle("bt-sp-on", !!liked);
            likeBtn.innerHTML = icon(liked ? "heart" : "heartOutline", 18);
            likeBtn.title = liked ? "Remove from Liked Songs" : "Save to Liked Songs";

            const volume = player.device?.volume_percent;
            const canVolume = volume != null && player.device?.supports_volume !== false;
            volBox.hidden = false;
            volBox.classList.toggle("bt-sp-disabled", !canVolume);
            volBox.title = canVolume ? "Drag or scroll to change the volume" : "This device doesn't allow changing its volume from here";
            if (!vol.dragging && Date.now() - volSentAt > 300) {
                vol.set((volume ?? 0) / 100);
                volPct.textContent = canVolume ? `${volume}%` : "";
                volBtn.innerHTML = icon(volIcon(volume ?? 0), 18);
            }
            deviceName.textContent = player.device?.name ? `Playing on ${player.device.name}` : "";
            tick();
        }
        function tick() {
            syncLyrics();
            if (!player?.item) return;
            const dur = player.item.duration_ms || 0;
            const pos = position();
            elapsed.textContent = fmtTime(pos);
            total.textContent = fmtTime(dur);
            if (!bar.dragging) bar.set(dur ? pos / dur : 0);
            miniFill.style.width = `${dur ? Math.min(100, (pos / dur) * 100) : 0}%`;
            if (player.is_playing && dur && pos >= dur && Date.now() - fetchedAt > 1000) poll();
        }

        let menu = null;
        const closeMenu = () => { menu?.remove(); menu = null; document.removeEventListener("pointerdown", outside, true); };
        const outside = e => { if (menu && !menu.contains(e.target)) closeMenu(); };
        async function openDevices(anchor) {
            if (menu) return closeMenu();
            const res = await spotify("GET", "me/player/devices");
            const devices = res.status === 200 ? res.data?.devices || [] : [];
            menu = el("div", { className: "bt-sp-menu" });
            menu.append(el("div", { className: "bt-sp-menu-title", textContent: devices.length ? "Play on" : "No devices found. Open Spotify on a device." }));
            for (const d of devices) {
                const b = el("button", { type: "button", innerHTML: icon("device", 14) });
                b.append(document.createTextNode(d.name));
                b.classList.toggle("bt-sp-on", !!d.is_active);
                b.onclick = () => { closeMenu(); command(null, "PUT", "me/player", { device_ids: [d.id], play: !!player?.is_playing }); };
                menu.append(b);
            }
            document.body.append(menu);
            const r = anchor.getBoundingClientRect();
            menu.style.left = `${Math.max(8, Math.min(r.left, innerWidth - menu.offsetWidth - 8))}px`;
            menu.style.top = `${Math.max(8, r.top - menu.offsetHeight - 6)}px`;
            setTimeout(() => document.addEventListener("pointerdown", outside, true));
        }

        async function loginViaDiscord() {
            discordToken = null;
            if (await discordAccess()) { api.toast("Spotify connected."); poll(); return; }
            if (discordProblem && discordProblem !== "not-linked") {
                api.toast(discordProblem === "no-token"
                    ? "Spotify is linked, but Discord didn't hand out a token. Try removing and re-adding Spotify in Discord Settings → Connections."
                    : discordProblem, 8000);
                return;
            }
            let url;
            try {
                let res = await api.discord.rest.get("/connections/spotify/authorize");
                if (res && !res.url && res.body) res = res.body;
                url = res?.url;
            } catch (error) {
                api.warn("Discord didn't start the Spotify login", error);
            }
            if (!url) {
                api.toast("Couldn't start the Spotify login. You can also link Spotify in Discord Settings → Connections.");
                return;
            }
            window.open(url, "_blank", "noopener");
            api.toast("Spotify's login page opened in your browser. Approve it there, then come back.");
            connectBtn.disabled = true;
            const until = Date.now() + 5 * 60_000;
            const check = async () => {
                if (stopped) return;
                discordToken = null;
                if (await discordAccess()) {
                    connectBtn.disabled = false;
                    api.toast("Spotify connected.");
                    poll();
                } else if (Date.now() < until) setTimeout(check, 3000);
                else connectBtn.disabled = false;
            };
            setTimeout(check, 3000);
        }

        async function loginViaWeb() {
            connectBtn.disabled = true;
            api.toast("Log in to Spotify in the window that opened…");
            try {
                await api.spotify.webLogin();
                webLoggedIn = true;
                webForce = true;
                const t = await webAccess();
                if (!t) throw new Error("Logged in, but Spotify's web player didn't hand out a token. Try again in a moment.");
                connectedEver = true;
                api.toast("Spotify connected.");
                poll();
            } catch (error) {
                const msg = String(error?.message || error).replace(/^Error invoking remote method '[^']+': (Error: )?/, "");
                if (!/window was closed/i.test(msg)) api.toast(msg, 6000);
            } finally {
                updateLoginStatus();
                connectBtn.disabled = false;
            }
        }

        async function login() {
            if (!BUILTIN_CLIENT_ID) return loginViaWeb();
            api.toast("Spotify's login page opened in your browser. Approve it there…");
            connectBtn.disabled = true;
            try {
                const t = await api.spotify.login(clientId(), callbackPort());
                own = { clientId: clientId(), ...t };
                saveOwn();
                api.toast("Spotify connected.");
                poll();
            } catch (error) {
                api.toast(String(error?.message || error).replace(/^Error invoking remote method '[^']+': (Error: )?/, ""));
            } finally {
                connectBtn.disabled = false;
            }
        }
        this.login = login;
        async function updateLoginStatus() {
            if (webLoggedIn === null) webLoggedIn = await api.spotify.webStatus().catch(() => false);
            if (!webLoggedIn) {
                api.setSetting("loginStatus", "Not logged in (playback uses Discord's Spotify link)");
                return;
            }
            api.setSetting("loginStatus", "Logged in to Spotify (Liked Songs and playlists)");
        }
        this.updateLoginStatus = updateLoginStatus;
        updateLoginStatus();
        this.logout = async () => {
            await api.spotify.webLogout().catch(() => {});
            own = null; saveOwn(); discordToken = null; webLoggedIn = false; player = null; using = null; connectedEver = false; poll();
            api.toast("Logged out of Spotify. (If Spotify is linked in Discord Settings → Connections, the player keeps using that.)", 6000);
            updateLoginStatus();
        };
        api.addMenuItem("Spotify: log in with Spotify", login);
        api.addMenuItem("Spotify: link through Discord instead", loginViaDiscord);
        api.addMenuItem("Spotify: log out", () => this.logout());

        const mount = panels => {
            if (stopped || !panels || panels.firstElementChild === root) return;
            panels.prepend(root);
        };
        api.observe('section[class*="panels_"]', mount);
        const mountTimer = setInterval(() => mount(document.querySelector('section[class*="panels_"]')), 2000);

        let pollTimer = null;
        const schedule = () => {
            clearTimeout(pollTimer);
            if (stopped) return;
            const cooling = 0;
            pollTimer = setTimeout(async () => { await poll(); schedule(); }, cooling || (document.hasFocus() ? 5000 : 15000));
        };
        api.flux.subscribe("SPOTIFY_PLAYER_STATE", () => setTimeout(poll, 300));
        api.flux.subscribe("SPOTIFY_PLAYER_PLAY", () => setTimeout(poll, 300));
        const onFocus = () => poll();
        window.addEventListener("focus", onFocus);
        const tickTimer = setInterval(tick, 500);
        ready.then(() => { poll(); schedule(); });
        const applyKeepAlive = () => api.spotify.keepAlive(api.settings.keepTray !== false).catch(error => api.warn("Spotify keep-alive failed", error));
        applyKeepAlive();
        this.applyKeepAlive = applyKeepAlive;
        render();

        this.refresh = () => { discordToken = null; poll(); };
        api.onDispose(() => {
            stopped = true;
            api.spotify.keepAlive(false).catch(() => {});
            delete this.applyKeepAlive;
            delete this.updateLoginStatus;
            clearTimeout(pollTimer);
            clearInterval(tickTimer);
            clearInterval(mountTimer);
            window.removeEventListener("focus", onFocus);
            closeMenu();
            root.remove();
            delete this.login;
            delete this.logout;
            delete this.refresh;
        });
    },
    onSettingChange(key) {
        if (["hideWhenIdle", "showSearch"].includes(key)) this.refresh?.();
        if (key === "keepTray") this.applyKeepAlive?.();
        if (key === "loginBtn") this.login?.();
        if (key === "logoutBtn") this.logout?.();
    },
});
