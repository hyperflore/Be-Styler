const hash = str => {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h;
};

BThemer.definePlugin({
    id: "usernameTools",
    name: "Username Tools",
    description: "Usernames next to nicknames, unique IRC-style name colours, and data-author-id on messages for themes.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        names: { type: "toggle", label: "Change how names are shown", default: true },
        mode: {
            type: "select",
            label: "Names",
            options: [["user-nick", "Username, then nickname"], ["nick-user", "Nickname, then username"], ["user", "Username only"], ["nick", "Nickname only"]],
            default: "user-nick",
        },
        friendNicknames: {
            type: "select",
            label: "Friend nicknames",
            options: [["dms", "Only in direct messages"], ["always", "Prefer over server nicknames"], ["fallback", "Only when there's no server nickname"]],
            default: "dms",
        },
        displayNames: { type: "toggle", label: "Use display names instead of usernames", default: false },
        inReplies: { type: "toggle", label: "Also in reply previews", default: false },
        ircColors: { type: "toggle", label: "IRC-style unique name colours", default: false },
        lightness: { type: "range", label: "IRC colour lightness", min: 0, max: 100, unit: "%", default: 70 },
        saturation: { type: "range", label: "IRC colour saturation", min: 0, max: 100, unit: "%", default: 100 },
        seed: { type: "text", label: "IRC colour seed (change to reshuffle everyone's colour)", default: "" },
        memberListColors: { type: "toggle", label: "IRC colours in the member list too", default: true },
        applyColorOnlyToUsersWithoutColor: { type: "toggle", label: "IRC colours only for people without a role colour", default: false },
        applyColorOnlyInDms: { type: "toggle", label: "IRC colours only in DMs", default: false },
        attributes: { type: "toggle", label: "Add data-author-id etc. to messages (for themes)", default: true },
    },

    css: `
        [data-bt-names] { font-size: 0 !important; }
        [data-bt-names]::before { content: attr(data-bt-first); font-size: 1rem; }
        [data-bt-names][data-bt-second]::after { content: attr(data-bt-second); font-size: .8rem; margin-left: 4px; opacity: .6; font-weight: 500; }
        [class*="repliedMessage_"] [data-bt-names]::before { font-size: .875rem; }
        [class*="repliedMessage_"] [data-bt-names]::after { font-size: .75rem; }`,

    start(api) {
        const s = api.settings;
        const store = n => api.discord.store(n);
        const me = () => api.discord.currentUser()?.id;

        const colorFor = id => {
            const hue = hash(String(s.seed || "") + id) % 360;
            return `hsl(${hue} ${s.saturation}% ${s.lightness}%)`;
        };
        const inDm = channelId => {
            try {
                return !store("ChannelStore")?.getChannel(channelId)?.guild_id;
            } catch {
                return false;
            }
        };
        const nickFor = (user, channelId) => {
            let server = null;
            let friend = null;
            try {
                const g = store("ChannelStore")?.getChannel(channelId)?.guild_id;
                server = g ? store("GuildMemberStore")?.getNick?.(g, user.id) : null;
                friend = store("RelationshipStore")?.getNickname?.(user.id) || null;
            } catch { }
            if (friend) {
                if (s.friendNicknames === "always") return friend;
                if (s.friendNicknames === "fallback" && !server) return friend;
                if (s.friendNicknames === "dms" && inDm(channelId)) return friend;
            }
            return server || user.globalName || user.global_name || null;
        };

        const applyNames = (el, user, channelId) => {
            if (!s.names || !el) return;
            const handle = s.displayNames ? user.globalName || user.global_name || user.username : user.username;
            const nick = nickFor(user, channelId) || handle;
            let first = handle;
            let second = nick;
            if (s.mode === "nick-user") [first, second] = [nick, handle];
            else if (s.mode === "user") second = null;
            else if (s.mode === "nick") {
                first = nick;
                second = null;
            }
            if (second && second.toLowerCase() === first.toLowerCase()) second = null;
            el.dataset.btNames = "1";
            el.dataset.btFirst = first;
            if (second) el.dataset.btSecond = second;
            else delete el.dataset.btSecond;
        };
        const applyColor = (el, userId, channelId) => {
            if (!s.ircColors || !el) return;
            if (s.applyColorOnlyInDms && !inDm(channelId)) return;
            if (s.applyColorOnlyToUsersWithoutColor && el.style.color && !el.dataset.btIrc) return;
            el.style.setProperty("color", colorFor(userId), "important");
            el.dataset.btIrc = "1";
        };

        const decorate = li => {
            const ids = api.discord.messageIdsOf(li);
            const msg = ids && api.discord.getMessage(ids.channelId, ids.messageId);
            const author = msg?.author;
            if (!author) return;
            if (s.attributes) {
                li.dataset.authorId = author.id;
                li.dataset.authorUsername = author.username;
                if (author.id === me()) li.dataset.isSelf = "true";
                if (author.bot) li.dataset.isBot = "true";
            }
            const name = li.querySelector('[id^="message-username-"] [class*="username_"]');
            applyNames(name, author, ids.channelId);
            applyColor(name, author.id, ids.channelId);

            if (s.inReplies && msg.messageReference) {
                const ref = api.discord.getMessage(msg.messageReference.channel_id, msg.messageReference.message_id);
                const replyName = li.querySelector('[class*="repliedMessage_"] [class*="username_"]');
                if (ref?.author && replyName) {
                    applyNames(replyName, ref.author, ids.channelId);
                    applyColor(replyName, ref.author.id, ids.channelId);
                }
            }
        };
        api.observe('[id^="chat-messages-"]', decorate);

        const AVATAR_ID = /\/avatars\/(\d+)\//;
        api.observe('[class*="membersWrap_"] [class*="member_"]', member => {
            if (!s.ircColors || !s.memberListColors) return;
            const id = AVATAR_ID.exec(member.querySelector("img")?.src || "")?.[1];
            const name = member.querySelector('[class*="name_"] span, [class*="username_"]');
            if (id && name) applyColor(name, id, api.discord.route().channelId);
        });

        const undo = () => {
            document.querySelectorAll("[data-bt-names]").forEach(e => {
                delete e.dataset.btNames;
                delete e.dataset.btFirst;
                delete e.dataset.btSecond;
            });
            document.querySelectorAll("[data-bt-irc]").forEach(e => {
                e.style.removeProperty("color");
                delete e.dataset.btIrc;
            });
            document.querySelectorAll("[data-author-id]").forEach(e => {
                for (const k of ["authorId", "authorUsername", "isSelf", "isBot"]) delete e.dataset[k];
            });
        };
        api.onDispose(undo);
        this._redo = () => {
            undo();
            document.querySelectorAll('[id^="chat-messages-"]').forEach(decorate);
        };
    },

    onSettingChange() {
        this._redo?.();
    },
});
