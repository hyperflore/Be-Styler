BThemer.definePlugin({
    id: "keyboardTweaks",
    name: "Keyboard Tweaks",
    description: "Stops F1 opening Discord's help page. Optional: F8 pauses in DevTools so you can inspect pop-ups.",
    author: "Be Themer",
    version: "1.0.0",
    enabledByDefault: true,

    settings: {
        noF1: { type: "toggle", label: "Block F1 (help page)", default: true },
        f8break: { type: "toggle", label: "F8 pauses in DevTools (debugger)", default: false },
    },

    start(api) {
        const handler = e => {
            if (e.key === "F1" && api.settings.noF1 && !e.ctrlKey && !e.altKey && !e.shiftKey) {
                e.preventDefault();
                e.stopImmediatePropagation();
            } else if (e.key === "F8" && api.settings.f8break) {
                debugger;
            }
        };
        window.addEventListener("keydown", handler, true);
        api.onDispose(() => window.removeEventListener("keydown", handler, true));
    },
});
