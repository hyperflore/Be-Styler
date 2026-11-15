const svg = inner => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const ICONS = {
    desktop: svg('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'),
    mobile: svg('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'),
    web: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    embedded: svg('<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 11v3M5.5 12.5h3M15 12h.01M18 13h.01"/>'),
};
const LABELS = { desktop: "Desktop", mobile: "Mobile", web: "Web", embedded: "Console" };
const AVATAR_ID = /\/avatars\/(\d+)\//;

let presence = null;

function clientStatus(api, userId) {
    presence ??= api.webpack.findStore("PresenceStore");
    if (!presence) return null;
    try {
        if (typeof presence.getClientStatus === "function") return presence.getClientStatus(userId) || null;
        const state = typeof presence.getState === "function" ? presence.getState() : null;
        return (state && state.clientStatuses && state.clientStatuses[userId]) || null;
    } catch {
        return null;
    }
}

function badge(api, userId) {
    const status = clientStatus(api, userId);
    const entries = status ? Object.entries(status).filter(([platform]) => ICONS[platform]) : [];
    if (!entries.length) return null;
    const el = api.el("span", { className: "bt-platforms" });
    el.title = entries.map(([p, s]) => `${LABELS[p]}: ${s}`).join(" · ");
    for (const [platform, state] of entries) {
        const icon = api.el("span", { className: `bt-platform bt-st-${state}` });
        icon.innerHTML = ICONS[platform];
        el.append(icon);
    }
    return el;
}

function decorate(api, host, userId) {
    const next = badge(api, userId);
    const old = host.querySelector(":scope > .bt-platforms");
    const sig = next ? next.title : "";
    if (old && old.dataset.sig === sig) return;
    if (old) old.remove();
    if (next) {
        next.dataset.sig = sig;
        host.append(next);
    }
}

function scan(api) {
    if (api.settings.messages) {
        for (const header of document.querySelectorAll('li[class*="messageListItem_"] h3')) {
            const avatar = header.closest('[class*="message_"]')?.querySelector('img[class*="avatar"]');
            const id = avatar && AVATAR_ID.exec(avatar.src);
            const name = header.querySelector('[class*="username_"]')?.parentElement || header;
            if (id) decorate(api, name, id[1]);
        }
    }
    if (api.settings.members) {
        for (const member of document.querySelectorAll('[class*="membersWrap_"] [class*="member_"]')) {
            const avatar = member.querySelector('img[class*="avatar"], img');
            const id = avatar && AVATAR_ID.exec(avatar.src);
            const name = member.querySelector('[class*="name_"], [class*="username_"]');
            if (id && name) decorate(api, name, id[1]);
        }
    }
}

BThemer.definePlugin({
    id: "platformIndicators",
    name: "Platform Indicators",
    description: "Desktop / mobile / web icons next to people's names for the devices they're online on.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        messages: { type: "toggle", label: "In chat", default: true },
        members: { type: "toggle", label: "In the member list", default: true },
    },

    css: `
        .bt-platforms { display: inline-flex; gap: 2px; margin-left: 6px; vertical-align: middle; font-size: 12px; }
        .bt-platform { display: inline-flex; }
        .bt-st-online { color: var(--status-positive, #23a55a); }
        .bt-st-idle { color: var(--status-warning, #f0b232); }
        .bt-st-dnd { color: var(--status-danger, #f23f43); }`,

    start(api) {
        let queued = false;
        const queue = () => {
            if (queued) return;
            queued = true;
            setTimeout(() => {
                queued = false;
                scan(api);
            }, 250);
        };
        api.observe('li[class*="messageListItem_"] h3, [class*="membersWrap_"] [class*="member_"]', queue);
        api.flux.subscribe("PRESENCE_UPDATES", queue);
        const timer = setInterval(queue, 10_000);
        api.onDispose(() => {
            clearInterval(timer);
            document.querySelectorAll(".bt-platforms").forEach(el => el.remove());
        });
        queue();
    },

    onSettingChange(_key, _value, api) {
        document.querySelectorAll(".bt-platforms").forEach(el => el.remove());
        scan(api);
    },
});
