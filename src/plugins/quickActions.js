BThemer.definePlugin({
    id: "quickActions",
    name: "Handy Actions",
    description: "\"Read All\" button, jump to the first message, friend invite links, copy channel link.",

    css: `.bt-read-all { display: block; margin: 4px auto 8px; width: 48px; padding: 4px 0; border: 0; border-radius: 8px; cursor: pointer;
        font-size: 10px; font-weight: 700; color: var(--text-normal, #dbdee1); background: var(--background-primary, #313338); }
        .bt-read-all:hover { background: var(--brand-500, #5865f2); color: #fff; }`,
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        readAllButton: { type: "toggle", label: "\"Read All\" button above the server list", default: true },
        readAllHotkey: { type: "toggle", label: "Ctrl+Shift+Alt+R marks everything read", default: true },
        jumpToTopMenu: { type: "toggle", label: "\"Jump to Top\" in channel / DM right-click menus", default: true },
    },

    start(api) {
        const markAllRead = async () => {
            const readStates = api.discord.store("ReadStateStore");
            const channels = api.discord.store("ChannelStore");
            const guildChannels = api.discord.store("GuildChannelStore");
            const guilds = api.discord.store("GuildStore");
            if (!readStates || !guilds) return api.toast("Couldn't find Discord's read state");
            const list = [];
            const consider = id => {
                try {
                    if (readStates.hasUnread?.(id)) {
                        const last = readStates.lastMessageId?.(id) || channels?.getChannel(id)?.lastMessageId;
                        if (last) list.push({ channel_id: id, message_id: last, read_state_type: 0 });
                    }
                } catch { }
            };
            for (const gid of Object.keys(guilds.getGuilds?.() || {})) {
                const all = guildChannels?.getChannels?.(gid);
                for (const group of Object.values(all || {})) {
                    if (!Array.isArray(group)) continue;
                    for (const entry of group) consider(entry.channel?.id || entry.id);
                }
                for (const thread of Object.values(api.discord.store("ActiveJoinedThreadsStore")?.getActiveJoinedThreadsForGuild?.(gid) || {})) {
                    for (const t of Object.values(thread || {})) consider(t.channel?.id);
                }
            }
            if (!list.length) return api.toast("Nothing unread");
            try {
                for (let i = 0; i < list.length; i += 100) {
                    await api.discord.rest.post("/read-states/ack-bulk", { read_states: list.slice(i, i + 100) });
                }
                api.toast(`Marked ${list.length} channel${list.length === 1 ? "" : "s"} as read`);
            } catch (e) {
                api.toast("Couldn't mark as read: " + e.message);
            }
        };

        const jumpToTop = target => {
            const channelId = typeof target === "string" ? target : api.discord.route().channelId;
            if (!channelId) return api.toast("Open a channel first");
            const actions = api.webpack.find(c => typeof c.jumpToMessage === "function" && typeof c.fetchMessages === "function");
            if (actions) actions.jumpToMessage({ channelId, messageId: "1", flash: false, jumpType: "INSTANT" });
            else api.toast("Couldn't find Discord's jump function");
        };

        const friendInvite = async () => {
            try {
                const inv = await api.discord.rest.post("/users/@me/invites", {});
                const url = "https://discord.gg/" + inv.code;
                api.copy(url);
                api.toast(`Friend invite copied: ${url} (max uses ${inv.max_uses ?? "∞"}, expires ${inv.expires_at ? new Date(inv.expires_at).toLocaleString() : "never"})`);
            } catch (e) {
                api.toast("Couldn't create invite: " + e.message);
            }
        };
        const listInvites = async () => {
            const box = api.el("div", { style: "display:flex;flex-direction:column;gap:8px" });
            try {
                const invites = (await api.discord.rest.get("/users/@me/invites")) || [];
                if (!invites.length) box.append(api.el("div", { textContent: "No friend invites." }));
                for (const inv of invites) {
                    box.append(api.el("div", { textContent: `discord.gg/${inv.code} · used ${inv.uses ?? 0}/${inv.max_uses || "∞"} · expires ${inv.expires_at ? new Date(inv.expires_at).toLocaleString() : "never"}` }));
                }
                if (invites.length) {
                    const revoke = api.el("button", { className: "bt-btn", textContent: "Revoke all" });
                    revoke.addEventListener("click", async () => {
                        try {
                            await api.discord.rest.del("/users/@me/invites");
                            api.toast("Friend invites revoked");
                            box.replaceChildren(api.el("div", { textContent: "Revoked." }));
                        } catch (e) {
                            api.toast("Couldn't revoke: " + e.message);
                        }
                    });
                    box.append(revoke);
                }
            } catch (e) {
                box.append(api.el("div", { textContent: "Couldn't load: " + e.message }));
            }
            api.openWindow("Friend invites", box);
        };

        const copyChannelLink = () => {
            const { guildId, channelId } = api.discord.route();
            if (!channelId) return api.toast("Open a channel first");
            api.copy(`https://discord.com/channels/${guildId}/${channelId}`);
            api.toast("Channel link copied");
        };

        api.addMenuItem("Mark all servers as read", markAllRead);
        api.addMenuItem("Jump to first message", jumpToTop);
        api.addMenuItem("Create friend invite", friendInvite);
        api.addMenuItem("Manage friend invites", listInvites);
        api.addMenuItem("Copy channel link", copyChannelLink);
        api.onKey("ctrl+alt+home", jumpToTop);
        api.onKey("ctrl+shift+alt+r", () => api.settings.readAllHotkey && markAllRead());

        api.contextMenu(["channel-context", "thread-context", "gdm-context", "user-context"], ({ target }) => {
            if (!api.settings.jumpToTopMenu) return null;
            const listId = target.closest("[data-list-item-id]")?.getAttribute("data-list-item-id") || "";
            let channelId = /(\d{15,25})$/.exec(listId)?.[1];
            const channels = api.discord.store("ChannelStore");
            if (channelId && !channels?.getChannel?.(channelId)) channelId = channels?.getDMFromUserId?.(channelId) || null;
            if (!channelId) return null;
            return [{ id: "bt-jump-to-top", label: "Jump to Top", action: () => jumpToTop(channelId) }];
        });

        const placeButton = () => {
            const existing = document.querySelector(".bt-read-all");
            if (!api.settings.readAllButton) return existing?.remove();
            const home = document.querySelector('nav[class*="guilds_"] [class*="tutorialContainer_"], nav[class*="guilds_"] [data-list-item-id="guildsnav___home"]');
            const anchor = home?.closest('[class*="listItem_"]') || home;
            if (!anchor || (existing && existing.isConnected && existing.previousElementSibling === anchor)) return;
            existing?.remove();
            const btn = api.el("button", { className: "bt-read-all", textContent: "Read All", title: "Mark every server as read" });
            btn.addEventListener("click", markAllRead);
            anchor.after(btn);
        };
        api.observe('nav[class*="guilds_"]', placeButton);
        const placeTimer = setInterval(placeButton, 3000);
        api.onDispose(() => {
            clearInterval(placeTimer);
            document.querySelector(".bt-read-all")?.remove();
        });
    },
});
