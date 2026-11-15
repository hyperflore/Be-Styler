BThemer.definePlugin({
    id: "noSystemBadge",
    name: "No Taskbar Badge",
    description: "Removes the red unread/mention count from Discord's taskbar icon.",
    author: "Be Themer",
    version: "1.0.0",

    start(api) {
        const app = window.DiscordNative?.app;
        if (!app || typeof app.setBadgeCount !== "function") return api.warn("DiscordNative.app.setBadgeCount not found");
        const original = app.setBadgeCount;
        try {
            app.setBadgeCount = () => original.call(app, 0);
            original.call(app, 0);
        } catch (e) {
            return api.warn("couldn't wrap setBadgeCount", e);
        }
        api.onDispose(() => {
            app.setBadgeCount = original;
        });
    },
});
