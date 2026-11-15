
let clicks = 0;

BThemer.definePlugin({
    id: "__PLUGIN_ID__",
    name: "__PLUGIN_NAME__",
    description: "Describe what your plugin does.",
    author: "__PLUGIN_AUTHOR__",
    version: "1.0.0",
    enabledByDefault: false,

    settings: {
        glow: { type: "toggle", label: "Glow on hover", default: true },
        strength: { type: "range", label: "Glow strength", min: 0, max: 40, unit: "px", default: 12 },
        color: { type: "color", label: "Glow colour", default: "#ff7eb6" },
        style: { type: "select", label: "Style", options: [["soft", "Soft"], ["hard", "Hard"]], default: "soft" },
        greeting: { type: "text", label: "Toast text", default: "Hello from __PLUGIN_NAME__!" },
    },

    css: s => !s.glow ? "" : `
        [class*="avatar_"]:hover {
            filter: drop-shadow(0 0 ${s.strength}px ${s.color})${s.style === "hard" ? " contrast(1.2)" : ""};
        }`,

    start(api) {
        api.log("started with settings", { ...api.settings });

        api.observe('[id^="message-content-"]', el => {
            el.dataset.seenByMyPlugin = "1";
        });

        api.onKey("Ctrl+Alt+K", () => api.toast(`${api.settings.greeting} (#${++clicks})`));

        api.addMenuItem("Say hi", () => api.toast(api.settings.greeting));

        const timer = setInterval(() => {}, 60_000);
        api.onDispose(() => clearInterval(timer));
    },

    stop(api) {
        api.log("stopped");
    },

    onSettingChange(key, value, api) {
        api.log(`${key} →`, value);
    },

    onCoreChange(core, api) {
    },
});
