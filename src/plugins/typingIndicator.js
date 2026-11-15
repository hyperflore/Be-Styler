const MODES = { both: 3, dots: 1, avatars: 2 };

BThemer.definePlugin({
    id: "typingIndicator",
    name: "Typing Indicator",
    description: "Shows who's typing next to channels and DMs in the sidebar.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        includeCurrentChannel: { type: "toggle", label: "Include the channel you're in", default: true },
        includeMutedChannels: { type: "toggle", label: "Include muted channels", default: false },
        includeIgnoredUsers: { type: "toggle", label: "Include ignored users", default: false },
        includeBlockedUsers: { type: "toggle", label: "Include blocked users", default: false },
        indicatorMode: { type: "select", label: "Show", options: [["both", "Avatars and animated dots"], ["dots", "Animated dots"], ["avatars", "Avatars"]], default: "both" },
    },

    css: `
        .bt-typing { display: inline-flex; gap: 4px; margin-left: 6px; align-items: center; flex: none; }
        .bt-typing-avatars { display: inline-flex; }
        .bt-typing-avatars img { width: 16px; height: 16px; border-radius: 50%; margin-left: -4px; box-shadow: 0 0 0 2px var(--background-secondary, #2b2d31); }
        .bt-typing-avatars img:first-child { margin-left: 0; }
        .bt-typing-avatars span { font-size: 10px; margin-left: 2px; opacity: .8; }
        .bt-typing-dots { display: inline-flex; gap: 2px; }
        .bt-typing-dots i { width: 4px; height: 4px; border-radius: 50%; background: currentColor; opacity: .5; animation: bt-typing 1.2s infinite ease-in-out; }
        .bt-typing-dots i:nth-child(2) { animation-delay: .15s; } .bt-typing-dots i:nth-child(3) { animation-delay: .3s; }
        @keyframes bt-typing { 0%, 60%, 100% { opacity: .3; transform: none; } 30% { opacity: 1; transform: translateY(-2px); } }`,

    start(api) {
        const s = api.settings;
        const store = n => api.discord.store(n);
        const typers = channelId => {
            const me = api.discord.currentUser()?.id;
            const rel = store("RelationshipStore");
            try {
                return Object.keys(store("TypingStore")?.getTypingUsers(channelId) || {}).filter(id => {
                    if (id === me) return false;
                    if (!s.includeBlockedUsers && rel?.isBlocked?.(id)) return false;
                    if (!s.includeIgnoredUsers && rel?.isIgnored?.(id)) return false;
                    return true;
                });
            } catch {
                return [];
            }
        };
        const skipChannel = channelId => {
            if (!s.includeCurrentChannel && api.discord.route().channelId === channelId) return true;
            if (s.includeMutedChannels) return false;
            try {
                const ch = store("ChannelStore")?.getChannel(channelId);
                return !!store("UserGuildSettingsStore")?.isChannelMuted?.(ch?.guild_id ?? null, channelId);
            } catch {
                return false;
            }
        };
        const user = id => store("UserStore")?.getUser?.(id);
        const nameOf = (id, channelId) => {
            const u = user(id);
            let nick = null;
            try {
                const g = store("ChannelStore")?.getChannel(channelId)?.guild_id;
                nick = g ? store("GuildMemberStore")?.getNick?.(g, id) : null;
            } catch { }
            return nick || u?.globalName || u?.global_name || u?.username || "Someone";
        };
        const avatarOf = id => {
            const u = user(id);
            try {
                return u?.getAvatarURL?.(null, 32) || (u?.avatar ? `https://cdn.discordapp.com/avatars/${id}/${u.avatar}.webp?size=32` : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(id) >> 22n) % 6}.png`);
            } catch {
                return "https://cdn.discordapp.com/embed/avatars/0.png";
            }
        };
        const tooltip = (users, channelId) => {
            const names = users.map(id => nameOf(id, channelId));
            if (names.length === 1) return `${names[0]} is typing...`;
            if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
            if (names.length === 3) return `${names[0]}, ${names[1]} and ${names[2]} are typing...`;
            return "Several people are typing...";
        };

        const update = () => {
            const mode = MODES[s.indicatorMode] ?? 3;
            for (const link of document.querySelectorAll('[data-list-item-id^="channels___"], [data-list-item-id^="private-channels-"]')) {
                const id = /(\d+)$/.exec(link.getAttribute("data-list-item-id") || "")?.[1];
                if (!id) continue;
                const users = skipChannel(id) ? [] : typers(id);
                let box = link.querySelector(".bt-typing");
                if (!users.length) {
                    box?.remove();
                    continue;
                }
                const sig = mode + ":" + users.join(",");
                if (box && box.dataset.sig === sig) continue;
                if (!box) {
                    box = api.el("span", { className: "bt-typing" });
                    const nameEl = link.querySelector('[class*="name_"], [class*="overflow_"]') || link;
                    (nameEl.parentElement || link).append(box);
                }
                box.dataset.sig = sig;
                box.replaceChildren();
                if (mode & 2) {
                    const av = api.el("span", { className: "bt-typing-avatars" });
                    for (const u of users.slice(0, 3)) av.append(api.el("img", { src: avatarOf(u), alt: "" }));
                    if (users.length > 3) av.append(api.el("span", { textContent: `+${users.length - 3}` }));
                    box.append(av);
                }
                if (mode & 1) {
                    const dots = api.el("span", { className: "bt-typing-dots" });
                    dots.append(api.el("i"), api.el("i"), api.el("i"));
                    box.append(dots);
                }
                box.title = tooltip(users, id);
            }
        };
        let queued = false;
        const schedule = () => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                update();
            });
        };
        api.flux.subscribe("TYPING_START", schedule);
        api.flux.subscribe("TYPING_STOP", schedule);
        api.flux.subscribe("MESSAGE_CREATE", schedule);
        api.flux.subscribe("CHANNEL_SELECT", schedule);
        const timer = setInterval(update, 3000);
        api.onDispose(() => {
            clearInterval(timer);
            document.querySelectorAll(".bt-typing").forEach(e => e.remove());
        });
        this._update = schedule;
    },

    onSettingChange() {
        document.querySelectorAll(".bt-typing").forEach(e => e.remove());
        this._update?.();
    },
});
