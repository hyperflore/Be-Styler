const KK_LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3h5v5h2V6h2V3h5v6h-2v2h-2v2h2v2h2v6h-5v-3h-2v-2H9v5H4V3Z"/></svg>';
const KK_ICONS = {
    chevron: '<path d="m6 9 6 6 6-6"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>',
};
const kkIcon = (name, size = 15) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${KK_ICONS[name]}</svg>`;
const kkCount = n => (n == null ? "" : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 100) / 10}K` : String(n));

const parseKick = text => {
    let u;
    try { u = new URL(/^https?:\/\//i.test(String(text).trim()) ? String(text).trim() : `https://${String(text).trim()}`); } catch { return null; }
    const host = u.hostname.replace(/^(www|m)\./, "");
    if (host !== "kick.com" && host !== "player.kick.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (parts[0] === "video" && uuid.test(parts[1] || "")) return { kind: "video", id: parts[1] };
    if (parts[1] === "videos" && uuid.test(parts[2] || "")) return { kind: "video", id: parts[2], channel: parts[0] };
    const clip = u.searchParams.get("clip") || (parts[1] === "clips" ? parts[2] : null);
    if (clip && parts[0]) return { kind: "clip", id: clip, channel: parts[0].toLowerCase() };
    const reserved = new Set(["categories", "category", "following", "search", "settings", "dashboard", "video", "popout", "browse", "terms-of-service", "privacy-policy"]);
    if (parts[0] && /^[a-z0-9_-]{2,40}$/i.test(parts[0]) && !reserved.has(parts[0].toLowerCase())) return { kind: "channel", id: parts[0].toLowerCase() };
    return null;
};

BThemer.definePlugin({
    id: "kick",
    name: "Kick",
    description: "Watch Kick inside Discord: a player above your user panel with search and Kick links. Log in (settings) to see the channels you follow.",
    author: "Be Themer",
    version: "1.0.0",
    settings: {
        loginStatus: { type: "info", label: "Kick account", default: "Not logged in" },
        loginBtn: { type: "button", label: "Log in to Kick", text: "Log in", description: "Opens kick.com in a small window; log in there. Adds the channels you follow to the widget." },
        logoutBtn: { type: "button", label: "Log out of Kick", text: "Log out" },
        showChat: { type: "toggle", label: "Show chat under the stream", default: false },
        chatHeight: { type: "range", label: "Chat height", min: 160, max: 600, unit: "px", default: 300 },
        rememberLast: { type: "toggle", label: "Reopen the last stream after restarting Discord (paused)", default: true },
    },
    css: `
        .bt-kk { position: relative; margin: 8px; padding: 10px; border-radius: 18px; border: 1px solid rgb(83 252 24 / .18);
            background: linear-gradient(180deg, #121614, #0b0e0f); color: #eef2ee; font: 14px/1.3 var(--font-primary, "gg sans", sans-serif);
            box-shadow: 0 10px 28px rgb(0 0 0 / .3); }
        .bt-kk[hidden], .bt-kk [hidden] { display: none !important; }
        .bt-kk-head { display: flex; align-items: center; gap: 8px; min-width: 0; height: 30px; }
        .bt-kk-logo { flex: none; width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center; background: #53fc18; color: #0b0e0f; }
        .bt-kk-logo svg { width: 16px; height: 16px; }
        .bt-kk-title { flex: 1; min-width: 0; line-height: 1.15; }
        .bt-kk-title b { display: block; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-kk-title small { display: block; font-size: 11px; color: #9aa59a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-kk .bt-kk-btn { display: grid; place-items: center; width: 28px; height: 28px; flex: none; padding: 0; border: 0; border-radius: 50% !important;
            background: none; color: #9aa59a; cursor: pointer; transition: background .12s, color .12s; }
        .bt-kk .bt-kk-btn:hover { background: rgb(255 255 255 / .08); color: #fff; }
        .bt-kk .bt-kk-btn.bt-kk-on { color: #53fc18; background: rgb(83 252 24 / .14); }
        .bt-kk-chevron svg { transition: transform .2s ease; transform: rotate(180deg); }
        .bt-kk-collapsed .bt-kk-chevron svg { transform: rotate(0deg); }
        .bt-kk-screen { position: relative; margin-top: 8px; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #000; }
        .bt-kk-screen iframe, .bt-kk-chat iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
        .bt-kk-idle { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 8px; color: #9aa59a; font-size: 12px; text-align: center; padding: 12px; }
        .bt-kk-idle span:first-child { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; background: #53fc18; color: #0b0e0f; }
        .bt-kk-idle span:first-child svg { width: 24px; height: 24px; }
        .bt-kk-chat { position: relative; margin-top: 6px; border-radius: 12px; overflow: hidden; background: #0f1112; }
        .bt-kk-searchbox { position: relative; margin-top: 8px; }
        .bt-kk-search { width: 100%; box-sizing: border-box; height: 32px; padding: 0 12px 0 32px; border: 1px solid rgb(255 255 255 / .1); border-radius: 10px; outline: none;
            background: #070909; color: #eef2ee; font: 13px var(--font-primary, sans-serif); }
        .bt-kk-search:focus { border-color: #53fc18; }
        .bt-kk-search::placeholder { color: #6b746b; }
        .bt-kk-searchicon { position: absolute; left: 11px; top: 9px; color: #6b746b; pointer-events: none; }
        .bt-kk-tabs { display: flex; align-items: center; gap: 12px; margin-top: 10px; padding: 0 2px; }
        .bt-kk-tabs button { padding: 0 0 4px; border: 0; border-bottom: 2px solid transparent; background: none; cursor: pointer; color: #9aa59a;
            font: 600 12px var(--font-primary, sans-serif); }
        .bt-kk-tabs button:hover { color: #eef2ee; }
        .bt-kk-tabs button.bt-kk-on { color: #eef2ee; border-bottom-color: #53fc18; }
        .bt-kk-tabs .bt-kk-btn { margin-left: auto; width: 24px; height: 24px; }
        .bt-kk-list { margin-top: 6px; max-height: 280px; overflow-y: auto; scrollbar-width: none; display: flex; flex-direction: column; gap: 2px; }
        .bt-kk-list::-webkit-scrollbar { display: none; }
        .bt-kk-row { display: flex; gap: 9px; align-items: center; padding: 5px; border-radius: 10px; cursor: pointer; min-width: 0; }
        .bt-kk-row:hover { background: rgb(255 255 255 / .06); }
        .bt-kk-row.bt-kk-current { background: rgb(83 252 24 / .12); }
        .bt-kk-thumb { position: relative; width: 92px; flex: none; aspect-ratio: 16 / 9; border-radius: 8px; background: #1b1f1d center / cover; }
        .bt-kk-avatar { width: 40px; height: 40px; flex: none; border-radius: 50%; background: #1b1f1d center / cover; margin: 0 26px; }
        .bt-kk-live { position: absolute; left: 4px; top: 4px; padding: 0 4px; border-radius: 4px; background: #53fc18; color: #0b0e0f; font: 800 9px/14px var(--font-primary, sans-serif); }
        .bt-kk-viewers { position: absolute; left: 4px; bottom: 4px; padding: 0 4px; border-radius: 4px; background: rgb(0 0 0 / .7); color: #fff; font: 600 9px/14px var(--font-primary, sans-serif); }
        .bt-kk-rowtext { flex: 1; min-width: 0; }
        .bt-kk-rowname { font-size: 12.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-kk-rowtitle { font-size: 11.5px; color: #d8ddd8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-kk-rowgame { font-size: 11px; color: #53fc18; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-kk-rowmuted { font-size: 11px; color: #9aa59a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-kk-msg { padding: 16px 8px; text-align: center; color: #9aa59a; font-size: 12px; }
        .bt-kk.bt-kk-collapsed { padding: 6px 8px; border-radius: 999px; }
        .bt-kk-collapsed .bt-kk-searchbox, .bt-kk-collapsed .bt-kk-tabs, .bt-kk-collapsed .bt-kk-list, .bt-kk-collapsed .bt-kk-chat,
        .bt-kk-collapsed .bt-kk-head .bt-kk-btn:not(.bt-kk-chevron) { display: none !important; }
        .bt-kk-collapsed .bt-kk-screen { height: 0; margin: 0; aspect-ratio: auto; }
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
        const clean = e => String(e?.message || e).replace(/^Error invoking remote method '[^']+': (Error: )?/, "");

        const root = el("div", { className: "bt-kk" });
        const btn = (name, title, onClick, extra = "") => {
            const b = el("button", { className: `bt-kk-btn ${extra}`.trim(), type: "button", title, innerHTML: kkIcon(name) });
            b.setAttribute("aria-label", title);
            b.onclick = e => { e.stopPropagation(); onClick(e, b); };
            return b;
        };
        const logo = el("span", { className: "bt-kk-logo", innerHTML: KK_LOGO });
        const title = el("div", { className: "bt-kk-title" });
        const chatBtn = btn("chat", "Show chat", () => api.setSetting("showChat", !api.settings.showChat));
        const openBtn = btn("external", "Open on Kick", () => current && window.open(watchUrl(current), "_blank", "noopener"));
        const closeBtn = btn("close", "Stop watching", () => play(null));
        const chevronBtn = btn("chevron", "Collapse", () => setCollapsed(!collapsed), "bt-kk-chevron");
        const head = el("div", { className: "bt-kk-head" });
        head.append(logo, title, chatBtn, openBtn, closeBtn, chevronBtn);

        const screen = el("div", { className: "bt-kk-screen" });
        const idle = el("div", { className: "bt-kk-idle" });
        idle.append(el("span", { innerHTML: KK_LOGO }), el("span", { textContent: "Pick a stream below, search, or paste a Kick link" }));
        screen.append(idle);
        const chatBox = el("div", { className: "bt-kk-chat" });
        let frame = null, chatFrame = null;

        const searchBox = el("div", { className: "bt-kk-searchbox" });
        const input = el("input", { className: "bt-kk-search", type: "search", placeholder: "Search channels or paste a Kick link", spellcheck: false });
        searchBox.append(el("span", { className: "bt-kk-searchicon", innerHTML: kkIcon("search", 14) }), input);
        const tabs = el("div", { className: "bt-kk-tabs" });
        const list = el("div", { className: "bt-kk-list" });
        root.append(head, screen, chatBox, searchBox, tabs, list);

        const watchUrl = v => v.kind === "video" ? `https://kick.com/video/${v.id}` : v.kind === "clip" ? `https://kick.com/${v.channel}?clip=${v.id}` : `https://kick.com/${v.id}`;
        function play(v, autoplay = true) {
            if (v?.kind === "clip") { window.open(watchUrl(v), "_blank", "noopener"); return; }
            current = v;
            frame?.remove(); frame = null;
            idle.hidden = !!v;
            if (v) {
                const p = new URLSearchParams({ autoplay: autoplay ? "true" : "false", muted: "false" });
                const src = v.kind === "video" ? `https://player.kick.com/video/${v.id}?${p}` : `https://player.kick.com/${v.id}?${p}`;
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
            chatBtn.classList.toggle("bt-kk-on", !!api.settings.showChat);
            chatBtn.title = api.settings.showChat ? "Hide chat" : "Show chat";
            chatBox.hidden = !want;
            chatBox.style.height = `${Math.max(160, Math.min(600, Number(api.settings.chatHeight) || 300))}px`;
            if (!want) { chatFrame?.remove(); chatFrame = null; return; }
            const src = `https://kick.com/popout/${current.id}/chat`;
            if (chatFrame?.dataset.src === src) return;
            chatFrame?.remove();
            chatFrame = el("iframe", { src, title: "Kick chat" });
            chatFrame.dataset.src = src;
            chatBox.append(chatFrame);
        }

        const TABS = () => [account.loggedIn && ["following", "Following"], ["top", "Live now"], query && ["search", "Results"]].filter(Boolean);
        function drawTabs() {
            const refresh = btn("refresh", "Refresh", () => load(tab, true));
            tabs.replaceChildren(...TABS().map(([k, label]) => {
                const b = el("button", { type: "button", textContent: label, className: k === tab ? "bt-kk-on" : "" });
                b.onclick = () => { tab = k; drawTabs(); load(k); };
                return b;
            }), refresh);
        }
        const msg = text => list.replaceChildren(el("div", { className: "bt-kk-msg", textContent: text }));
        let loadSeq = 0;
        async function load(kind, force) {
            if (!force && lists[kind]) return drawList();
            const my = ++loadSeq;
            msg(kind === "search" ? "Searching…" : "Loading…");
            try {
                const r = await api.kick.list(kind, kind === "search" ? query : "");
                lists[kind] = r.items || [];
            } catch (error) {
                const m = clean(error);
                if (my !== loadSeq) return;
                if (/not-logged-in/.test(m)) { account.loggedIn = false; updateStatus(); tab = "top"; drawTabs(); return load("top"); }
                return msg(`Couldn't load this (${m}).`);
            }
            if (my === loadSeq && tab === kind) drawList();
        }
        function drawList() {
            const items = lists[tab];
            if (!items) return;
            if (!items.length) return msg(tab === "following" ? "You don't follow anyone on Kick yet." : tab === "search" ? "No channels found." : "Nothing here.");
            list.replaceChildren(...items.map(it => {
                const row = el("div", { className: `bt-kk-row${current?.kind === "channel" && current.id === it.slug ? " bt-kk-current" : ""}`, title: it.title || it.name });
                if (it.live && it.thumb) {
                    const thumb = el("div", { className: "bt-kk-thumb" });
                    thumb.style.backgroundImage = `url("${it.thumb}")`;
                    thumb.append(el("span", { className: "bt-kk-live", textContent: "LIVE" }));
                    if (it.viewers) thumb.append(el("span", { className: "bt-kk-viewers", textContent: it.viewers }));
                    row.append(thumb);
                } else {
                    const av = el("div", { className: "bt-kk-avatar" });
                    if (it.avatar) av.style.backgroundImage = `url("${it.avatar}")`;
                    row.append(av);
                }
                const text = el("div", { className: "bt-kk-rowtext" });
                text.append(el("div", { className: "bt-kk-rowname", textContent: it.name }));
                if (it.title) text.append(el("div", { className: "bt-kk-rowtitle", textContent: it.title }));
                if (it.game) text.append(el("div", { className: "bt-kk-rowgame", textContent: it.game }));
                if (!it.live) text.append(el("div", { className: "bt-kk-rowmuted", textContent: `Offline${it.followers != null ? ` · ${kkCount(it.followers)} followers` : ""}` }));
                row.append(text);
                row.onclick = () => play({ kind: "channel", id: it.slug, name: it.name, title: it.title, game: it.game });
                return row;
            }));
        }

        const submit = () => {
            const t = input.value.trim();
            if (!t) return;
            const link = /kick\.com/i.test(t) ? parseKick(t) : null;
            if (link) { play({ ...link, name: link.channel || link.id }); input.value = ""; input.blur(); return; }
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
            if (/kick\.com/i.test(text) && parseKick(text)) { e.preventDefault(); input.value = text; submit(); }
        };
        window.addEventListener("paste", onPasteFirst, true);

        function render() {
            title.replaceChildren();
            if (current) {
                title.append(el("b", { textContent: current.name || current.id }),
                    el("small", { textContent: current.kind === "video" ? "Video" : [current.game, current.title].filter(Boolean).join(" · ") || "Live" }));
            } else {
                title.append(el("b", { textContent: "Kick" }), el("small", { textContent: account.loggedIn ? `Logged in${account.login ? ` as ${account.login}` : ""}` : "Not logged in" }));
            }
            openBtn.hidden = closeBtn.hidden = !current;
            chatBtn.hidden = !(current && current.kind === "channel");
        }
        function setCollapsed(on, save = true) {
            collapsed = !!on;
            root.classList.toggle("bt-kk-collapsed", collapsed);
            chevronBtn.title = collapsed ? "Expand" : "Collapse";
            if (save) api.storage.set("collapsed", collapsed).catch(() => {});
        }

        async function updateStatus() {
            account = await api.kick.status().catch(() => ({ loggedIn: false, login: "" }));
            api.setSetting("loginStatus", account.loggedIn ? `Logged in${account.login ? ` as ${account.login}` : ""}` : "Not logged in (watching and search work without it)");
            if (!account.loggedIn && tab === "following") tab = "top";
            drawTabs();
            render();
        }
        this.login = async () => {
            api.toast("Log in to Kick in the window that opened…");
            try {
                await api.kick.login();
                api.toast("Kick connected.");
                tab = "following";
                lists.following = null;
            } catch (error) {
                const m = clean(error);
                if (!/window was closed/i.test(m)) api.toast(m, 6000);
            }
            await updateStatus();
            load(tab);
        };
        this.logout = async () => {
            await api.kick.logout().catch(() => {});
            lists.following = null;
            api.toast("Logged out of Kick.");
            await updateStatus();
            load(tab);
        };
        this.refreshChat = () => drawChat();

        const mount = panels => {
            if (stopped || !panels) return;
            const above = [...panels.querySelectorAll(":scope > .bt-sp, :scope > .bt-yt, :scope > .bt-lz, :scope > .bt-tw")].pop();
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
