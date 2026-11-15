const pad = n => String(n).padStart(2, "0");
const fmt = (ms, style) => {
    const t = Math.floor(ms / 1000);
    const d = Math.floor(t / 86400);
    const h = Math.floor((t % 86400) / 3600);
    const m = Math.floor((t % 3600) / 60);
    const sec = t % 60;
    if (style === "human") return `${d ? d + "d " : ""}${d || h ? pad(h) + "h " : ""}${pad(m)}m ${pad(sec)}s`;
    return `${d ? d + "d " : ""}${pad(h)}:${pad(m)}:${pad(sec)}`;
};

BThemer.definePlugin({
    id: "callTimer",
    name: "Call Timer",
    description: "Shows how long you've been in the current voice call.",
    author: "Be Themer",
    version: "1.1.0",

    settings: {
        format: { type: "select", label: "Format", options: [["stopwatch", "30d 23:00:42"], ["human", "30d 23h 00m 42s"]], default: "stopwatch" },
    },

    css: `.bt-call-timer { font-size: 12px; font-variant-numeric: tabular-nums; opacity: .8; margin-left: 4px; }`,

    start(api) {
        let since = 0;
        api.flux.subscribe("RTC_CONNECTION_STATE", a => {
            if (a.context && a.context !== "default") return;
            if (a.state === "RTC_CONNECTED") since ||= Date.now();
            else if (a.state === "RTC_DISCONNECTED") since = 0;
        });
        api.flux.subscribe("VOICE_CHANNEL_SELECT", a => {
            if (!a.channelId) since = 0;
            else if (since) since = Date.now();
        });

        const tick = () => {
            const status = document.querySelector('[class*="rtcConnectionStatus_"]');
            let el = document.querySelector(".bt-call-timer");
            if (!status || !since) return el?.remove();
            const host = status.querySelector('[class*="channel_"], a') || status;
            if (!el || !host.contains(el)) {
                el?.remove();
                el = api.el("span", { className: "bt-call-timer" });
                host.parentElement?.append(el);
            }
            el.textContent = fmt(Date.now() - since, api.settings.format);
        };
        const timer = setInterval(tick, 1000);
        api.onDispose(() => {
            clearInterval(timer);
            document.querySelectorAll(".bt-call-timer").forEach(e => e.remove());
        });
    },
});
