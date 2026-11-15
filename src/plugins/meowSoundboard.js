const RATE = 48000;
const LABEL = /^(open |toggle )?soundboard$/i;
const pad = n => String(n).padStart(2, "0");
const clock = ms => {
    const s = Math.floor(ms / 1000);
    return s >= 3600 ? `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};
const sizeText = n => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const stampText = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}.${pad(d.getMinutes())}`;

let catSeq = 0;
const SVG_NS = "http://www.w3.org/2000/svg";
const catIcon = size => {
    const id = `bt-cat-mask-${++catSeq}`;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "bt-meow-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML =
        `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-2" y="-2" width="28" height="28">` +
        '<rect x="-2" y="-2" width="28" height="28" fill="#fff"/>' +
        '<g class="bt-cat-eyes" fill="#000"><ellipse cx="9" cy="14.1" rx="1.25" ry="1.55"/><ellipse cx="15" cy="14.1" rx="1.25" ry="1.55"/></g>' +
        '<path d="M11.05 16.85h1.9l-.95 1.1z" fill="#000"/>' +
        '<path d="M10.1 18.35c.65.55 1.3.55 1.9 0 .6.55 1.25.55 1.9 0" fill="none" stroke="#000" stroke-width=".85" stroke-linecap="round"/>' +
        "</mask></defs>" +
        '<g class="bt-cat-face">' +
        `<g class="bt-cat-head" fill="currentColor" mask="url(#${id})">` +
        '<path class="bt-cat-ear bt-cat-ear-l" d="M4.2 3.9c0-.65.75-.98 1.25-.55l4.75 4.3-5.4 4.1z"/>' +
        '<path class="bt-cat-ear bt-cat-ear-r" d="M19.8 3.9c0-.65-.75-.98-1.25-.55l-4.75 4.3 5.4 4.1z"/>' +
        '<ellipse cx="12" cy="14.6" rx="8.6" ry="6.9"/>' +
        "</g>" +
        '<g fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round">' +
        '<path class="bt-cat-wl" d="M.9 13.7l2.8.55M1.1 16.75l2.7-.55"/>' +
        '<path class="bt-cat-wr" d="M23.1 13.7l-2.8.55M22.9 16.75l-2.7-.55"/>' +
        "</g>" +
        "</g>";
    return svg;
};

BThemer.definePlugin({
    id: "meowSoundboard",
    name: "Meow",
    description: "Records your voice call (everyone you hear plus your mic) and saves it as an MP3 in a folder you choose.",
    author: "Be Themer",
    version: "3.0.0",
    enabledByDefault: true,

    settings: {
        folder: { type: "text", label: "Recordings folder (empty = Documents\\Meow Recordings; you can also choose it on the Meow page)", default: "" },
        includeMic: { type: "toggle", label: "Record my voice (my microphone)", default: true },
        micDevice: { type: "text", label: "Microphone (empty = the one Discord uses; pick it on the Meow page)", default: "" },
        micVolume: { type: "range", label: "My voice volume", min: 0, max: 200, unit: "%", default: 100 },
        followMute: { type: "toggle", label: "Leave my voice out while I'm muted in Discord", default: true },
        quality: { type: "select", label: "MP3 quality", default: "High", options: [["High", "High (192 kbps)"], ["Medium", "Standard (128 kbps)"]] },
        announce: { type: "toggle", label: "Tell the channel when I start and stop recording (in many places everyone must agree to being recorded)", default: true },
        autoStop: { type: "toggle", label: "Stop when I leave the voice channel", default: true },
    },

    css: () => `
        /* the cat (animates on hover, like Discord's own buttons) */
        .bt-meow-icon { display: block; flex: none; overflow: visible; color: inherit; }
        .bt-meow-icon * { transform-box: fill-box; }
        .bt-meow-icon .bt-cat-face { transform-origin: 50% 100%; }
        .bt-meow-icon .bt-cat-ear-l { transform-origin: 85% 85%; }
        .bt-meow-icon .bt-cat-ear-r { transform-origin: 15% 85%; }
        .bt-meow-icon .bt-cat-eyes { transform-origin: 50% 50%; }
        .bt-meow-icon .bt-cat-wl { transform-origin: 100% 50%; }
        .bt-meow-icon .bt-cat-wr { transform-origin: 0% 50%; }
        :is(.bt-meow-btn:hover, .bt-meow-btn:focus-visible) .bt-cat-face { animation: bt-cat-tilt .8s cubic-bezier(.3, 1.4, .5, 1); } /* whiskers tilt with the face */
        :is(.bt-meow-btn:hover, .bt-meow-btn:focus-visible) .bt-cat-ear-l { animation: bt-cat-ear-l .45s ease .08s; }
        :is(.bt-meow-btn:hover, .bt-meow-btn:focus-visible) .bt-cat-ear-r { animation: bt-cat-ear-r .45s ease .22s; }
        :is(.bt-meow-btn:hover, .bt-meow-btn:focus-visible) .bt-cat-eyes { animation: bt-cat-blink .4s ease .35s; }
        :is(.bt-meow-btn:hover, .bt-meow-btn:focus-visible) .bt-cat-wl { animation: bt-cat-wl .6s ease; }
        :is(.bt-meow-btn:hover, .bt-meow-btn:focus-visible) .bt-cat-wr { animation: bt-cat-wr .6s ease; }
        @keyframes bt-cat-tilt { 0% { transform: none; } 30% { transform: rotate(-9deg); } 62% { transform: rotate(5deg); } 100% { transform: none; } }
        @keyframes bt-cat-ear-l { 0%, 100% { transform: none; } 45% { transform: rotate(-18deg); } }
        @keyframes bt-cat-ear-r { 0%, 100% { transform: none; } 45% { transform: rotate(18deg); } }
        @keyframes bt-cat-blink { 0%, 100% { transform: none; } 50% { transform: scaleY(.1); } }
        @keyframes bt-cat-wl { 0%, 100% { transform: none; } 25% { transform: rotate(9deg); } 60% { transform: rotate(-6deg); } }
        @keyframes bt-cat-wr { 0%, 100% { transform: none; } 25% { transform: rotate(-9deg); } 60% { transform: rotate(6deg); } }
        @media (prefers-reduced-motion: reduce) { .bt-meow-icon * { animation: none !important; } }

        /* the row Meow joins keeps one line: Discord lays the voice panel out 4 to a row, so make it 5 */
        :has(> .bt-meow-cell) {
            flex-wrap: nowrap !important;
            grid-template-columns: none !important; grid-auto-flow: column !important; grid-auto-columns: minmax(0, 1fr) !important;
        }
        :has(> .bt-meow-cell) > * { min-width: 0 !important; }

        /* recording: red dot on the button, red bar at the top */
        .bt-meow-btn { position: relative; }
        .bt-meow-btn.bt-recording { color: #f23f43 !important; }
        .bt-meow-btn.bt-recording::after {
            content: ""; position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; border-radius: 50%;
            background: #f23f43; box-shadow: 0 0 0 2px var(--background-secondary, #2b2d31); animation: bt-rec-dot 1.2s ease-in-out infinite;
        }
        .bt-meow-recbar { display: none !important; }
        .bt-meow-recbar-unused {
            position: fixed; top: 6px; left: 50%; transform: translateX(-50%); z-index: 2147483001; display: flex; align-items: center; gap: 10px;
            padding: 4px 6px 4px 12px; border-radius: 999px; font: 600 13px/1 var(--font-primary, "gg sans", sans-serif); color: #fff;
            background: rgb(30 31 34 / .92); border: 1px solid rgb(242 63 67 / .6); box-shadow: 0 4px 16px rgb(0 0 0 / .35); backdrop-filter: blur(12px);
        }
        .bt-meow-recbar .bt-rec-dot { width: 8px; height: 8px; border-radius: 50%; background: #f23f43; animation: bt-rec-dot 1.2s ease-in-out infinite; }
        .bt-meow-recbar .bt-rec-time { font-variant-numeric: tabular-nums; }
        .bt-meow-recbar .bt-rec-where { font-weight: 500; color: rgb(255 255 255 / .7); max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bt-meow-recbar .bt-rec-mic { padding: 2px 8px; border-radius: 999px; font-size: 11px; background: rgb(255 255 255 / .12); transition: background .15s; }
        .bt-meow-recbar .bt-rec-mic:empty { display: none; }
        .bt-meow-recbar .bt-rec-mic.bt-hot { background: #23a55a; }
        .bt-meow-recbar .bt-rec-mic.bt-off { background: rgb(242 63 67 / .35); }
        .bt-meow-recbar button {
            all: unset; padding: 4px 10px; border-radius: 999px; cursor: pointer; font: 600 12px var(--font-primary, sans-serif); color: #fff; background: #da373c;
        }
        .bt-meow-recbar button:hover { background: #a12828; }
        @keyframes bt-rec-dot { 50% { opacity: .35; } }
        @media (prefers-reduced-motion: reduce) { .bt-meow-btn.bt-recording::after, .bt-meow-recbar .bt-rec-dot { animation: none; } }

        /* the Meow page */
        .bt-meow-page .bt-meow-status { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 0 0 12px; padding: 10px 12px; border-radius: 6px; background: var(--background-secondary, rgb(255 255 255 / .04)); }
        .bt-meow-page .bt-meow-status.bt-on { box-shadow: inset 3px 0 0 #f23f43; }
        .bt-meow-page .bt-meow-status span { flex: 1 1 220px; font-size: 14px; color: var(--header-primary, #f2f3f5); }
        .bt-meow-page .bt-meow-path { flex: 1 1 260px; min-width: 0; font: 13px var(--font-code, monospace); color: var(--text-link, #00a8fc); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .bt-meow-page .bt-meow-files { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
        .bt-meow-page .bt-meow-file { display: flex; align-items: center; gap: 10px; padding: 6px 10px; border-radius: 4px; background: var(--background-secondary, rgb(255 255 255 / .03)); }
        .bt-meow-page .bt-meow-file b { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; font-size: 13px; color: var(--header-primary, #f2f3f5); }
        .bt-meow-page .bt-meow-file small { color: var(--text-muted, #949ba4); font-size: 12px; white-space: nowrap; }
        .bt-meow-page .bt-meow-meter { flex: 0 0 160px; height: 8px; border-radius: 4px; overflow: hidden; background: rgb(0 0 0 / .35); }
        .bt-meow-page .bt-meow-meter > i { display: block; height: 100%; width: 0%; border-radius: 4px; background: linear-gradient(90deg, #23a55a, #f0b232 70%, #f23f43); transition: width .08s linear; }
        .bt-meow-page .bt-meow-test-info { margin: 0; }
        .bt-meow-page .bt-meow-testlist { display: flex; flex-direction: column; gap: 4px; margin: 2px 0 6px; }
        .bt-meow-page .bt-meow-testmic { display: flex; align-items: center; gap: 10px; padding: 5px 8px; border-radius: 4px; background: rgb(0 0 0 / .18); border: 1px solid transparent; }
        .bt-meow-page .bt-meow-testmic.bt-hears { border-color: #23a55a; }
        .bt-meow-page .bt-meow-testname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: var(--header-primary, #f2f3f5); }
        .bt-meow-page .bt-meow-opts label input[type=range] { flex: 0 1 220px; }
        .bt-meow-page .bt-meow-opts label { display: flex; align-items: center; gap: 8px; margin: 6px 0; font-size: 14px; color: var(--text-normal, #dbdee1); cursor: pointer; }`,

    start(api) {
        const s = api.settings;
        const N = window.BThemerNative || {};
        const store = name => api.discord.store(name);
        let ready = typeof N.recStart === "function";
        const RESTART = "Quit Discord fully once to finish updating Meow: right-click Discord's icon in the system tray (by the clock), choose Quit Discord, then open Discord again. Closing the window isn't enough.";
        const outdated = e => /No handler registered/i.test(String((e && e.message) || e));
        const call = async (fn, ...args) => {
            try {
                return await fn(...args);
            } catch (e) {
                if (outdated(e)) {
                    ready = false;
                    refreshUi();
                    say(RESTART);
                    return null;
                }
                throw e;
            }
        };

        api.storage.get("library").then(async lib => {
            const legacy = await api.storage.get("sounds");
            const ids = new Set([...(lib?.sounds || []), ...(Array.isArray(legacy) ? legacy : [])].map(x => x && x.id).filter(Boolean));
            for (const id of ids) {
                api.storage.delete(`audio:${id}`).catch(() => {});
                api.storage.delete(`audio-discord:${id}`).catch(() => {});
            }
            for (const k of ["library", "sounds", "okGuilds"]) api.storage.delete(k).catch(() => {});
        });
        for (const k of ["homeGuild", "volume"]) delete s[k];

        let lastVoice = null;
        const fromStore = () => {
            try {
                const id = store("SelectedChannelStore")?.getVoiceChannelId?.();
                return id ? { channelId: String(id), guildId: store("ChannelStore")?.getChannel?.(id)?.guild_id || null } : null;
            } catch {
                return null;
            }
        };
        const fromPanel = () => {
            const link = document.querySelector('section[class*="panels_"] a[href*="/channels/"], [class*="rtcConnectionStatus"] a[href*="/channels/"], [class*="connection_"] a[href*="/channels/"]');
            const m = link && /\/channels\/(@me|\d+)\/(\d+)/.exec(link.getAttribute("href") || "");
            return m ? { channelId: m[2], guildId: m[1] === "@me" ? null : m[1], label: link.textContent.trim() } : null;
        };
        const currentVoice = () => fromStore() || lastVoice || fromPanel();
        const placeName = v => {
            let channel = null, guild = null;
            try {
                channel = store("ChannelStore")?.getChannel?.(v.channelId)?.name || null;
                guild = v.guildId ? store("GuildStore")?.getGuild?.(v.guildId)?.name || null : null;
            } catch { }
            if (channel) return guild ? `${channel} - ${guild}` : channel;
            const panel = fromPanel();
            return (panel && panel.channelId === v.channelId && panel.label.replace(/\s*\/\s*/g, " - ")) || "Voice call";
        };

        const discordMicName = () => {
            try {
                const m = store("MediaEngineStore");
                const id = m?.getInputDeviceId?.();
                if (!id || id === "default") return null;
                const devs = m?.getInputDevices?.() || {};
                const d = devs[id] || Object.values(devs).find(x => x && x.id === id);
                return d && d.name ? String(d.name) : null;
            } catch {
                return null;
            }
        };
        const micList = async () => {
            try {
                return (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === "audioinput" && d.deviceId);
            } catch {
                return [];
            }
        };
        const norm = t => String(t || "").toLowerCase().replace(/^(default|communications) - /, "").replace(/\s+/g, " ").trim();
        const pickMicId = async () => {
            const list = await micList();
            if (s.micDevice && list.some(d => d.deviceId === s.micDevice)) return s.micDevice;
            const want = norm(discordMicName());
            if (!want) return null;
            const hit = list.find(d => norm(d.label) === want) || list.find(d => norm(d.label) && (norm(d.label).includes(want) || want.includes(norm(d.label))));
            return hit ? hit.deviceId : null;
        };
        const MIC_PROCESSING = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
        const openMic = async () => {
            let stream = await navigator.mediaDevices.getUserMedia({ audio: { ...MIC_PROCESSING }, video: false });
            const id = await pickMicId();
            const now = stream.getAudioTracks()[0]?.getSettings?.().deviceId;
            if (id && id !== now) {
                const exact = await navigator.mediaDevices.getUserMedia({ audio: { ...MIC_PROCESSING, deviceId: { exact: id } }, video: false }).catch(() => null);
                if (exact) {
                    stopTracks([stream]);
                    stream = exact;
                }
            }
            return stream;
        };
        const micName = stream => stream?.getAudioTracks()[0]?.label || "your microphone";
        const mutedInDiscord = () => {
            try {
                const m = store("MediaEngineStore");
                return !!(m?.isSelfMute?.() || m?.isSelfDeaf?.());
            } catch {
                return false;
            }
        };
        const peakOf = (analyser, buf) => {
            analyser.getFloatTimeDomainData(buf);
            let p = 0;
            for (let i = 0; i < buf.length; i++) p = Math.max(p, Math.abs(buf[i]));
            return p;
        };

        let rec = null, starting = false, lastSaved = null;
        const say = text => api.toast(text, 5000);
        const announce = (channelId, text) => {
            if (!s.announce) return;
            Promise.resolve()
                .then(() => api.discord.sendMessage(channelId, text))
                .catch(e => say(`Couldn't post the recording notice in the channel (${e.message || e}).`));
        };
        const stopTracks = streams => streams.forEach(st => st && st.getTracks().forEach(t => t.stop()));

        const start = async () => {
            if (rec || starting) return;
            if (!ready) return say(RESTART);
            const voice = currentVoice();
            if (!voice) return say("Join a voice channel first, then start Meow.");
            starting = true;
            refreshUi();
            const streams = [];
            let ctx = null;
            try {
                let heard;
                try {
                    heard = await navigator.mediaDevices.getUserMedia({
                        audio: { mandatory: { chromeMediaSource: "desktop" } },
                        video: { mandatory: { chromeMediaSource: "desktop", maxWidth: 16, maxHeight: 16, maxFrameRate: 1 } },
                    });
                } catch (e) {
                    throw new Error(`couldn't capture your PC's sound (${e.message || e.name || e})`);
                }
                streams.push(heard);
                heard.getVideoTracks().forEach(t => t.stop());
                if (!heard.getAudioTracks().length) throw new Error("Windows gave no sound to record");
                let mic = null;
                if (s.includeMic) {
                    try {
                        mic = await openMic();
                        streams.push(mic);
                    } catch {
                        say("Couldn't open your microphone, so only what you hear is recorded.");
                    }
                }

                ctx = new AudioContext({ sampleRate: RATE });
                ctx.resume?.().catch?.(() => {});
                const mix = ctx.createGain();
                ctx.createMediaStreamSource(heard).connect(mix);
                let micGain = null, micMeter = null;
                if (mic) {
                    const src = ctx.createMediaStreamSource(mic);
                    micGain = ctx.createGain();
                    micMeter = ctx.createAnalyser();
                    micMeter.fftSize = 1024;
                    src.connect(micMeter);
                    src.connect(micGain);
                    micGain.connect(mix);
                }
                const proc = ctx.createScriptProcessor(4096, 2, 2);
                const silent = ctx.createGain();
                silent.gain.value = 0;
                mix.connect(proc);
                proc.connect(silent);
                silent.connect(ctx.destination);

                const where = placeName(voice);
                const started = new Date();
                const info = await call(N.recStart, { dir: s.folder || "", name: `${where} - ${stampText(started)}`, rate: ctx.sampleRate, channels: 2, quality: s.quality });

                if (!info) {
                    stopTracks(streams);
                    ctx.close?.().catch?.(() => {});
                    return;
                }
                let pending = [], frames = 0;
                const flush = () => {
                    if (!frames) return;
                    const out = new Int16Array(frames * 2);
                    let o = 0;
                    for (const part of pending) {
                        out.set(part, o);
                        o += part.length;
                    }
                    pending = [];
                    frames = 0;
                    N.recChunk(info.id, out);
                };
                proc.onaudioprocess = ev => {
                    const b = ev.inputBuffer;
                    const L = b.getChannelData(0), R = b.numberOfChannels > 1 ? b.getChannelData(1) : L;
                    const pcm = new Int16Array(L.length * 2);
                    for (let i = 0; i < L.length; i++) {
                        const l = Math.max(-1, Math.min(1, L[i])), r = Math.max(-1, Math.min(1, R[i]));
                        pcm[i * 2] = l < 0 ? l * 0x8000 : l * 0x7fff;
                        pcm[i * 2 + 1] = r < 0 ? r * 0x8000 : r * 0x7fff;
                    }
                    pending.push(pcm);
                    frames += L.length;
                    if (frames >= RATE) flush();
                };
                const r = { id: info.id, file: info.file, folder: info.folder, voice, where, started: started.getTime(), ctx, proc, streams, flush, mic: !!mic, micLabel: mic ? micName(mic) : "", micPeak: 0, micNow: 0, micMuted: false };
                if (mic) {
                    const buf = new Float32Array(micMeter.fftSize);
                    const applyMic = () => {
                        r.micMuted = !!s.followMute && mutedInDiscord();
                        micGain.gain.value = r.micMuted ? 0 : Math.max(0, Number(s.micVolume ?? 100)) / 100;
                        r.micNow = peakOf(micMeter, buf);
                        r.micPeak = Math.max(r.micPeak, r.micNow);
                    };
                    applyMic();
                    r.micTimer = setInterval(applyMic, 250);
                }
                r.timer = setInterval(tick, 1000);
                rec = r;
                announce(voice.channelId, "Recording started: this voice call is being recorded (Meow).");
                say(`Recording “${where}”${mic ? ` with your voice (${micName(mic)})` : s.includeMic ? "" : " (without your voice)"}. Click Meow again to stop and save.`);
            } catch (e) {
                stopTracks(streams);
                ctx?.close?.().catch?.(() => {});
                say(`Meow couldn't start recording: ${e.message || e}.`);
            } finally {
                starting = false;
                refreshUi();
            }
        };

        const stop = async reason => {
            if (!rec) return;
            const r = rec;
            rec = null;
            clearInterval(r.timer);
            clearInterval(r.micTimer);
            r.proc.onaudioprocess = null;
            r.flush();
            try {
                r.proc.disconnect();
            } catch { }
            stopTracks(r.streams);
            r.ctx.close?.().catch?.(() => {});
            announce(r.voice.channelId, "Recording stopped (Meow).");
            refreshUi();
            say(reason ? `${reason} Saving the recording…` : "Saving the recording…");
            try {
                const res = await N.recStop(r.id);
                if (res.empty) return say("Nothing was recorded.");
                lastSaved = res;
                const name = res.path.split(/[\\/]/).pop();
                say(res.format === "mp3" ? `Saved ${name} (${sizeText(res.bytes)}).` : `Saved ${name} as WAV: the MP3 conversion failed (${res.error}).`);
                if (r.mic && r.micPeak < 0.01) {
                    setTimeout(() => say(`Your voice wasn't picked up: “${r.micLabel}” stayed silent. Choose your microphone on the Meow page (and try Test my mic).`), 600);
                }
            } catch (e) {
                say(`Couldn't save the recording (${e.message || e}).`);
            } finally {
                refreshUi();
            }
        };
        const toggle = () => (rec ? stop() : start());

        api.flux.subscribe("VOICE_CHANNEL_SELECT", a => {
            lastVoice = a && a.channelId ? { channelId: String(a.channelId), guildId: a.guildId ? String(a.guildId) : null } : null;
            if (rec && s.autoStop && (!a || String(a.channelId || "") !== rec.voice.channelId)) stop("You left the voice channel.");
        });
        addEventListener("beforeunload", () => rec && rec.flush());
        api.onDispose(() => {
            if (rec) stop("Meow was turned off.");
        });

        let bar = null;
        const micChip = () => (!rec || !rec.mic ? (rec && s.includeMic ? "No mic" : "") : rec.micMuted ? "Mic muted" : "Mic");
        const tick = () => {
            if (!rec) return;
            const t = clock(Date.now() - rec.started);
            for (const b of document.querySelectorAll(".bt-meow-btn")) b.title = `Meow: recording ${t}. Click to stop and save.`;
            const time = bar && bar.querySelector(".bt-rec-time");
            if (time) time.textContent = `REC ${t}`;
            const chip = bar && bar.querySelector(".bt-rec-mic");
            if (chip) {
                chip.textContent = micChip();
                chip.classList.toggle("bt-hot", !!rec.mic && !rec.micMuted && rec.micNow > 0.02);
                chip.classList.toggle("bt-off", !rec.mic || rec.micMuted);
            }
            document.querySelectorAll(".bt-meow-page .bt-meow-status span").forEach(el => (el.textContent = `Recording “${rec.where}” · ${t}`));
        };
        const refreshUi = () => {
            const on = !!rec;
            for (const b of document.querySelectorAll(".bt-meow-btn")) {
                b.classList.toggle("bt-recording", on);
                b.setAttribute("aria-pressed", String(on));
                b.setAttribute("aria-label", on ? "Stop Meow recording" : "Start Meow recording");
                b.title = on ? `Meow: recording ${clock(Date.now() - rec.started)}. Click to stop and save.` : starting ? "Meow: starting…" : "Meow: record this voice call (Ctrl+Alt+M)";
            }
            if (on && !bar) {
                bar = api.el("div", { className: "bt-meow-recbar", role: "status" });
                document.body.append(bar);
            }
            if (!on && bar) {
                bar.remove();
                bar = null;
            }
            if (bar) {
                const stopBtn = api.el("button", { textContent: "Stop" });
                stopBtn.onclick = () => stop();
                const chip = api.el("span", { className: "bt-rec-mic", title: rec.mic ? `Your voice: ${rec.micLabel}` : "Your voice isn't being recorded" });
                bar.replaceChildren(
                    api.el("span", { className: "bt-rec-dot" }),
                    api.el("span", { className: "bt-rec-time", textContent: `REC ${clock(Date.now() - rec.started)}` }),
                    api.el("span", { className: "bt-rec-where", textContent: rec.where }),
                    chip,
                    stopBtn,
                );
                tick();
            }
            pages.forEach(h => h.isConnected && renderPage(h));
        };
        api.onDispose(() => bar?.remove());

        let testing = null;
        const levelPct = peak => (peak > 0 ? Math.max(0, Math.min(100, Math.round(((20 * Math.log10(peak) + 60) / 60) * 100))) : 0);
        const paintTest = () => {
            if (!testing) return;
            for (const r of document.querySelectorAll(".bt-meow-testmic")) {
                const m = testing.mics.find(x => x.id === r.dataset.mic);
                if (!m) continue;
                const bar = r.querySelector(".bt-meow-meter > i");
                if (bar) bar.style.width = `${levelPct(m.level)}%`;
                r.classList.toggle("bt-hears", m.level > 0.02);
            }
        };
        const stopTest = (report = false) => {
            if (!testing) return;
            const t = testing;
            testing = null;
            clearInterval(t.timer);
            clearTimeout(t.end);
            stopTracks(t.mics.map(m => m.stream));
            t.ctx.close?.().catch?.(() => {});
            refreshUi();
            if (!report) return;
            const best = t.mics.slice().sort((a, b) => b.peak - a.peak)[0];
            if (!best || best.peak < 0.02) return say("None of your microphones picked anything up. Check that your mic is plugged in and not muted in Windows.");
            const chosen = s.micDevice || t.sameAsDiscord;
            say(best.id === chosen ? `Your mic works: “${best.label}” heard you.` : `“${best.label}” heard you best. Click Use next to it to record your voice from it.`);
        };
        const startTest = async () => {
            if (testing) return;
            const ctx = new AudioContext();
            ctx.resume?.().catch?.(() => {});
            const t = { ctx, mics: [], sameAsDiscord: null };
            testing = t;
            try {
                const first = await navigator.mediaDevices.getUserMedia({ audio: { ...MIC_PROCESSING }, video: false });
                const firstId = first.getAudioTracks()[0]?.getSettings?.().deviceId;
                let list = (await micList()).filter(d => d.deviceId !== "default" && d.deviceId !== "communications");
                if (!list.length) list = [{ deviceId: firstId || "default", label: micName(first) }];
                t.sameAsDiscord = await pickMicId();
                for (const d of list.slice(0, 8)) {
                    let stream = d.deviceId === firstId ? first : null;
                    if (!stream) stream = await navigator.mediaDevices.getUserMedia({ audio: { ...MIC_PROCESSING, deviceId: { exact: d.deviceId } }, video: false }).catch(() => null);
                    if (!stream) continue;
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 1024;
                    ctx.createMediaStreamSource(stream).connect(analyser);
                    t.mics.push({ id: d.deviceId, label: d.label || micName(stream), stream, analyser, buf: new Float32Array(analyser.fftSize), level: 0, peak: 0 });
                }
                if (!t.mics.some(m => m.stream === first)) stopTracks([first]);
                if (testing !== t) return stopTracks(t.mics.map(m => m.stream));
                if (!t.mics.length) throw new Error("no microphone could be opened");
                t.timer = setInterval(() => {
                    if (ctx.state === "suspended") ctx.resume?.().catch?.(() => {});
                    for (const m of t.mics) {
                        m.level = peakOf(m.analyser, m.buf);
                        m.peak = Math.max(m.peak, m.level);
                    }
                    paintTest();
                }, 80);
                t.end = setTimeout(() => stopTest(true), 15000);
                refreshUi();
            } catch (e) {
                stopTest();
                say(`Couldn't open your microphone (${e.message || e.name || e}).`);
            }
        };
        api.onDispose(stopTest);

        const pages = new Set();
        let defaultDir = "";
        if (ready) N.recDefaultDir().then(d => {
            defaultDir = d || "";
            refreshUi();
        }, e => {
            if (outdated(e)) {
                ready = false;
                refreshUi();
            }
        });
        const renderPage = host => {
            pages.add(host);
            const root = api.el("div", { className: "bt-meow-page" });
            root.append(api.el("div", {
                className: "bt-note",
                textContent: "Records what you hear in a voice call (everyone talking, plus any other sound on your PC) and your microphone, then saves an MP3. In many places everyone in a conversation has to agree to being recorded: Meow can tell the channel for you.",
            }));
            if (!ready) root.append(api.el("div", { className: "bt-warn", textContent: RESTART }));

            const status = api.el("div", { className: `bt-meow-status${rec ? " bt-on" : ""}` });
            const voice = currentVoice();
            const action = api.el("button", { className: `bt-b bt-small ${rec ? "bt-danger" : "bt-primary"}`, textContent: rec ? "Stop and save" : "Start recording" });
            action.onclick = toggle;
            action.disabled = !rec && (!voice || !ready || starting);
            status.append(
                api.el("span", { textContent: rec ? `Recording “${rec.where}” · ${clock(Date.now() - rec.started)}` : starting ? "Starting…" : voice ? `In “${placeName(voice)}”. Ready to record.` : "Join a voice channel to record it." }),
                action,
            );
            root.append(status);

            root.append(api.el("div", { className: "bt-server-label", textContent: "Recordings folder" }));
            const folderRow = api.el("div", { className: "bt-btns" });
            const shown = s.folder || defaultDir || "Documents\\Meow Recordings";
            const change = api.el("button", { className: "bt-b bt-small", textContent: "Change…" });
            change.onclick = async () => {
                const picked = await call(N.recPickDir, s.folder || defaultDir);
                if (picked) {
                    api.setSetting("folder", picked);
                    refreshUi();
                }
            };
            const openBtn = api.el("button", { className: "bt-b bt-small", textContent: "Open folder" });
            openBtn.onclick = () => call(N.recOpenDir, s.folder || "");
            folderRow.append(api.el("span", { className: "bt-meow-path", textContent: shown, title: shown }), change, openBtn);
            if (s.folder) {
                const reset = api.el("button", { className: "bt-b bt-small", textContent: "Use default" });
                reset.onclick = () => {
                    api.setSetting("folder", "");
                    refreshUi();
                };
                folderRow.append(reset);
            }
            if (!ready) [change, openBtn].forEach(b => (b.disabled = true));
            root.append(folderRow);

            const check = (key, text) => {
                const label = api.el("label");
                const box = api.el("input", { type: "checkbox", className: "bt-switch", checked: !!s[key] });
                box.onchange = () => api.setSetting(key, box.checked);
                label.append(box, api.el("span", { textContent: text }));
                return label;
            };
            root.append(api.el("div", { className: "bt-server-label", textContent: "Your voice" }));
            const voiceBox = api.el("div", { className: "bt-meow-opts" });
            const voiceToggle = api.el("label");
            const vbox = api.el("input", { type: "checkbox", className: "bt-switch", checked: !!s.includeMic });
            vbox.setAttribute("data-meow", "includeMic");
            vbox.onchange = () => {
                api.setSetting("includeMic", vbox.checked);
                refreshUi();
            };
            voiceToggle.append(vbox, api.el("span", { textContent: "Record my voice (my microphone)" }));
            voiceBox.append(voiceToggle);
            if (s.includeMic) {
                const micRow = api.el("label");
                const micSel = api.el("select");
                micSel.setAttribute("data-meow", "micDevice");
                const discordName = discordMicName();
                micSel.append(api.el("option", { value: "", textContent: `Same as Discord (${discordName || "Windows default"})` }));
                micSel.value = "";
                micList().then(list => {
                    for (const d of list) micSel.append(api.el("option", { value: d.deviceId, textContent: d.label || "Microphone" }));
                    if (s.micDevice && list.some(d => d.deviceId === s.micDevice)) micSel.value = s.micDevice;
                });
                micSel.onchange = () => api.setSetting("micDevice", micSel.value);
                micRow.append(api.el("span", { textContent: "Microphone" }), micSel);

                const volRow = api.el("label");
                const vol = api.el("input", { type: "range", min: 0, max: 200, step: 5, value: s.micVolume ?? 100 });
                vol.setAttribute("data-meow", "micVolume");
                const volOut = api.el("span", { className: "bt-hex", textContent: `${s.micVolume ?? 100}%` });
                const fill = () => vol.style.setProperty("--bt-fill", `${(vol.value / 200) * 100}%`);
                fill();
                vol.oninput = () => {
                    volOut.textContent = `${vol.value}%`;
                    fill();
                };
                vol.onchange = () => api.setSetting("micVolume", +vol.value);
                volRow.append(api.el("span", { textContent: "My voice volume" }), vol, volOut);

                const testRow = api.el("div", { className: "bt-btns" });
                const testBtn = api.el("button", { className: "bt-b bt-small", textContent: testing ? "Stop test" : "Test my mics" });
                testBtn.onclick = () => (testing ? stopTest(true) : startTest());
                testRow.append(testBtn, api.el("span", { className: "bt-note bt-meow-test-info", textContent: testing ? (testing.mics.length ? "Talk: the bar that moves is your mic. Click Use on it." : "Opening your microphones…") : "Shows every microphone at once, so you can see which one hears you." }));
                const testList = api.el("div", { className: "bt-meow-testlist" });
                for (const m of testing ? testing.mics : []) {
                    const r = api.el("div", { className: "bt-meow-testmic" });
                    r.dataset.mic = m.id;
                    const meter = api.el("div", { className: "bt-meow-meter", title: `${m.label}: level` });
                    meter.append(api.el("i"));
                    const inUse = (s.micDevice || testing.sameAsDiscord) === m.id;
                    const use = api.el("button", { className: `bt-b bt-small${inUse ? " bt-picked" : ""}`, textContent: inUse ? "In use" : "Use" });
                    use.disabled = inUse;
                    use.onclick = () => {
                        api.setSetting("micDevice", m.id);
                        say(`Meow will record your voice from “${m.label}”.`);
                        refreshUi();
                    };
                    r.append(meter, api.el("span", { className: "bt-meow-testname", textContent: m.label }), use);
                    testList.append(r);
                }
                voiceBox.append(micRow, volRow, check("followMute", "Leave my voice out while I'm muted in Discord"), testRow, testList);
            }
            root.append(voiceBox);

            root.append(api.el("div", { className: "bt-server-label", textContent: "Options" }));
            const opts = api.el("div", { className: "bt-meow-opts" });
            const quality = api.el("label");
            const sel = api.el("select");
            for (const [v, t] of [["High", "High (192 kbps)"], ["Medium", "Standard (128 kbps)"]]) sel.append(api.el("option", { value: v, textContent: t }));
            sel.value = s.quality;
            sel.onchange = () => api.setSetting("quality", sel.value);
            quality.append(api.el("span", { textContent: "MP3 quality" }), sel);
            opts.append(
                check("announce", "Tell the channel when I start and stop recording"),
                check("autoStop", "Stop when I leave the voice channel"),
                quality,
            );
            root.append(opts);

            root.append(api.el("div", { className: "bt-server-label", textContent: "Recordings" }));
            const files = api.el("div", { className: "bt-meow-files" });
            files.append(api.el("div", { className: "bt-empty", textContent: ready ? "Loading…" : "Available after restarting Discord." }));
            root.append(files);
            if (ready) call(N.recList, s.folder || "").then(list => {
                if (!list) return;
                files.replaceChildren();
                if (!list.length) files.append(api.el("div", { className: "bt-empty", textContent: "No recordings yet." }));
                for (const f of list) {
                    const row = api.el("div", { className: "bt-meow-file" });
                    const show = api.el("button", { className: "bt-b bt-small", textContent: "Show" });
                    show.onclick = () => call(N.recShow, f.path);
                    row.append(api.el("b", { textContent: f.name, title: f.path }), api.el("small", { textContent: `${sizeText(f.bytes)} · ${new Date(f.at).toLocaleString()}` }), show);
                    files.append(row);
                }
            });
            host.replaceChildren(root);
        };
        api.settingsPage("meow", renderPage);

        const isButton = el => el.matches('button, [role="button"]') || !!el.querySelector('button, [role="button"]');
        const cellOf = sb => {
            let cell = sb;
            for (let i = 0; i < 5 && cell.parentElement && cell.parentElement !== document.body; i++) {
                const others = [...cell.parentElement.children].filter(c => c !== cell && !c.classList.contains("bt-meow-cell"));
                if (others.some(isButton)) return cell;
                cell = cell.parentElement;
            }
            return sb;
        };
        const addButton = sb => {
            if (!LABEL.test((sb.getAttribute("aria-label") || "").trim()) || sb.closest(".bt-panel, .bt-meow-cell")) return;
            const cell = cellOf(sb);
            if (cell.nextElementSibling?.classList.contains("bt-meow-cell")) return;
            const path = [];
            for (let n = sb; n !== cell; n = n.parentElement) path.unshift([...n.parentElement.children].indexOf(n));
            const meowCell = cell.cloneNode(true);
            let btn = meowCell;
            for (const i of path) btn = btn.children[i];
            meowCell.classList.add("bt-meow-cell");
            if (meowCell !== btn) for (const a of ["id", "aria-label", "aria-describedby"]) meowCell.removeAttribute(a);
            btn.classList.add("bt-meow-btn");
            for (const a of ["id", "aria-expanded", "aria-haspopup", "aria-controls"]) btn.removeAttribute(a);
            const theirs = sb.querySelector('[class*="lottie" i], svg, img, canvas');
            const box = theirs && theirs.getBoundingClientRect ? theirs.getBoundingClientRect() : null;
            const size = Math.round((box && box.width) || +theirs?.getAttribute?.("width") || 20) || 20;
            const cat = catIcon(Math.min(Math.max(size, 16), 28));
            const slot = btn.querySelector('[class*="lottie" i]') || btn.querySelector("svg, img, canvas");
            if (slot && /lottie/i.test(String(slot.getAttribute("class") || ""))) slot.replaceChildren(cat);
            else if (slot) slot.replaceWith(cat);
            else btn.replaceChildren(cat);
            for (const el of btn.querySelectorAll("*")) if (el.childElementCount === 0 && !el.closest("svg") && el.textContent.trim()) el.textContent = "";
            btn.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
            }, true);
            cell.after(meowCell);
            refreshUi();
        };
        api.observe('[aria-label*="oundboard"]', addButton);
        api.onDispose(() => document.querySelectorAll(".bt-meow-cell").forEach(b => b.remove()));
        api.onKey("ctrl+alt+m", toggle);
        api.addMenuItem("Start / stop Meow recording", toggle);
        api.addMenuItem("Open Meow recordings", () => (ready ? call(N.recOpenDir, s.folder || "") : BThemer.open("meow")));
    },
});
