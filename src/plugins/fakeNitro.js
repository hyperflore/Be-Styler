const EMOJI_TOKEN = /(?<!\\)<a?:([\w~]+):(\d+)>/ig;
const EMOJI_URL = /\/emojis\/(\d+)\.(png|webp|gif)/i;
const MEDIA_SIZES = [16, 32, 48, 56, 64, 96, 128, 160, 256, 512, 1024];

function withWordBoundaries(text, start, length, replacement) {
    const before = text[start - 1];
    const after = text[start + length];
    return `${before && !/\s/.test(before) ? " " : ""}${replacement}${after && !/\s/.test(after) ? " " : ""}`;
}

BThemer.definePlugin({
    id: "fakeNitro",
    name: "Fake Nitro",
    description: "Send custom emoji/sticker links, unlock client themes and app icons, unlock stream quality controls, and optionally force capture quality or keep previews active.",
    author: "Be Themer",
    version: "2.2.0",
    settings: {
        streamQuality: { type: "toggle", label: "Allow streaming in nitro quality (restart Discord to apply)", default: true },
        forceResolution: { type: "select", label: "Force stream resolution", options: [["0", "Discord default"], ["720", "720p"], ["1080", "1080p"], ["1440", "1440p"], ["2160", "2160p"]], default: "0" },
        forceFps: { type: "select", label: "Force stream frame rate", options: [["0", "Discord default"], ["15", "15 FPS"], ["30", "30 FPS"], ["60", "60 FPS"]], default: "0" },
        disableStreamPause: { type: "toggle", label: "Keep stream previews active when Discord loses focus", default: false },
        transformStickers: { type: "toggle", label: "Render sticker links as stickers for me", default: true },
        enableEmojiBypass: { type: "toggle", label: "Send locked custom emojis as image links", default: true },
        emojiSize: { type: "select", label: "Emoji image size", options: MEDIA_SIZES.map(n => [String(n), `${n}px`]), default: "48" },
        transformEmojis: { type: "toggle", label: "Render linked emojis inline for me", default: true },
        enableStickerBypass: { type: "toggle", label: "Send locked server stickers as image links", default: true },
        stickerSize: { type: "select", label: "Sticker image size", options: MEDIA_SIZES.map(n => [String(n), `${n}px`]), default: "160" },
        transformCompoundSentence: { type: "toggle", label: "Transform emoji links in longer messages", default: false },
        useHyperLinks: { type: "toggle", label: "Use a short named link instead of the full URL", default: true },
        hyperLinkText: { type: "text", label: "Link label (use {{NAME}} for the name)", default: "{{NAME}}" },
        enableClientThemes: { type: "toggle", label: "Unlock Nitro client themes (only you see them)", default: true },
        enableAppIcons: { type: "toggle", label: "Unlock premium app icons (only you see them)", default: true },
    },
    css: `
        .bt-fn-emoji { display: inline-block; width: 1.375em; height: 1.375em; object-fit: contain; vertical-align: -0.35em; }
        .bt-fake-nitro-emoji { display: inline-block; width: 1.375em; height: 1.375em; object-fit: contain; vertical-align: -0.35em; }
        .bt-fake-nitro-link { text-decoration: none !important; }
        .bt-fake-nitro-sticker { display: inline-block; max-width: 160px; max-height: 160px; object-fit: contain; }
    `,
    start(api) {
        const pendingLinks = new Map();
        const queuePendingLink = (channelId, link) => {
            const id = String(channelId);
            const items = pendingLinks.get(id) || [];
            items.push({ link, expires: Date.now() + 15_000 });
            pendingLinks.set(id, items);
            setTimeout(() => {
                const current = (pendingLinks.get(id) || []).filter(item => item.expires > Date.now());
                if (current.length) pendingLinks.set(id, current);
                else pendingLinks.delete(id);
            }, 15_100);
        };
        const size = (key, fallback) => Number(api.settings[key]) || fallback;
        const store = name => name === "StickerStore" ? (api.discord.store("StickersStore") || api.discord.store(name)) : api.discord.store(name);
        const route = () => api.discord.route();
        const nameForLink = name => (api.settings.hyperLinkText || "{{NAME}}").replaceAll("{{NAME}}", name || "media").replace(/[\\[\]]/g, "\\$&");
        const channelFor = channelId => {
            try { return store("ChannelStore")?.getChannel(String(channelId)) || null; } catch { return null; }
        };
        const permission = (channelId, key) => {
            try {
                const channel = channelFor(channelId);
                if (!channel || channel.isPrivate?.()) return true;
                const bits = api.webpack.find(mod => typeof mod?.[key] === "bigint")?.[key];
                const permissions = store("PermissionStore");
                return bits != null && !!permissions?.can?.(bits, channel);
            } catch { return false; }
        };
        const premiumType = () => Number(api.discord.currentUser()?.premiumType) || 0;

        function canUseEmoji(emoji, channelId, guildId) {
            if (!emoji || emoji.type === 0) return true;
            if (emoji.available === false) return false;
            const localGuild = String(emoji.guildId || emoji.guild_id || "");
            const animated = !!emoji.animated;
            const hasNitro = premiumType() > 0;
            if (hasNitro && (localGuild === guildId || permission(channelId, "USE_EXTERNAL_EMOJIS"))) return true;
            return !animated && localGuild === guildId;
        }

        function emojiLink(emoji, label) {
            const emojiSize = size("emojiSize", 48);
            const url = new URL(`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "webp"}`);
            url.searchParams.set("size", String(emojiSize));
            url.searchParams.set("name", emoji.name || "emoji");
            url.searchParams.set("lossless", "true");
            const text = nameForLink(emoji.name);
            return api.settings.useHyperLinks ? `[${text}](${url.href})` : url.href;
        }

        function stickerLink(sticker) {
            const ext = Number(sticker.format_type ?? sticker.formatType) === 4 ? "gif" : "png";
            const url = new URL(`https://media.discordapp.net/stickers/${sticker.id}.${ext}`);
            url.searchParams.set("size", String(size("stickerSize", 160)));
            url.searchParams.set("name", sticker.name || "sticker");
            url.searchParams.set("lossless", "true");
            const label = nameForLink(sticker.name);
            return api.settings.useHyperLinks ? `[${label}](${url.href})` : url.href;
        }

        const onSend = (channelId, message, options) => {
            if (!message || typeof message.content !== "string") return;
            const channel = channelFor(channelId);
            const guildId = String(channel?.guild_id || channel?.guildId || "");
            let usedBypass = false;

            if (api.settings.enableStickerBypass) {
                const stickerId = options?.stickerIds?.[0] || options?.sticker_ids?.[0];
                if (stickerId) {
                    const sticker = store("StickerStore")?.getStickerById?.(String(stickerId));
                    if (sticker && !("pack_id" in sticker) && !("packId" in sticker)) {
                        const stickerGuild = String(sticker.guild_id || sticker.guildId || "");
                        const mayUseExternal = premiumType() > 1 && permission(channelId, "USE_EXTERNAL_STICKERS");
                        const usableHere = sticker.available !== false && (stickerGuild === guildId || mayUseExternal);
                        if (!usableHere) {
                            const link = stickerLink(sticker);
                            queuePendingLink(channelId, link);
                            message.content += `${message.content && !/\s$/.test(message.content) ? " " : ""}${link}`;
                            const ids = options.stickerIds || options.sticker_ids;
                            ids.length = 0;
                            usedBypass = true;
                        }
                    }
                }
            }

            if (api.settings.enableEmojiBypass && Array.isArray(message.validNonShortcutEmojis)) {
                for (const emoji of message.validNonShortcutEmojis) {
                    if (!emoji?.id || canUseEmoji(emoji, channelId, guildId)) continue;
                    const sourceName = emoji.originalName || emoji.name || "emoji";
                    const token = `<${emoji.animated ? "a" : ""}:${sourceName}:${emoji.id}>`;
                    const replacement = emojiLink(emoji);
                    message.content = message.content.replaceAll(token, (raw, offset, content) => withWordBoundaries(content, offset, raw.length, replacement));
                    usedBypass = true;
                }
            }

            if (usedBypass && !api.settings.transformCompoundSentence) {
                const contentWithoutLinks = message.content.replace(/\[[^\]]*\]\(https?:\/\/[^)]+\)|https?:\/\/\S+/g, "").trim();
                if (contentWithoutLinks) return;
            }
        };

        const onEdit = (channelId, _messageId, message) => {
            if (!api.settings.enableEmojiBypass || typeof message?.content !== "string") return;
            message.content = message.content.replace(EMOJI_TOKEN, (token, name, id, offset, content) => {
                const emoji = store("EmojiStore")?.getCustomEmojiById?.(String(id));
                if (!emoji || canUseEmoji(emoji, channelId, String(channelFor(channelId)?.guild_id || channelFor(channelId)?.guildId || ""))) return token;
                const replacement = emojiLink({ ...emoji, name: emoji.name || name });
                return withWordBoundaries(content, offset, token.length, replacement);
            });
        };

        const PICKER_PERKS = { ANIMATED_EMOJIS: 1, EMOJIS_EVERYWHERE: 2, STICKERS_EVERYWHERE: 3 };
        const THEME_PERK = /CLIENT_THEME/;
        const ICON_PERK = /APP_ICON/;
        let perkEnum;
        const findPerkEnum = () => {
            if (perkEnum !== undefined) return perkEnum;
            try {
                perkEnum = api.webpack.find(mod => mod && typeof mod === "object" && !Array.isArray(mod) &&
                    Object.entries(PICKER_PERKS).every(([k, v]) => mod[k] === v) &&
                    Object.keys(mod).some(k => THEME_PERK.test(k) || ICON_PERK.test(k))) || null;
            } catch { perkEnum = null; }
            if (!perkEnum) api.warn("Couldn't find Discord's perk list; client themes / app icons stay locked");
            return perkEnum;
        };
        const wantedPerkBits = () => {
            const bits = new Set(Object.values(PICKER_PERKS));
            const extra = [];
            if (api.settings.enableClientThemes) extra.push(THEME_PERK);
            if (api.settings.enableAppIcons) extra.push(ICON_PERK);
            const perks = extra.length ? findPerkEnum() : null;
            if (perks) {
                for (const [key, bit] of Object.entries(perks)) {
                    if (Number.isInteger(bit) && bit >= 0 && extra.some(re => re.test(key))) bits.add(bit);
                }
            }
            return [...bits];
        };
        const patchedUsers = new Map();
        const unlockPerks = () => {
            let user;
            try { user = store("UserStore")?.getCurrentUser?.(); } catch { return; }
            if (!user || typeof user !== "object") return;
            const original = patchedUsers.has(user) ? patchedUsers.get(user) : user.perks;
            const mask = Array.isArray(original?.activePerksBitmask) ? original.activePerksBitmask : [];
            const chunks = mask.map(v => { try { return BigInt(v ?? 0); } catch { return 0n; } });
            for (const bit of wantedPerkBits()) {
                const i = Math.floor(bit / 64);
                while (chunks.length <= i) chunks.push(0n);
                chunks[i] |= 1n << BigInt(bit % 64);
            }
            const next = chunks.map(String);
            const current = user.perks?.activePerksBitmask;
            if (Array.isArray(current) && current.length === next.length && current.every((v, i) => String(v) === next[i])) return;
            if (!patchedUsers.has(user)) patchedUsers.set(user, user.perks);
            try {
                user.perks = { configByPerk: {}, ...original, activePerksBitmask: next };
            } catch (error) { api.warn("Couldn't unlock Nitro perks", error); }
        };
        this.reapplyPerks = unlockPerks;
        unlockPerks();
        const perkTimer = setInterval(unlockPerks, 1000);
        api.onDispose(() => {
            clearInterval(perkTimer);
            delete this.reapplyPerks;
            for (const [user, perks] of patchedUsers) { try { user.perks = perks; } catch {} }
            patchedUsers.clear();
        });

        let savedTheme = null;
        const themeReady = Promise.resolve(api.storage?.get?.("clientTheme")).then(v => { if (v && v.gradientId != null) savedTheme = v; }).catch(() => {});
        const gradientOf = appearance => appearance?.clientThemeSettings?.backgroundGradientPresetId?.value;
        const applySavedTheme = proto => {
            if (!savedTheme || !proto || typeof proto !== "object") return false;
            const appearance = proto.appearance ??= {};
            if (gradientOf(appearance) === savedTheme.gradientId && appearance.theme === savedTheme.theme) return false;
            if (savedTheme.theme != null) appearance.theme = savedTheme.theme;
            appearance.clientThemeSettings ??= {};
            appearance.clientThemeSettings.backgroundGradientPresetId = { value: savedTheme.gradientId };
            return true;
        };
        const reapplyTheme = () => {
            if (!api.settings.enableClientThemes || !savedTheme) return;
            try {
                const settings = store("UserSettingsProtoStore")?.settings;
                if (!settings || (gradientOf(settings.appearance) === savedTheme.gradientId && settings.appearance?.theme === savedTheme.theme)) return;
                const proto = structuredClone(settings);
                applySavedTheme(proto);
                api.flux?.dispatcher?.dispatch?.({ type: "USER_SETTINGS_PROTO_UPDATE", settings: { type: 1, proto }, partial: false, local: false });
            } catch (error) { api.warn("Couldn't re-apply the client theme", error); }
        };
        this.reapplyTheme = reapplyTheme;
        api.flux?.intercept?.(action => {
            if (!api.settings.enableClientThemes || !action) return;
            try {
                if (action.type === "USER_SETTINGS_PROTO_UPDATE" && action.settings?.type === 1) {
                    const proto = action.settings.proto;
                    if (action.local) {
                        if (!proto?.appearance) return;
                        const gradientId = gradientOf(proto.appearance);
                        savedTheme = gradientId != null ? { theme: proto.appearance.theme, gradientId } : null;
                        Promise.resolve(savedTheme ? api.storage?.set?.("clientTheme", savedTheme) : api.storage?.delete?.("clientTheme")).catch(() => {});
                    } else {
                        applySavedTheme(proto);
                    }
                } else if (action.type === "CONNECTION_OPEN" || action.type === "USER_SETTINGS_PROTO_LOAD_IF_NECESSARY") {
                    setTimeout(reapplyTheme, 500);
                }
            } catch (error) { api.warn("Couldn't keep the client theme", error); }
        });
        themeReady.then(() => setTimeout(reapplyTheme, 0));
        const themeTimer = setInterval(reapplyTheme, 5000);
        api.onDispose(() => { clearInterval(themeTimer); delete this.reapplyTheme; });

        api.onDispose(api.discord.onMessageSend(onSend));
        api.onDispose(api.discord.onMessageEdit(onEdit));
        api.net.onRequest(req => {
            const match = ["POST", "PATCH"].includes(req.method) && typeof req.body === "string" && /\/api\/v\d+\/channels\/(\d+)\/messages(?:\/\d+)?(?:\?|$)/.exec(req.url);
            if (!match) return;
            try {
                const body = JSON.parse(req.body);
                const originalBody = JSON.stringify(body);
                const channelId = match[1];
                const pending = req.method === "POST" ? (pendingLinks.get(channelId) || []).filter(item => item.expires > Date.now()) : [];
                const links = pending.map(item => item.link);
                const ids = Array.isArray(body.sticker_ids) ? body.sticker_ids.slice() : [];
                for (const id of ids) {
                    const sticker = store("StickerStore")?.getStickerById?.(String(id));
                    const channel = channelFor(channelId);
                    const guildId = String(channel?.guild_id || channel?.guildId || "");
                    const native = sticker && sticker.available !== false &&
                        (String(sticker.guild_id || sticker.guildId || "") === guildId ||
                            (premiumType() > 1 && permission(channelId, "USE_EXTERNAL_STICKERS")));
                    if (api.settings.enableStickerBypass && sticker && !native && !("pack_id" in sticker) && !("packId" in sticker)) links.push(stickerLink(sticker));
                }
                onEdit(channelId, null, body);
                for (const link of links) {
                    if (!String(body.content || "").includes(link)) {
                        body.content = `${body.content && !/\s$/.test(body.content) ? " " : ""}${link}`;
                    }
                }
                if (Array.isArray(body.sticker_ids)) body.sticker_ids = body.sticker_ids.filter(id => !links.includes(stickerLink(store("StickerStore")?.getStickerById?.(String(id)) || { id })));
                if (JSON.stringify(body) === originalBody) return;
                if (req.method === "POST") pendingLinks.delete(channelId);
                return { body: JSON.stringify(body) };
            } catch (error) {
                api.warn("Fake Nitro couldn't preserve a sticker link in the outgoing request", error);
            }
        });
        api.onDispose(() => pendingLinks.clear());

        const previews = new Map();
        function restorePreviews() {
            for (const [anchor, { nodes, image }] of previews) {
                if (anchor.firstChild === image) anchor.replaceChildren(...nodes);
                anchor.classList.remove("bt-fake-nitro-link");
            }
            previews.clear();
        }
        api.onDispose(restorePreviews);
        const previewSelector = '[id^="chat-messages-"] a[href*="/emojis/"], [id^="chat-messages-"] a[href*="/stickers/"]';
        const renderPreview = anchor => {
            if (previews.has(anchor)) return;
            let url;
            try { url = new URL(anchor.href); } catch { return; }
            if (!["cdn.discordapp.com", "media.discordapp.net"].includes(url.hostname)) return;
            const match = /^\/(emojis|stickers)\/(\d+)\.(gif|webp|png)$/.exec(url.pathname);
            if (!match) return;
            const sticker = match[1] === "stickers";
            if (!(sticker ? api.settings.transformStickers : api.settings.transformEmojis)) return;
            const content = anchor.closest('[id^="message-content-"]');
            if (!content) return;
            if (!api.settings.transformCompoundSentence && content.textContent.trim() !== anchor.textContent.trim()) return;
            const name = url.searchParams.get("name") || (sticker ? "sticker" : "emoji");
            const image = api.el("img", {
                className: sticker ? "bt-fake-nitro-sticker" : "bt-fake-nitro-emoji",
                alt: `:${name}:`, title: `${name} (local link preview)`, src: url.href,
            });
            previews.set(anchor, { nodes: [...anchor.childNodes], image });
            anchor.classList.add("bt-fake-nitro-link");
            anchor.replaceChildren(image);
        };
        api.observe(previewSelector, renderPreview);

        const LINK = String.raw`https?:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net)\/(emojis|stickers)\/(\d{15,22})\.(gif|webp|png)(?:\?[^\s)\]]*)?`;
        const MASKED_LINK = new RegExp(String.raw`\[([^\]\n]*)\]\(<?(${LINK})>?\)`, "g");
        const BARE_LINK = new RegExp(String.raw`<?(${LINK})>?`, "g");
        const ONE_LINK = new RegExp(`^${LINK}`);
        const cleanName = (raw, fallback) => (String(raw || "").replace(/^:|:$/g, "").replace(/[^\w~]/g, "_").slice(0, 32) || fallback);
        const nameFromUrl = url => { try { return new URL(url).searchParams.get("name"); } catch { return null; } };

        function nativeizeMessage(message) {
            if (!message || typeof message.content !== "string" || !/\/(emojis|stickers)\/\d/.test(message.content)) return;
            const stickers = [];
            const toNative = (url, label) => {
                const m = ONE_LINK.exec(url);
                if (!m) return null;
                const [, kind, id, ext] = m;
                if (kind === "stickers") {
                    if (!api.settings.transformStickers) return null;
                    stickers.push({ id, name: cleanName(nameFromUrl(url) || label, "sticker"), format_type: ext === "gif" ? 4 : 1 });
                    return "";
                }
                if (!api.settings.transformEmojis) return null;
                return `<${ext === "gif" ? "a" : ""}:${cleanName(nameFromUrl(url) || label, "emoji")}:${id}>`;
            };
            let content = message.content.replace(MASKED_LINK, (all, label, url) => toNative(url, label) ?? all);
            content = content.replace(BARE_LINK, (all, url) => toNative(url, null) ?? all);
            if (content === message.content) return;
            message.content = content.replace(/[ \t]{2,}/g, " ").trim();
            if (Array.isArray(message.embeds)) message.embeds = message.embeds.filter(e => !ONE_LINK.test(e?.url || e?.thumbnail?.url || ""));
            if (stickers.length) {
                const existing = message.sticker_items || message.stickerItems || [];
                message.sticker_items = [...existing, ...stickers.filter(s => !existing.some(x => x.id === s.id))];
            }
        }
        const NATIVE_EVENTS = new Set(["MESSAGE_CREATE", "MESSAGE_UPDATE", "LOAD_MESSAGES_SUCCESS", "LOAD_MESSAGES_AROUND_SUCCESS", "LOAD_RECENT_MENTIONS_SUCCESS", "LOAD_PINNED_MESSAGES_SUCCESS", "SEARCH_FINISH", "MOD_VIEW_SEARCH_FINISH", "LOAD_FORUM_POSTS", "LOAD_THREADS_SUCCESS"]);
        const eachMessage = (value, fn, depth = 0) => {
            if (!value || typeof value !== "object" || depth > 4) return;
            if (Array.isArray(value)) { for (const v of value) eachMessage(v, fn, depth + 1); return; }
            if (typeof value.content === "string" && value.id && (value.channel_id || value.channelId)) { fn(value); return; }
            for (const key of ["message", "messages", "messageReference", "referenced_message", "firstMessages", "threads", "mostRecentMessages"]) {
                if (key in value) eachMessage(value[key], fn, depth + 1);
            }
        };
        api.flux?.intercept?.(action => {
            if (!action || !NATIVE_EVENTS.has(action.type)) return;
            try { eachMessage(action, msg => { nativeizeMessage(msg); if (msg.referenced_message) nativeizeMessage(msg.referenced_message); }); }
            catch (error) { api.warn("Couldn't turn an emoji/sticker link into a native one", error); }
        });

        this.refreshPreviews = () => {
            restorePreviews();
            document.querySelectorAll(previewSelector).forEach(renderPreview);
        };
        api.onDispose(() => { delete this.refreshPreviews; });

        const modified = new Map();
        let disposed = false;
        async function applyStreamQuality() {
            const fps = Number(api.settings.forceFps), height = Number(api.settings.forceResolution);
            const store = api.discord.store("MediaEngineStore");
            const connections = store?.getMediaEngine?.()?.connections;
            const userId = api.discord.currentUser()?.id;
            if (!connections || !userId) return;
            for (const [track] of modified) if (track.readyState === "ended") modified.delete(track);
            for (const conn of connections) {
                if (conn.streamUserId !== userId) continue;
                const track = conn.input?.stream?.getVideoTracks?.()[0];
                if (!track || track.readyState === "ended") continue;
                const params = conn.videoStreamParameters?.[0];
                let state = modified.get(track);
                if (!state) {
                    if (!fps && !height) continue;
                    state = { params, savedParams: params && { ...params }, constraints: track.getConstraints(), key: null, pending: false };
                    modified.set(track, state);
                }
                const key = `${fps}:${height}`;
                if (state.pending || key === state.key) continue;
                const constraints = { ...state.constraints };
                if (fps) constraints.frameRate = { ideal: fps, max: fps };
                if (height) {
                    const ratio = track.getSettings?.().aspectRatio || 16 / 9;
                    constraints.height = { ideal: height, max: height };
                    constraints.width = { ideal: Math.round(height * ratio), max: Math.round(height * ratio) };
                }
                state.pending = true;
                try {
                    await track.applyConstraints(constraints);
                    if (disposed) { await track.applyConstraints(state.constraints); continue; }
                    if (params) {
                        if (fps) params.maxFrameRate = fps;
                        else if (state.savedParams.maxFrameRate === undefined) delete params.maxFrameRate;
                        else params.maxFrameRate = state.savedParams.maxFrameRate;
                        if (height) params.maxResolution = { width: constraints.width.max, height };
                        else if (state.savedParams.maxResolution === undefined) delete params.maxResolution;
                        else params.maxResolution = state.savedParams.maxResolution;
                    }
                    state.key = key;
                } catch (error) {
                    state.key = key;
                    api.warn("Could not apply forced stream quality", error);
                } finally { state.pending = false; }
            }
        }
        const timer = setInterval(() => { applyStreamQuality().catch(error => api.warn("Stream quality unavailable", error)); }, 1000);
        api.onDispose(() => {
            disposed = true;
            clearInterval(timer);
            for (const [track, state] of modified) {
                if (state.params) {
                    for (const key of ["maxFrameRate", "maxResolution"]) {
                        if (state.savedParams[key] === undefined) delete state.params[key];
                        else state.params[key] = state.savedParams[key];
                    }
                }
                if (track.readyState !== "ended") track.applyConstraints(state.constraints).catch(() => {});
            }
            modified.clear();
        });
    },
    onSettingChange(key) {
        if (["transformEmojis", "transformStickers", "transformCompoundSentence"].includes(key)) this.refreshPreviews?.();
        if (["enableClientThemes", "enableAppIcons"].includes(key)) this.reapplyPerks?.();
        if (key === "enableClientThemes") this.reapplyTheme?.();
    },
});
