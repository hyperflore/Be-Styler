const ANALYTICS = /\/api\/v\d+\/(science|metrics|track)(\/|\?|$)/;
const CRASH_REPORTS = /(^https?:\/\/[^/]*sentry\.io\/)|\/error-reporting-proxy\//;

let blocked = 0;

BThemer.definePlugin({
    id: "noTrack",
    name: "No Track",
    description: "Blocks Discord's analytics/metrics requests and crash reports.",
    author: "Be Themer",
    version: "1.0.0",
    enabledByDefault: false,

    settings: {
        analytics: { type: "toggle", label: "Block analytics & metrics", default: true },
        crashReports: { type: "toggle", label: "Block crash reports (Sentry)", default: true },
    },

    start(api) {
        api.net.onRequest(req => {
            if ((api.settings.analytics && ANALYTICS.test(req.url)) || (api.settings.crashReports && CRASH_REPORTS.test(req.url))) {
                blocked++;
                return { block: true, status: 204 };
            }
        });
        api.addMenuItem("No Track: blocked request count", () => api.toast(`${blocked} tracking request(s) blocked this session`));
    },
});
