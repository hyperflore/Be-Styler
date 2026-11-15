BThemer.definePlugin({
    id: "vcDoubleClick",
    name: "Voice Double-Click",
    description: "Voice and stage channels need a double-click to join, so you never join by accident.",
    author: "Be Themer",
    version: "1.0.0",

    start(api) {
        const click = e => {
            if (e.button !== 0 || e.detail >= 2) return;
            const link = e.target instanceof Element && e.target.closest('[data-list-item-id^="channels___"]');
            if (!link || e.target.closest('[role="button"][aria-label], button')) return;
            const id = /(\d+)$/.exec(link.getAttribute("data-list-item-id") || "")?.[1];
            if (!id) return;
            let ch = null;
            try {
                ch = api.discord.store("ChannelStore")?.getChannel(id);
            } catch { }
            if (!ch || (ch.type !== 2 && ch.type !== 13)) return;
            if (api.discord.store("SelectedChannelStore")?.getVoiceChannelId?.() === id) return;
            e.preventDefault();
            e.stopImmediatePropagation();
        };
        document.addEventListener("click", click, true);
        api.onDispose(() => document.removeEventListener("click", click, true));
    },
});
