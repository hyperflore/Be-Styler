const isDiscordSound = el => {
    const src = String(el.currentSrc || el.src || "");
    return /\/assets\/[^/?]+\.(mp3|ogg|wav)(\?|$)/i.test(src);
};

BThemer.definePlugin({
    id: "notificationVolume",
    name: "Notification Volume",
    description: "Sets the volume of Discord's notification sounds (pings, joins, ringing).",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        volume: { type: "range", label: "Notification volume", min: 0, max: 100, unit: "%", default: 100 },
    },

    start(api) {
        const proto = HTMLMediaElement.prototype;
        const play = proto.play;
        proto.play = function () {
            try {
                if (this instanceof HTMLAudioElement && isDiscordSound(this)) {
                    if (this.__btBase === undefined) this.__btBase = this.volume;
                    this.volume = Math.max(0, Math.min(1, this.__btBase * (api.settings.volume / 100)));
                }
            } catch { }
            return play.apply(this, arguments);
        };
        api.onDispose(() => {
            proto.play = play;
        });
    },
});
