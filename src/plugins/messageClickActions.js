const isInteractive = el => el.closest('a, button, input, textarea, [role="button"], [role="textbox"], video, audio, [class*="reactions_"], [class*="embed"]');

BThemer.definePlugin({
    id: "messageClickActions",
    name: "Message Click Actions",
    description: "Double-click to edit (yours) or reply (others'). Backspace + click deletes your message.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        enableDeleteOnClick: { type: "toggle", label: "Hold Backspace and click: delete", default: true },
        enableDoubleClickToEdit: { type: "toggle", label: "Double-click your message: edit", default: true },
        enableDoubleClickToReply: { type: "toggle", label: "Double-click other messages: reply", default: true },
        requireModifier: { type: "toggle", label: "Only when Shift or Ctrl is held while double-clicking", default: false },
    },

    start(api) {
        let backspace = false;
        const key = e => {
            if (e.key === "Backspace") backspace = e.type === "keydown";
        };
        const blur = () => (backspace = false);
        window.addEventListener("keydown", key, true);
        window.addEventListener("keyup", key, true);
        window.addEventListener("blur", blur);

        const resolve = target => {
            if (!(target instanceof Element) || isInteractive(target) || !target.closest('[id^="chat-messages-"]')) return null;
            const ids = api.discord.messageIdsOf(target);
            const msg = ids && api.discord.getMessage(ids.channelId, ids.messageId);
            return msg ? { ...ids, msg, own: msg.author?.id === api.discord.currentUser()?.id } : null;
        };

        const canManage = channelId => {
            try {
                const channel = api.discord.store("ChannelStore")?.getChannel(channelId);
                const perms = api.discord.store("PermissionStore");
                return !!(channel?.guild_id && perms?.can?.(1n << 13n, channel));
            } catch {
                return false;
            }
        };
        const click = e => {
            if (!backspace || !api.settings.enableDeleteOnClick) return;
            const m = resolve(e.target);
            if (!m || (!m.own && !canManage(m.channelId))) return;
            if (m.msg.deleted) return;
            e.preventDefault();
            e.stopPropagation();
            api.discord.rest.del(`/channels/${m.channelId}/messages/${m.messageId}`).catch(err => api.toast("Couldn't delete: " + err.message));
        };
        const dblclick = e => {
            if (api.settings.requireModifier && !e.shiftKey && !e.ctrlKey) return;
            const m = resolve(e.target);
            if (!m) return;
            window.getSelection()?.removeAllRanges();
            if (m.own && api.settings.enableDoubleClickToEdit) {
                api.discord.dispatch({ type: "MESSAGE_START_EDIT", channelId: m.channelId, messageId: m.messageId, content: m.msg.content, source: "bt-dblclick" });
            } else if ((!m.own || !api.settings.enableDoubleClickToEdit) && api.settings.enableDoubleClickToReply) {
                const channel = api.discord.store("ChannelStore")?.getChannel(m.channelId);
                if (!channel) return;
                const nrm = !!window.BThemer?.settings?.plugins?.noReplyMention?.enabled;
                api.discord.dispatch({ type: "CREATE_PENDING_REPLY", channel, message: m.msg, shouldMention: !nrm, showMentionToggle: channel.guild_id != null });
            }
        };
        document.addEventListener("click", click, true);
        document.addEventListener("dblclick", dblclick);
        api.onDispose(() => {
            window.removeEventListener("keydown", key, true);
            window.removeEventListener("keyup", key, true);
            window.removeEventListener("blur", blur);
            document.removeEventListener("click", click, true);
            document.removeEventListener("dblclick", dblclick);
        });
    },
});
