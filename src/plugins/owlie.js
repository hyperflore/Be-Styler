const OWL_QUALITY = {
    native: { label: "My screen's own", h: 0, mbps: 0 },
    720: { label: "720p HD", h: 720, mbps: 8 },
    1080: { label: "1080p Full HD", h: 1080, mbps: 16 },
    1440: { label: "1440p QHD", h: 1440, mbps: 28 },
    2160: { label: "2160p 4K", h: 2160, mbps: 45 },
};
const owlPad = n => String(n).padStart(2, "0");
const owlClock = ms => { const s = Math.floor(ms / 1000); return `${s >= 3600 ? `${Math.floor(s / 3600)}:` : ""}${owlPad(Math.floor(s / 60) % 60)}:${owlPad(s % 60)}`; };
const owlStamp = d => `${d.getFullYear()}-${owlPad(d.getMonth() + 1)}-${owlPad(d.getDate())} ${owlPad(d.getHours())}.${owlPad(d.getMinutes())}.${owlPad(d.getSeconds())}`;
const owlSize = n => (n >= 1024 ** 3 ? `${(n / 1024 ** 3).toFixed(2)} GB` : n >= 1024 ** 2 ? `${(n / 1024 ** 2).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

let owlSeq = 0;
const owlIcon = size => {
    const id = `bt-owl-mask-${++owlSeq}`;
    return `<svg class="bt-owl-icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">` +
        `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">` +
        '<rect width="24" height="24" fill="#fff"/>' +
        '<g class="bt-owl-eyes"><circle cx="8.6" cy="11.2" r="3.05" fill="#000"/><circle cx="15.4" cy="11.2" r="3.05" fill="#000"/></g>' +
        '<path d="M12 13.4l-1.3 1.7L12 16.9l1.3-1.8z" fill="#000"/>' +
        '</mask></defs>' +
        '<g class="bt-owl-face">' +
        `<g class="bt-owl-head" fill="currentColor" mask="url(#${id})">` +
        '<path class="bt-owl-tuft bt-owl-tuft-l" d="M4.1 3.1c-.1-.6.6-1 1.1-.6l3.6 3.2-4.5 2.4z"/>' +
        '<path class="bt-owl-tuft bt-owl-tuft-r" d="M19.9 3.1c.1-.6-.6-1-1.1-.6l-3.6 3.2 4.5 2.4z"/>' +
        '<path d="M12 4.8c4.7 0 8.2 3.2 8.2 8 0 4.9-3.7 8.8-8.2 8.8s-8.2-3.9-8.2-8.8c0-4.8 3.5-8 8.2-8z"/>' +
        '</g>' +
        '<g class="bt-owl-pupils" fill="currentColor"><circle cx="8.6" cy="11.3" r="1.25"/><circle cx="15.4" cy="11.3" r="1.25"/></g>' +
        '</g></svg>';
};

BThemer.definePlugin({
    id: "owlie",
    name: "Owlie",
    description: "Record your screen (a whole screen or one window) in HD up to 4K, with your PC's sound and your microphone, or without. Click the owl next to your settings gear.",
    author: "Be Themer",
    version: "1.0.0",
    enabledByDefault: true,
    settings: {
        showButton: { type: "toggle", label: "Show the owl button in my user panel (before the settings gear)", default: true },
        animatedIcon: { type: "toggle", label: "Animated owl (moves when you hover it)", default: true },
        folder: { type: "text", label: "Recordings folder (empty = Videos\\Owlie Recordings; you can also choose it on the Owlie page)", default: "" },
        audio: { type: "select", label: "Sound", default: "both", options: [["both", "My PC's sound + my microphone"], ["system", "My PC's sound (no microphone)"], ["mic", "Only my microphone"], ["none", "No sound"]] },
        quality: { type: "select", label: "Quality", default: "1080", options: Object.entries(OWL_QUALITY).map(([k, v]) => [k, v.label]) },
        fps: { type: "select", label: "Frame rate", default: "60", options: [["30", "30 fps"], ["60", "60 fps"]] },
        micVolume: { type: "range", label: "Microphone volume", min: 0, max: 200, unit: "%", default: 100 },
    },
    css: s => `
        .bt-owl-icon { display: block; flex: none; overflow: visible; color: inherit; }
        .bt-owl-icon * { transform-box: fill-box; }
        .bt-owl-face { transform-origin: 50% 100%; }
        .bt-owl-tuft-l { transform-origin: 90% 90%; }
        .bt-owl-tuft-r { transform-origin: 10% 90%; }
        .bt-owl-eyes, .bt-owl-pupils { transform-origin: 50% 50%; }
        ${s.animatedIcon === false ? "" : `
        :is(.bt-owl-btn:hover, .bt-owl-btn:focus-visible) .bt-owl-face { animation: bt-owl-tilt .9s cubic-bezier(.3, 1.4, .5, 1); }
        :is(.bt-owl-btn:hover, .bt-owl-btn:focus-visible) .bt-owl-tuft-l { animation: bt-owl-tuft-l .45s ease .1s; }
        :is(.bt-owl-btn:hover, .bt-owl-btn:focus-visible) .bt-owl-tuft-r { animation: bt-owl-tuft-r .45s ease .25s; }
        :is(.bt-owl-btn:hover, .bt-owl-btn:focus-visible) :is(.bt-owl-eyes, .bt-owl-pupils) { animation: bt-owl-blink .38s ease .4s; }
        :is(.bt-owl-btn:hover, .bt-owl-btn:focus-visible) .bt-owl-pupils { animation: bt-owl-look 1.1s ease, bt-owl-blink .38s ease .4s; }
        .bt-owl-btn.bt-owl-rec .bt-owl-pupils { animation: bt-owl-glow 1.4s ease-in-out infinite; }
        @keyframes bt-owl-tilt { 0% { transform: none; } 30% { transform: rotate(-10deg); } 62% { transform: rotate(6deg); } 100% { transform: none; } }
        @keyframes bt-owl-tuft-l { 0%, 100% { transform: none; } 45% { transform: rotate(-20deg); } }
        @keyframes bt-owl-tuft-r { 0%, 100% { transform: none; } 45% { transform: rotate(20deg); } }
        @keyframes bt-owl-blink { 0%, 100% { transform: none; } 50% { transform: scaleY(.1); } }
        @keyframes bt-owl-look { 0%, 100% { transform: none; } 30% { transform: translateX(-.9px); } 65% { transform: translateX(.9px); } }
        @keyframes bt-owl-glow { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
        @media (prefers-reduced-motion: reduce) { .bt-owl-icon * { animation: none !important; } }`}
        .bt-owl-btn { position: relative; }
        .bt-owl-btn.bt-owl-rec { color: #f23f43 !important; }
        .bt-owl-btn.bt-owl-rec::after { content: ""; position: absolute; right: 4px; top: 4px; width: 7px; height: 7px; border-radius: 50%;
            background: #f23f43; box-shadow: 0 0 0 2px var(--background-secondary-alt, #232428); animation: bt-owl-dot 1.2s ease-in-out infinite; }
        @keyframes bt-owl-dot { 50% { opacity: .3; } }

        /* picker */
        .bt-owl-pop { position: fixed; z-index: 100004; width: 340px; max-height: min(560px, calc(100vh - 24px)); display: flex; flex-direction: column; gap: 10px;
            padding: 14px; border-radius: 16px; background: var(--background-floating, #111214); border: 1px solid rgb(255 255 255 / .08);
            box-shadow: 0 16px 40px rgb(0 0 0 / .5); color: var(--text-normal, #dbdee1); font: 14px/1.3 var(--font-primary, "gg sans", sans-serif); }
        .bt-owl-pop h3 { display: flex; align-items: center; gap: 8px; margin: 0; font: 800 15px var(--font-display, var(--font-primary, sans-serif)); color: var(--header-primary, #f2f3f5); }
        .bt-owl-pop h3 svg { width: 22px; height: 22px; color: #e8b34a; }
        .bt-owl-label { font: 700 11px var(--font-primary, sans-serif); text-transform: uppercase; letter-spacing: .03em; color: var(--text-muted, #949ba4); }
        .bt-owl-sources { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; overflow-y: auto; max-height: 230px; scrollbar-width: thin; padding: 2px; }
        .bt-owl-src { display: flex; flex-direction: column; gap: 4px; padding: 5px; border-radius: 10px; border: 2px solid transparent; background: rgb(255 255 255 / .04); cursor: pointer; min-width: 0; }
        .bt-owl-src:hover { background: rgb(255 255 255 / .08); }
        .bt-owl-src.bt-owl-on { border-color: #e8b34a; background: rgb(232 179 74 / .12); }
        .bt-owl-src img, .bt-owl-src .bt-owl-noimg { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 6px; background: #000; }
        .bt-owl-src span { font-size: 11.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-owl-row { display: flex; gap: 8px; }
        .bt-owl-row select { flex: 1; min-width: 0; height: 34px; padding: 0 30px 0 10px; border-radius: 9px; border: 1px solid rgb(255 255 255 / .12);
            background: #1e1f22 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23b5bac1' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 10px center;
            appearance: none; -webkit-appearance: none; color-scheme: dark; color: #f2f3f5; font: 600 13px var(--font-primary, sans-serif); cursor: pointer; outline: none; }
        .bt-owl-row select:hover { border-color: rgb(255 255 255 / .22); }
        .bt-owl-row select:focus { border-color: #e8b34a; }
        .bt-owl-row select option { background: #1e1f22; color: #f2f3f5; }
        .bt-owl-save { display: flex; align-items: center; gap: 6px; min-width: 0; padding: 7px 8px 7px 10px; border-radius: 9px; background: rgb(255 255 255 / .04); }
        .bt-owl-save span { flex: 1; min-width: 0; font: 12px var(--font-code, monospace); color: #b5bac1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; direction: rtl; text-align: left; }
        .bt-owl-save button { flex: none; height: 26px; padding: 0 9px; border: 0; border-radius: 7px; background: rgb(255 255 255 / .1); color: #f2f3f5;
            font: 700 11.5px var(--font-primary, sans-serif); cursor: pointer; }
        .bt-owl-save button:hover { background: rgb(255 255 255 / .18); }
        .bt-owl-go { height: 38px; border: 0; border-radius: 10px; background: #e8b34a; color: #241a06; font: 800 14px var(--font-primary, sans-serif); cursor: pointer; }
        .bt-owl-go:hover { background: #f2c25e; }
        .bt-owl-go:disabled { opacity: .5; cursor: progress; }
        .bt-owl-note { font-size: 11.5px; color: var(--text-muted, #949ba4); }

        /* REC pill */
        .bt-owl-pill { position: fixed; z-index: 100003; top: 10px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 8px;
            padding: 5px 6px 5px 12px; border-radius: 999px; background: rgb(17 18 20 / .92); border: 1px solid rgb(255 255 255 / .1); box-shadow: 0 8px 24px rgb(0 0 0 / .4);
            color: #f2f3f5; font: 700 12px var(--font-primary, sans-serif); font-variant-numeric: tabular-nums; }
        .bt-owl-pill .bt-owl-recdot { width: 9px; height: 9px; border-radius: 50%; background: #f23f43; animation: bt-owl-dot 1.2s ease-in-out infinite; }
        .bt-owl-pill.bt-owl-paused .bt-owl-recdot { animation: none; background: #e8b34a; }
        .bt-owl-pill button { height: 26px; padding: 0 10px; border: 0; border-radius: 999px; background: rgb(255 255 255 / .1); color: #f2f3f5; font: 700 12px var(--font-primary, sans-serif); cursor: pointer; }
        .bt-owl-pill button:hover { background: rgb(255 255 255 / .18); }
        .bt-owl-pill button.bt-owl-stop { background: #f23f43; }
        html[data-bt-loading] .bt-owl-pill, html:has(#bt-splash) .bt-owl-pill { display: none !important; }

        /* settings page */
        .bt-owl-page { display: flex; flex-direction: column; gap: 12px; }
        .bt-owl-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; border-radius: 10px; background: var(--background-secondary, #2b2d31); }
        .bt-owl-status.bt-on { box-shadow: inset 0 0 0 1px #f23f43; }
        .bt-owl-switch { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border-radius: 10px;
            background: var(--background-secondary, #2b2d31); cursor: pointer; }
        .bt-owl-path { flex: 1; min-width: 0; font-family: var(--font-code, monospace); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-muted, #949ba4); }
    `,

    start(api) {
        const s = api.settings;
        const N = window.BThemerNative || {};
        const ready = typeof N.owlStart === "function";
        const RESTART = "Owlie was just added: restart Discord once (Ctrl+R isn't enough) so it can save recordings.";
        let rec = null;
        let starting = false;
        let defaultDir = "";
        N.owlDefaultDir?.().then(d => { defaultDir = d || ""; refreshUi(); }).catch(() => {});
        const say = (t, ms) => api.toast(t, ms);

        const stopTracks = list => list.forEach(st => st && st.getTracks().forEach(t => t.stop()));
        const pickMime = () => [
            "video/mp4;codecs=avc1.640033,mp4a.40.2", "video/mp4;codecs=avc1,mp4a", "video/mp4",
            "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm",
        ].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || "";

        async function startRecording(source, opts) {
            if (rec || starting) return;
            if (!ready) return say(RESTART, 6000);
            starting = true;
            refreshUi();
            const streams = [];
            let ctx = null;
            try {
                const q = OWL_QUALITY[opts.quality] || OWL_QUALITY[1080];
                const fps = Number(opts.fps) === 30 ? 30 : 60;
                const video = { chromeMediaSource: "desktop", chromeMediaSourceId: source.id, maxFrameRate: fps, minFrameRate: Math.min(fps, 30) };
                if (q.h) { video.maxHeight = q.h; video.maxWidth = Math.round(q.h * 16 / 9); }
                else { video.maxWidth = Math.round(screen.width * devicePixelRatio); video.maxHeight = Math.round(screen.height * devicePixelRatio); }
                const screenStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { mandatory: video } });
                streams.push(screenStream);
                const vTrack = screenStream.getVideoTracks()[0];
                if (!vTrack) throw new Error("Windows gave no picture to record");

                const tracks = [vTrack];
                const wantSystem = opts.audio === "both" || opts.audio === "system";
                const wantMic = opts.audio === "both" || opts.audio === "mic";
                if (wantSystem || wantMic) {
                    ctx = new AudioContext({ sampleRate: 48000 });
                    ctx.resume?.().catch?.(() => {});
                    const out = ctx.createMediaStreamDestination();
                    let any = false;
                    if (wantSystem) {
                        try {
                            const heard = await navigator.mediaDevices.getUserMedia({
                                audio: { mandatory: { chromeMediaSource: "desktop" } },
                                video: { mandatory: { chromeMediaSource: "desktop", maxWidth: 16, maxHeight: 16, maxFrameRate: 1 } },
                            });
                            streams.push(heard);
                            heard.getVideoTracks().forEach(t => t.stop());
                            if (heard.getAudioTracks().length) { ctx.createMediaStreamSource(heard).connect(out); any = true; }
                        } catch (e) { say(`Couldn't capture your PC's sound (${e.message || e.name}); recording without it.`); }
                    }
                    if (wantMic) {
                        try {
                            const mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: false }, video: false });
                            streams.push(mic);
                            const gain = ctx.createGain();
                            gain.gain.value = Math.max(0, Math.min(2, (Number(s.micVolume) || 100) / 100));
                            ctx.createMediaStreamSource(mic).connect(gain).connect(out);
                            any = true;
                        } catch (e) { say(`Couldn't open your microphone (${e.message || e.name}); recording without it.`); }
                    }
                    if (any) tracks.push(...out.stream.getAudioTracks());
                }

                const mimeType = pickMime();
                if (!mimeType) throw new Error("this Discord can't record video");
                const settings = vTrack.getSettings();
                const pixels = (settings.width || 1920) * (settings.height || 1080);
                const mbps = q.mbps || Math.max(8, Math.round(pixels / (1920 * 1080) * 16));
                const recorder = new MediaRecorder(new MediaStream(tracks), {
                    mimeType, videoBitsPerSecond: Math.round(mbps * 1e6 * (fps === 30 ? 0.7 : 1)), audioBitsPerSecond: 192000,
                });
                const started = new Date();
                const info = await N.owlStart({ dir: s.folder || "", name: `${source.name} - ${owlStamp(started)}`, ext: mimeType.startsWith("video/mp4") ? "mp4" : "webm" });
                rec = { id: info.id, file: info.file, recorder, streams, ctx, started: Date.now(), pausedAt: 0, pausedFor: 0, bytes: 0, source: source.name, size: `${settings.width}×${settings.height}` };
                let writing = Promise.resolve();
                recorder.ondataavailable = ev => {
                    if (!ev.data || !ev.data.size || !rec) return;
                    const r = rec;
                    writing = writing.then(async () => { const buf = new Uint8Array(await ev.data.arrayBuffer()); N.owlChunk(r.id, buf); r.bytes += buf.byteLength; });
                };
                recorder.onstop = () => { writing.then(() => finish()); };
                vTrack.addEventListener("ended", () => stopRecording());
                recorder.start(1000);
                api.storage.set("lastSource", { id: source.id, name: source.name }).catch(() => {});
                say(`Owlie is recording ${source.name} (${rec.size}).`);
            } catch (e) {
                stopTracks(streams);
                ctx?.close?.().catch?.(() => {});
                say(`Owlie couldn't start: ${e.message || e}`, 6000);
                rec = null;
            } finally {
                starting = false;
                refreshUi();
            }
        }
        function stopRecording() {
            if (!rec || rec.stopping) return;
            rec.stopping = true;
            try { rec.recorder.state !== "inactive" ? rec.recorder.stop() : finish(); } catch { finish(); }
            refreshUi();
        }
        async function finish() {
            const r = rec;
            if (!r) return;
            rec = null;
            stopTracks(r.streams);
            r.ctx?.close?.().catch?.(() => {});
            const res = await N.owlStop(r.id).catch(() => null);
            refreshUi();
            if (res?.file) {
                lastFile = res.file;
                say(`Saved ${owlSize(res.bytes)} to ${res.file.split(/[\\/]/).slice(-2).join("\\")}. Open it from the Owlie page.`, 6000);
            } else say("Nothing was recorded.");
        }
        function togglePause() {
            if (!rec) return;
            if (rec.recorder.state === "recording") { rec.recorder.pause(); rec.pausedAt = Date.now(); }
            else if (rec.recorder.state === "paused") { rec.recorder.resume(); rec.pausedFor += Date.now() - rec.pausedAt; rec.pausedAt = 0; }
            refreshUi();
        }
        const elapsed = () => (rec ? (rec.pausedAt || Date.now()) - rec.started - rec.pausedFor : 0);
        let lastFile = "";

        let pop = null;
        const closePop = () => { pop?.remove(); pop = null; document.removeEventListener("pointerdown", outside, true); };
        const outside = e => { if (pop && !pop.contains(e.target) && !e.target.closest?.(".bt-owl-btn")) closePop(); };
        async function openPicker(anchor) {
            if (pop) return closePop();
            if (!ready) return say(RESTART, 6000);
            pop = api.el("div", { className: "bt-owl-pop" });
            const head = api.el("h3", { innerHTML: owlIcon(22) });
            head.append(document.createTextNode("Owlie: record your screen"));
            const grid = api.el("div", { className: "bt-owl-sources" });
            grid.append(api.el("div", { className: "bt-owl-note", textContent: "Finding your screens and windows…" }));
            const sel = (key, entries) => {
                const el = api.el("select");
                for (const [v, label] of entries) el.append(api.el("option", { value: v, textContent: label }));
                el.value = String(s[key]);
                el.onchange = () => api.setSetting(key, el.value);
                return el;
            };
            const row1 = api.el("div", { className: "bt-owl-row" });
            row1.append(sel("audio", [["both", "PC sound + mic"], ["system", "PC sound only"], ["mic", "Mic only"], ["none", "No sound"]]));
            const row2 = api.el("div", { className: "bt-owl-row" });
            row2.append(sel("quality", Object.entries(OWL_QUALITY).map(([k, v]) => [k, v.label])), sel("fps", [["30", "30 fps"], ["60", "60 fps"]]));
            const saveRow = api.el("div", { className: "bt-owl-save" });
            const drawSave = () => {
                const where = s.folder || defaultDir || "Videos\\Owlie Recordings";
                const change = api.el("button", { type: "button", textContent: "Change…" });
                change.onclick = async e => {
                    e.stopPropagation();
                    const picked = await N.owlPickDir?.(s.folder || defaultDir).catch(() => null);
                    if (picked) { api.setSetting("folder", picked); drawSave(); refreshUi(); }
                };
                const open = api.el("button", { type: "button", textContent: "Open" });
                open.onclick = e => { e.stopPropagation(); N.owlOpen?.(s.folder || "", ""); };
                const kids = [api.el("span", { textContent: where, title: where }), change, open];
                if (s.folder) {
                    const reset = api.el("button", { type: "button", textContent: "Default", title: "Back to Videos\\Owlie Recordings" });
                    reset.onclick = e => { e.stopPropagation(); api.setSetting("folder", ""); drawSave(); refreshUi(); };
                    kids.push(reset);
                }
                saveRow.replaceChildren(...kids);
            };
            drawSave();
            const go = api.el("button", { className: "bt-owl-go", type: "button", textContent: "Start recording" });
            const note = api.el("div", { className: "bt-owl-note", textContent: "4K only adds detail if your screen is 4K. Ctrl+Alt+O stops." });
            pop.append(head, api.el("div", { className: "bt-owl-label", textContent: "What to record" }), grid,
                api.el("div", { className: "bt-owl-label", textContent: "Sound" }), row1, api.el("div", { className: "bt-owl-label", textContent: "Quality" }), row2,
                api.el("div", { className: "bt-owl-label", textContent: "Save to" }), saveRow, go, note);
            document.body.append(pop);
            const place = () => {
                const r = anchor.getBoundingClientRect();
                pop.style.left = `${Math.max(12, Math.min(r.left + r.width / 2 - pop.offsetWidth / 2, innerWidth - pop.offsetWidth - 12))}px`;
                pop.style.top = `${Math.max(12, r.top - pop.offsetHeight - 10)}px`;
            };
            place();
            setTimeout(() => document.addEventListener("pointerdown", outside, true));

            let chosen = null;
            const last = await api.storage.get("lastSource").catch(() => null);
            let sources = [];
            try { sources = await N.owlSources(); } catch (e) { grid.replaceChildren(api.el("div", { className: "bt-owl-note", textContent: `Couldn't list your screens (${e.message || e}).` })); }
            if (!pop) return;
            grid.replaceChildren(...sources.map(src => {
                const card = api.el("div", { className: "bt-owl-src", title: src.name });
                card.append(src.thumb ? api.el("img", { src: src.thumb, alt: "" }) : api.el("div", { className: "bt-owl-noimg" }), api.el("span", { textContent: src.screen ? `🖥 ${src.name}` : src.name }));
                card.onclick = () => { chosen = src; grid.querySelectorAll(".bt-owl-on").forEach(c => c.classList.remove("bt-owl-on")); card.classList.add("bt-owl-on"); };
                if ((last && last.id === src.id) || (!chosen && src.screen && !last)) card.onclick();
                return card;
            }));
            if (!chosen && sources[0]) grid.firstElementChild.onclick();
            place();
            go.onclick = async () => {
                if (!chosen) return say("Pick a screen or a window first.");
                go.disabled = true;
                go.textContent = "Starting…";
                closePop();
                await startRecording(chosen, { audio: s.audio, quality: s.quality, fps: s.fps });
            };
        }
        async function quickToggle() {
            if (rec) return stopRecording();
            if (!ready) return say(RESTART, 6000);
            const last = await api.storage.get("lastSource").catch(() => null);
            const sources = await N.owlSources().catch(() => []);
            const src = sources.find(x => last && x.id === last.id) || sources.find(x => x.screen);
            if (!src) return say("Owlie couldn't find a screen to record.");
            startRecording(src, { audio: s.audio, quality: s.quality, fps: s.fps });
        }

        let pill = null, tick = null;
        function refreshUi() {
            for (const b of document.querySelectorAll(".bt-owl-btn")) {
                b.classList.toggle("bt-owl-rec", !!rec);
                b.title = rec ? `Owlie: recording ${owlClock(elapsed())}. Click to stop and save.` : "Owlie: record your screen";
                b.setAttribute("aria-label", b.title);
            }
            if (rec && !tick) tick = setInterval(refreshUi, 1000);
            if (!rec && tick) { clearInterval(tick); tick = null; }
            for (const host of pages) if (host.isConnected) renderPage(host); else pages.delete(host);
        }

        const isGear = el => /^user settings$/i.test((el.getAttribute("aria-label") || "").trim()) && !!el.closest('section[class*="panels_"]');
        const addButton = gear => {
            if (s.showButton === false || !isGear(gear) || gear.closest(".bt-owl-cell")) return;
            let cell = gear;
            for (let i = 0; i < 4 && cell.parentElement && cell.parentElement.children.length < 3; i++) cell = cell.parentElement;
            if (cell.previousElementSibling?.classList.contains("bt-owl-cell")) return;
            const path = [];
            for (let n = gear; n !== cell; n = n.parentElement) path.unshift([...n.parentElement.children].indexOf(n));
            const owlCell = cell.cloneNode(true);
            let btn = owlCell;
            for (const i of path) btn = btn.children[i];
            owlCell.classList.add("bt-owl-cell");
            btn.classList.add("bt-owl-btn");
            for (const a of ["id", "aria-expanded", "aria-haspopup", "aria-controls", "aria-describedby"]) { btn.removeAttribute(a); if (owlCell !== btn) owlCell.removeAttribute(a); }
            const theirs = gear.querySelector("svg");
            const size = Math.round(theirs?.getBoundingClientRect().width || 20) || 20;
            const slot = btn.querySelector("svg");
            const tmp = document.createElement("div");
            tmp.innerHTML = owlIcon(Math.min(Math.max(size, 16), 26));
            if (slot) slot.replaceWith(tmp.firstChild); else btn.replaceChildren(tmp.firstChild);
            btn.addEventListener("click", e => {
                e.preventDefault();
                e.stopPropagation();
                rec ? stopRecording() : openPicker(btn);
            }, true);
            cell.before(owlCell);
            refreshUi();
        };
        const placeAll = () => {
            document.querySelectorAll(".bt-owl-cell").forEach(c => { if (s.showButton === false) c.remove(); });
            if (s.showButton !== false) document.querySelectorAll('section[class*="panels_"] [aria-label="User Settings"]').forEach(addButton);
        };
        api.observe('section[class*="panels_"] [aria-label="User Settings"]', addButton);
        this.placeAll = placeAll;
        this.refreshPages = () => { for (const host of pages) if (host.isConnected) renderPage(host); };
        this.redrawIcons = () => {
            placeAll();
        };

        const pages = new Set();
        const renderPage = host => {
            pages.add(host);
            const root = api.el("div", { className: "bt-owl-page" });
            root.append(api.el("div", { className: "bt-note", textContent: "Owlie records your screen, a whole screen or one window, with your PC's sound and your microphone (or without), from 720p up to 4K. Recordings save as you go, so nothing is lost if Discord closes." }));
            if (!ready) root.append(api.el("div", { className: "bt-warn", textContent: RESTART }));
            const status = api.el("div", { className: `bt-owl-status${rec ? " bt-on" : ""}` });
            const act = api.el("button", { className: `bt-b bt-small ${rec ? "bt-danger" : "bt-primary"}`, textContent: rec ? "Stop and save" : "Record…" });
            act.disabled = !ready || starting;
            act.onclick = e => (rec ? stopRecording() : openPicker(e.currentTarget));
            status.append(api.el("span", { textContent: rec ? `Recording ${rec.source} (${rec.size}) · ${owlClock(elapsed())} · ${owlSize(rec.bytes)}` : starting ? "Starting…" : "Ready. Click Record, the owl in your user panel, or press Ctrl+Alt+O." }), act);
            root.append(status);
            if (rec) {
                const ctl = api.el("div", { className: "bt-btns" });
                const pz = api.el("button", { className: "bt-b bt-small", textContent: rec.recorder.state === "paused" ? "Resume" : "Pause" });
                pz.onclick = togglePause;
                ctl.append(pz);
                root.append(ctl);
            }
            root.append(api.el("div", { className: "bt-server-label", textContent: "Owl button" }));
            const sw = (key, label) => {
                const row = api.el("label", { className: "bt-owl-switch" });
                const box = api.el("input", { type: "checkbox", className: "bt-switch" });
                box.checked = s[key] !== false;
                box.onchange = () => api.setSetting(key, box.checked);
                row.append(api.el("span", { textContent: label }), box);
                return row;
            };
            root.append(sw("showButton", "Show the owl in my user panel (before the settings gear)"), sw("animatedIcon", "Animated owl (moves when you hover it)"));
            root.append(api.el("div", { className: "bt-server-label", textContent: "Recordings folder" }));
            const folderRow = api.el("div", { className: "bt-btns" });
            const shown = s.folder || defaultDir || "Videos\\Owlie Recordings";
            const change = api.el("button", { className: "bt-b bt-small", textContent: "Change…" });
            change.onclick = async () => { const picked = await N.owlPickDir?.(s.folder || defaultDir).catch(() => null); if (picked) { api.setSetting("folder", picked); refreshUi(); } };
            const open = api.el("button", { className: "bt-b bt-small", textContent: lastFile ? "Show last recording" : "Open folder" });
            open.onclick = () => N.owlOpen?.(s.folder || "", lastFile || "");
            folderRow.append(api.el("span", { className: "bt-owl-path", textContent: shown, title: shown }), change, open);
            if (s.folder) {
                const reset = api.el("button", { className: "bt-b bt-small", textContent: "Use default" });
                reset.onclick = () => { api.setSetting("folder", ""); refreshUi(); };
                folderRow.append(reset);
            }
            root.append(folderRow);
            host.replaceChildren(root);
        };
        api.settingsPage("owlie", renderPage);

        api.onKey("ctrl+alt+o", quickToggle);
        api.addMenuItem("Start / stop Owlie screen recording", quickToggle);
        api.addMenuItem("Open Owlie recordings", () => N.owlOpen?.(s.folder || "", lastFile || ""));
        api.onDispose(() => {
            if (rec) stopRecording();
            closePop();
            clearInterval(tick);
            pill?.remove();
            document.querySelectorAll(".bt-owl-cell").forEach(c => c.remove());
            delete this.placeAll;
            delete this.refreshPages;
            delete this.redrawIcons;
        });
        placeAll();
    },
    onSettingChange(key) {
        if (key === "showButton" || key === "animatedIcon") { this.placeAll?.(); this.refreshPages?.(); }
    },
});
