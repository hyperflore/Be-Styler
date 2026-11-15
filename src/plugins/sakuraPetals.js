let palette = [];

const mixWithWhite = (hex, t) => {
    let h = String(hex).replace("#", "");
    if (h.length === 3) h = [...h].map(c => c + c).join("");
    const n = parseInt(h, 16) || 0;
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => Math.round(c + (255 - c) * t));
    return `rgb(${rgb.join(" ")})`;
};
const updatePalette = accent => {
    palette = [0.3, 0.45, 0.58, 0.7, 0.82].map(t => mixWithWhite(accent, t));
};

BThemer.definePlugin({
    id: "sakuraPetals",
    name: "Sakura Petals",
    description: "Falling sakura petals that take their colour from your accent.",
    author: "Be Themer",
    version: "1.1.0",
    enabledByDefault: true,

    settings: {
        count: { type: "range", label: "Amount", min: 0, max: 150, default: 28 },
        speed: { type: "range", label: "Speed", min: 20, max: 300, unit: "%", default: 100 },
        size: { type: "range", label: "Size", min: 40, max: 250, unit: "%", default: 100 },
        opacity: { type: "range", label: "Opacity", min: 10, max: 100, unit: "%", default: 85 },
        behindGlass: { type: "toggle", label: "Behind the glass", default: false },
    },

    css: s => `
        #bt-petals {
            position: fixed; inset: 0; pointer-events: none;
            opacity: ${s.opacity / 100};
            z-index: ${s.behindGlass ? -1 : 2147483000};
        }`,

    start(api) {
        const s = api.settings;
        updatePalette(api.core.accent);

        const canvas = api.el("canvas", { id: "bt-petals" });
        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        const rnd = (a, b) => a + Math.random() * (b - a);
        let w = 0, h = 0, raf = 0, last = performance.now(), paused = false;

        const resize = () => {
            const d = devicePixelRatio || 1;
            w = innerWidth;
            h = innerHeight;
            canvas.width = w * d;
            canvas.height = h * d;
            ctx.setTransform(d, 0, 0, d, 0, 0);
        };
        const spawn = (p, anywhere = false) => Object.assign(p, {
            x: rnd(-w * 0.3, w), y: anywhere ? rnd(-40, h) : rnd(-80, -20),
            s: rnd(5, 11), vy: rnd(25, 60), vx: rnd(10, 35),
            sway: rnd(15, 45), freq: rnd(0.6, 1.6), t: rnd(0, 6.28),
            rot: rnd(0, 6.28), vr: rnd(-1.5, 1.5), flip: rnd(0, 6.28), vf: rnd(1, 3),
            ci: (Math.random() * 5) | 0,
        });
        const draw = (p, size) => {
            const r = p.s * size;
            ctx.save();
            ctx.translate(p.x + Math.sin(p.t) * p.sway, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, Math.abs(Math.cos(p.flip)) * 0.7 + 0.3);
            ctx.fillStyle = palette[p.ci % palette.length];
            ctx.beginPath();
            ctx.moveTo(0, r);
            ctx.bezierCurveTo(r * 0.9, r * 0.4, r * 0.8, -r * 0.6, r * 0.3, -r);
            ctx.lineTo(0, -r * 0.72);
            ctx.lineTo(-r * 0.3, -r);
            ctx.bezierCurveTo(-r * 0.8, -r * 0.6, -r * 0.9, r * 0.4, 0, r);
            ctx.fill();
            ctx.restore();
        };

        resize();
        const petals = [];
        const loading = () => document.documentElement.hasAttribute("data-bt-loading");
        const tick = now => {
            const dt = paused ? 0 : Math.min((now - last) / 1000, 0.05);
            last = now;
            if (loading()) {
                raf = requestAnimationFrame(tick);
                return;
            }
            const speed = s.speed / 100, size = s.size / 100;
            while (petals.length < s.count) petals.push(spawn({}, true));
            if (petals.length > s.count) petals.length = s.count;
            ctx.clearRect(0, 0, w, h);
            for (const p of petals) {
                p.t += p.freq * dt * speed;
                p.y += p.vy * dt * speed;
                p.x += p.vx * dt * speed;
                p.rot += p.vr * dt * speed;
                p.flip += p.vf * dt * speed;
                if (p.y > h + 30 || p.x > w + 80) spawn(p);
                draw(p, size);
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        addEventListener("resize", resize);

        api.addMenuItem("Pause / resume petals", () => {
            paused = !paused;
            api.toast(paused ? "Petals paused" : "Petals resumed");
        });

        api.onDispose(() => {
            cancelAnimationFrame(raf);
            removeEventListener("resize", resize);
            canvas.remove();
        });
    },

    onCoreChange(core) {
        updatePalette(core.accent);
    },
});
