const STICKER_SIZES = [48, 96, 160, 256, 512];

BThemer.definePlugin({
    id: "stickers",
    name: "Sticker",
    description: "Use server sticker previews in channels where Discord blocks the native sticker.",
    author: "Be Themer",
    version: "2.1.0",
    settings: {
        enabled: { type: "toggle", label: "Enable locked server sticker links", default: true },
        size: { type: "select", label: "Preview size", options: STICKER_SIZES.map(n => [String(n), `${n}px`]), default: "160" },
    },
    css: `
        [class*="stickerPicker_"] [aria-disabled="true"], [class*="stickerPicker_"] [class*="disabled" i],
        [class*="expressionPicker_"] [aria-disabled="true"] { opacity: 1 !important; filter: none !important; }
    `,
    start(api) {
        const pending = new Map();
        const onSend = (channelId, message, options) => {
            const ids = options?.stickerIds || options?.sticker_ids;
            if (!api.settings.enabled || !Array.isArray(ids) || !ids.length || !message || typeof message.content !== "string") return;
            const sticker = api.discord.store("StickerStore")?.getStickerById?.(String(ids[0]));
            if (!sticker || "pack_id" in sticker || "packId" in sticker) return;
            const guildId = String(api.discord.route().guildId || "");
            const stickerGuild = String(sticker.guild_id || sticker.guildId || "");
            if (sticker.available !== false && stickerGuild === guildId) return;
            const ext = Number(sticker.format_type ?? sticker.formatType) === 4 ? "gif" : "png";
            const url = new URL(`https://media.discordapp.net/stickers/${sticker.id}.${ext}`);
            url.searchParams.set("size", String(Number(api.settings.size) || 160));
            url.searchParams.set("name", sticker.name || "sticker");
            url.searchParams.set("lossless", "true");
            const label = sticker.name || "sticker";
            const link = `[${label}](${url.href})`;
            message.content += `${message.content && !/\s$/.test(message.content) ? " " : ""}${link}`;
            pending.set(String(channelId), { link, expires: Date.now() + 15_000 });
            ids.length = 0;
        };
        api.onDispose(api.discord.onMessageSend(onSend));
        api.net.onRequest(req => {
            const match = req.method === "POST" && typeof req.body === "string" && /\/api\/v\d+\/channels\/(\d+)\/messages(?:\?|$)/.exec(req.url);
            if (!match) return;
            try {
                const body = JSON.parse(req.body);
                const item = pending.get(match[1]);
                const links = item && item.expires >= Date.now() ? [item.link] : [];
                const ids = Array.isArray(body.sticker_ids) ? body.sticker_ids.slice() : [];
                for (const id of ids) {
                    const sticker = api.discord.store("StickerStore")?.getStickerById?.(String(id));
                    if (!sticker || "pack_id" in sticker || "packId" in sticker) continue;
                    const ext = Number(sticker.format_type ?? sticker.formatType) === 4 ? "gif" : "png";
                    const url = new URL(`https://media.discordapp.net/stickers/${sticker.id}.${ext}`);
                    url.searchParams.set("size", String(Number(api.settings.size) || 160));
                    url.searchParams.set("name", sticker.name || "sticker");
                    url.searchParams.set("lossless", "true");
                    links.push(`[${sticker.name || "sticker"}](${url.href})`);
                }
                if (!links.length) return;
                for (const link of links) if (!String(body.content || "").includes(link)) {
                    body.content = `${body.content && !/\s$/.test(body.content) ? " " : ""}${link}`;
                }
                if (Array.isArray(body.sticker_ids)) body.sticker_ids = [];
                pending.delete(match[1]);
                return { body: JSON.stringify(body) };
            } catch (error) {
                api.warn("Sticker couldn't preserve its link in the outgoing request", error);
            }
        });
        api.onDispose(() => pending.clear());
    },
});
