const ENGINES = [
    ["Google Lens", u => "https://lens.google.com/uploadbyurl?url=" + encodeURIComponent(u)],
    ["Yandex", u => "https://yandex.com/images/search?rpt=imageview&url=" + encodeURIComponent(u)],
    ["SauceNAO", u => "https://saucenao.com/search.php?url=" + encodeURIComponent(u)],
    ["IQDB", u => "https://iqdb.org/?url=" + encodeURIComponent(u)],
    ["Bing", u => "https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:" + encodeURIComponent(u)],
    ["TinEye", u => "https://www.tineye.com/search?url=" + encodeURIComponent(u)],
    ["ImgOps", u => "https://imgops.com/start?url=" + encodeURIComponent(u)],
];
const TEXT_EXT = /\.(txt|md|json|js|mjs|cjs|ts|tsx|jsx|css|scss|less|html|xml|svg|yml|yaml|toml|ini|cfg|conf|env|log|csv|tsv|py|rb|go|rs|java|kt|kts|c|h|cpp|hpp|cs|lua|sh|bash|zsh|ps1|bat|cmd|sql|diff|patch|gradle|properties|php|swift|dart|r|pl|vue|svelte)(\?|$)/i;
const CDN = /^https:\/\/(cdn|media)\.discordapp\.(com|net)\//;
const ICON_PATH = /\/(avatars|icons|banners|splashes|guilds\/\d+\/users\/\d+\/(avatars|banners)|avatar-decoration-presets)\//;

const fileName = url => {
    try {
        return decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    } catch {
        return "";
    }
};
const toCdn = url => {
    try {
        const u = new URL(url);
        if (u.hostname === "media.discordapp.net") u.hostname = "cdn.discordapp.com";
        return u;
    } catch {
        return null;
    }
};

BThemer.definePlugin({
    id: "mediaTools",
    name: "Media Tools",
    description: "Picture-in-picture, voice message download, image names, reverse image search, full-size icons, original-quality and always-animated images.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        pip: { type: "toggle", label: "Picture-in-Picture button on videos", default: true },
        pipLoop: { type: "toggle", label: "Picture-in-Picture videos loop", default: true },
        voiceDownload: { type: "toggle", label: "Download button on voice messages / audio", default: true },
        imageFilename: { type: "toggle", label: "Show the file name when hovering images", default: true },
        showFullUrl: { type: "toggle", label: "…show the full URL instead of the file name", default: false },
        reverseSearch: { type: "toggle", label: "Reverse image search (right-click an image, or Alt+click)", default: true },
        viewIcons: { type: "toggle", label: "View avatars, icons and banners full size", default: true },
        iconFormat: { type: "select", label: "Icon format (animated ones always use .webp)", options: [["webp", "webp"], ["png", "png"], ["jpg", "jpg"]], default: "webp" },
        iconSize: { type: "select", label: "Icon size", options: ["128", "256", "512", "1024", "2048", "4096"].map(n => [n, n]), default: "1024" },
        copyFile: { type: "toggle", label: "Copy button on text file attachments", default: true },
        fixImagesQuality: { type: "toggle", label: "Opened images load at their original resolution", default: true },
        originalImagesInChat: { type: "toggle", label: "…in chat too (uses more data and memory)", default: false },
        alwaysAnimate: { type: "toggle", label: "Always animate avatars, icons and emoji", default: false },
    },

    css: `
        .bt-media-btn { position: absolute; top: 6px; right: 6px; z-index: 3; border: 0; border-radius: 6px; padding: 4px 7px; cursor: pointer;
            background: rgba(0,0,0,.65); color: #fff; font-size: 13px; opacity: 0; transition: opacity .15s; }
        *:hover > .bt-media-btn, .bt-media-btn:focus { opacity: 1; }
        .bt-inline-btn { margin-left: 6px; border: 0; border-radius: 4px; padding: 2px 6px; cursor: pointer; background: var(--background-modifier-accent, #4e5058); color: inherit; font-size: 12px; text-decoration: none; }
        [class*="userProfile"] img[class*="avatar"], [class*="userProfile"] [class*="bannerImage"], [class*="userPopout"] img[class*="avatar"] { cursor: pointer; }`,

    start(api) {
        const s = api.settings;
        const open = url => (window.BThemerNative?.openExternal ? window.BThemerNative.openExternal(url) : window.open(url, "_blank"));

        const iconUrl = src => {
            const u = toCdn(src);
            if (!u) return src;
            const animated = /\/a_[0-9a-f]+\.\w+$/.test(u.pathname);
            u.pathname = u.pathname.replace(/\.(webp|png|jpe?g|gif)$/, animated ? ".webp" : "." + s.iconFormat);
            u.searchParams.set("size", s.iconSize);
            if (animated) u.searchParams.set("animated", "true");
            return u.href;
        };

        api.observe('[id^="chat-messages-"] video', video => {
            if (!s.pip || !document.pictureInPictureEnabled) return;
            const box = video.parentElement;
            if (!box || box.querySelector(".bt-pip")) return;
            if (getComputedStyle(box).position === "static") box.style.position = "relative";
            const b = api.el("button", { className: "bt-media-btn bt-pip", textContent: "⧉", title: "Picture-in-Picture" });
            b.addEventListener("click", e => {
                e.stopPropagation();
                if (document.pictureInPictureElement === video) return document.exitPictureInPicture().catch(() => {});
                video.loop = !!s.pipLoop;
                video.play().catch(() => {});
                video.requestPictureInPicture().catch(err => api.toast(err.message));
            });
            box.append(b);
        });

        api.observe('[id^="chat-messages-"] audio', audio => {
            if (!s.voiceDownload) return;
            const src = audio.currentSrc || audio.src || audio.querySelector("source")?.src;
            const host = audio.parentElement;
            if (!src || !host || host.querySelector(".bt-dl")) return;
            const a = api.el("a", { className: "bt-inline-btn bt-dl", textContent: "⬇", title: "Download", href: src, download: fileName(src) || "voice-message.ogg", target: "_blank", rel: "noreferrer noopener" });
            a.addEventListener("click", e => e.stopPropagation());
            host.append(a);
        });

        api.observe('[id^="chat-messages-"] img, [class*="imageWrapper_"] img, [class*="carouselModal"] img, [class*="mediaArea"] img', img => {
            const src = img.src || "";
            if (!CDN.test(src)) return;
            const inChat = !!img.closest('[id^="chat-messages-"]');
            if (s.imageFilename && inChat && /\/attachments\//.test(src) && !img.title) {
                const gif = /\.gif(\?|$)/i.test(src);
                img.title = s.showFullUrl || gif ? src : fileName(src);
            }
            if (s.fixImagesQuality && /\/attachments\//.test(src) && (!inChat || s.originalImagesInChat)) {
                const u = toCdn(src);
                if (u && (u.href !== src || u.searchParams.has("width"))) {
                    for (const k of ["width", "height", "quality", "format"]) u.searchParams.delete(k);
                    if (u.href !== src) img.src = u.href;
                }
            }
        });

        const animateAll = () => {
            if (!s.alwaysAnimate) return;
            for (const img of document.querySelectorAll('img[src*="/avatars/"], img[src*="/icons/"], img[src*="/banners/"]')) {
                const src = img.src;
                if (/\/(avatars|icons|banners)\/\d+\/a_/.test(src) && !/animated=true|\.gif/.test(src)) {
                    img.src = src.replace(/\.(webp|png)/, ".gif").replace(/([?&])animated=false/, "$1animated=true");
                }
            }
            for (const img of document.querySelectorAll('img[src*="/emojis/"][src*="animated=false"]')) img.src = img.src.replace("animated=false", "animated=true");
        };
        const animTimer = setInterval(animateAll, 2000);
        api.onDispose(() => clearInterval(animTimer));

        const click = e => {
            const img = e.target instanceof Element && e.target.closest("img");
            const bannerEl = e.target instanceof Element && e.target.closest('[class*="bannerImage"], [class*="banner_"]');
            if (s.viewIcons && !e.altKey) {
                const inProfile = e.target instanceof Element && e.target.closest('[class*="userProfile"], [class*="userPopout"], [class*="profileModal"]');
                if (inProfile && img && ICON_PATH.test(img.src) && img.closest('[class*="avatar"]')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return open(iconUrl(img.src));
                }
                if (inProfile && bannerEl) {
                    const bg = /url\("?([^")]+)"?\)/.exec(getComputedStyle(bannerEl).backgroundImage || "")?.[1];
                    if (bg && ICON_PATH.test(bg)) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return open(iconUrl(bg));
                    }
                }
            }
            if (!e.altKey || e.ctrlKey || e.shiftKey || !img || !img.src) return;
            if (ICON_PATH.test(img.src) && s.viewIcons) open(iconUrl(img.src));
            else if (s.reverseSearch && !img.closest('[class*="emoji"]')) open(ENGINES[0][1](toCdn(img.src)?.href || img.src));
            else return;
            e.preventDefault();
            e.stopImmediatePropagation();
        };
        document.addEventListener("click", click, true);
        api.onDispose(() => document.removeEventListener("click", click, true));

        api.contextMenu(["message", "image-context"], ({ target }) => {
            if (!s.reverseSearch) return null;
            const img = target.closest("img");
            const src = img?.src || target.closest("a[href]")?.href;
            if (!src || !/\.(png|jpe?g|gif|webp|avif|bmp)(\?|$)|\/attachments\/|\/external\//i.test(src) || img?.closest('[class*="emoji"]')) return null;
            const url = toCdn(src)?.href || src;
            return [
                ...ENGINES.map(([name, make]) => ({ id: "bt-search-" + name.toLowerCase().replace(/\W/g, ""), label: `Search Image with ${name}`, action: () => open(make(url)) })),
                { id: "bt-search-all", label: "Search Image with all engines", action: () => ENGINES.forEach(([, make]) => open(make(url))) },
            ];
        });
        api.contextMenu(["user-context", "user-profile-actions"], ({ target }) => {
            if (!s.viewIcons) return null;
            const listId = target.closest("[data-list-item-id]")?.getAttribute("data-list-item-id") || "";
            const avatar = target.closest('[class*="avatar"], [class*="member_"], [class*="message_"]')?.querySelector?.('img[src*="/avatars/"]') || (target.matches?.('img[src*="/avatars/"]') ? target : null);
            const fromSrc = avatar && /\/avatars\/(\d+)\//.exec(avatar.src)?.[1];
            const userId = fromSrc || /(\d{15,25})$/.exec(listId)?.[1];
            const user = userId && api.discord.store("UserStore")?.getUser?.(userId);
            if (!user) return null;
            const items = [];
            const av = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(user.id) >> 22n) % 6}.png`;
            items.push({ id: "bt-view-avatar", label: "View Avatar", action: () => open(iconUrl(av)) });
            if (user.banner) items.push({ id: "bt-view-banner", label: "View Banner", action: () => open(iconUrl(`https://cdn.discordapp.com/banners/${user.id}/${user.banner}.png`)) });
            return items;
        });
        api.contextMenu("guild-context", ({ target }) => {
            if (!s.viewIcons) return null;
            const id = /(\d{15,25})$/.exec(target.closest("[data-list-item-id]")?.getAttribute("data-list-item-id") || "")?.[1];
            const g = id && api.discord.store("GuildStore")?.getGuild?.(id);
            if (!g) return null;
            const items = [];
            if (g.icon) items.push({ id: "bt-view-icon", label: "View Icon", action: () => open(iconUrl(`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`)) });
            if (g.banner) items.push({ id: "bt-view-banner", label: "View Banner", action: () => open(iconUrl(`https://cdn.discordapp.com/banners/${g.id}/${g.banner}.png`)) });
            return items;
        });

        api.observe('[id^="chat-messages-"] a[href*="/attachments/"]', a => {
            if (!s.copyFile || !TEXT_EXT.test(a.href) || a.parentElement?.querySelector(".bt-copy-file")) return;
            const b = api.el("button", { className: "bt-inline-btn bt-copy-file", title: "Copy file contents" });
            b.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
            b.addEventListener("click", async e => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    const res = await fetch(a.href);
                    if (!res.ok) throw new Error("HTTP " + res.status);
                    const blob = await res.blob();
                    if (blob.size > 2 * 1024 * 1024) throw new Error("file is over 2 MB");
                    api.copy(await blob.text());
                    api.toast("File contents copied");
                } catch (err) {
                    api.toast("Couldn't copy: " + err.message);
                }
            });
            a.after(b);
        });

        api.onDispose(() => document.querySelectorAll(".bt-pip, .bt-dl, .bt-copy-file").forEach(e => e.remove()));
    },
});
