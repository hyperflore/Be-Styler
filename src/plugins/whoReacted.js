const REACTION = '[class*="reaction_"]';

BThemer.definePlugin({
    id: "whoReacted",
    name: "Who Reacted",
    description: "Alt-click a reaction to see who reacted to that visible message.",
    author: "Be Themer",
    version: "1.0.0",

    css: `
        .bt-who-reacted-list { display: flex; flex-direction: column; gap: 5px; min-width: 240px; max-width: min(440px, 78vw); }
        .bt-who-reacted-user { display: flex; align-items: center; gap: 8px; padding: 5px 0; }
        .bt-who-reacted-avatar { width: 28px; height: 28px; flex: none; border-radius: 50%; object-fit: cover; }
        .bt-who-reacted-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bt-who-reacted-note { opacity: .7; font-size: 12px; }
    `,

    start(api) {
        const getReaction = (element, message) => {
            const image = element.querySelector("img");
            const imageId = image && /\/emojis\/(\d+)/.exec(image.src)?.[1];
            const label = [element.getAttribute("aria-label"), image?.alt, image?.getAttribute("aria-label")]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return (message.reactions || []).find(reaction => {
                if (!reaction?.emoji?.name) return false;
                if (reaction.emoji.id && imageId === reaction.emoji.id) return true;
                return !reaction.emoji.id && label.includes(reaction.emoji.name.toLowerCase());
            }) || null;
        };

        const showReactors = async (ids, reaction) => {
            const emoji = reaction.emoji.id ? `${reaction.emoji.name}:${reaction.emoji.id}` : reaction.emoji.name;
            try {
                const users = await api.discord.rest.get(
                    `/channels/${ids.channelId}/messages/${ids.messageId}/reactions/${encodeURIComponent(emoji)}?limit=100`,
                );
                if (!Array.isArray(users)) throw new Error("Discord returned an unexpected response.");

                const box = api.el("div", { className: "bt-who-reacted-list" });
                if (!users.length) {
                    box.append(api.el("div", { className: "bt-empty", textContent: "No reactors found." }));
                } else {
                    for (const user of users) {
                        const name = user.global_name || user.globalName || user.username || "Unknown user";
                        const row = api.el("div", { className: "bt-who-reacted-user" });
                        if (user.avatar && /^\d{1,25}$/.test(String(user.id))) {
                            const avatar = api.el("img", {
                                className: "bt-who-reacted-avatar",
                                alt: "",
                                src: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=64`,
                            });
                            row.append(avatar);
                        }
                        row.append(api.el("span", { className: "bt-who-reacted-name", textContent: name }));
                        box.append(row);
                    }
                    if (users.length >= 100) {
                        box.append(api.el("div", { className: "bt-who-reacted-note", textContent: "Showing the first 100 reactors." }));
                    }
                }
                api.openWindow("Who Reacted", box);
            } catch (error) {
                api.toast(error.status === 403 || error.status === 404 ? "That reaction isn't available to this account." : `Couldn't load reactors: ${error.message}`);
            }
        };

        const click = event => {
            if (!event.altKey || event.ctrlKey || event.shiftKey || event.metaKey || !(event.target instanceof Element)) return;
            const reactionEl = event.target.closest(REACTION);
            if (!reactionEl) return;
            const ids = api.discord.messageIdsOf(reactionEl);
            const message = ids && api.discord.getMessage(ids.channelId, ids.messageId);
            const reaction = message && getReaction(reactionEl, message);
            if (!ids || !reaction) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            showReactors(ids, reaction);
        };

        document.addEventListener("click", click, true);
        api.onDispose(() => document.removeEventListener("click", click, true));
    },
});