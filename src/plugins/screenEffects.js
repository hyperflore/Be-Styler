const TAU = Math.PI * 2;
const MAX_FX = 1600;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = list => list[(Math.random() * list.length) | 0];

const hexRgb = hex => {
    let h = String(hex || "#ffffff").replace("#", "");
    if (h.length === 3) h = [...h].map(c => c + c).join("");
    const n = parseInt(h, 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (hex, t) => `rgb(${hexRgb(hex).map(c => Math.round(c + (255 - c) * t)).join(" ")})`;

const NATURAL = {
    snow: ["#ffffff", "#eef6ff", "#dbeafe"],
    stars: ["#ffffff", "#fff4c2", "#cfe3ff"],
    warp: ["#ffffff", "#cfe3ff", "#e9d5ff"],
    fireflies: ["#fff59d", "#e6ff8a", "#ffe082"],
    bubbles: ["#bfe9ff", "#d8f3ff", "#e5d4ff"],
    confetti: ["#ff5c8a", "#ffd166", "#06d6a0", "#4cc9f0", "#b388ff", "#ff9f1c"],
    hearts: ["#ff5c8a", "#ff8fab", "#ff3d6e", "#ffb3c6"],
    rain: ["#a9c6ff", "#c7d8ff"],
    storm: ["#a9c6ff", "#c7d8ff"],
    matrix: ["#38ff7a", "#7dffa6"],
    leaves: ["#e76f51", "#f4a261", "#e9c46a", "#d62828", "#bc6c25"],
    embers: ["#ff6b1a", "#ffa62b", "#ffd166", "#ff3d00"],
    bokeh: ["#ff9ecf", "#9d8cff", "#6ad7ff", "#ffd6a5"],
};
const TRAIL_NATURAL = { sparkles: ["#ffffff", "#fff4c2"], stars: ["#ffe066", "#ffffff"], hearts: NATURAL.hearts, rainbow: [], bubbles: NATURAL.bubbles, fire: NATURAL.embers };
const BURST_NATURAL = { fireworks: [], hearts: NATURAL.hearts, confetti: NATURAL.confetti, ripple: ["#ffffff"] };
const MATRIX_GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789ZΣ";

let accent = "#ff7eb6";

BThemer.definePlugin({
    id: "screenEffects",
    name: "Screen Effects",
    description: "Snow, stars, warp speed, fireflies, confetti, matrix code, storms and more, plus cursor trails and click bursts.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        effect: {
            type: "select",
            label: "Background effect",
            default: "snow",
            options: [
                ["none", "None"], ["snow", "Snow"], ["stars", "Twinkling stars"], ["warp", "Warp speed"], ["fireflies", "Fireflies"],
                ["bubbles", "Bubbles"], ["confetti", "Confetti"], ["hearts", "Floating hearts"], ["rain", "Rain"], ["storm", "Thunderstorm"],
                ["matrix", "Matrix code"], ["leaves", "Autumn leaves"], ["embers", "Embers"], ["bokeh", "Bokeh lights"],
            ],
        },
        amount: { type: "range", label: "Amount", min: 0, max: 400, default: 80 },
        speed: { type: "range", label: "Speed", min: 10, max: 300, unit: "%", default: 100 },
        size: { type: "range", label: "Size", min: 30, max: 300, unit: "%", default: 100 },
        opacity: { type: "range", label: "Opacity", min: 10, max: 100, unit: "%", default: 85 },
        colors: {
            type: "select",
            label: "Colours",
            default: "natural",
            options: [["natural", "The effect's own"], ["accent", "My accent colour"], ["rainbow", "Rainbow"], ["custom", "One colour (below)"]],
        },
        customColor: { type: "color", label: "Colour", default: "#ff7eb6" },
        trail: {
            type: "select",
            label: "Cursor trail",
            default: "off",
            options: [["off", "Off"], ["sparkles", "Sparkles"], ["stars", "Stars"], ["hearts", "Hearts"], ["rainbow", "Rainbow"], ["bubbles", "Bubbles"], ["fire", "Fire"]],
        },
        burst: {
            type: "select",
            label: "When you click",
            default: "off",
            options: [["off", "Nothing"], ["fireworks", "Fireworks"], ["hearts", "Hearts"], ["confetti", "Confetti"], ["ripple", "Ripple"]],
        },
        behindGlass: { type: "toggle", label: "Behind the glass", default: false },
        pauseUnfocused: { type: "toggle", label: "Pause when Discord isn't the active window", default: true },
    },

    css: s => `
        #bt-fx {
            position: fixed; inset: 0; pointer-events: none;
            opacity: ${s.opacity / 100};
            z-index: ${s.behindGlass ? -1 : 2147482999};
        }`,

    start(api) {
        const s = api.settings;
        accent = api.core.accent || accent;
        const canvas = api.el("canvas", { id: "bt-fx" });
        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        let w = 0, h = 0, raf = 0, last = performance.now(), paused = false, focused = document.hasFocus();
        let flash = 0;
        let drewLast = true;
        let hueBase = 0;

        const resize = () => {
            const d = Math.min(devicePixelRatio || 1, 2);
            w = innerWidth;
            h = innerHeight;
            canvas.width = w * d;
            canvas.height = h * d;
            ctx.setTransform(d, 0, 0, d, 0, 0);
        };

        const paletteFor = (natural, kind) => {
            if (s.colors === "custom") return [s.customColor, mix(s.customColor, 0.25), mix(s.customColor, 0.5)];
            if (s.colors === "accent") return [0.15, 0.35, 0.55, 0.75].map(t => mix(accent, t));
            if (s.colors === "rainbow" || !natural.length || kind === "rainbow") return null;
            return natural;
        };
        const colorOf = (p, palette) => (palette ? palette[p.ci % palette.length] : `hsl(${(p.hue + hueBase) % 360} 95% 68%)`);

        const heart = r => {
            ctx.beginPath();
            ctx.moveTo(0, r * 0.35);
            ctx.bezierCurveTo(r * 0.05, r * 0.3, r, -0.05 * r, r * 0.5, -r * 0.55);
            ctx.bezierCurveTo(r * 0.2, -r * 0.85, 0, -r * 0.55, 0, -r * 0.35);
            ctx.bezierCurveTo(0, -r * 0.55, -r * 0.2, -r * 0.85, -r * 0.5, -r * 0.55);
            ctx.bezierCurveTo(-r, -0.05 * r, -r * 0.05, r * 0.3, 0, r * 0.35);
            ctx.fill();
        };
        const sparkle = r => {
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * TAU, rr = i % 2 ? r * 0.28 : r;
                ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
            }
            ctx.closePath();
            ctx.fill();
        };
        const star5 = r => {
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const a = (i / 10) * TAU - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
                ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
            }
            ctx.closePath();
            ctx.fill();
        };
        const leaf = r => {
            ctx.beginPath();
            ctx.moveTo(0, -r);
            ctx.quadraticCurveTo(r * 0.9, -r * 0.2, 0, r);
            ctx.quadraticCurveTo(-r * 0.9, -r * 0.2, 0, -r);
            ctx.fill();
        };
        const dot = r => {
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, TAU);
            ctx.fill();
        };

        const EFFECTS = {
            snow: {
                spawn: (p, any) => Object.assign(p, { x: rnd(0, w), y: any ? rnd(0, h) : -10, r: rnd(1.2, 3.6), vy: rnd(18, 55), vx: rnd(-8, 8), sway: rnd(10, 30), t: rnd(0, TAU), f: rnd(0.4, 1.2) }),
                step: (p, dt) => ((p.t += p.f * dt), (p.y += p.vy * dt), (p.x += p.vx * dt), p.y < h + 10),
                draw: (p, z, c) => {
                    ctx.translate(p.x + Math.sin(p.t) * p.sway, p.y);
                    ctx.fillStyle = c;
                    ctx.globalAlpha = 0.9;
                    dot(p.r * z);
                },
            },
            stars: {
                spawn: p => Object.assign(p, { x: rnd(0, w), y: rnd(0, h), r: rnd(1, 3), t: rnd(0, TAU), f: rnd(0.6, 2.2), life: rnd(4, 12) }),
                step: (p, dt) => ((p.t += p.f * dt), (p.life -= dt), p.life > 0),
                draw: (p, z, c) => {
                    ctx.translate(p.x, p.y);
                    ctx.globalAlpha = Math.max(0, Math.sin(p.t)) ** 2;
                    ctx.fillStyle = c;
                    sparkle(p.r * 2.2 * z);
                },
            },
            warp: {
                spawn: (p, any) => Object.assign(p, { a: rnd(0, TAU), d: any ? rnd(0.02, 1) : rnd(0.01, 0.05), v: rnd(0.25, 0.6) }),
                step: (p, dt) => ((p.pd = p.d), (p.d *= 1 + p.v * dt * 2.2), p.d < 1.4),
                draw: (p, z, c) => {
                    const cx = w / 2, cy = h / 2, R = Math.hypot(cx, cy);
                    const r1 = (p.pd ?? p.d) * R, r2 = p.d * R;
                    ctx.strokeStyle = c;
                    ctx.globalAlpha = Math.min(1, p.d * 1.6);
                    ctx.lineWidth = Math.max(0.6, p.d * 2.6 * z);
                    ctx.beginPath();
                    ctx.moveTo(cx + Math.cos(p.a) * r1, cy + Math.sin(p.a) * r1);
                    ctx.lineTo(cx + Math.cos(p.a) * (r2 + 2), cy + Math.sin(p.a) * (r2 + 2));
                    ctx.stroke();
                },
            },
            fireflies: {
                spawn: p => Object.assign(p, { x: rnd(0, w), y: rnd(h * 0.2, h), r: rnd(1.5, 3), a: rnd(0, TAU), v: rnd(10, 30), t: rnd(0, TAU), f: rnd(0.8, 2), life: rnd(6, 16) }),
                step: (p, dt) => {
                    p.a += rnd(-1.5, 1.5) * dt;
                    p.x += Math.cos(p.a) * p.v * dt;
                    p.y += Math.sin(p.a) * p.v * dt - 4 * dt;
                    p.t += p.f * dt;
                    p.life -= dt;
                    return p.life > 0 && p.x > -20 && p.x < w + 20 && p.y > -20 && p.y < h + 20;
                },
                draw: (p, z, c) => {
                    ctx.translate(p.x, p.y);
                    ctx.globalCompositeOperation = "lighter";
                    const glow = 0.35 + 0.65 * Math.max(0, Math.sin(p.t));
                    ctx.fillStyle = c;
                    ctx.globalAlpha = glow * 0.18;
                    dot(p.r * 5 * z);
                    ctx.globalAlpha = glow;
                    dot(p.r * z);
                },
            },
            bubbles: {
                spawn: (p, any) => Object.assign(p, { x: rnd(0, w), y: any ? rnd(0, h) : h + 20, r: rnd(4, 14), vy: rnd(20, 50), t: rnd(0, TAU), f: rnd(1, 2), sway: rnd(4, 14) }),
                step: (p, dt) => ((p.t += p.f * dt), (p.y -= p.vy * dt), p.y > -30),
                draw: (p, z, c) => {
                    const r = p.r * z;
                    ctx.translate(p.x + Math.sin(p.t) * p.sway, p.y);
                    ctx.strokeStyle = c;
                    ctx.lineWidth = 1.2;
                    ctx.globalAlpha = 0.75;
                    ctx.beginPath();
                    ctx.arc(0, 0, r, 0, TAU);
                    ctx.stroke();
                    ctx.fillStyle = c;
                    ctx.globalAlpha = 0.12;
                    dot(r);
                    ctx.globalAlpha = 0.8;
                    ctx.fillStyle = "#fff";
                    ctx.beginPath();
                    ctx.arc(-r * 0.35, -r * 0.35, r * 0.18, 0, TAU);
                    ctx.fill();
                },
            },
            confetti: {
                spawn: (p, any) => Object.assign(p, { x: rnd(0, w), y: any ? rnd(0, h) : -10, r: rnd(4, 8), vy: rnd(60, 130), vx: rnd(-20, 20), rot: rnd(0, TAU), vr: rnd(-6, 6), fl: rnd(0, TAU), vf: rnd(4, 9) }),
                step: (p, dt) => ((p.y += p.vy * dt), (p.x += p.vx * dt), (p.rot += p.vr * dt), (p.fl += p.vf * dt), p.y < h + 20),
                draw: (p, z, c) => {
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.scale(1, Math.cos(p.fl));
                    ctx.fillStyle = c;
                    ctx.fillRect(-p.r * z * 0.5, -p.r * z * 0.3, p.r * z, p.r * z * 0.6);
                },
            },
            hearts: {
                spawn: (p, any) => Object.assign(p, { x: rnd(0, w), y: any ? rnd(0, h) : h + 20, r: rnd(6, 14), vy: rnd(25, 60), t: rnd(0, TAU), f: rnd(0.8, 1.8), sway: rnd(8, 24) }),
                step: (p, dt) => ((p.t += p.f * dt), (p.y -= p.vy * dt), p.y > -30),
                draw: (p, z, c) => {
                    ctx.translate(p.x + Math.sin(p.t) * p.sway, p.y);
                    ctx.rotate(Math.sin(p.t) * 0.25);
                    ctx.globalAlpha = Math.min(1, (p.y / h) * 1.5);
                    ctx.fillStyle = c;
                    heart(p.r * z);
                },
            },
            rain: {
                spawn: (p, any) => Object.assign(p, { x: rnd(-w * 0.2, w), y: any ? rnd(0, h) : rnd(-60, -10), l: rnd(10, 24), v: rnd(500, 850) }),
                step: (p, dt) => ((p.y += p.v * dt), (p.x += p.v * 0.18 * dt), p.y < h + 30),
                draw: (p, z, c) => {
                    ctx.strokeStyle = c;
                    ctx.globalAlpha = 0.55;
                    ctx.lineWidth = Math.max(0.8, z);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - p.l * 0.18 * z, p.y - p.l * z);
                    ctx.stroke();
                },
            },
            matrix: {
                spawn: (p, any) => {
                    const cell = 16;
                    return Object.assign(p, {
                        x: Math.floor(rnd(0, w / cell)) * cell, y: any ? rnd(-h, h) : rnd(-h * 0.5, -20), v: rnd(80, 220),
                        n: (rnd(8, 24) | 0), g: Array.from({ length: 24 }, () => pick(MATRIX_GLYPHS)), tick: 0,
                    });
                },
                step: (p, dt) => {
                    p.y += p.v * dt;
                    p.tick += dt;
                    if (p.tick > 0.08) {
                        p.tick = 0;
                        p.g[(Math.random() * p.g.length) | 0] = pick(MATRIX_GLYPHS);
                    }
                    return p.y - p.n * 16 < h;
                },
                draw: (p, z, c) => {
                    const cell = 16 * z;
                    ctx.font = `${Math.round(14 * z)}px monospace`;
                    ctx.textAlign = "center";
                    for (let i = 0; i < p.n; i++) {
                        const y = p.y - i * cell;
                        if (y < -cell || y > h + cell) continue;
                        ctx.globalAlpha = i === 0 ? 1 : (1 - i / p.n) * 0.8;
                        ctx.fillStyle = i === 0 ? "#eafff0" : c;
                        ctx.fillText(p.g[i % p.g.length], p.x, y);
                    }
                },
            },
            leaves: {
                spawn: (p, any) => Object.assign(p, { x: rnd(-w * 0.2, w), y: any ? rnd(0, h) : -20, r: rnd(6, 12), vy: rnd(30, 70), vx: rnd(10, 40), t: rnd(0, TAU), f: rnd(0.8, 1.8), rot: rnd(0, TAU), vr: rnd(-2, 2), sway: rnd(20, 50) }),
                step: (p, dt) => ((p.t += p.f * dt), (p.y += p.vy * dt), (p.x += p.vx * dt), (p.rot += p.vr * dt), p.y < h + 30 && p.x < w + 60),
                draw: (p, z, c) => {
                    ctx.translate(p.x + Math.sin(p.t) * p.sway, p.y);
                    ctx.rotate(p.rot);
                    ctx.scale(1, Math.abs(Math.cos(p.t)) * 0.6 + 0.4);
                    ctx.fillStyle = c;
                    leaf(p.r * z);
                },
            },
            embers: {
                spawn: (p, any) => Object.assign(p, { x: rnd(0, w), y: any ? rnd(h * 0.3, h) : h + 10, r: rnd(1, 2.6), vy: rnd(30, 90), vx: rnd(-15, 15), t: rnd(0, TAU), life: rnd(3, 7), max: 7 }),
                step: (p, dt) => ((p.t += 6 * dt), (p.y -= p.vy * dt), (p.x += (p.vx + Math.sin(p.t) * 12) * dt), (p.life -= dt), p.life > 0 && p.y > -10),
                draw: (p, z, c) => {
                    ctx.translate(p.x, p.y);
                    ctx.globalCompositeOperation = "lighter";
                    ctx.fillStyle = c;
                    ctx.globalAlpha = Math.min(1, p.life / 2) * (0.6 + 0.4 * Math.sin(p.t * 1.7));
                    dot(p.r * z);
                    ctx.globalAlpha *= 0.25;
                    dot(p.r * 3.5 * z);
                },
            },
            bokeh: {
                spawn: p => Object.assign(p, { x: rnd(0, w), y: rnd(0, h), r: rnd(20, 70), vx: rnd(-8, 8), vy: rnd(-8, 8), t: rnd(0, TAU), f: rnd(0.2, 0.6) }),
                step: (p, dt) => ((p.t += p.f * dt), (p.x += p.vx * dt), (p.y += p.vy * dt), p.x > -100 && p.x < w + 100 && p.y > -100 && p.y < h + 100),
                draw: (p, z, c) => {
                    ctx.translate(p.x, p.y);
                    ctx.globalCompositeOperation = "lighter";
                    ctx.fillStyle = c;
                    ctx.globalAlpha = 0.06 + 0.06 * Math.sin(p.t);
                    dot(p.r * z);
                },
            },
        };
        EFFECTS.storm = EFFECTS.rain;

        const TRAILS = {
            sparkles: (x, y) => ({ x, y, vx: rnd(-20, 20), vy: rnd(-20, 20), r: rnd(3, 6), life: 0.7, shape: sparkle }),
            stars: (x, y) => ({ x, y, vx: rnd(-30, 30), vy: rnd(10, 50), r: rnd(4, 7), life: 0.8, shape: star5, rot: rnd(0, TAU), vr: rnd(-4, 4) }),
            hearts: (x, y) => ({ x, y, vx: rnd(-15, 15), vy: rnd(-50, -20), r: rnd(5, 8), life: 0.9, shape: heart }),
            rainbow: (x, y) => ({ x, y, vx: 0, vy: 0, r: 5, life: 0.5, shape: dot, hueLocked: true }),
            bubbles: (x, y) => ({ x, y, vx: rnd(-10, 10), vy: rnd(-40, -15), r: rnd(3, 6), life: 1, ring: true }),
            fire: (x, y) => ({ x, y, vx: rnd(-15, 15), vy: rnd(-70, -30), r: rnd(2, 4.5), life: 0.6, shape: dot, glow: true }),
        };
        const BURSTS = {
            fireworks: (x, y, out) => {
                const hue = rnd(0, 360);
                for (let i = 0; i < 46; i++) {
                    const a = (i / 46) * TAU, v = rnd(120, 260);
                    out.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 220, r: rnd(1.6, 2.6), life: rnd(0.8, 1.3), shape: dot, glow: true, hue: hue + rnd(-25, 25) });
                }
            },
            hearts: (x, y, out) => {
                for (let i = 0; i < 12; i++) {
                    const a = rnd(0, TAU), v = rnd(60, 160);
                    out.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: 120, r: rnd(5, 9), life: 1, shape: heart });
                }
            },
            confetti: (x, y, out) => {
                for (let i = 0; i < 36; i++) {
                    const a = rnd(-Math.PI, 0), v = rnd(150, 330);
                    out.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 420, r: rnd(4, 7), life: 1.4, rect: true, rot: rnd(0, TAU), vr: rnd(-10, 10) });
                }
            },
            ripple: (x, y, out) => {
                out.push({ x, y, vx: 0, vy: 0, r: 4, grow: 140, life: 0.7, ring: true });
                out.push({ x, y, vx: 0, vy: 0, r: 2, grow: 90, life: 0.55, ring: true });
            },
        };

        const ambient = [];
        const fx = [];
        let lastEffect = null;
        let trailAcc = 0;

        const onMove = e => {
            if (s.trail === "off" || paused || fx.length > MAX_FX) return;
            trailAcc++;
            if (trailAcc % 2) return;
            const make = TRAILS[s.trail];
            if (!make) return;
            const p = make(e.clientX, e.clientY);
            p.kind = s.trail;
            p.src = TRAIL_NATURAL;
            p.max = p.life;
            p.ci = (Math.random() * 6) | 0;
            p.hue = p.hueLocked ? hueBase * 4 : rnd(0, 360);
            fx.push(p);
        };
        const onDown = e => {
            if (s.burst === "off" || paused || e.button !== 0 || fx.length > MAX_FX) return;
            const make = BURSTS[s.burst];
            if (!make) return;
            const out = [];
            make(e.clientX, e.clientY, out);
            for (const p of out) {
                p.kind = s.burst;
                p.src = BURST_NATURAL;
                p.max = p.life;
                p.ci = (Math.random() * 6) | 0;
                p.hue ??= rnd(0, 360);
                fx.push(p);
            }
        };
        const onFocus = () => (focused = true);
        const onBlur = () => (focused = false);
        addEventListener("pointermove", onMove, { passive: true, capture: true });
        addEventListener("pointerdown", onDown, { passive: true, capture: true });
        addEventListener("focus", onFocus);
        addEventListener("blur", onBlur);
        addEventListener("resize", resize);

        const loading = () => document.documentElement.hasAttribute("data-bt-loading");
        const drawShortLived = (p, size) => {
            const natural = p.src[p.kind] || [];
            const palette = p.kind === "fireworks" || p.kind === "rainbow" ? null : paletteFor(natural, p.kind);
            const c = colorOf(p, palette);
            const t = Math.max(0, p.life / p.max);
            ctx.save();
            ctx.translate(p.x, p.y);
            if (p.rot) ctx.rotate(p.rot);
            if (p.glow) ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = t;
            const r = (p.r + (p.grow ? (1 - t) * p.grow : 0)) * size;
            if (p.ring) {
                ctx.strokeStyle = c;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(0, 0, r, 0, TAU);
                ctx.stroke();
            } else if (p.rect) {
                ctx.fillStyle = c;
                ctx.fillRect(-r * 0.5, -r * 0.3, r, r * 0.6);
            } else {
                ctx.fillStyle = c;
                (p.shape || dot)(p.kind === "rainbow" ? r * (0.4 + 0.6 * t) : r);
            }
            ctx.restore();
        };

        const tick = now => {
            raf = requestAnimationFrame(tick);
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            if (loading() || paused || (s.pauseUnfocused && !focused)) return;
            const speed = s.speed / 100, size = s.size / 100;
            hueBase = (hueBase + dt * 40) % 360;
            const kind = s.effect;
            const E = EFFECTS[kind];
            if (!E && !fx.length && !drewLast) return;
            drewLast = !!E || fx.length > 0;
            ctx.globalCompositeOperation = "source-over";
            ctx.clearRect(0, 0, w, h);

            if (kind !== lastEffect) {
                ambient.length = 0;
                lastEffect = kind;
            }
            if (E) {
                const want = Math.min(s.amount, MAX_FX);
                while (ambient.length < want) ambient.push(E.spawn({ ci: (Math.random() * 6) | 0, hue: rnd(0, 360) }, true));
                if (ambient.length > want) ambient.length = want;
                const palette = paletteFor(NATURAL[kind] || [], kind);
                for (const p of ambient) {
                    if (!E.step(p, dt * speed)) E.spawn(p, false);
                    ctx.save();
                    E.draw(p, size, colorOf(p, palette));
                    ctx.restore();
                }
                if (kind === "storm") {
                    if (flash <= 0 && Math.random() < dt * 0.12) flash = 1;
                    if (flash > 0) {
                        ctx.save();
                        ctx.globalAlpha = flash * (0.5 + 0.5 * Math.random()) * 0.45;
                        ctx.fillStyle = "#e8f0ff";
                        ctx.fillRect(0, 0, w, h);
                        ctx.restore();
                        flash -= dt * 3;
                    }
                }
            } else ambient.length = 0;

            for (let i = fx.length - 1; i >= 0; i--) {
                const p = fx[i];
                p.life -= dt;
                if (p.life <= 0) {
                    fx.splice(i, 1);
                    continue;
                }
                p.vy += (p.g || 0) * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.vr) p.rot += p.vr * dt;
                drawShortLived(p, size);
            }
        };
        resize();
        raf = requestAnimationFrame(tick);

        api.addMenuItem("Pause / resume screen effects", () => {
            paused = !paused;
            if (paused) ctx.clearRect(0, 0, w, h);
            api.toast(paused ? "Screen effects paused" : "Screen effects resumed");
        });

        api.onDispose(() => {
            cancelAnimationFrame(raf);
            removeEventListener("pointermove", onMove, { capture: true });
            removeEventListener("pointerdown", onDown, { capture: true });
            removeEventListener("focus", onFocus);
            removeEventListener("blur", onBlur);
            removeEventListener("resize", resize);
            canvas.remove();
        });
    },

    onCoreChange(core) {
        accent = core.accent || accent;
    },
});
