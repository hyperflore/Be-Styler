const ids = text => new Set(String(text || "").split(/[\s,]+/).filter(s => /^\d{1,25}$/.test(s)));
let shiftHeld = false;

BThemer.definePlugin({
    id: "noReplyMention",
    name: "No Reply Mention",
    description: "Replies don't ping by default, with user and role exceptions.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        userList: { type: "text", label: "User IDs (comma-separated)", default: "" },
        roleList: { type: "text", label: "Role IDs (comma-separated)", default: "" },
        shouldPingListed: {
            type: "select",
            label: "Listed users / roles",
            options: [["no", "Never ping the listed users / roles"], ["yes", "Only ping the listed users / roles"]],
            default: "yes",
        },
        inverseShiftReply: { type: "toggle", label: "Invert Shift (Shift+Reply pings)", default: false },
    },

    start(api) {
        const track = e => (shiftHeld = e.shiftKey);
        for (const t of ["keydown", "keyup", "mousedown"]) window.addEventListener(t, track, true);
        api.onDispose(() => ["keydown", "keyup", "mousedown"].forEach(t => window.removeEventListener(t, track, true)));

        const isListed = (message, channel) => {
            const author = message?.author?.id;
            if (author && ids(api.settings.userList).has(author)) return true;
            const roles = ids(api.settings.roleList);
            if (!roles.size || !channel?.guild_id || !author) return false;
            try {
                const member = api.discord.store("GuildMemberStore")?.getMember?.(channel.guild_id, author);
                return !!member?.roles?.some(r => roles.has(r));
            } catch {
                return false;
            }
        };

        api.flux.intercept(action => {
            if (action?.type !== "CREATE_PENDING_REPLY" || action.__btNrm) return;
            action.__btNrm = true;
            const listed = isListed(action.message, action.channel);
            const ping = shiftHeld ? !!api.settings.inverseShiftReply : api.settings.shouldPingListed === "yes" ? listed : !listed;
            action.shouldMention = ping;
        });
    },
});
