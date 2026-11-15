BThemer.definePlugin({
    id: "noBlockedMessages",
    name: "No Blocked Messages",
    description: "Blocked (and ignored) users' messages disappear from chat, with no \"blocked message\" bars.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        ignoreMessages: { type: "toggle", label: "Completely ignore incoming messages from blocked (and ignored) users", default: false },
        applyToIgnoredUsers: { type: "toggle", label: "Also apply to ignored users", default: true },
    },

    css: `[class*="blockedSystemMessage_"], li:has(> [class*="blockedSystemMessage_"]), [class*="groupStart_"]:has([class*="blockedSystemMessage_"]) { display: none !important; }`,

    start(api) {
        const hidden = id => {
            const rel = api.discord.store("RelationshipStore");
            if (!rel || !id) return false;
            try {
                return !!rel.isBlocked?.(id) || (api.settings.applyToIgnoredUsers && !!rel.isIgnored?.(id));
            } catch {
                return false;
            }
        };
        const mark = () => {
            for (const li of document.querySelectorAll('li[id^="chat-messages-"]')) {
                const ids = api.discord.messageIdsOf(li);
                const msg = ids && api.discord.getMessage(ids.channelId, ids.messageId);
                const hide = !!msg && hidden(msg.author?.id);
                if (hide !== (li.dataset.btBlocked === "1")) {
                    if (hide) {
                        li.dataset.btBlocked = "1";
                        li.style.display = "none";
                    } else {
                        delete li.dataset.btBlocked;
                        li.style.display = "";
                    }
                }
            }
        };
        api.observe('li[id^="chat-messages-"]', () => queueMicrotask(mark));
        api.onDispose(() =>
            document.querySelectorAll("[data-bt-blocked]").forEach(li => {
                li.style.display = "";
                delete li.dataset.btBlocked;
            }),
        );

        api.flux.intercept(action => {
            if (!api.settings.ignoreMessages || !action) return;
            if (action.type === "MESSAGE_CREATE" && hidden(action.message?.author?.id)) return false;
            if (action.type === "LOAD_MESSAGES_SUCCESS" && Array.isArray(action.messages)) {
                action.messages = action.messages.filter(m => !hidden(m?.author?.id));
            }
        });
    },
});
