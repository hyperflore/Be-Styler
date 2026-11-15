const SOCKET = "BeThemerCustomRPC";
const TYPES = { playing: 0, streaming: 1, listening: 2, watching: 3, competing: 5 };

BThemer.definePlugin({
    id: "customRPC",
    name: "Custom Activity",
    description: "Set your own Playing / Watching / Listening activity with details, state, timer and image.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        appId: { type: "text", label: "Application ID", default: "" },
        name: { type: "text", label: "Name (what you're doing)", default: "Be Themer" },
        type: { type: "select", label: "Type", options: [["playing", "Playing"], ["watching", "Watching"], ["listening", "Listening to"], ["competing", "Competing in"]], default: "playing" },
        details: { type: "text", label: "Details (line 2)", default: "" },
        state: { type: "text", label: "State (line 3)", default: "" },
        image: { type: "text", label: "Large image URL (https)", default: "" },
        imageText: { type: "text", label: "Image hover text", default: "" },
        timer: { type: "toggle", label: "Show elapsed time", default: true },
    },

    start(api) {
        let started = Date.now();
        let assetKey = null;

        const resolveImage = async url => {
            if (!/^https:\/\//.test(url) || !/^\d{15,22}$/.test(api.settings.appId)) return null;
            try {
                const res = await api.discord.rest.post(`/applications/${api.settings.appId}/external-assets`, { urls: [url] });
                return res?.[0]?.external_asset_path ? "mp:" + res[0].external_asset_path : null;
            } catch (e) {
                api.warn("couldn't register image", e);
                return null;
            }
        };

        const push = async () => {
            const s = api.settings;
            if (!/^\d{15,22}$/.test(s.appId) || !s.name) {
                api.discord.dispatch({ type: "LOCAL_ACTIVITY_UPDATE", activity: null, socketId: SOCKET });
                return;
            }
            assetKey = s.image ? await resolveImage(s.image) : null;
            const activity = {
                application_id: s.appId,
                name: s.name,
                type: TYPES[s.type] ?? 0,
                flags: 1,
                ...(s.details ? { details: s.details } : {}),
                ...(s.state ? { state: s.state } : {}),
                ...(s.timer ? { timestamps: { start: started } } : {}),
                ...(assetKey ? { assets: { large_image: assetKey, ...(s.imageText ? { large_text: s.imageText } : {}) } } : {}),
            };
            api.discord.dispatch({ type: "LOCAL_ACTIVITY_UPDATE", activity, socketId: SOCKET });
        };

        let debounce = 0;
        this._refresh = () => {
            clearTimeout(debounce);
            debounce = setTimeout(push, 800);
        };
        api.flux.subscribe("CONNECTION_OPEN", () => {
            started = Date.now();
            push();
        });
        setTimeout(push, 1500);
        api.onDispose(() => {
            clearTimeout(debounce);
            api.discord.dispatch({ type: "LOCAL_ACTIVITY_UPDATE", activity: null, socketId: SOCKET });
        });
    },

    onSettingChange() {
        this._refresh?.();
    },
});
