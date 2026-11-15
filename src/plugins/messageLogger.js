const EPHEMERAL = 1 << 6;
const MAX_LOG = 2000;
const HIDE_ON_DELETED = ["edit", "reply", "forward", "thread", "pin", "delete", "mark-unread", "apps", "bookmark", "reminder"];
const CHANNEL_MENUS = ["channel-context", "thread-context", "user-context", "gdm-context", "guild-context"];

const isId = s => /^\d{1,25}$/.test(String(s));
const idList = text => new Set(String(text || "").split(/[\s,]+/).filter(isId));
const fullTime = t => {
    const d = t instanceof Date ? t : new Date(t);
    return isNaN(d) ? "" : d.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });
};
const shortTime = t => {
    const d = t instanceof Date ? t : new Date(t);
    return isNaN(d) ? "?" : d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" });
};

const deleted = new Map();
const history = new Map();
const goneFiles = new Map();
const unhighlighted = new Set();
const expanded = new Set();
let log = [];

BThemer.definePlugin({
    id: "messageLogger",
    name: "Message Logger",
    description: "Deleted messages stay visible in red and edits keep their earlier versions, until you restart Discord.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        deleteStyle: { type: "select", label: "Style of deleted messages", options: [["text", "Red text"], ["overlay", "Red overlay"]], default: "text" },
        logDeletes: { type: "toggle", label: "Log deleted messages", default: true },
        collapseDeleted: { type: "toggle", label: "Collapse deleted messages (like blocked messages)", default: false },
        logEdits: { type: "toggle", label: "Log edited messages", default: true },
        logDeletedAttachments: { type: "toggle", label: "Log deleted attachments", default: true },
        inlineEdits: { type: "toggle", label: "Show edit history as part of the message", default: true },
        ignoreBots: { type: "toggle", label: "Ignore messages by bots", default: true },
        ignoreSelf: { type: "toggle", label: "Ignore my own messages", default: false },
        ignoreUsers: { type: "text", label: "Ignore user IDs (comma-separated)", default: "" },
        ignoreChannels: { type: "text", label: "Ignore channel / category IDs (comma-separated)", default: "" },
        ignoreGuilds: { type: "text", label: "Ignore server IDs (comma-separated)", default: "" },
        saveLog: { type: "toggle", label: "Also save deleted messages to a log on this PC (Be Themer extra)", default: false },
    },

    css: s => `
        .bt-ml-edit { white-space: pre-wrap; word-break: break-word; }
        /* earlier versions of an edited message: dull, so the current text stands out */
        .bt-ml-edit { color: var(--text-muted, #949ba4) !important; opacity: .6; }
        .bt-ml-edit :is(a, code, strong, em, span) { color: inherit !important; }
        .bt-ml-edit img { opacity: .7; }
        .bt-ml-edit .bt-ml-edited-tag { font-size: .625rem; line-height: 1; color: var(--text-muted, #949ba4); margin-left: 4px; cursor: default; user-select: none; }
        .bt-ml-collapsed { display: flex; align-items: center; gap: 8px; margin: 4px 16px 4px 72px; padding: 6px 10px; border-radius: 8px;
            font-size: 14px; color: var(--text-muted, #949ba4); background: var(--background-secondary, rgb(0 0 0 / .2)); }
        .bt-ml-collapsed button { margin-left: auto; background: none; border: 0; color: var(--text-link, #00a8fc); cursor: pointer; font: inherit; }
        .bt-ml-collapsed button:hover { text-decoration: underline; }
        .bt-ml-hist-tabs { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-bottom: 14px; border-bottom: 1px solid var(--background-modifier-accent, #3f4147); }
        .bt-ml-hist-tabs button { background: none; border: 0; border-bottom: 2px solid transparent; padding: 6px 2px; color: var(--interactive-normal, #b5bac1); cursor: pointer; font: inherit; font-size: 13px; }
        .bt-ml-hist-tabs button.on { color: var(--interactive-active, #fff); border-bottom-color: var(--brand-500, #5865f2); }
        .bt-ml-hist-tabs button:disabled { opacity: .45; cursor: not-allowed; }
        .bt-ml-hist-body { white-space: pre-wrap; word-break: break-word; line-height: 1.375; }
        .bt-ml-item { padding: 10px 12px; margin: 8px 0; border-radius: 10px; background: rgb(0 0 0 / .25); border-left: 3px solid var(--status-danger, #f23f43); }
        .bt-ml-item p { margin: 6px 0 0; white-space: pre-wrap; word-break: break-word; }
        .bt-ml-item small { opacity: .6; }`,

    start(api) {
        const s = api.settings;
        const store = name => api.discord.store(name);
        const me = () => api.discord.currentUser()?.id;
        const channelOf = id => {
            try {
                return store("ChannelStore")?.getChannel(id) || null;
            } catch {
                return null;
            }
        };
        const keyOf = (c, m) => `${c}:${m}`;

        const shouldIgnore = (msg, isEdit) => {
            if (!msg) return true;
            try {
                const author = msg.author || {};
                const channelId = msg.channel_id ?? msg.channelId;
                const ch = channelOf(channelId);
                if (isEdit ? !s.logEdits : !s.logDeletes) return true;
                if (s.ignoreBots && author.bot) return true;
                if (s.ignoreSelf && author.id === me()) return true;
                if (idList(s.ignoreUsers).has(author.id)) return true;
                const chans = idList(s.ignoreChannels);
                if (chans.has(channelId) || (ch?.parent_id && chans.has(ch.parent_id))) return true;
                if (ch?.guild_id && idList(s.ignoreGuilds).has(ch.guild_id)) return true;
                return false;
            } catch {
                return false;
            }
        };
        const hasHistory = (c, m) => deleted.has(keyOf(c, m)) || !!history.get(m)?.edits.length || !!goneFiles.get(m)?.attachments.size;
        const channelHasHistory = c => {
            for (const e of deleted.values()) if (e.channelId === c) return true;
            for (const e of history.values()) if (e.channelId === c && e.edits.length) return true;
            for (const e of goneFiles.values()) if (e.channelId === c && e.attachments.size) return true;
            return false;
        };

        const roots = new Map();
        let parser;
        let ReactDOM;
        let React;
        let Boundary;
        const renderContent = (el, content, channelId, messageId) => {
            try {
                parser ??= api.webpack.find(c => typeof c.parse === "function" && typeof c.parseTopic === "function") || null;
                React ??= api.webpack.find(c => typeof c.createElement === "function" && typeof c.Component === "function" && typeof c.useState === "function" && typeof c.version === "string") || null;
                ReactDOM ??= (React && api.webpack.find(c => typeof c.createRoot === "function" && typeof c.hydrateRoot === "function" && c.version === React.version)) || null;
                if (parser && ReactDOM && React) {
                    Boundary ??= class extends React.Component {
                        constructor(props) {
                            super(props);
                            this.state = { failed: false };
                        }
                        static getDerivedStateFromError() {
                            return { failed: true };
                        }
                        componentDidCatch() {}
                        render() {
                            return this.state.failed ? this.props.fallback : this.props.children;
                        }
                    };
                    const tree = parser.parse(content, true, {
                        channelId,
                        messageId,
                        allowLinks: true,
                        allowHeading: true,
                        allowList: true,
                        allowEmojiLinks: true,
                        viewingChannelId: store("SelectedChannelStore")?.getChannelId?.(),
                    });
                    let root = roots.get(el);
                    if (!root) roots.set(el, (root = ReactDOM.createRoot(el)));
                    root.render(React.createElement(Boundary, { fallback: content }, tree));
                    setTimeout(() => {
                        if (!el.isConnected || el.textContent.trim() || !String(content).trim()) return;
                        try {
                            root.unmount();
                        } catch { }
                        roots.delete(el);
                        el.textContent = content;
                    }, 120);
                    return;
                }
            } catch { }
            el.textContent = content;
        };
        const unmountGone = () => {
            for (const [el, root] of roots) {
                if (el.isConnected) continue;
                roots.delete(el);
                try {
                    root.unmount();
                } catch { }
            }
        };
        api.onDispose(() => {
            for (const root of roots.values()) {
                try {
                    root.unmount();
                } catch { }
            }
            roots.clear();
        });

        const sheet = api.css("");
        let collapsedIds = [];
        const renderCss = () => {
            const red = [];
            for (const [k, e] of deleted) if (!unhighlighted.has(k) && isId(e.channelId) && isId(e.id)) red.push(`#chat-messages-${e.channelId}-${e.id}`);
            const files = [];
            for (const e of goneFiles.values()) for (const aid of e.attachments.keys()) if (isId(aid)) files.push(aid);
            const out = [];
            if (red.length) {
                const sel = red.join(",\n");
                out.push(
                    s.deleteStyle === "overlay"
                        ? `:is(${sel}) { background-color: color-mix(in srgb, var(--status-danger, #f23f43) 15%, transparent) !important; }`
                        : `:is(${sel}) {
                            --text-default: var(--status-danger, #f23f43); --text-normal: var(--status-danger, #f23f43);
                            --text-muted: var(--status-danger, #f23f43); --interactive-icon-default: var(--status-danger, #f23f43);
                            --header-primary: var(--status-danger, #f23f43);
                            --text-link: #be3535; --text-strong: #be3535; --embed-title: #be3535; }
                           :is(${sel}) [id^="message-content-"] { color: var(--status-danger, #f23f43) !important; }`,
                    `:is(${sel}) [class*="buttonsInner_"] [role="button"]:not(.bt-ml-clear), :is(${sel}) [class*="buttonsInner_"] [class*="separator_"] { display: none !important; }`,
                    `:is(${sel}) :is(img[class*="emoji"], [data-type="sticker"], [class*="embedIframe_"], [class*="embedSpotify_"], [class*="imageContainer_"], [class*="mosaicItem_"]) { filter: grayscale(1) !important; transition: filter .15s ease-in-out; }
                     :is(${sel}) :is(img[class*="emoji"], [data-type="sticker"], [class*="embedIframe_"], [class*="embedSpotify_"], [class*="imageContainer_"], [class*="mosaicItem_"]):hover { filter: none !important; }
                     :is(${sel}) [class*="spoilerWarning"] { color: var(--status-danger, #f23f43); }`,
                );
            }
            if (files.length) {
                const has = files.map(id => `[src*="/${id}/"], [href*="/${id}/"]`).join(", ");
                out.push(
                    `[id^="chat-messages-"] :is([class*="mosaicItem_"], [class*="messageAttachment_"], [class*="imageContainer_"], [class*="attachment_"]):has(${has}) { filter: grayscale(1) !important; transition: filter .15s ease-in-out; }
                     [id^="chat-messages-"] :is([class*="mosaicItem_"], [class*="messageAttachment_"], [class*="imageContainer_"], [class*="attachment_"]):has(${has}):hover { filter: none !important; }`,
                );
            }
            const editIds = [...history.entries()].filter(([id, e]) => e.edits.length && isId(id)).map(([id]) => `#message-content-${id} [class*="edited_"]`);
            if (editIds.length) out.push(`${editIds.join(", ")} { cursor: pointer; }`);
            if (collapsedIds.length) out.push(`${collapsedIds.map(id => "#" + id).join(", ")} { display: none !important; }`);
            sheet.update(out.join("\n"));
        };

        const renderEdits = () => {
            for (const [id, e] of history) {
                if (!isId(id)) continue;
                const content = document.getElementById(`message-content-${id}`);
                const parent = content?.parentElement;
                let box = parent?.querySelector(`:scope > .bt-ml-edits[data-id="${id}"]`);
                if (!content || !s.inlineEdits || !e.edits.length) {
                    box?.remove();
                    continue;
                }
                if (box && box.nextElementSibling !== content) {
                    box.remove();
                    box = null;
                }
                if (box && box.dataset.count === String(e.edits.length)) continue;
                if (!box) {
                    box = api.el("div", { className: "bt-ml-edits" });
                    box.dataset.id = id;
                    content.before(box);
                }
                box.dataset.count = String(e.edits.length);
                box.replaceChildren();
                for (const edit of e.edits) {
                    const row = api.el("div", { className: "bt-ml-edit" });
                    const text = api.el("span");
                    renderContent(text, edit.content, e.channelId, id);
                    row.append(text, api.el("span", { className: "bt-ml-edited-tag", textContent: "(edited)", title: fullTime(edit.timestamp) }));
                    box.append(row);
                }
            }
            for (const box of document.querySelectorAll(".bt-ml-edits")) {
                const e = history.get(box.dataset.id);
                if (!e || !e.edits.length || !s.inlineEdits) box.remove();
            }
            unmountGone();
        };
        const clearButton = () => {
            const b = api.el("div", { className: "bt-ml-clear", role: "button", tabIndex: 0, title: "Clear history" });
            b.setAttribute("aria-label", "Clear history");
            b.innerHTML =
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 3a9 9 0 0 0-9 9H1l3.9 3.9.1.1L9 12H6a7 7 0 1 1 2.05 4.95l-1.42 1.42A9 9 0 1 0 13 3Zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8H12Z"/></svg>';
            return b;
        };
        const renderButtons = () => {
            if (!deleted.size && !history.size && !goneFiles.size && !document.querySelector(".bt-ml-clear")) return;
            for (const inner of document.querySelectorAll('[id^="chat-messages-"] [class*="buttonsInner_"]')) {
                const ids = api.discord.messageIdsOf(inner);
                const existing = inner.querySelector(".bt-ml-clear");
                if (!ids || !hasHistory(ids.channelId, ids.messageId)) {
                    existing?.remove();
                    continue;
                }
                if (existing) continue;
                const b = clearButton();
                const sample = inner.querySelector('[role="button"]');
                if (sample) b.className = sample.className + " bt-ml-clear";
                b.style.display = "flex";
                b.style.alignItems = "center";
                b.style.justifyContent = "center";
                b.addEventListener("click", e => {
                    e.stopPropagation();
                    clearMessageHistory(ids.channelId, ids.messageId);
                });
                inner.prepend(b);
            }
        };

        let applyingCollapse = false;
        const renderCollapse = () => {
            applyingCollapse = true;
            try {
                document.querySelectorAll(".bt-ml-collapsed").forEach(b => b.remove());
                const hidden = [];
                if (s.collapseDeleted && s.logDeletes) {
                    for (const list of document.querySelectorAll('ol[data-list-id="chat-messages"]')) {
                        let run = [];
                        const flush = () => {
                            if (!run.length) return;
                            const first = run[0];
                            const firstId = first.id;
                            const open = expanded.has(firstId);
                            const n = run.length;
                            const bar = api.el("div", { className: "bt-ml-collapsed" });
                            const label = api.el("span", { textContent: `${n} deleted message${n === 1 ? "" : "s"}` });
                            const btn = api.el("button", { textContent: open ? "Collapse" : "Show" });
                            btn.addEventListener("click", () => {
                                open ? expanded.delete(firstId) : expanded.add(firstId);
                                refresh();
                            });
                            bar.append(label, btn);
                            first.before(bar);
                            if (!open) hidden.push(...run.map(li => li.id));
                            run = [];
                        };
                        for (const li of list.querySelectorAll(':scope > li[id^="chat-messages-"]')) {
                            const m = /^chat-messages-(\d+)-(\d+)$/.exec(li.id);
                            if (m && deleted.has(keyOf(m[1], m[2]))) run.push(li);
                            else flush();
                        }
                        flush();
                    }
                }
                const changed = hidden.join() !== collapsedIds.join();
                collapsedIds = hidden;
                if (changed) renderCss();
            } finally {
                applyingCollapse = false;
            }
        };

        let queued = false;
        const refresh = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                renderCss();
                renderEdits();
                renderButtons();
                renderCollapse();
            });
        };
        const mo = new MutationObserver(muts => {
            if (applyingCollapse) return;
            const ours = n => n.nodeType === 1 && (n.classList.contains("bt-ml-collapsed") || n.classList.contains("bt-ml-edits") || n.classList.contains("bt-ml-clear") || n.closest?.(".bt-ml-edits"));
            if (muts.every(m => [...m.addedNodes, ...m.removedNodes].every(ours))) return;
            refresh();
        });
        mo.observe(document.body, { childList: true, subtree: true });
        api.onDispose(() => {
            mo.disconnect();
            document.querySelectorAll(".bt-ml-collapsed, .bt-ml-edits, .bt-ml-clear").forEach(e => e.remove());
        });

        let passing = false;
        const dispatchOwn = action => {
            passing = true;
            try {
                api.discord.dispatch(action);
            } finally {
                passing = false;
            }
        };
        const clearMessageHistory = (channelId, id) => {
            const k = keyOf(channelId, id);
            if (deleted.has(k)) {
                deleted.delete(k);
                unhighlighted.delete(k);
                history.delete(id);
                goneFiles.delete(id);
                dispatchOwn({ type: "MESSAGE_DELETE", channelId, id, mlDeleted: true });
            } else {
                history.delete(id);
                const files = goneFiles.get(id);
                goneFiles.delete(id);
                if (files?.attachments.size) {
                    const msg = api.discord.getMessage(channelId, id);
                    const keep = (msg?.attachments || []).filter(a => !files.attachments.has(a.id));
                    dispatchOwn({ type: "MESSAGE_UPDATE", message: { id, channel_id: channelId, attachments: keep } });
                }
            }
            refresh();
        };
        const loggedIn = want => {
            const out = new Map();
            const add = (c, id) => {
                if (!want(c)) return;
                if (!out.has(c)) out.set(c, new Set());
                out.get(c).add(id);
            };
            for (const e of deleted.values()) add(e.channelId, e.id);
            for (const [id, e] of history) if (e.edits.length) add(e.channelId, id);
            for (const [id, e] of goneFiles) if (e.attachments.size) add(e.channelId, id);
            return out;
        };
        const countOf = found => [...found.values()].reduce((n, ids) => n + ids.size, 0);
        const clearLogs = want => {
            const found = loggedIn(want);
            for (const [channelId, ids] of found) for (const id of ids) clearMessageHistory(channelId, id);
            return countOf(found);
        };
        const cleared = (n, where) => api.toast(n ? `Cleared ${n} logged message${n === 1 ? "" : "s"}${where}` : "Nothing was logged");

        api.storage.get("log").then(saved => {
            if (Array.isArray(saved)) log = saved.concat(log).slice(0, MAX_LOG);
        });
        let saveTimer = 0;
        const remember = (msg, channelId) => {
            if (!s.saveLog) return;
            const ch = channelOf(channelId);
            log.unshift({
                id: msg.id,
                channelId,
                guildId: ch?.guild_id || null,
                channelName: ch?.name || "DM",
                author: msg.author ? msg.author.globalName || msg.author.global_name || msg.author.username : "Unknown",
                content: typeof msg.content === "string" ? msg.content : "",
                attachments: (msg.attachments || []).map(a => a.url || a.proxy_url).filter(Boolean),
                at: Date.now(),
            });
            if (log.length > MAX_LOG) log.length = MAX_LOG;
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => api.storage.set("log", log).catch(() => {}), 1000);
        };

        const keepDeleted = (channelId, id) => {
            const msg = api.discord.getMessage(channelId, id);
            if (!msg) return false;
            if ((msg.flags & EPHEMERAL) === EPHEMERAL || shouldIgnore(msg, false)) return false;
            if (!deleted.has(keyOf(channelId, id))) remember(msg, channelId);
            deleted.set(keyOf(channelId, id), { channelId, id });
            return true;
        };

        api.flux.intercept(action => {
            if (!action || typeof action.type !== "string" || passing) return;
            switch (action.type) {
                case "MESSAGE_DELETE": {
                    if (action.mlDeleted) return;
                    if (keepDeleted(action.channelId, action.id)) {
                        refresh();
                        return false;
                    }
                    deleted.delete(keyOf(action.channelId, action.id));
                    return;
                }
                case "MESSAGE_DELETE_BULK": {
                    if (action.mlDeleted || !Array.isArray(action.ids)) return;
                    const kept = action.ids.filter(id => keepDeleted(action.channelId, id));
                    if (!kept.length) return;
                    refresh();
                    action.ids = action.ids.filter(id => !kept.includes(id));
                    if (!action.ids.length) return false;
                    return;
                }
                case "MESSAGE_UPDATE": {
                    const m = action.message;
                    if (!m || !m.id) return;
                    const channelId = m.channel_id ?? m.channelId;
                    const old = api.discord.getMessage(channelId, m.id);
                    if (!old) return;

                    if (s.logDeletedAttachments && Array.isArray(m.attachments) && !shouldIgnore({ ...old, channel_id: channelId }, true)) {
                        const oldFiles = old.attachments || [];
                        const newIds = new Set(m.attachments.map(a => a.id));
                        const gone = oldFiles.filter(a => !newIds.has(a.id));
                        if (gone.length) {
                            const entry = goneFiles.get(m.id) || { channelId, attachments: new Map() };
                            for (const a of gone) entry.attachments.set(a.id, a);
                            goneFiles.set(m.id, entry);
                            const byId = new Map(m.attachments.map(a => [a.id, a]));
                            m.attachments = oldFiles.map(a => byId.get(a.id) || a).concat(m.attachments.filter(a => !oldFiles.some(o => o.id === a.id)));
                        }
                    }

                    if (typeof m.content === "string" && typeof old.content === "string" && old.content !== m.content && !shouldIgnore({ ...old, channel_id: channelId }, true)) {
                        let e = history.get(m.id);
                        if (!e) {
                            const sent = old.timestamp ? new Date(old.timestamp) : null;
                            const firstEdit = old.editedTimestamp || old.edited_timestamp;
                            e = { channelId, sentTimestamp: sent, firstEditTimestamp: firstEdit ? new Date(firstEdit) : sent, edits: [] };
                            history.set(m.id, e);
                        }
                        e.edits.push({ content: old.content, timestamp: new Date(m.edited_timestamp || Date.now()) });
                    }
                    refresh();
                    return;
                }
                case "MESSAGE_CREATE": {
                    const m = action.message;
                    try {
                        if (!m?.nonce || m.author?.id === me()) return;
                        const prev = api.discord.getMessage(m.channel_id, m.nonce);
                        if (prev && prev.state === "SENT" && prev.id !== m.id) delete m.nonce;
                    } catch { }
                    return;
                }
                case "MESSAGE_START_EDIT": {
                    if (deleted.has(keyOf(action.channelId, action.messageId))) return false;
                    return;
                }
                case "LOAD_MESSAGES_SUCCESS":
                case "CHANNEL_SELECT":
                    refresh();
                    return;
            }
        });

        const openHistory = (channelId, id) => {
            const e = history.get(id);
            const msg = api.discord.getMessage(channelId, id);
            if (!e || !e.edits.length) return;
            const timestamps = [e.firstEditTimestamp, ...e.edits.map(x => x.timestamp)];
            const contents = [...e.edits.map(x => x.content), msg && typeof msg.content === "string" ? msg.content : ""];
            let current = e.edits.length;
            const wrap = api.el("div");
            const tabs = api.el("div", { className: "bt-ml-hist-tabs" });
            const body = api.el("div", { className: "bt-ml-hist-body" });
            const show = () => {
                for (const b of tabs.querySelectorAll("button[data-i]")) b.classList.toggle("on", +b.dataset.i === current);
                renderContent(body, contents[current], channelId, id);
            };
            if (e.sentTimestamp && e.firstEditTimestamp && e.firstEditTimestamp.getTime() !== e.sentTimestamp.getTime()) {
                tabs.append(api.el("button", { textContent: shortTime(e.sentTimestamp), disabled: true, title: "The original text was sent before Message Logger saw this message, so it wasn't recorded." }));
            }
            timestamps.forEach((t, i) => {
                const b = api.el("button", { textContent: shortTime(t), title: fullTime(t) });
                b.dataset.i = String(i);
                b.addEventListener("click", () => {
                    current = i;
                    show();
                });
                tabs.append(b);
            });
            wrap.append(tabs, body);
            api.openWindow("Message Edit History", wrap);
            show();
        };
        const editedClick = ev => {
            const marker = ev.target instanceof Element && ev.target.closest('[id^="message-content-"] [class*="edited_"], [class*="edited_"]');
            if (!marker) return;
            const ids = api.discord.messageIdsOf(marker);
            if (!ids || !history.get(ids.messageId)?.edits.length) return;
            ev.preventDefault();
            ev.stopPropagation();
            openHistory(ids.channelId, ids.messageId);
        };
        document.addEventListener("click", editedClick, true);
        api.onDispose(() => document.removeEventListener("click", editedClick, true));

        api.contextMenu("message", ({ target }) => {
            const ids = api.discord.messageIdsOf(target);
            if (!ids || !hasHistory(ids.channelId, ids.messageId)) return null;
            const k = keyOf(ids.channelId, ids.messageId);
            const isDeleted = deleted.has(k);
            const items = [];
            if (isDeleted && document.getElementById(`chat-messages-${ids.channelId}-${ids.messageId}`)) {
                items.push({
                    id: "ml-toggle-style",
                    label: "Toggle Deleted Highlight",
                    action: () => {
                        unhighlighted.has(k) ? unhighlighted.delete(k) : unhighlighted.add(k);
                        renderCss();
                    },
                });
            }
            items.push({ id: "ml-remove-history", label: "Clear Message Log", danger: true, action: () => clearMessageHistory(ids.channelId, ids.messageId) });
            return { items, hide: isDeleted ? HIDE_ON_DELETED : [] };
        });
        const listItemId = target => /(\d{1,25})$/.exec(target.closest("[data-list-item-id]")?.getAttribute("data-list-item-id") || "")?.[1] || null;
        const clearItem = (want, where) => {
            const n = countOf(loggedIn(want));
            return n
                ? { id: "ml-clear-channel", label: `Clear Message Logs (${n})`, danger: true, action: () => cleared(clearLogs(want), where) }
                : { id: "ml-clear-channel", label: "Clear Message Logs (none)", disabled: true };
        };
        api.contextMenu(CHANNEL_MENUS, ({ navId, target }) => {
            if (navId === "guild-context") {
                const guildId = listItemId(target) || api.discord.route().guildId;
                if (!guildId || guildId === "@me") return null;
                return [clearItem(c => channelOf(c)?.guild_id === guildId, " in this server")];
            }
            let channelId = listItemId(target);
            if (navId === "user-context") {
                if (channelId && !channelOf(channelId)) channelId = store("ChannelStore")?.getDMFromUserId?.(channelId) || null;
                if (!channelId) return null;
            } else if (!channelId || !channelOf(channelId)) {
                channelId = api.discord.route().channelId;
            }
            if (!channelId) return null;
            const where = navId === "user-context" || navId === "gdm-context" ? " in this DM" : navId === "thread-context" ? " in this thread" : " in this channel";
            return [clearItem(c => c === channelId, where)];
        });
        api.addMenuItem("Clear all message logs", () => cleared(clearLogs(() => true), ""));

        api.addMenuItem("Deleted message log", () => {
            const list = api.el("div");
            if (!s.saveLog && !log.length) list.append(api.el("div", { textContent: 'Turn on "Also save deleted messages to a log" in Message Logger\'s settings to keep a log here.' }));
            else if (!log.length) list.append(api.el("div", { textContent: "No deleted messages logged yet." }));
            for (const e of log.slice(0, 500)) {
                const item = api.el("div", { className: "bt-ml-item" });
                item.append(api.el("b", { textContent: e.author || "Unknown" }), api.el("small", { textContent: ` in #${e.channelName || e.channelId} · ${new Date(e.at).toLocaleString()}` }));
                item.append(api.el("p", { textContent: e.content || "(no text)" }));
                for (const url of e.attachments || []) item.append(api.el("div", { textContent: `Attachment: ${url}` }));
                list.append(item);
            }
            if (log.length) {
                const clear = api.el("button", { className: "bt-b bt-danger", textContent: "Clear log" });
                clear.onclick = () => {
                    log = [];
                    api.storage.set("log", log).catch(() => {});
                    list.replaceChildren(api.el("div", { textContent: "Cleared." }));
                };
                list.prepend(clear);
            }
            api.openWindow("Deleted messages", list);
        });

        this._refresh = refresh;
        refresh();
    },

    onSettingChange() {
        this._refresh?.();
    },
});
