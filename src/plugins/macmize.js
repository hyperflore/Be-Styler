const LIGHTS = [
    ["close", "#ff5f57", "#e2463f", "Close", '<path d="M3.6 3.6l4.8 4.8M8.4 3.6L3.6 8.4" stroke="#4c0002" stroke-width="1.25" stroke-linecap="round"/>'],
    ["minimize", "#febc2e", "#e1a116", "Minimise", '<path d="M3 6h6" stroke="#985700" stroke-width="1.35" stroke-linecap="round"/>'],
    ["zoom", "#28c840", "#12ac28", "Zoom", '<path d="M3.3 7.6V3.3h4.3zM8.7 4.4v4.3H4.4z" fill="#0a5a12"/>'],
];
const ORIGINAL_LABELS = { close: ["Close"], minimize: ["Minimize", "Minimise"], zoom: ["Maximize", "Maximise", "Restore"] };

BThemer.definePlugin({
    id: "macmize",
    name: "Macmize",
    description: "Traffic-light window buttons: red, yellow and green round buttons in the top-left corner instead of minimise / maximise / close.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        side: { type: "select", label: "Where", options: [["left", "Top left"], ["right", "Top right"]], default: "left" },
        size: { type: "select", label: "Size", options: [["12", "Standard (12 px)"], ["14", "Large (14 px)"], ["16", "Extra large (16 px)"]], default: "12" },
        symbols: { type: "select", label: "Symbols (×, −, ⤢)", options: [["hover", "When you point at them"], ["always", "Always"], ["never", "Never"]], default: "hover" },
        greyInactive: { type: "toggle", label: "Grey while Discord isn't the active window", default: true },
        green: { type: "select", label: "Green button", options: [["maximize", "Maximise / restore"], ["fullscreen", "Full screen"]], default: "maximize" },
    },

    css: s => {
        const size = Number(s.size) || 12;
        return `
        /* Discord's own window buttons make way (they still exist, hidden) */
        [class*="winButton"] { display: none !important; }
        .bt-mac {
            position: fixed; top: var(--bt-mac-top, 10px); ${s.side === "right" ? "right: 14px" : "left: 13px"}; z-index: 2147482990;
            display: flex; gap: ${Math.round(size * 0.67)}px; padding: 4px; margin: -4px;
            -webkit-app-region: no-drag; app-region: no-drag;
        }
        .bt-mac button {
            all: unset; box-sizing: border-box; width: ${size}px; height: ${size}px; border-radius: 50%; cursor: default;
            display: grid; place-items: center; -webkit-app-region: no-drag;
        }
        .bt-mac button svg { width: ${size}px; height: ${size}px; opacity: ${s.symbols === "always" ? 1 : 0}; transition: opacity .08s ease; }
        ${s.symbols === "hover" ? ".bt-mac:hover button svg { opacity: 1; }" : ""}
        .bt-mac button:active { filter: brightness(.82); }
        ${LIGHTS.map(([id, fill, border]) => `.bt-mac .bt-mac-${id} { background: ${fill}; box-shadow: inset 0 0 0 .5px ${border}; }`).join("\n")}
        .bt-mac.bt-mac-inactive:not(:hover) button { background: rgb(255 255 255 / .2); box-shadow: inset 0 0 0 .5px rgb(255 255 255 / .12); }
        .bt-mac.bt-mac-inactive:not(:hover) button svg { opacity: 0; }
        ${s.side === "right" ? "" : `/* Discord's back / forward arrows move to the right end of the title bar, out of the buttons' way */
        [class^="bar_"]:has([class*="winButton"]) > :first-child,
        [class*=" bar_"]:has([class*="winButton"]) > :first-child,
        [class*="titleBar_"] > :first-child { order: 99; margin-left: 0 !important; margin-right: 8px !important; }`}`;
    },

    start(api) {
        const s = api.settings;
        const box = api.el("div", { className: "bt-mac" });
        box.setAttribute("role", "group");
        box.setAttribute("aria-label", "Window");

        const clickOriginal = id => {
            for (const label of ORIGINAL_LABELS[id]) {
                const b = document.querySelector(`[class*="winButton"][aria-label="${label}"]`);
                if (b) return b.click(), true;
            }
            return false;
        };
        const act = id => {
            if (id === "zoom" && s.green === "fullscreen") {
                if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
                else document.documentElement.requestFullscreen?.().catch(() => {});
                return;
            }
            const w = window.DiscordNative?.window;
            const fn = w && w[id === "zoom" ? "maximize" : id];
            if (typeof fn === "function") {
                Promise.resolve()
                    .then(() => fn.call(w))
                    .catch(() => clickOriginal(id) || api.warn(`couldn't ${id} the window`));
            } else if (!clickOriginal(id)) api.warn(`couldn't ${id} the window: DiscordNative.window isn't available`);
        };

        for (const [id, , , label, symbol] of LIGHTS) {
            const b = api.el("button", { className: `bt-mac-${id}`, type: "button", title: label });
            b.setAttribute("aria-label", label);
            b.innerHTML = `<svg viewBox="0 0 12 12" aria-hidden="true">${symbol}</svg>`;
            b.addEventListener("click", e => {
                e.stopPropagation();
                act(id);
            });
            b.addEventListener("dblclick", e => e.stopPropagation());
            box.append(b);
        }
        document.body.append(box);

        const place = () => {
            const bar = document.querySelector('[class*="winButton"]')?.parentElement?.closest('[class^="bar_"], [class*=" bar_"], [class*="titleBar_"]')
                || document.querySelector('[class*="titleBar_"]');
            const size = Number(s.size) || 12;
            const r = bar?.getBoundingClientRect();
            const top = r && r.height ? r.top + (r.height - size) / 2 : 10;
            box.style.setProperty("--bt-mac-top", `${Math.max(2, Math.round(top))}px`);
        };
        place();
        api.observe('[class*="winButton"]', place);
        addEventListener("resize", place);

        const focus = () => box.classList.toggle("bt-mac-inactive", s.greyInactive !== false && !document.hasFocus());
        focus();
        addEventListener("focus", focus);
        addEventListener("blur", focus);

        api.onDispose(() => {
            box.remove();
            removeEventListener("resize", place);
            removeEventListener("focus", focus);
            removeEventListener("blur", focus);
        });
    },
});
