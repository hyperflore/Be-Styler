const voiceOptions = () => {
    try {
        const list = window.speechSynthesis?.getVoices() || [];
        return [["", "System default"], ...list.map(v => [v.voiceURI, `${v.name} (${v.lang})`])];
    } catch {
        return [["", "System default"]];
    }
};

BThemer.definePlugin({
    id: "vcNarrator",
    name: "Voice Narrator",
    description: "Reads out who joins, leaves or moves in your voice channel, and your own mute / deafen.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        voice: { type: "select", label: "Voice", options: voiceOptions(), default: "" },
        volume: { type: "range", label: "Volume", min: 0, max: 100, unit: "%", default: 100 },
        rate: { type: "range", label: "Speed", min: 10, max: 200, unit: "%", default: 100 },
        sayOwnName: { type: "toggle", label: "Say my own name", default: false },
        latinOnly: { type: "toggle", label: "Remove non-Latin characters from names", default: false },
        joinMessage: { type: "text", label: "Join message", default: "{{USER}} joined" },
        leaveMessage: { type: "text", label: "Leave message", default: "{{USER}} left" },
        moveMessage: { type: "text", label: "Move message", default: "{{USER}} moved to {{CHANNEL}}" },
        muteMessage: { type: "text", label: "Mute message (you)", default: "{{USER}} muted" },
        unmuteMessage: { type: "text", label: "Unmute message (you)", default: "{{USER}} unmuted" },
        deafenMessage: { type: "text", label: "Deafen message (you)", default: "{{USER}} deafened" },
        undeafenMessage: { type: "text", label: "Undeafen message (you)", default: "{{USER}} undeafened" },
    },

    start(api) {
        const s = api.settings;
        const states = new Map();

        const speak = text => {
            const synth = window.speechSynthesis;
            if (!text || !synth) return;
            const u = new SpeechSynthesisUtterance(text);
            const v = s.voice && synth.getVoices().find(x => x.voiceURI === s.voice);
            if (v) u.voice = v;
            u.volume = s.volume / 100;
            u.rate = s.rate / 100;
            synth.speak(u);
        };
        const clean = str => {
            let out = String(str || "");
            if (s.latinOnly) out = out.normalize("NFKC").replace(/[^\p{Script=Latin}\p{N}\p{P}\s]/gu, "");
            return out.replace(/[_*~`|]+/g, " ").trim() || "someone";
        };
        const format = (tpl, userId, channelId) => {
            const u = api.discord.store("UserStore")?.getUser?.(userId);
            const ch = channelId && api.discord.store("ChannelStore")?.getChannel?.(channelId);
            let nick = null;
            try {
                nick = ch?.guild_id ? api.discord.store("GuildMemberStore")?.getNick?.(ch.guild_id, userId) : null;
            } catch { }
            const username = u?.username || "someone";
            const display = u?.globalName || u?.global_name || username;
            return String(tpl || "")
                .replaceAll("{{USER}}", clean(nick || display))
                .replaceAll("{{USERNAME}}", clean(username))
                .replaceAll("{{DISPLAY_NAME}}", clean(display))
                .replaceAll("{{NICKNAME}}", clean(nick || display))
                .replaceAll("{{CHANNEL}}", clean(ch?.name || "voice channel"));
        };

        api.flux.subscribe("VOICE_STATE_UPDATES", ({ voiceStates }) => {
            const me = api.discord.currentUser()?.id;
            const mine = api.discord.store("SelectedChannelStore")?.getVoiceChannelId?.();
            for (const st of voiceStates || []) {
                const before = st.oldChannelId !== undefined ? st.oldChannelId : states.get(st.userId) ?? null;
                states.set(st.userId, st.channelId ?? null);
                if (before === (st.channelId ?? null)) continue;
                if (st.userId === me) {
                    if (!s.sayOwnName) continue;
                    if (!before && st.channelId) speak(format(s.joinMessage, me, st.channelId));
                    else if (before && !st.channelId) speak(format(s.leaveMessage, me, before));
                    else speak(format(s.moveMessage, me, st.channelId));
                    continue;
                }
                if (!mine) continue;
                if (st.channelId === mine) speak(format(s.joinMessage, st.userId, mine));
                else if (before === mine && !st.channelId) speak(format(s.leaveMessage, st.userId, mine));
                else if (before === mine) speak(format(s.moveMessage, st.userId, st.channelId));
            }
        });

        const me = () => api.discord.currentUser()?.id;
        api.flux.subscribe("AUDIO_TOGGLE_SELF_MUTE", () => {
            setTimeout(() => {
                const media = api.discord.store("MediaEngineStore");
                if (!api.discord.store("SelectedChannelStore")?.getVoiceChannelId?.()) return;
                const muted = media?.isSelfMute?.();
                speak(format(muted ? s.muteMessage : s.unmuteMessage, me(), api.discord.store("SelectedChannelStore")?.getVoiceChannelId?.()));
            });
        });
        api.flux.subscribe("AUDIO_TOGGLE_SELF_DEAF", () => {
            setTimeout(() => {
                const media = api.discord.store("MediaEngineStore");
                if (!api.discord.store("SelectedChannelStore")?.getVoiceChannelId?.()) return;
                const deaf = media?.isSelfDeaf?.();
                speak(format(deaf ? s.deafenMessage : s.undeafenMessage, me(), api.discord.store("SelectedChannelStore")?.getVoiceChannelId?.()));
            });
        });

        api.addMenuItem("Test voice narrator", () => speak(format(s.joinMessage, me(), api.discord.route().channelId)));
        api.onDispose(() => window.speechSynthesis?.cancel());
    },
});
