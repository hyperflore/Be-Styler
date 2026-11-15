const MESSAGE_LINK = /^\/channels\/(?:@me|\d{1,25})\/(\d{1,25})\/(\d{1,25})\/?$/;
const DISCORD_HOST = /^(?:(?:canary|ptb)\.)?discord(?:app)?\.com$/i;

BThemer.definePlugin({
    id: "messageLinkEmbeds",
    name: "Message Link Embeds",
    description: "Preview linked Discord messages your account is allowed to read.",
    author: "Be Themer",
    version: "1.0.0",

    css: `
        .bt-message-link-preview { margin-left: 5px; padding: 2px 6px; border: 0; border-radius: 4px; background: var(--background-modifier-accent); color: var(--interactive-normal); cursor: pointer; font-size: 11px; }
        .bt-message-link-preview:disabled { cursor: wait; opacity: .6; }
        .bt-message-link-card { max-width: min(560px, 78vw); white-space: pre-wrap; overflow-wrap: anywhere; }
        .bt-message-link-meta { margin-bottom: 8px; opacity: .7; font-size: 12px; }
        .bt-message-link-content { margin: 0; }
    `,

    start(api) {
        const parseLink = href => {
            try {
                const url = new URL(href);
                const match = MESSAGE_LINK.exec(url.pathname);
                if (!DISCORD_HOST.test(url.hostname) || !match) return null;
                return { channelId: match[1], messageId: match[2] };
            } catch {
                return null;
            }
        };

        const preview = async (button, ids) => {
            button.disabled = true;
            button.textContent = "Loading";
            try {
                const message = await api.discord.rest.get(`/channels/${ids.channelId}/messages/${ids.messageId}`);
                if (!message || message.id !== ids.messageId || message.channel_id !== ids.channelId) {
                    throw new Error("Discord did not return that message.");
                }
                const content = api.el("div", { className: "bt-message-link-card" });
                const author = message.author?.global_name || message.author?.globalName || message.author?.username || "Unknown user";
                const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleString() : "";
                content.append(api.el("div", { className: "bt-message-link-meta", textContent: timestamp ? `${author} · ${timestamp}` : author }));
                content.append(api.el("p", { className: "bt-message-link-content", textContent: message.content || "(no text content)" }));
                api.openWindow("Linked message", content);
                button.textContent = "Preview";
            } catch (error) {
                api.toast(error.status === 403 || error.status === 404 ? "That message isn't available to this account." : `Couldn't load message: ${error.message}`);
                button.textContent = "Preview";
            } finally {
                button.disabled = false;
            }
        };

        api.observe('[id^="message-content-"] a[href]', anchor => {
            if (anchor.closest(".bt-message-link-preview")) return;
            const ids = parseLink(anchor.href);
            if (!ids || anchor.parentElement?.querySelector(":scope > .bt-message-link-preview")) return;
            const button = api.el("button", { className: "bt-message-link-preview", type: "button", textContent: "Preview", title: "Preview linked message" });
            button.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                preview(button, ids);
            });
            anchor.after(button);
        });

        api.onDispose(() => document.querySelectorAll(".bt-message-link-preview").forEach(button => button.remove()));
    },
});