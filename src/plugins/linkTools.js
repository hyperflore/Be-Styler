const APPS = [
    { key: "spotify", rx: /^https:\/\/open\.spotify\.com\/(?:intl-\w+\/)?(track|album|artist|playlist|user|episode|show)\/([\w-]+)/, to: m => `spotify:${m[1]}:${m[2]}` },
    { key: "steam", rx: /^https:\/\/(store\.steampowered\.com|steamcommunity\.com)\/.+/, to: m => `steam://openurl/${m[0]}` },
    { key: "epic", rx: /^https:\/\/store\.epicgames\.com\/(.+)/, to: m => `com.epicgames.launcher://store/${m[1]}` },
    { key: "tidal", rx: /^https:\/\/(?:listen\.)?tidal\.com\/(?:browse\/)?(track|album|artist|playlist|user|video)\/([\w-]+)/, to: m => `tidal://${m[1]}/${m[2]}` },
    { key: "itunes", rx: /^https:\/\/(music|geo\.music|itunes)\.apple\.com\/(.+)/, to: m => `itunes://music.apple.com/${m[2]}` },
];
const RISKY_DOWNLOAD = /\.(exe|msi|bat|cmd|com|scr|ps1|vbs|js|jar|apk|dmg|pkg|app|deb|rpm|sh|reg|lnk|hta|cpl|msc|iso|img)(\?|#|$)/i;
const isDiscordUrl = u => /^https:\/\/((canary|ptb)\.)?discord(app)?\.(com|gg|new|gift)\b/.test(u);

BThemer.definePlugin({
    id: "linkTools",
    name: "Link Tools",
    description: "Skip the \"Leaving Discord\" and dangerous-download warnings; open Spotify / Steam / Epic / Tidal / Apple Music links in their apps.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        domain: { type: "toggle", label: "Skip the \"Leaving Discord\" (untrusted domain) warning", default: true },
        file: { type: "toggle", label: "Skip the \"Potentially dangerous download\" warning", default: true },
        spotify: { type: "toggle", label: "Open Spotify links in the Spotify app", default: true },
        steam: { type: "toggle", label: "Open Steam links in the Steam app", default: true },
        epic: { type: "toggle", label: "Open Epic Games links in the Epic Games Launcher", default: true },
        tidal: { type: "toggle", label: "Open Tidal links in the Tidal app", default: true },
        itunes: { type: "toggle", label: "Open Apple Music links in iTunes / Apple Music", default: true },
    },

    start(api) {
        const openExternal = url => {
            if (typeof window.BThemerNative?.openExternal === "function") {
                window.BThemerNative.openExternal(url).then(ok => ok || api.toast("Couldn't open " + url));
            } else if (/^https?:/.test(url)) window.open(url, "_blank");
        };
        const click = e => {
            if (e.button !== 0 || e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
            const a = e.target instanceof Element && e.target.closest("a[href]");
            if (!a || !a.closest('[id^="chat-messages-"], [class*="embed"], [class*="userProfile"], [class*="bio"], [class*="topic"]')) return;
            const href = a.href;
            if (!/^https?:\/\//.test(href) || isDiscordUrl(href)) return;

            for (const app of APPS) {
                const m = api.settings[app.key] && app.rx.exec(href);
                if (m) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    openExternal(app.to(m));
                    return;
                }
            }
            const risky = RISKY_DOWNLOAD.test(new URL(href).pathname);
            if (risky ? api.settings.file : api.settings.domain) {
                e.preventDefault();
                e.stopImmediatePropagation();
                openExternal(href);
            }
        };
        document.addEventListener("click", click, true);
        api.onDispose(() => document.removeEventListener("click", click, true));
    },
});
