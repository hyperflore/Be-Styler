const TW_LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.3 3 3 6.4v13.1h4.5V22H10l2.4-2.5h3.7l4.9-4.9V3H4.3Zm15.1 10.8-2.8 2.8H12l-2.4 2.4v-2.4H5.8V4.6h13.6v9.2ZM16.6 7.7h-1.6v4.8h1.6V7.7Zm-4.4 0h-1.6v4.8h1.6V7.7Z"/></svg>';
const TW_ICONS = {
    chevron: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
};
const twIcon = (name, size = 15) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TW_ICONS[name]}</svg>`;

const parseTwitch = text => {
    let u;
    try { u = new URL(/^https?:\/\//i.test(String(text).trim()) ? String(text).trim() : `https://${String(text).trim()}`); } catch { return null; }
    const host = u.hostname.replace(/^(www|m|go)\./, "");
    const parts = u.pathname.split("/").filter(Boolean);
    if (host === "clips.twitch.tv" && parts[0] && parts[0] !== "embed") return { kind: "clip", id: parts[0] };
    if (host !== "twitch.tv") return null;
    if (parts[0] === "videos" && /^\d+$/.test(parts[1] || "")) return { kind: "video", id: parts[1] };
    if (parts[1] === "clip" && parts[2]) return { kind: "clip", id: parts[2] };
    const reserved = new Set(["directory", "search", "settings", "subscriptions", "inventory", "wallet", "drops", "downloads", "p", "jobs", "turbo", "login", "signup"]);
    if (parts[0] && /^[a-z0-9_]{2,25}$/i.test(parts[0]) && !reserved.has(parts[0].toLowerCase())) return { kind: "channel", id: parts[0].toLowerCase() };
    return null;
};

BThemer.definePlugin({
    id: "twitch",
    name: "Twitch",
    description: "Watch Twitch inside Discord: a player above your user panel with search and Twitch links. Log in (settings) to see the channels you follow that are live.",
    author: "Be Themer",
    version: "1.0.0",
    settings: {
        loginStatus: { type: "info", label: "Twitch account", default: "Not logged in" },
        loginBtn: { type: "button", label: "Log in to Twitch", text: "Log in", description: "Opens Twitch's login page in a small window. Adds the live channels you follow to the widget." },
        logoutBtn: { type: "button", label: "Log out of Twitch", text: "Log out" },
        showChat: { type: "toggle", label: "Show chat under the stream", default: false },
        chatHeight: { type: "range", label: "Chat height", min: 160, max: 600, unit: "px", default: 300 },
        rememberLast: { type: "toggle", label: "Reopen the last stream after restarting Discord (paused)", default: true },
    },
    css: `
        .bt-tw { position: relative; margin: 8px; padding: 10px; border-radius: 18px; border: 1px solid rgb(145 70 255 / .22);
            background: linear-gradient(180deg, #1c1726, #141119); color: #efeff1; font: 14px/1.3 var(--font-primary, "gg sans", sans-serif);
            box-shadow: 0 10px 28px rgb(0 0 0 / .3); }
        .bt-tw[hidden], .bt-tw [hidden] { display: none !important; }
        .bt-tw-head { display: flex; align-items: center; gap: 8px; min-width: 0; height: 30px; }
        .bt-tw-logo { flex: none; width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center; background: #9146ff; color: #fff; }
        .bt-tw-logo svg { width: 17px; height: 17px; }
        .bt-tw-title { flex: 1; min-width: 0; line-height: 1.15; }
        .bt-tw-title b { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-tw-title small { display: block; font-size: 11px; color: #adadb8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-tw .bt-tw-btn { display: grid; place-items: center; width: 28px; height: 28px; flex: none; padding: 0; border: 0; border-radius: 50% !important;
            background: none; color: #adadb8; cursor: pointer; transition: background .12s, color .12s; }
        .bt-tw .bt-tw-btn:hover { background: rgb(255 255 255 / .08); color: #fff; }
        .bt-tw .bt-tw-btn.bt-tw-on { color: #bf94ff; background: rgb(145 70 255 / .18); }
        .bt-tw-chevron svg { transition: transform .2s ease; transform: rotate(180deg); }
        .bt-tw-collapsed .bt-tw-chevron svg { transform: rotate(0deg); }
        .bt-tw-screen { position: relative; margin-top: 8px; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #000; }
        .bt-tw-screen iframe, .bt-tw-chat iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
        .bt-tw-idle { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 8px; color: #adadb8; font-size: 12px; text-align: center; padding: 12px; }
        .bt-tw-idle span:first-child { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; background: #9146ff; color: #fff; }
        .bt-tw-idle span:first-child svg { width: 26px; height: 26px; }
        .bt-tw-chat { position: relative; margin-top: 6px; border-radius: 12px; overflow: hidden; background: #18181b; }
        .bt-tw-searchbox { position: relative; margin-top: 8px; }
        .bt-tw-search { width: 100%; box-sizing: border-box; height: 32px; padding: 0 12px 0 32px; border: 1px solid rgb(255 255 255 / .1); border-radius: 10px; outline: none;
            background: #0e0e10; color: #efeff1; font: 13px var(--font-primary, sans-serif); }
        .bt-tw-search:focus { border-color: #9146ff; }
        .bt-tw-search::placeholder { color: #7a7a85; }
        .bt-tw-searchicon { position: absolute; left: 11px; top: 9px; color: #7a7a85; pointer-events: none; }
        .bt-tw-tabs { display: flex; align-items: center; gap: 12px; margin-top: 10px; padding: 0 2px; }
        .bt-tw-tabs button { padding: 0 0 4px; border: 0; border-bottom: 2px solid transparent; background: none; cursor: pointer; color: #adadb8;
            font: 600 12px var(--font-primary, sans-serif); }
        .bt-tw-tabs button:hover { color: #efeff1; }
        .bt-tw-tabs button.bt-tw-on { color: #efeff1; border-bottom-color: #9146ff; }
        .bt-tw-tabs .bt-tw-btn { margin-left: auto; width: 24px; height: 24px; }
        .bt-tw-list { margin-top: 6px; max-height: 280px; overflow-y: auto; scrollbar-width: none; display: flex; flex-direction: column; gap: 2px; }
        .bt-tw-list::-webkit-scrollbar { display: none; }
        .bt-tw-row { display: flex; gap: 9px; align-items: center; padding: 5px; border-radius: 10px; cursor: pointer; min-width: 0; }
        .bt-tw-row:hover { background: rgb(255 255 255 / .06); }
        .bt-tw-row.bt-tw-current { background: rgb(145 70 255 / .16); }
        .bt-tw-thumb { position: relative; width: 92px; flex: none; aspect-ratio: 16 / 9; border-radius: 8px; background: #26262c center / cover; }
        .bt-tw-live { position: absolute; left: 4px; top: 4px; padding: 0 4px; border-radius: 4px; background: #eb0400; color: #fff; font: 700 9px/14px var(--font-primary, sans-serif); }
        .bt-tw-viewers { position: absolute; left: 4px; bottom: 4px; padding: 0 4px; border-radius: 4px; background: rgb(0 0 0 / .7); color: #fff; font: 600 9px/14px var(--font-primary, sans-serif); }
        .bt-tw-rowtext { flex: 1; min-width: 0; }
        .bt-tw-rowname { font-size: 12.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-tw-rowtitle { font-size: 11.5px; color: #dedee3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-tw-rowgame { font-size: 11px; color: #bf94ff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-tw-msg { padding: 16px 8px; text-align: center; color: #adadb8; font-size: 12px; }
        .bt-tw.bt-tw-collapsed { padding: 6px 8px; border-radius: 999px; }
        .bt-tw-collapsed .bt-tw-searchbox, .bt-tw-collapsed .bt-tw-tabs, .bt-tw-collapsed .bt-tw-list, .bt-tw-collapsed .bt-tw-chat,
        .bt-tw-collapsed .bt-tw-head .bt-tw-btn:not(.bt-tw-chevron) { display: none !important; }
        .bt-tw-collapsed .bt-tw-screen { height: 0; margin: 0; aspect-ratio: auto; }
    `,

    start(api) {
        const el = api.el;
        let stopped = false;
        let collapsed = false;
        let current = null;
        let account = { loggedIn: false, login: "" };
        let tab = "top";
        let query = "";
        const lists = { following: null, top: null, search: null };
        const parent = location.hostname || "discord.com";

        const root = el("div", { className: "bt-tw" });
        const btn = (name, title, onClick, extra = "") => {
            const b = el("button", { className: `bt-tw-btn ${extra}`.trim(), type: "button", title, innerHTML: twIcon(name) });
            b.setAttribute("aria-label", title);
            b.onclick = e => { e.stopPropagation(); onClick(e, b); };
            return b;
        };
        const logo = el("span", { className: "bt-tw-logo", innerHTML: TW_LOGO });
        const title = el("div", { className: "bt-tw-title" });
        const chatBtn = btn("chat", "Show chat", () => api.setSetting("showChat", !api.settings.showChat));
        const openBtn = btn("external", "Open on Twitch", () => current && window.open(watchUrl(current), "_blank", "noopener"));
        const closeBtn = btn("close", "Stop watching", () => play(null));
        const chevronBtn = btn("chevron", "Collapse", () => setCollapsed(!collapsed), "bt-tw-chevron");
        const head = el("div", { className: "bt-tw-head" });
        head.append(logo, title, chatBtn, openBtn, closeBtn, chevronBtn);

        const screen = el("div", { className: "bt-tw-screen" });
        const idle = el("div", { className: "bt-tw-idle" });
        idle.append(el("span", { innerHTML: TW_LOGO }), el("span", { textContent: "Pick a stream below, search, or paste a Twitch link" }));
        screen.append(idle);
        const chatBox = el("div", { className: "bt-tw-chat" });
        let frame = null, chatFrame = null;

        const searchBox = el("div", { className: "bt-tw-searchbox" });
        const input = el("input", { className: "bt-tw-search", type: "search", placeholder: "Search channels or paste a Twitch link", spellcheck: false });
        searchBox.append(el("span", { className: "bt-tw-searchicon", innerHTML: twIcon("search", 14) }), input);
        const tabs = el("div", { className: "bt-tw-tabs" });
        const list = el("div", { className: "bt-tw-list" });
        root.append(head, screen, chatBox, searchBox, tabs, list);

        const watchUrl = v => v.kind === "video" ? `https://www.twitch.tv/videos/${v.id}` : v.kind === "clip" ? `https://clips.twitch.tv/${v.id}` : `https://www.twitch.tv/${v.id}`;
        function play(v, autoplay = true) {
            current = v;
            frame?.remove(); frame = null;
            idle.hidden = !!v;
            if (v) {
                const p = new URLSearchParams({ parent, autoplay: autoplay ? "true" : "false", muted: "false" });
                let src;
                if (v.kind === "clip") { p.set("clip", v.id); src = `https://clips.twitch.tv/embed?${p}`; }
                else { p.set(v.kind === "video" ? "video" : "channel", v.kind === "video" ? `v${v.id}` : v.id); src = `https://player.twitch.tv/?${p}`; }
                frame = el("iframe", { src, allow: "autoplay; fullscreen; encrypted-media; picture-in-picture", allowFullscreen: true, title: v.name || v.id });
                screen.append(frame);
                if (api.settings.rememberLast !== false) api.storage.set("last", { kind: v.kind, id: v.id, name: v.name, title: v.title, game: v.game }).catch(() => {});
            } else {
                api.storage.delete("last").catch(() => {});
            }
            drawChat();
            render();
            drawList();
        }
        function drawChat() {
            const want = !!(current && current.kind === "channel" && api.settings.showChat);
            chatBtn.classList.toggle("bt-tw-on", !!api.settings.showChat);
            chatBtn.title = api.settings.showChat ? "Hide chat" : "Show chat";
            chatBox.hidden = !want;
            chatBox.style.height = `${Math.max(160, Math.min(600, Number(api.settings.chatHeight) || 300))}px`;
            const src = want ? `https://www.twitch.tv/embed/${current.id}/chat?parent=${encodeURIComponent(parent)}&darkpopout` : "";
            if (!want) { chatFrame?.remove(); chatFrame = null; return; }
            if (chatFrame?.dataset.src === src) return;
            chatFrame?.remove();
            chatFrame = el("iframe", { src, title: "Twitch chat" });
            chatFrame.dataset.src = src;
            chatBox.append(chatFrame);
        }

        const TABS = () => [account.loggedIn && ["following", "Following"], ["top", "Live now"], query && ["search", "Results"]].filter(Boolean);
        function drawTabs() {
            const refresh = btn("refresh", "Refresh", () => load(tab, true));
            tabs.replaceChildren(...TABS().map(([k, label]) => {
                const b = el("button", { type: "button", textContent: label, className: k === tab ? "bt-tw-on" : "" });
                b.onclick = () => { tab = k; drawTabs(); load(k); };
                return b;
            }), refresh);
        }
        const msg = text => list.replaceChildren(el("div", { className: "bt-tw-msg", textContent: text }));
        let loadSeq = 0;
        async function load(kind, force) {
            if (!force && lists[kind]) return drawList();
            const my = ++loadSeq;
            msg(kind === "search" ? "Searching…" : "Loading…");
            try {
                const r = await api.twitch.list(kind, kind === "search" ? query : "");
                lists[kind] = r.items || [];
            } catch (error) {
                const m = String(error?.message || error).replace(/^Error invoking remote method '[^']+': (Error: )?/, "");
                if (my !== loadSeq) return;
                if (/not-logged-in/.test(m)) { account.loggedIn = false; updateStatus(); tab = "top"; drawTabs(); return load("top"); }
                return msg(`Couldn't load this (${m}).`);
            }
            if (my === loadSeq && tab === kind) drawList();
        }
        function drawList() {
            const items = lists[tab];
            if (!items) return;
            if (!items.length) return msg(tab === "following" ? "None of the channels you follow are live right now." : tab === "search" ? "No channels found." : "Nothing here.");
            list.replaceChildren(...items.map(it => {
                const row = el("div", { className: `bt-tw-row${current?.kind === "channel" && current.id === it.login ? " bt-tw-current" : ""}`, title: it.title || it.name });
                const thumb = el("div", { className: "bt-tw-thumb" });
                if (it.thumb) thumb.style.backgroundImage = `url("${it.thumb}")`;
                if (it.live) thumb.append(el("span", { className: "bt-tw-live", textContent: "LIVE" }));
                if (it.viewers) thumb.append(el("span", { className: "bt-tw-viewers", textContent: it.viewers.replace(/\s*viewers?/i, "") }));
                const text = el("div", { className: "bt-tw-rowtext" });
                text.append(el("div", { className: "bt-tw-rowname", textContent: it.name }));
                if (it.title) text.append(el("div", { className: "bt-tw-rowtitle", textContent: it.title }));
                if (it.game) text.append(el("div", { className: "bt-tw-rowgame", textContent: it.game }));
                row.append(thumb, text);
                row.onclick = () => play({ kind: "channel", id: it.login, name: it.name, title: it.title, game: it.game });
                return row;
            }));
        }

        const submit = () => {
            const t = input.value.trim();
            if (!t) return;
            const link = parseTwitch(t);
            if (link && (/twitch\.tv/i.test(t))) { play({ ...link, name: link.id }); input.value = ""; input.blur(); return; }
            query = t;
            lists.search = null;
            tab = "search";
            drawTabs();
            load("search", true);
        };
        for (const type of ["keyup", "keypress"]) input.addEventListener(type, e => e.stopPropagation());
        input.addEventListener("keydown", e => {
            e.stopPropagation();
            if (e.key === "Enter") { e.preventDefault(); submit(); }
            else if (e.key === "Escape") { input.value = ""; input.blur(); }
        });
        const onPasteFirst = e => {
            if (e.target !== input) return;
            e.stopImmediatePropagation();
            const text = e.clipboardData?.getData("text") || "";
            if (parseTwitch(text) && /twitch\.tv/i.test(text)) { e.preventDefault(); input.value = text; submit(); }
        };
        window.addEventListener("paste", onPasteFirst, true);

        function render() {
            title.replaceChildren();
            if (current) {
                title.append(el("b", { textContent: current.name || current.id }),
                    el("small", { textContent: current.kind === "clip" ? "Clip" : current.kind === "video" ? "Video" : [current.game, current.title].filter(Boolean).join(" · ") || "Live" }));
            } else {
                title.append(el("b", { textContent: "Twitch" }), el("small", { textContent: account.loggedIn ? `Logged in as ${account.login || "you"}` : "Not logged in" }));
            }
            openBtn.hidden = closeBtn.hidden = !current;
            chatBtn.hidden = !(current && current.kind === "channel");
        }
        function setCollapsed(on, save = true) {
            collapsed = !!on;
            root.classList.toggle("bt-tw-collapsed", collapsed);
            chevronBtn.title = collapsed ? "Expand" : "Collapse";
            if (save) api.storage.set("collapsed", collapsed).catch(() => {});
        }

        async function updateStatus() {
            account = await api.twitch.status().catch(() => ({ loggedIn: false, login: "" }));
            api.setSetting("loginStatus", account.loggedIn ? `Logged in as ${account.login || "your account"}` : "Not logged in (watching and search work without it)");
            if (!account.loggedIn && tab === "following") tab = "top";
            drawTabs();
            render();
        }
        this.login = async () => {
            api.toast("Log in to Twitch in the window that opened…");
            try {
                account = await api.twitch.login();
                api.toast(`Twitch connected${account.login ? ` as ${account.login}` : ""}.`);
                tab = "following";
                lists.following = null;
            } catch (error) {
                const m = String(error?.message || error).replace(/^Error invoking remote method '[^']+': (Error: )?/, "");
                if (!/window was closed/i.test(m)) api.toast(m, 6000);
            }
            await updateStatus();
            load(tab);
        };
        this.logout = async () => {
            await api.twitch.logout().catch(() => {});
            lists.following = null;
            api.toast("Logged out of Twitch.");
            await updateStatus();
            load(tab);
        };
        this.refreshChat = () => drawChat();

        const mount = panels => {
            if (stopped || !panels) return;
            const above = [...panels.querySelectorAll(":scope > .bt-sp, :scope > .bt-yt, :scope > .bt-lz")].pop();
            if (above ? above.nextElementSibling === root : panels.firstElementChild === root) return;
            if (above) above.after(root);
            else panels.prepend(root);
        };
        api.observe('section[class*="panels_"]', mount);
        const mountTimer = setInterval(() => mount(document.querySelector('section[class*="panels_"]')), 2000);

        api.storage.get("collapsed").then(v => { if (v) setCollapsed(true, false); }).catch(() => {});
        if (api.settings.rememberLast !== false) {
            api.storage.get("last").then(v => { if (v && v.id && !current) play(v, false); }).catch(() => {});
        }
        drawChat();
        render();
        updateStatus().then(() => { tab = account.loggedIn ? "following" : "top"; drawTabs(); load(tab); });

        api.onDispose(() => {
            stopped = true;
            clearInterval(mountTimer);
            window.removeEventListener("paste", onPasteFirst, true);
            frame?.remove();
            chatFrame?.remove();
            root.remove();
            delete this.login;
            delete this.logout;
            delete this.refreshChat;
        });
    },
    onSettingChange(key) {
        if (key === "loginBtn") this.login?.();
        else if (key === "logoutBtn") this.logout?.();
        else if (key === "showChat" || key === "chatHeight") this.refreshChat?.();
    },
});
