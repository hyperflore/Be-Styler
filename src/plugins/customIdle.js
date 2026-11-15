BThemer.definePlugin({
    id: "customIdle",
    name: "Custom Idle",
    description: "Choose how many minutes until you're marked Idle, or turn auto-idle off.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        idleTimeout: { type: "range", label: "Minutes before going idle (0 = never)", min: 0, max: 60, unit: " min", default: 10 },
        remainInIdle: { type: "toggle", label: "Stay idle when you come back, until you confirm", default: true },
    },

    css: `
        .bt-idle-notice { position: fixed; top: 0; left: 0; right: 0; z-index: 10001; display: flex; align-items: center; justify-content: center; gap: 12px;
            padding: 8px 40px; font-size: 14px; font-weight: 500; color: #fff; background: var(--brand-500, #5865f2); }
        .bt-idle-notice button { border: 1px solid #fff; background: none; color: #fff; border-radius: 4px; padding: 2px 10px; cursor: pointer; font: inherit; }
        .bt-idle-notice .bt-x { position: absolute; right: 12px; border: 0; font-size: 18px; padding: 0 6px; }`,

    start(api) {
        let ours = false;
        let idle = false;
        let stayIdle = false;
        let last = Date.now();
        let notice = null;

        const send = value => {
            if (idle === value) return;
            idle = value;
            ours = true;
            try {
                api.discord.dispatch({ type: "IDLE", idle: value, idleSince: value ? last : null });
            } finally {
                ours = false;
            }
        };
        api.flux.intercept(action => {
            if (action?.type === "IDLE" && !ours) return false;
        });

        const hideNotice = () => {
            notice?.remove();
            notice = null;
        };
        const showNotice = () => {
            if (notice) return;
            notice = api.el("div", { className: "bt-idle-notice" });
            const go = api.el("button", { textContent: "Exit idle" });
            go.onclick = () => {
                hideNotice();
                send(false);
            };
            const x = api.el("button", { className: "bt-x", textContent: "×", title: "Stay idle until reload" });
            x.onclick = () => {
                stayIdle = true;
                hideNotice();
            };
            notice.append(api.el("span", { textContent: "You're still shown as Idle. Go back online now, or press × to stay Idle until Discord restarts." }), go, x);
            document.body.append(notice);
        };

        const active = () => {
            last = Date.now();
            if (!idle || stayIdle) return;
            if (api.settings.remainInIdle) showNotice();
            else send(false);
        };
        const events = ["mousemove", "keydown", "mousedown", "wheel", "focus"];
        for (const e of events) window.addEventListener(e, active, true);

        const timer = setInterval(() => {
            const m = api.settings.idleTimeout;
            if (m > 0 && !idle && Date.now() - last > m * 60000) send(true);
        }, 10000);
        api.onDispose(() => {
            clearInterval(timer);
            events.forEach(e => window.removeEventListener(e, active, true));
            hideNotice();
            if (idle) send(false);
        });
    },
});
