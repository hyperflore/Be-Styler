let countStore = null;

const guildId = () => (/^\/channels\/(\d+)\//.exec(location.pathname + "/") || [])[1] || null;
const fmt = n => Number(n).toLocaleString();

function counts(api, id) {
    countStore ??= api.webpack.findStore("GuildMemberCountStore");
    if (!countStore || !id) return null;
    try {
        const total = typeof countStore.getMemberCount === "function" ? countStore.getMemberCount(id) : null;
        const online = typeof countStore.getOnlineCount === "function" ? countStore.getOnlineCount(id) : null;
        return total == null ? null : { total, online };
    } catch {
        return null;
    }
}

function inVoice(api, id) {
    const voice = api.discord.store("VoiceStateStore");
    if (!voice || !id) return null;
    try {
        if (typeof voice.getVoiceStatesForGuild === "function") return Object.keys(voice.getVoiceStatesForGuild(id) || {}).length;
        const all = voice.getAllVoiceStates?.() || {};
        return Object.keys(all[id] || {}).length;
    } catch {
        return null;
    }
}

function line(api, id) {
    const c = counts(api, id);
    if (!c) return null;
    let text = `${fmt(c.total)} members${c.online != null ? ` · ${fmt(c.online)} online` : ""}`;
    if (api.settings.voiceActivity) {
        const v = inVoice(api, id);
        if (v) text += ` · ${fmt(v)} in voice`;
    }
    return text;
}

function update(api) {
    const wrap = document.querySelector('[class*="membersWrap_"]');
    const existing = document.querySelector(".bt-member-count");
    const text = api.settings.memberList ? line(api, guildId()) : null;
    if (!wrap || !text) {
        existing?.remove();
        return;
    }
    const el = existing && existing.parentElement === wrap ? existing : api.el("div", { className: "bt-member-count" });
    if (el.textContent !== text) el.textContent = text;
    if (el.parentElement !== wrap) {
        existing?.remove();
        wrap.prepend(el);
    }
}

BThemer.definePlugin({
    id: "memberCount",
    name: "Member Count",
    description: "Online, total and in-voice member counts in the member list and the server tooltip.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        memberList: { type: "toggle", label: "Show in the member list", default: true },
        toolTip: { type: "toggle", label: "Show in the server tooltip (hover a server)", default: true },
        voiceActivity: { type: "toggle", label: "Include how many people are in voice", default: true },
    },

    css: `
        .bt-member-count { padding: 12px 16px 4px; font-size: 12px; font-weight: 600; letter-spacing: .02em;
            color: var(--channels-default, #b5bac1); }
        .bt-member-count-tip { display: block; margin-top: 4px; font-size: 12px; font-weight: 500; opacity: .85; }`,

    start(api) {
        const tick = () => update(api);
        api.observe('[class*="membersWrap_"]', tick);
        api.flux.subscribe("GUILD_MEMBER_LIST_UPDATE", tick);
        api.flux.subscribe("VOICE_STATE_UPDATES", tick);
        const timer = setInterval(tick, 5000);

        let hovered = null;
        const over = e => {
            const item = e.target instanceof Element && e.target.closest('[data-list-item-id^="guildsnav___"]');
            hovered = item ? /(\d{15,25})$/.exec(item.getAttribute("data-list-item-id"))?.[1] || null : null;
        };
        document.addEventListener("mouseover", over, true);
        api.observe('[class*="tooltip_"], [role="tooltip"]', tip => {
            if (!api.settings.toolTip || !hovered || tip.querySelector(".bt-member-count-tip")) return;
            const text = line(api, hovered);
            if (!text) return;
            const content = tip.querySelector('[class*="tooltipContent_"]') || tip;
            content.append(api.el("span", { className: "bt-member-count-tip", textContent: text }));
        });

        api.onDispose(() => {
            clearInterval(timer);
            document.removeEventListener("mouseover", over, true);
            document.querySelectorAll(".bt-member-count, .bt-member-count-tip").forEach(el => el.remove());
        });
        tick();
    },
});
