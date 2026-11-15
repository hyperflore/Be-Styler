const CALC_KEYS = [
    ["C", "clear", "fn"], ["(", "(", "fn"], [")", ")", "fn"], ["÷", "/", "op"],
    ["7", "7"], ["8", "8"], ["9", "9"], ["×", "*", "op"],
    ["4", "4"], ["5", "5"], ["6", "6"], ["−", "-", "op"],
    ["1", "1"], ["2", "2"], ["3", "3"], ["+", "+", "op"],
    ["√", "sqrt(", "fn"], ["0", "0"], [".", "."], ["=", "=", "eq"],
    ["%", "%", "fn"], ["^", "^", "fn"], ["ans", "ans", "fn"], ["⌫", "back", "fn"],
];

function calcEval(src, ans) {
    const s = String(src).replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "");
    let i = 0;
    const peek = () => s[i];
    const fail = () => { throw new Error("bad"); };
    const number = () => {
        if (s.startsWith("ans", i)) { i += 3; return ans; }
        if (s.startsWith("sqrt(", i)) { i += 5; const v = expr(); if (s[i] !== ")") fail(); i++; return Math.sqrt(v); }
        if (s.startsWith("pi", i)) { i += 2; return Math.PI; }
        if (peek() === "(") { i++; const v = expr(); if (s[i] !== ")") fail(); i++; return v; }
        const m = /^\d*\.?\d+(e[+-]?\d+)?/i.exec(s.slice(i)) || /^\d+\.?/.exec(s.slice(i));
        if (!m) fail();
        i += m[0].length;
        return parseFloat(m[0]);
    };
    const unary = () => {
        if (peek() === "-") { i++; return -unary(); }
        if (peek() === "+") { i++; return unary(); }
        let v = number();
        while (peek() === "%") { i++; v /= 100; }
        return v;
    };
    const power = () => { const b = unary(); if (peek() === "^") { i++; return Math.pow(b, power()); } return b; };
    const term = () => {
        let v = power();
        for (;;) {
            if (peek() === "*") { i++; v *= power(); }
            else if (peek() === "/") { i++; v /= power(); }
            else if (peek() === "(" || /[\da-z]/i.test(peek() || "")) v *= power();
            else return v;
        }
    };
    function expr() {
        let v = term();
        for (;;) {
            if (peek() === "+") { i++; v += term(); }
            else if (peek() === "-") { i++; v -= term(); }
            else return v;
        }
    }
    const v = expr();
    if (i !== s.length || !Number.isFinite(v)) fail();
    return v;
}
const calcShow = v => {
    if (!Number.isFinite(v)) return "Error";
    const r = Math.round(v * 1e12) / 1e12;
    return Math.abs(r) >= 1e15 || (r !== 0 && Math.abs(r) < 1e-9) ? r.toExponential(8).replace(/\.?0+e/, "e") : r.toLocaleString("en-US", { maximumFractionDigits: 10 });
};
const calcCombo = text => {
    const parts = String(text || "").toLowerCase().split("+").map(x => x.trim()).filter(Boolean);
    const c = { ctrl: false, alt: false, shift: false, meta: false, key: "" };
    for (const p of parts) {
        if (p === "ctrl" || p === "control") c.ctrl = true;
        else if (p === "alt" || p === "option") c.alt = true;
        else if (p === "shift") c.shift = true;
        else if (p === "meta" || p === "win" || p === "cmd") c.meta = true;
        else c.key = p === "space" ? " " : p;
    }
    return c.key ? c : null;
};

BThemer.definePlugin({
    id: "calculate",
    name: "Calculate",
    description: "A glassy calculator that pops up over Discord with a key combination you choose (Alt+C by default). Type or click; it remembers your last results.",
    author: "Be Themer",
    version: "1.0.0",
    settings: {
        hotkey: { type: "text", label: "Open / close with (two keys, e.g. Alt+C, Ctrl+K)", default: "Alt+C" },
        tint: { type: "color", label: "Glass tint", default: "#7c5cff" },
        blur: { type: "range", label: "Glass blur", min: 0, max: 40, unit: "px", default: 22 },
    },
    css: s => `
        .bt-calc { position: fixed; z-index: 100005; width: 264px; padding: 12px; border-radius: 24px; user-select: none;
            background: linear-gradient(155deg, ${s.tint}33, rgb(20 20 30 / .45) 55%, ${s.tint}22);
            backdrop-filter: blur(${Number(s.blur) || 0}px) saturate(1.4); -webkit-backdrop-filter: blur(${Number(s.blur) || 0}px) saturate(1.4);
            border: 1px solid rgb(255 255 255 / .18); box-shadow: 0 24px 60px rgb(0 0 0 / .45), inset 0 1px 0 rgb(255 255 255 / .25);
            color: #fff; font: 15px/1.2 var(--font-primary, "gg sans", sans-serif); animation: bt-calc-in .18s cubic-bezier(.2, .9, .3, 1.2); }
        .bt-calc[hidden] { display: none; }
        @keyframes bt-calc-in { from { opacity: 0; transform: translateY(8px) scale(.96); } }
        .bt-calc-top { display: flex; align-items: center; justify-content: space-between; height: 22px; margin: -2px 2px 8px; cursor: grab; }
        .bt-calc-top:active { cursor: grabbing; }
        .bt-calc-top b { font: 800 12px var(--font-primary, sans-serif); letter-spacing: .06em; text-transform: uppercase; opacity: .75; }
        .bt-calc-x { width: 22px; height: 22px; border: 0; border-radius: 50%; background: rgb(255 255 255 / .12); color: #fff; cursor: pointer; font: 700 13px/1 var(--font-primary, sans-serif); }
        .bt-calc-x:hover { background: rgb(255 80 80 / .7); }
        .bt-calc-screen { padding: 10px 12px; margin-bottom: 10px; border-radius: 16px; background: rgb(0 0 0 / .28); box-shadow: inset 0 1px 6px rgb(0 0 0 / .3); text-align: right; min-height: 64px; }
        .bt-calc-hist { min-height: 14px; font-size: 11px; opacity: .55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-calc-expr { margin-top: 2px; min-height: 18px; font-size: 14px; opacity: .8; word-break: break-all; }
        .bt-calc-out { margin-top: 2px; font: 700 30px/1.1 var(--font-display, var(--font-primary, sans-serif)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bt-calc-out.bt-calc-err { color: #ff9a9a; font-size: 20px; }
        .bt-calc-keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; }
        .bt-calc-keys button { height: 44px; border: 0; border-radius: 14px; cursor: pointer; color: #fff; font: 600 17px var(--font-primary, sans-serif);
            background: rgb(255 255 255 / .1); box-shadow: inset 0 1px 0 rgb(255 255 255 / .15); transition: background .1s, transform .06s; }
        .bt-calc-keys button:hover { background: rgb(255 255 255 / .2); }
        .bt-calc-keys button:active, .bt-calc-keys button.bt-calc-hit { transform: scale(.94); background: rgb(255 255 255 / .28); }
        .bt-calc-keys .bt-calc-op { background: ${s.tint}66; }
        .bt-calc-keys .bt-calc-op:hover { background: ${s.tint}99; }
        .bt-calc-keys .bt-calc-fn { background: rgb(255 255 255 / .06); font-size: 15px; opacity: .9; }
        .bt-calc-keys .bt-calc-eq { background: ${s.tint}; box-shadow: 0 6px 16px ${s.tint}66, inset 0 1px 0 rgb(255 255 255 / .3); }
        .bt-calc-hint { margin-top: 8px; text-align: center; font-size: 10.5px; opacity: .5; }
    `,

    start(api) {
        let expr = "", ans = 0, history = [], justEvaluated = false;
        const root = api.el("div", { className: "bt-calc", tabIndex: -1 });
        root.hidden = true;
        const top = api.el("div", { className: "bt-calc-top" });
        const close = api.el("button", { className: "bt-calc-x", type: "button", textContent: "×", title: "Close" });
        close.onclick = () => hide();
        top.append(api.el("b", { textContent: "Calculate" }), close);
        const screen = api.el("div", { className: "bt-calc-screen" });
        const hist = api.el("div", { className: "bt-calc-hist" });
        const exprEl = api.el("div", { className: "bt-calc-expr" });
        const out = api.el("div", { className: "bt-calc-out", textContent: "0" });
        screen.append(hist, exprEl, out);
        const keys = api.el("div", { className: "bt-calc-keys" });
        const keyEls = new Map();
        for (const [label, value, kind] of CALC_KEYS) {
            const b = api.el("button", { type: "button", textContent: label, className: kind ? `bt-calc-${kind}` : "" });
            b.onclick = () => press(value);
            keys.append(b);
            keyEls.set(value, b);
        }
        const hint = api.el("div", { className: "bt-calc-hint" });
        root.append(top, screen, keys, hint);
        document.body.append(root);

        const preview = () => {
            if (!expr) return "";
            try { return calcShow(calcEval(expr, ans)); } catch { return ""; }
        };
        function draw(error) {
            exprEl.textContent = expr.replace(/\*/g, "×").replace(/\//g, "÷").replace(/sqrt\(/g, "√(");
            const p = error ? "Error" : justEvaluated ? calcShow(ans) : preview() || (expr ? out.textContent : "0");
            out.textContent = p;
            out.classList.toggle("bt-calc-err", p === "Error");
            hist.textContent = history.slice(-2).join("   ·   ");
            hint.textContent = `${api.settings.hotkey || "Alt+C"} to open / close · Enter = · Esc closes`;
        }
        function press(v) {
            keyEls.get(v)?.classList.add("bt-calc-hit");
            setTimeout(() => keyEls.get(v)?.classList.remove("bt-calc-hit"), 90);
            if (v === "clear") { expr = ""; justEvaluated = false; return draw(); }
            if (v === "back") { expr = expr.replace(/(sqrt\(|ans|.)$/, ""); justEvaluated = false; return draw(); }
            if (v === "=") {
                if (!expr) return;
                try {
                    const r = calcEval(expr, ans);
                    history.push(`${expr.replace(/\*/g, "×").replace(/\//g, "÷")} = ${calcShow(r)}`);
                    history = history.slice(-20);
                    api.storage.set("history", history).catch(() => {});
                    ans = r;
                    expr = "";
                    justEvaluated = true;
                    return draw();
                } catch { return draw(true); }
            }
            if (justEvaluated) {
                expr = /^[+\-*/^%]$/.test(v) ? `ans${v}` : "";
                justEvaluated = false;
                if (/^[+\-*/^%]$/.test(v)) return draw();
            }
            expr += v;
            draw();
        }

        const KEYMAP = { Enter: "=", "=": "=", Backspace: "back", Delete: "clear", "*": "*", "/": "/", "+": "+", "-": "-", "^": "^", "%": "%", "(": "(", ")": ")", ".": ".", ",": ".", x: "*", X: "*" };
        const onCalcKey = e => {
            if (root.hidden || !root.contains(document.activeElement)) return;
            e.stopPropagation();
            if (e.key === "Escape") { e.preventDefault(); return hide(); }
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const v = /^\d$/.test(e.key) ? e.key : KEYMAP[e.key];
            if (v) { e.preventDefault(); press(v); }
        };
        root.addEventListener("keydown", onCalcKey);
        root.addEventListener("keyup", e => e.stopPropagation());
        root.addEventListener("keypress", e => e.stopPropagation());
        const onPaste = e => {
            if (root.hidden || !root.contains(e.target) && e.target !== root) return;
            e.stopImmediatePropagation();
            e.preventDefault();
            const t = (e.clipboardData?.getData("text") || "").replace(/[^\d+\-*/().^%×÷−\s]/g, "");
            if (t) { if (justEvaluated) { expr = ""; justEvaluated = false; } expr += t.replace(/\s+/g, ""); draw(); }
        };
        window.addEventListener("paste", onPaste, true);

        let pos = null;
        const place = () => {
            const w = root.offsetWidth || 264, h = root.offsetHeight || 420;
            const x = pos ? pos.x : innerWidth - w - 40, y = pos ? pos.y : Math.max(20, (innerHeight - h) / 2);
            root.style.left = `${Math.max(8, Math.min(x, innerWidth - w - 8))}px`;
            root.style.top = `${Math.max(8, Math.min(y, innerHeight - h - 8))}px`;
        };
        top.addEventListener("pointerdown", e => {
            if (e.target === close) return;
            e.preventDefault();
            top.setPointerCapture(e.pointerId);
            const r = root.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
            const move = ev => { pos = { x: ev.clientX - dx, y: ev.clientY - dy }; place(); };
            top.addEventListener("pointermove", move);
            top.addEventListener("pointerup", () => { top.removeEventListener("pointermove", move); api.storage.set("pos", pos).catch(() => {}); }, { once: true });
        });
        addEventListener("resize", place);

        function show() { root.hidden = false; place(); draw(); root.focus({ preventScroll: true }); }
        function hide() { root.hidden = true; }
        const toggle = () => (root.hidden ? show() : hide());

        const onHotkey = e => {
            const c = calcCombo(api.settings.hotkey || "Alt+C");
            if (!c || e.repeat) return;
            const key = (e.key || "").toLowerCase();
            if (key !== c.key && (e.code || "").toLowerCase() !== `key${c.key}` && (e.code || "").toLowerCase() !== `digit${c.key}`) return;
            if (e.ctrlKey !== c.ctrl || e.altKey !== c.alt || e.shiftKey !== c.shift || e.metaKey !== c.meta) return;
            e.preventDefault();
            e.stopPropagation();
            toggle();
        };
        window.addEventListener("keydown", onHotkey, true);
        api.addMenuItem("Open / close the calculator", toggle);

        api.storage.get("pos").then(v => { if (v && Number.isFinite(v.x)) pos = v; }).catch(() => {});
        api.storage.get("history").then(v => { if (Array.isArray(v)) history = v.slice(-20); }).catch(() => {});
        this.redraw = () => { if (!root.hidden) draw(); };
        api.onDispose(() => {
            window.removeEventListener("keydown", onHotkey, true);
            window.removeEventListener("paste", onPaste, true);
            removeEventListener("resize", place);
            root.remove();
            delete this.redraw;
        });
    },
    onSettingChange(key) {
        if (key === "hotkey") this.redraw?.();
    },
});
