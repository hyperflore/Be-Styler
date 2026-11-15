const SEND = /\/api\/v\d+\/channels\/\d+\/messages(\?|$)/;
const SUPPRESS_NOTIFICATIONS = 1 << 12;
const BELL_PATH = "M12 3.5c-3 0-5.25 2.3-5.25 5.4v4.3L4.75 16.5h14.5l-2-3.3V8.9c0-3.1-2.25-5.4-5.25-5.4ZM10 19.25a2 2 0 0 0 4 0";
const svg = inner => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
const BELL = svg(`<path d="${BELL_PATH}"/>`);
const BELL_OFF = svg(`<path d="${BELL_PATH}"/><path d="M3 3l18 18"/>`);

BThemer.definePlugin({
    id: "silentMessages",
    name: "Silent Message Toggle",
    description: "A bell button in the chat bar: while it's on, your messages go out as @silent.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        persistState: { type: "toggle", label: "Keep state when changing channels", default: false },
        autoDisable: { type: "toggle", label: "Turn off again after sending one message", default: true },
    },

    css: `
        .bt-silent-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 0; background: none; cursor: pointer;
            color: var(--interactive-normal, #b5bac1); border-radius: 6px; font-size: 17px; }
        .bt-silent-btn:hover { color: var(--interactive-hover, #dbdee1); }
        .bt-silent-btn.on { color: var(--status-danger, #f23f43); }`,

    start(api) {
        let on = false;
        const paint = () => {
            for (const b of document.querySelectorAll(".bt-silent-btn")) {
                b.classList.toggle("on", on);
                b.innerHTML = on ? BELL_OFF : BELL;
                b.title = on ? "Disable Silent Message" : "Enable Silent Message";
            }
        };
        const set = value => {
            on = !!value;
            paint();
        };
        const toggle = () => {
            set(!on);
            api.toast(on ? "Silent message on" : "Silent message off");
        };

        api.observe('form [class*="channelTextArea_"] [class*="buttons_"]', bar => {
            if (bar.querySelector(".bt-silent-btn")) return;
            const b = api.el("button", { type: "button", className: "bt-silent-btn" });
            b.addEventListener("click", e => {
                e.preventDefault();
                toggle();
            });
            bar.prepend(b);
            paint();
        });
        api.onDispose(() => document.querySelectorAll(".bt-silent-btn").forEach(b => b.remove()));
        api.onKey("ctrl+shift+s", toggle);
        api.addMenuItem("Toggle silent message", toggle);
        api.flux.subscribe("CHANNEL_SELECT", () => {
            if (!api.settings.persistState) set(false);
        });

        api.net.onRequest(req => {
            if (!on || req.method !== "POST" || !SEND.test(req.url) || typeof req.body !== "string") return;
            try {
                const body = JSON.parse(req.body);
                if (typeof body.content === "string" && body.content.startsWith("@silent ")) return undefined;
                body.flags = (body.flags || 0) | SUPPRESS_NOTIFICATIONS;
                if (api.settings.autoDisable) setTimeout(() => set(false));
                return { body: JSON.stringify(body) };
            } catch {
                return undefined;
            }
        });
    },
});
