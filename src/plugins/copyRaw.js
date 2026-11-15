const COPY_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
let messageStore = null;

const rawText = (api, channelId, messageId) => {
    messageStore ??= api.webpack.findStore("MessageStore");
    try {
        const msg = messageStore && messageStore.getMessage(channelId, messageId);
        if (msg && typeof msg.content === "string") return msg.content;
    } catch { }
    const el = document.getElementById(`message-content-${messageId}`);
    return el ? el.textContent : "";
};

BThemer.definePlugin({
    id: "copyRaw",
    name: "Copy Raw Message",
    description: "Adds a copy button to the message toolbar that copies a message's raw text. Shift+click copies its ID.",
    author: "Be Themer",
    version: "1.0.0",

    css: `
        .bt-copy-raw { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px;
            cursor: pointer; border-radius: 6px; font-size: 15px; user-select: none; }
        .bt-copy-raw:hover { background: var(--background-modifier-hover, rgb(255 255 255 / .08)); }`,

    start(api) {
        api.observe('[class*="buttonsInner_"]', toolbar => {
            if (toolbar.querySelector(".bt-copy-raw")) return;
            const item = toolbar.closest('li[id^="chat-messages-"]');
            const ids = item && /^chat-messages-(\d+)-(\d+)$/.exec(item.id);
            if (!ids) return;
            const [, channelId, messageId] = ids;
            const btn = api.el("div", { className: "bt-copy-raw", role: "button", tabIndex: 0, title: "Copy raw text (Shift: copy ID)" });
            btn.innerHTML = COPY_ICON;
            btn.style.display = "flex";
            btn.style.alignItems = "center";
            btn.style.justifyContent = "center";
            btn.onclick = e => {
                e.stopPropagation();
                const text = e.shiftKey ? messageId : rawText(api, channelId, messageId);
                api.copy(text);
                api.toast(e.shiftKey ? "Message ID copied" : "Raw message copied");
            };
            toolbar.prepend(btn);
        });
        api.onDispose(() => document.querySelectorAll(".bt-copy-raw").forEach(b => b.remove()));
    },
});
