const LOGGER = /^%c\[([^\]]+)\]/;
const SELF_XSS = /Hold Up!|If someone told you to copy\/paste|Unless you understand exactly what you are doing/i;
const LEVELS = ["error", "warn", "info", "log", "debug", "trace"];

BThemer.definePlugin({
    id: "consoleJanitor",
    name: "Console Janitor",
    description: "Quiets Discord's console spam (hides the token-leaking Spotify logger) and adds BT.* DevTools shortcuts.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        disableLoggers: { type: "toggle", label: "Hide Discord's loggers", default: false },
        disableSpotifyLogger: { type: "toggle", label: "Hide the Spotify logger (prints account info and tokens)", default: true },
        whitelistedLoggers: { type: "text", label: "Loggers to keep (separated by ;)", default: "GatewaySocket; Routing/Utils" },
        allowError: { type: "toggle", label: "Allow errors", default: true },
        allowWarn: { type: "toggle", label: "Allow warnings", default: false },
        allowInfo: { type: "toggle", label: "Allow info", default: false },
        allowLog: { type: "toggle", label: "Allow logs", default: false },
        allowDebug: { type: "toggle", label: "Allow debug", default: false },
        allowTrace: { type: "toggle", label: "Allow trace", default: false },
        shortcuts: { type: "toggle", label: "Add BT.* shortcuts to the console", default: true },
    },

    start(api) {
        const s = api.settings;
        const allowed = level => s["allow" + level[0].toUpperCase() + level.slice(1)] !== false;
        const whitelist = () => new Set(String(s.whitelistedLoggers || "").split(";").map(x => x.trim().toLowerCase()).filter(Boolean));

        const shouldHide = (level, args) => {
            const first = typeof args[0] === "string" ? args[0] : "";
            if (SELF_XSS.test(first) || (typeof args[1] === "string" && SELF_XSS.test(args[1]))) return true;
            const name = LOGGER.exec(first)?.[1];
            if (!name || /Be Themer|B-Themer/i.test(name)) return false;
            if (/spotify/i.test(name) && s.disableSpotifyLogger) return true;
            if (!s.disableLoggers) return false;
            if (whitelist().has(name.toLowerCase())) return false;
            return !allowed(level);
        };

        const originals = {};
        for (const level of LEVELS) {
            const orig = (originals[level] = console[level]);
            console[level] = function (...args) {
                if (shouldHide(level, args)) return;
                return orig.apply(this, args);
            };
        }
        api.onDispose(() => Object.assign(console, originals));

        if (s.shortcuts) {
            window.BT = {
                find: f => api.webpack.find(f),
                props: (...p) => api.webpack.findByProps(...p),
                store: n => api.webpack.findStore(n),
                get flux() {
                    return api.flux.dispatcher;
                },
                copy: t => api.copy(typeof t === "string" ? t : JSON.stringify(t, null, 2)),
                route: () => api.discord.route(),
                me: () => api.discord.currentUser(),
                msg: (c, m) => api.discord.getMessage(c, m),
                rest: api.discord.rest,
                help: () => console.table({ find: "BT.find(filterFn)", props: 'BT.props("a", "b")', store: 'BT.store("UserStore")', flux: "BT.flux", copy: "BT.copy(anything)", route: "BT.route()", me: "BT.me()", msg: "BT.msg(channelId, messageId)", rest: 'await BT.rest.get("/users/@me")' }),
            };
            api.onDispose(() => delete window.BT);
        }
    },
});
