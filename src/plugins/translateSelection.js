BThemer.definePlugin({
    id: "translateSelection",
    name: "Translate Selection",
    description: "Translate selected text with Google Translate using Ctrl+Alt+T.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        targetLanguage: { type: "text", label: "Target language code", default: "en" },
    },

    start(api) {
        api.onKey("Ctrl+Alt+T", () => {
            const text = window.getSelection()?.toString().trim();
            if (!text) return api.toast("Select text to translate first");
            if (text.length > 3000) return api.toast("Select a shorter passage (up to 3,000 characters)");

            const target = String(api.settings.targetLanguage || "en").trim();
            if (!/^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/.test(target)) {
                return api.toast("Use a language code such as en, es, fr, or ja");
            }
            const url = new URL("https://translate.google.com/");
            url.searchParams.set("sl", "auto");
            url.searchParams.set("tl", target);
            url.searchParams.set("text", text);
            url.searchParams.set("op", "translate");

            const openExternal = window.BThemerNative?.openExternal;
            if (typeof openExternal === "function") {
                openExternal(url.href).then(ok => {
                    if (!ok) api.toast("Couldn't open Google Translate");
                });
            } else {
                window.open(url.href, "_blank", "noopener,noreferrer");
            }
        });
    },
});