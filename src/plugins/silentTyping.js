const TYPING = /\/api\/v\d+\/channels\/(\d+)\/typing(\?|$)/;
const ids = text => new Set(String(text || "").split(/[\s,]+/).filter(s => /^\d{1,25}$/.test(s)));

BThemer.definePlugin({
    id: "silentTyping",
    name: "Silent Typing",
    description: "Nobody sees \"… is typing\" while you write. Toggle from the chat bar, right-click menu or Ctrl+Shift+T.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        isEnabled: { type: "toggle", label: "Hide that I'm typing", default: true },
        showIcon: { type: "toggle", label: "Show a toggle button in the chat bar", default: false },
        contextMenu: { type: "toggle", label: "Toggle in the message box's right-click menu", default: true },
        showTypingIn: { type: "text", label: "Always show typing in these channel IDs (comma-separated)", default: "" },
    },

    css: s =>
        s.showIcon
            ? `.bt-st-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 0; background: none; cursor: pointer;
                color: var(--interactive-normal, #b5bac1); font-size: 18px; border-radius: 6px; }
               .bt-st-btn:hover { color: var(--interactive-hover, #dbdee1); }
               .bt-st-btn.off { opacity: .45; }
               .bt-st-btn.on::after { content: ""; position: absolute; width: 22px; height: 2px; background: var(--status-danger, #f23f43); transform: rotate(-45deg); border-radius: 2px; }`
            : "",

    start(api) {
        if (api.settings.active === false && api.settings.isEnabled !== false) api.setSetting("isEnabled", false);

        const toggle = () => {
            api.setSetting("isEnabled", !api.settings.isEnabled);
            api.toast(api.settings.isEnabled ? "Silent typing enabled" : "Silent typing disabled");
            paintButtons();
        };

        api.net.onRequest(req => {
            if (req.method !== "POST") return;
            const m = TYPING.exec(req.url);
            if (!m || !api.settings.isEnabled || ids(api.settings.showTypingIn).has(m[1])) return;
            return { block: true, status: 204 };
        });

        api.addMenuItem("Toggle silent typing", toggle);
        api.onKey("ctrl+shift+t", toggle);

        api.contextMenu("textarea-context", () =>
            api.settings.contextMenu ? [{ id: "bt-silent-typing", label: api.settings.isEnabled ? "Disable Silent Typing" : "Enable Silent Typing", action: toggle }] : null,
        );

        const paintButtons = () => {
            for (const b of document.querySelectorAll(".bt-st-btn")) {
                b.classList.toggle("on", !!api.settings.isEnabled);
                b.classList.toggle("off", !api.settings.isEnabled);
                b.title = api.settings.isEnabled ? "Silent typing is on (click to disable)" : "Silent typing is off (click to enable)";
            }
        };
        api.observe('form [class*="channelTextArea_"] [class*="buttons_"]', bar => {
            if (!api.settings.showIcon || bar.querySelector(".bt-st-btn")) return;
            const b = api.el("button", { type: "button", className: "bt-st-btn", textContent: "⌨️" });
            b.style.position = "relative";
            b.addEventListener("click", e => {
                e.preventDefault();
                toggle();
            });
            bar.prepend(b);
            paintButtons();
        });
        this._repaint = () => {
            if (!api.settings.showIcon) document.querySelectorAll(".bt-st-btn").forEach(b => b.remove());
            paintButtons();
        };
        api.onDispose(() => document.querySelectorAll(".bt-st-btn").forEach(b => b.remove()));
    },

    onSettingChange() {
        this._repaint?.();
    },
});
