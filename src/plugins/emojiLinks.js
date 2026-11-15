const EMOJI_URL = /\/emojis\/(\d+)\.(\w+)/;

const emojiFrom = item => {
    const img = item.querySelector("img");
    const m = img && EMOJI_URL.exec(img.currentSrc || img.src);
    const id = (m && m[1]) || item.getAttribute("data-id");
    if (!id || !/^\d+$/.test(id)) return null;
    const animated = (img && (/\.gif\b/i.test(img.currentSrc || img.src) || /[?&]animated=true/.test(img.src))) || item.getAttribute("data-animated") === "true";
    const name = (item.getAttribute("data-name") || img?.alt || "emoji").replace(/[^\w-]/g, "_").slice(0, 64) || "emoji";
    return { id, animated, name };
};

async function uploadImage(api, channelId, url, filename) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not fetch image (HTTP ${response.status})`);
    const blob = await response.blob();
    const safeName = filename.replace(/[^\w.-]/g, "_").slice(0, 90);
    const slot = await api.discord.rest.post(`/channels/${channelId}/attachments`, {
        files: [{ id: "0", filename: safeName, file_size: blob.size }],
    });
    const attachment = slot?.attachments?.[0];
    if (!attachment?.upload_url || !attachment?.upload_filename) throw new Error("Discord did not return an upload slot");
    const put = await fetch(attachment.upload_url, { method: "PUT", body: blob, headers: { "Content-Type": blob.type || "application/octet-stream" } });
    if (!put.ok) throw new Error(`Image upload failed (HTTP ${put.status})`);
    await api.discord.rest.post(`/channels/${channelId}/messages`, {
        content: "",
        attachments: [{ id: "0", filename: safeName, uploaded_filename: attachment.upload_filename }],
    });
}

BThemer.definePlugin({
    id: "emojiLinks",
    name: "Emoji",
    description: "Show and send custom emojis from your servers as image attachments, even where Discord locks them.",
    author: "Be Themer",
    version: "2.0.0",
    settings: {
        size: { type: "select", label: "Image size", options: [["96", "Small"], ["160", "Medium"], ["256", "Large"]], default: "160" },
    },
    css: `
        [class*="emojiPicker_"] [aria-disabled="true"], [class*="emojiPicker_"] [class*="disabled" i],
        [class*="expressionPicker_"] [aria-disabled="true"] { opacity: 1 !important; filter: none !important; }
        [class*="emojiPicker_"] [class*="emojiItem_"]:hover { filter: none !important; }
    `,
    start(api) {
        const busy = new Set();
        const onClick = async e => {
            if (window.BThemer?.__wp?.fakeNitroEnabled?.()) return;
            const item = e.target instanceof Element && e.target.closest('[data-type="emoji"], [class*="emojiItem_"]');
            if (!item || !item.closest('[class*="emojiPicker_"], [class*="expressionPicker_"], [id*="emoji-picker"], [role="grid"]')) return;
            const emoji = emojiFrom(item);
            if (!emoji || busy.has(emoji.id)) return;
            const channelId = api.discord.route().channelId;
            if (!channelId) return api.toast("Open a chat before sending an emoji.");
            e.preventDefault();
            e.stopImmediatePropagation();
            busy.add(emoji.id);
            try {
                const ext = emoji.animated ? "gif" : "webp";
                const size = Number(api.settings.size) || 160;
                const url = `https://cdn.discordapp.com/emojis/${emoji.id}.${ext}?size=${size}&quality=lossless`;
                await uploadImage(api, channelId, url, `${emoji.name}.${ext}`);
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
                api.toast("Emoji sent.");
            } catch (error) {
                api.warn("Emoji upload failed", error);
                api.toast(`Couldn't send emoji: ${error.message || error}`);
            } finally { busy.delete(emoji.id); }
        };
        document.addEventListener("click", onClick, true);
        api.onDispose(() => document.removeEventListener("click", onClick, true));
    },
});
