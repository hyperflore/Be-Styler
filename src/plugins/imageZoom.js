BThemer.definePlugin({
    id: "imageZoom",
    name: "Image Zoom",
    description: "Magnifying lens on opened images: hold click to zoom, scroll to change zoom, Shift+scroll for lens size.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        zoom: { type: "range", label: "Zoom (×10)", min: 10, max: 500, default: 20 },
        size: { type: "range", label: "Lens size", min: 50, max: 1000, unit: "px", default: 100 },
        zoomSpeed: { type: "range", label: "How fast zoom / size change when scrolling (×10)", min: 1, max: 50, default: 5 },
        invertScroll: { type: "toggle", label: "Invert scroll", default: true },
        nearestNeighbour: { type: "toggle", label: "Sharp pixels when zoomed (nearest neighbour)", default: false },
        square: { type: "toggle", label: "Square lens", default: false },
        saveZoomValues: { type: "toggle", label: "Remember zoom and lens size changes", default: true },
        always: { type: "toggle", label: "Show lens on hover (no click needed)", default: false },
    },

    css: s => `.bt-lens { position: fixed; z-index: 10000; pointer-events: none; border: 2px solid rgba(255,255,255,.8); box-shadow: 0 6px 24px rgba(0,0,0,.6);
        background-repeat: no-repeat; background-color: #000; display: none; ${s.nearestNeighbour ? "image-rendering: pixelated;" : ""} }`,

    start(api) {
        const s = api.settings;
        const lens = api.el("div", { className: "bt-lens" });
        document.body.append(lens);
        api.onDispose(() => lens.remove());
        let img = null;
        let held = false;
        let zoom = s.zoom / 10;
        let size = s.size;

        const isModalImage = el =>
            el instanceof HTMLImageElement && el.closest('[class*="imageWrapper_"], [class*="mediaArea"], [class*="modal"], [class*="carouselModal"]') && !el.closest('[id^="chat-messages-"]');

        const draw = e => {
            if (!img || !(held || s.always)) return (lens.style.display = "none");
            const r = img.getBoundingClientRect();
            if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return (lens.style.display = "none");
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            Object.assign(lens.style, {
                display: "block",
                width: size + "px",
                height: size + "px",
                borderRadius: s.square ? "8px" : "50%",
                left: e.clientX - size / 2 + "px",
                top: e.clientY - size / 2 + "px",
                backgroundImage: `url("${(img.currentSrc || img.src).replace(/"/g, "%22")}")`,
                backgroundSize: `${r.width * zoom}px ${r.height * zoom}px`,
                backgroundPosition: `${-x * zoom + size / 2}px ${-y * zoom + size / 2}px`,
            });
        };
        const move = e => {
            const t = document.elementFromPoint(e.clientX, e.clientY);
            if (isModalImage(t)) img = t;
            else if (!held) img = null;
            draw(e);
        };
        const down = e => {
            if (e.button === 0 && isModalImage(e.target)) {
                held = true;
                img = e.target;
                draw(e);
            }
        };
        const up = e => {
            held = false;
            draw(e);
        };
        const wheel = e => {
            if (!img || !(held || s.always) || lens.style.display === "none") return;
            e.preventDefault();
            const speed = s.zoomSpeed / 10;
            const dir = Math.sign(e.deltaY) * (s.invertScroll ? -1 : 1);
            if (e.shiftKey) size = Math.max(50, Math.min(1000, size + dir * speed * 40));
            else zoom = Math.max(1, Math.min(50, zoom + dir * speed));
            if (s.saveZoomValues) {
                clearTimeout(saveTimer);
                saveTimer = setTimeout(() => {
                    saving = true;
                    api.setSetting("zoom", Math.round(zoom * 10));
                    api.setSetting("size", Math.round(size));
                    saving = false;
                }, 400);
            }
            draw(e);
        };
        let saveTimer = 0;
        let saving = false;
        document.addEventListener("mousemove", move, true);
        document.addEventListener("mousedown", down, true);
        document.addEventListener("mouseup", up, true);
        document.addEventListener("wheel", wheel, { capture: true, passive: false });
        api.onDispose(() => {
            document.removeEventListener("mousemove", move, true);
            document.removeEventListener("mousedown", down, true);
            document.removeEventListener("mouseup", up, true);
            document.removeEventListener("wheel", wheel, { capture: true });
        });
        document.addEventListener("mouseup", () => {
            if (!s.saveZoomValues) {
                zoom = s.zoom / 10;
                size = s.size;
            }
        });
        this._reset = () => {
            if (saving) return;
            zoom = s.zoom / 10;
            size = s.size;
        };
    },

    onSettingChange() {
        this._reset?.();
    },
});
