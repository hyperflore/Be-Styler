const PETS = { cat: "🐈", dog: "🐕", fox: "🦊", bunny: "🐇", hamster: "🐹", duck: "🦆", dragon: "🐉" };

BThemer.definePlugin({
    id: "cursorPet",
    name: "Cursor Pet",
    description: "A tiny pet that chases your mouse and naps when you're idle.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        pet: { type: "select", label: "Pet", options: Object.keys(PETS).map(k => [k, PETS[k] + " " + k]), default: "cat" },
        size: { type: "range", label: "Size", min: 16, max: 64, unit: "px", default: 28 },
        speed: { type: "range", label: "Speed", min: 2, max: 20, default: 8 },
    },

    css: s => `
        .bt-pet { position: fixed; left: 0; top: 0; z-index: 9999; pointer-events: none; font-size: ${s.size}px; line-height: 1; will-change: transform; user-select: none; }
        .bt-pet .bt-pet-body { display: inline-block; transition: transform .15s; }
        .bt-pet.flip .bt-pet-body { transform: scaleX(-1); }
        .bt-pet.walking .bt-pet-body { animation: bt-pet-hop .3s infinite alternate; }
        .bt-pet.flip.walking .bt-pet-body { animation-name: bt-pet-hop-flip; }
        .bt-pet .bt-pet-zz { position: absolute; top: -.6em; right: -.5em; font-size: .5em; opacity: 0; transition: opacity .4s; }
        .bt-pet.sleeping .bt-pet-zz { opacity: 1; animation: bt-pet-zz 2s infinite; }
        @keyframes bt-pet-hop { to { transform: translateY(-3px); } }
        @keyframes bt-pet-hop-flip { from { transform: scaleX(-1); } to { transform: scaleX(-1) translateY(-3px); } }
        @keyframes bt-pet-zz { 50% { transform: translateY(-4px); } }`,

    start(api) {
        const pet = api.el("div", { className: "bt-pet" });
        const body = api.el("span", { className: "bt-pet-body" });
        pet.append(body, api.el("span", { className: "bt-pet-zz", textContent: "💤" }));
        document.body.append(pet);

        let x = innerWidth / 2;
        let y = innerHeight / 2;
        let tx = x;
        let ty = y;
        let lastMove = Date.now();
        let frame = 0;

        const move = e => {
            tx = e.clientX;
            ty = e.clientY;
            lastMove = Date.now();
        };
        document.addEventListener("mousemove", move, { passive: true });

        const step = () => {
            body.textContent = PETS[api.settings.pet] || PETS.cat;
            const size = api.settings.size;
            const dx = tx - x - size;
            const dy = ty - y;
            const dist = Math.hypot(dx, dy);
            const walking = dist > size * 0.8;
            if (walking) {
                const v = Math.min(dist, api.settings.speed);
                x += (dx / dist) * v;
                y += (dy / dist) * v;
                if (Math.abs(dx) > 2) pet.classList.toggle("flip", dx > 0);
            }
            pet.classList.toggle("walking", walking);
            pet.classList.toggle("sleeping", !walking && Date.now() - lastMove > 8000);
            pet.style.transform = `translate(${x - size / 2}px, ${y - size}px)`;
            frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);

        api.onDispose(() => {
            cancelAnimationFrame(frame);
            document.removeEventListener("mousemove", move);
            pet.remove();
        });
    },
});
