const MAX_LOG = 200;

BThemer.definePlugin({
    id: "relationshipNotifier",
    name: "Relationship Notifier",
    description: "Tells you when a friend, group chat or server removes you, even while you were offline.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        notices: { type: "toggle", label: "Also show a banner at the top of the window", default: false },
        offlineRemovals: { type: "toggle", label: "Report removals that happened while Discord was closed", default: true },
        friends: { type: "toggle", label: "When a friend removes you", default: true },
        friendRequestCancels: { type: "toggle", label: "When a friend request is cancelled", default: true },
        servers: { type: "toggle", label: "When you're removed from a server", default: true },
        groups: { type: "toggle", label: "When you're removed from a group chat", default: true },
    },

    css: `
        .bt-rn-notice { position: fixed; top: 0; left: 0; right: 0; z-index: 10001; display: flex; align-items: center; justify-content: center; gap: 12px;
            padding: 8px 40px; font-size: 14px; font-weight: 500; color: #fff; background: var(--status-danger, #da373c); }
        .bt-rn-notice button { position: absolute; right: 12px; border: 0; background: none; color: #fff; font-size: 18px; cursor: pointer; }`,

    start(api) {
        const s = api.settings;
        const mine = new Set();
        let log = [];
        api.storage.get("log").then(saved => Array.isArray(saved) && (log = log.concat(saved).slice(0, MAX_LOG))).catch(() => {});

        const users = () => api.discord.store("UserStore");
        const userName = (id, fallback) => {
            const u = users()?.getUser?.(id);
            return u ? u.globalName || u.global_name || u.username : fallback || id;
        };

        let noticeEl = null;
        const notify = (text, icon) => {
            api.toast(text);
            log.unshift({ text, at: Date.now() });
            log = log.slice(0, MAX_LOG);
            api.storage.set("log", log).catch(() => {});
            try {
                if ("Notification" in window) new Notification("Relationship Notifier", { body: text, icon: icon || undefined });
            } catch { }
            if (s.notices) {
                noticeEl?.remove();
                noticeEl = api.el("div", { className: "bt-rn-notice" });
                const x = api.el("button", { textContent: "×" });
                x.onclick = () => {
                    noticeEl?.remove();
                    noticeEl = null;
                };
                noticeEl.append(api.el("span", { textContent: text }), x);
                document.body.append(noticeEl);
            }
        };
        api.onDispose(() => noticeEl?.remove());

        const snapshot = () => {
            const snap = { friends: {}, requests: {}, guilds: {}, groups: {} };
            try {
                const rel = api.discord.store("RelationshipStore");
                const map = rel?.getRelationships?.() || rel?.getMutableRelationships?.() || {};
                const entries = map instanceof Map ? [...map.entries()] : Object.entries(map);
                for (const [id, r] of entries) {
                    const type = typeof r === "object" && r ? r.type : r;
                    if (type === 1) snap.friends[id] = userName(id);
                    else if (type === 3 || type === 4) snap.requests[id] = userName(id);
                }
                for (const g of Object.values(api.discord.store("GuildStore")?.getGuilds?.() || {})) snap.guilds[g.id] = { name: g.name, icon: g.icon };
                const chans = api.discord.store("ChannelStore");
                const privates = chans?.getSortedPrivateChannels?.() || Object.values(chans?.getMutablePrivateChannels?.() || {});
                for (const c of privates) {
                    if (c.type === 3) snap.groups[c.id] = c.name || (c.recipients || []).map(r => userName(r)).join(", ") || "Unnamed group";
                }
            } catch (e) {
                api.warn("snapshot failed", e);
            }
            return snap;
        };
        let snap = snapshot();
        let saveTimer = 0;
        const saveSnapshot = () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                snap = snapshot();
                api.storage.set("snapshot", { at: Date.now(), ...snap }).catch(() => {});
            }, 2000);
        };
        const guildIcon = (id, icon) => (icon ? `https://cdn.discordapp.com/icons/${id}/${icon}.png?size=128` : null);

        const checkOffline = async () => {
            if (!s.offlineRemovals) return;
            const old = await api.storage.get("snapshot").catch(() => null);
            const now = snapshot();
            if (old && old.friends) {
                if (s.friends) for (const id of Object.keys(old.friends)) if (!now.friends[id]) notify(`${old.friends[id]} removed you as a friend (while you were offline)`);
                if (s.friendRequestCancels) for (const id of Object.keys(old.requests || {})) if (!now.requests[id] && !now.friends[id]) notify(`The friend request with ${old.requests[id]} was cancelled (while you were offline)`);
                if (s.servers) for (const id of Object.keys(old.guilds || {})) if (!now.guilds[id]) notify(`You were removed from the server ${old.guilds[id].name} (while you were offline)`, guildIcon(id, old.guilds[id].icon));
                if (s.groups) for (const id of Object.keys(old.groups || {})) if (!now.groups[id]) notify(`You were removed from the group ${old.groups[id]} (while you were offline)`);
            }
            snap = now;
            api.storage.set("snapshot", { at: Date.now(), ...now }).catch(() => {});
        };
        let checked = false;
        api.flux.subscribe("CONNECTION_OPEN", () => {
            setTimeout(() => {
                if (!checked) {
                    checked = true;
                    checkOffline();
                } else saveSnapshot();
            }, 4000);
        });
        if (api.discord.currentUser()) {
            checked = true;
            setTimeout(checkOffline, 4000);
        }

        api.net.onRequest(req => {
            if (req.method !== "DELETE") return;
            const m = /\/users\/@me\/(?:relationships|guilds)\/(\d+)|\/channels\/(\d+)(?:\?|$)/.exec(req.url);
            if (m) mine.add(m[1] || m[2]);
        });

        api.flux.subscribe("RELATIONSHIP_REMOVE", a => {
            const r = a.relationship || {};
            if (!r.id) return;
            if (mine.delete(r.id)) return saveSnapshot();
            const name = snap.friends[r.id] || snap.requests[r.id] || userName(r.id);
            if (r.type === 1 && s.friends) notify(`${name} removed you as a friend`, users()?.getUser?.(r.id)?.getAvatarURL?.(null, 128));
            else if ((r.type === 3 || r.type === 4) && s.friendRequestCancels) notify(`The friend request with ${name} was cancelled`, users()?.getUser?.(r.id)?.getAvatarURL?.(null, 128));
            saveSnapshot();
        });
        api.flux.subscribe("RELATIONSHIP_ADD", saveSnapshot);
        api.flux.subscribe("GUILD_CREATE", saveSnapshot);
        api.flux.subscribe("CHANNEL_CREATE", saveSnapshot);
        api.flux.subscribe("GUILD_DELETE", a => {
            const g = a.guild || {};
            if (!g.id || g.unavailable) return;
            if (!mine.delete(g.id) && s.servers) {
                const known = snap.guilds[g.id];
                notify(`You were removed from the server ${known?.name || "(unknown server)"}`, guildIcon(g.id, known?.icon));
            }
            saveSnapshot();
        });
        api.flux.subscribe("CHANNEL_DELETE", a => {
            const c = a.channel || {};
            if (c.type !== 3 || !c.id) return;
            if (!mine.delete(c.id) && s.groups) notify(`You were removed from the group ${snap.groups[c.id] || c.name || "chat"}`);
            saveSnapshot();
        });

        api.addMenuItem("Relationship log", () => {
            const list = api.el("div", { style: "display:flex;flex-direction:column;gap:6px" });
            if (!log.length) list.append(api.el("div", { textContent: "Nothing yet." }));
            for (const e of log) list.append(api.el("div", { textContent: `${new Date(e.at).toLocaleString()} · ${e.text}` }));
            api.openWindow("Relationship log", list);
        });
    },
});
