BThemer.definePlugin({
    id: "chatTools",
    name: "Chat Tools",
    description: "Reveal all spoilers, blur NSFW media, character counter, copy emoji markdown, always-expanded roles.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        spoilers: { type: "toggle", label: "Ctrl+click spoiler: reveal all in message (Ctrl+Shift: whole chat)", default: true },
        blurNsfw: { type: "toggle", label: "Blur media in NSFW channels until hovered", default: false },
        blurAmount: { type: "range", label: "NSFW blur", min: 1, max: 60, unit: "px", default: 10 },
        blurIgnoredChannels: { type: "text", label: "Don't blur in these channel IDs (comma-separated)", default: "" },
        counter: { type: "toggle", label: "Character counter", default: true },
        counterColors: { type: "toggle", label: "Counter turns yellow / red near the limit", default: true },
        emojiMarkdown: { type: "toggle", label: "Copy emoji markdown (right-click an emoji, or Alt+click)", default: true },
        copyUnicode: { type: "toggle", label: "For standard emoji, copy the character itself instead of :name:", default: true },
        expandRoles: { type: "toggle", label: "Always show all roles in profiles", default: true },
    },

    css: s => `
        ${s.blurNsfw ? `body.bt-nsfw [id^="chat-messages-"] :is(img, video, [class*="embedVideo"]):not([class*="emoji"]):not([class*="avatar"]) { filter: blur(${s.blurAmount}px); transition: filter .2s; }
        body.bt-nsfw [id^="chat-messages-"] :is(img, video, [class*="embedVideo"]):hover { filter: none; }` : ""}
        .bt-char-count { position: absolute; right: 16px; bottom: -18px; font-size: 11px; font-variant-numeric: tabular-nums; opacity: .65; pointer-events: none; }
        .bt-char-count.near { color: var(--status-warning, #f0b232); opacity: 1; }
        .bt-char-count.over { color: var(--status-danger, #f23f43); opacity: 1; font-weight: 700; }`,

    start(api) {
        const s = api.settings;

        const click = e => {
            if (!(e.target instanceof Element)) return;
            if (e.ctrlKey && s.spoilers) {
                const spoiler = e.target.closest('[class*="spoilerContent_"], [class*="spoilerContainer_"]');
                if (spoiler) {
                    const scope = e.shiftKey ? document.querySelector('[class*="messagesWrapper_"]') || document : spoiler.closest('[id^="chat-messages-"]') || document;
                    setTimeout(() => {
                        for (const sp of scope.querySelectorAll('[class*="spoilerContent_"][class*="hidden_"], [class*="spoilerContainer_"][class*="hidden_"]')) sp.click();
                    });
                    return;
                }
            }
            if (e.altKey && s.emojiMarkdown) {
                const md = emojiMarkdown(e.target);
                if (md) {
                    api.copy(md);
                    api.toast("Copied " + md);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        };
        function emojiMarkdown(target) {
            const img = target instanceof Element && target.closest('img[class*="emoji"], img[src*="/emojis/"], img[data-type="emoji"]');
            if (!img) return null;
            const custom = /\/emojis\/(\d+)\.(\w+)/.exec(img.src || "");
            const name = (img.dataset.name || img.alt || img.getAttribute("aria-label") || "emoji").replace(/:/g, "").trim();
            if (custom) {
                const animated = custom[2] === "gif" || /animated=true/.test(img.src);
                return `<${animated ? "a" : ""}:${name}:${custom[1]}>`;
            }
            const alt = img.alt || "";
            if (s.copyUnicode && alt && !/^:.*:$/.test(alt)) return alt;
            return `:${name}:`;
        }
        api.contextMenu(["message", "expression-picker"], ({ target }) => {
            if (!s.emojiMarkdown) return null;
            const md = emojiMarkdown(target);
            return md ? [{ id: "bt-copy-emoji-md", label: "Copy Emoji Markdown", action: () => api.copy(md) }] : null;
        });
        document.addEventListener("click", click, true);
        api.onDispose(() => document.removeEventListener("click", click, true));

        const markNsfw = () => {
            const { channelId } = api.discord.route();
            let nsfw = false;
            try {
                const ch = channelId && api.discord.store("ChannelStore")?.getChannel(channelId);
                const ignored = new Set(String(s.blurIgnoredChannels || "").split(/[\s,]+/).filter(Boolean));
                nsfw = !!(ch && (ch.nsfw || ch.isNSFW?.())) && !ignored.has(channelId);
            } catch { }
            document.body.classList.toggle("bt-nsfw", nsfw && s.blurNsfw);
        };
        api.flux.subscribe("CHANNEL_SELECT", () => setTimeout(markNsfw));
        const nsfwTimer = setInterval(markNsfw, 2000);
        markNsfw();
        api.onDispose(() => {
            clearInterval(nsfwTimer);
            document.body.classList.remove("bt-nsfw");
        });

        const limit = () => (api.discord.currentUser()?.premiumType === 2 ? 4000 : 2000);
        const updateCounter = () => {
            for (const box of document.querySelectorAll('form [class*="channelTextArea_"]')) {
                const editor = box.querySelector('[role="textbox"]');
                let el = box.querySelector(".bt-char-count");
                if (!s.counter || !editor) {
                    el?.remove();
                    continue;
                }
                const n = (editor.innerText || "").replace(/\n$/, "").length;
                if (!el) {
                    el = api.el("div", { className: "bt-char-count" });
                    if (getComputedStyle(box).position === "static") box.style.position = "relative";
                    box.append(el);
                }
                const max = limit();
                el.textContent = n ? `${n.toLocaleString()} / ${max.toLocaleString()}` : "";
                el.classList.toggle("over", s.counterColors && n > max);
                el.classList.toggle("near", s.counterColors && n <= max && n >= max * 0.8);
            }
        };
        document.addEventListener("input", updateCounter, true);
        api.flux.subscribe("MESSAGE_CREATE", () => setTimeout(updateCounter, 50));
        api.flux.subscribe("CHANNEL_SELECT", () => setTimeout(updateCounter, 300));
        api.onDispose(() => {
            document.removeEventListener("input", updateCounter, true);
            document.querySelectorAll(".bt-char-count").forEach(e => e.remove());
        });

        api.observe('[class*="expandButton_"], [class*="overflowButton_"]', btn => {
            if (s.expandRoles && btn.closest('[class*="role"]')) setTimeout(() => btn.click());
        });
    },
});
