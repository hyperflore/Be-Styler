BThemer.definePlugin({
    id: "dmsSaaf",
    name: "DMS Saaf",
    description: "Right-click a DM or a channel → \"Saaf karo\" to delete your own messages there: the last few, or all of them.",
    author: "Be Themer",
    version: "1.0.0",
    settings: {
        delay: { type: "range", label: "Pause between deletions (slower is safer)", min: 400, max: 3000, unit: " ms", default: 1100 },
    },
    css: `
        .bt-saaf-back { position: fixed; inset: 0; z-index: 100006; display: grid; place-items: center; background: rgb(0 0 0 / .55); animation: bt-saaf-fade .15s ease; }
        @keyframes bt-saaf-fade { from { opacity: 0; } }
        .bt-saaf { width: 360px; padding: 18px; border-radius: 16px; background: var(--background-floating, #111214); border: 1px solid rgb(255 255 255 / .08);
            box-shadow: 0 20px 50px rgb(0 0 0 / .5); color: var(--text-normal, #dbdee1); font: 14px/1.35 var(--font-primary, "gg sans", sans-serif); }
        .bt-saaf h3 { margin: 0 0 4px; font: 800 18px var(--font-display, var(--font-primary, sans-serif)); color: var(--header-primary, #f2f3f5); }
        .bt-saaf p { margin: 0 0 14px; font-size: 12.5px; color: var(--text-muted, #949ba4); }
        .bt-saaf label { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 8px; border-radius: 10px; background: var(--background-secondary, #2b2d31); cursor: pointer; }
        .bt-saaf label:has(input:checked) { box-shadow: inset 0 0 0 2px var(--brand-500, #5865f2); }
        .bt-saaf input[type=number] { width: 80px; height: 28px; padding: 0 8px; border-radius: 6px; border: 1px solid rgb(255 255 255 / .12); background: #1e1f22;
            color: #f2f3f5; font: 600 13px var(--font-primary, sans-serif); color-scheme: dark; }
        .bt-saaf-btns { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
        .bt-saaf-btns button { height: 34px; padding: 0 16px; border: 0; border-radius: 8px; cursor: pointer; font: 700 13px var(--font-primary, sans-serif); color: #fff; background: #4e5058; }
        .bt-saaf-btns button.bt-saaf-go { background: #da373c; }
        .bt-saaf-btns button:hover { filter: brightness(1.1); }
        .bt-saaf-run { position: fixed; z-index: 100006; right: 18px; bottom: 18px; width: 280px; padding: 12px 14px; border-radius: 14px;
            background: var(--background-floating, #111214); border: 1px solid rgb(255 255 255 / .1); box-shadow: 0 12px 30px rgb(0 0 0 / .45);
            color: var(--text-normal, #dbdee1); font: 13px/1.35 var(--font-primary, sans-serif); }
        .bt-saaf-run b { display: block; color: var(--header-primary, #f2f3f5); margin-bottom: 4px; }
        .bt-saaf-bar { height: 6px; margin: 8px 0; border-radius: 3px; background: rgb(255 255 255 / .1); overflow: hidden; }
        .bt-saaf-bar div { height: 100%; width: 0; background: #da373c; transition: width .3s; }
        .bt-saaf-bar.bt-saaf-all div { width: 35%; animation: bt-saaf-slide 1.2s linear infinite; }
        @keyframes bt-saaf-slide { from { transform: translateX(-100%); } to { transform: translateX(300%); } }
        .bt-saaf-run button { height: 28px; padding: 0 12px; border: 0; border-radius: 7px; background: #4e5058; color: #fff; font: 700 12px var(--font-primary, sans-serif); cursor: pointer; }
    `,

    start(api) {
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        let job = null;

        const channelFrom = target => {
            const a = target?.closest?.('a[href*="/channels/"]');
            const m = a && /\/channels\/(@me|\d+)\/(\d+)/.exec(a.getAttribute("href") || "");
            if (m) return { guildId: m[1] === "@me" ? null : m[1], channelId: m[2] };
            const item = target?.closest?.("[data-list-item-id]");
            const n = item && /(?:channels|private-channels-uid_\d+)___(\d{15,22})/.exec(item.getAttribute("data-list-item-id") || "");
            return n ? { guildId: null, channelId: n[1] } : null;
        };
        const nameOf = id => {
            try {
                const ch = api.discord.store("ChannelStore")?.getChannel(id);
                if (!ch) return "this chat";
                if (ch.name) return ch.guild_id ? `#${ch.name}` : ch.name;
                const users = (ch.recipients || []).map(r => api.discord.store("UserStore")?.getUser(r)).filter(Boolean);
                return users.map(u => u.globalName || u.global_name || u.username).join(", ") || "this DM";
            } catch { return "this chat"; }
        };

        api.contextMenu("*", ({ target, navId }) => {
            if (!/channel|user|gdm|thread/i.test(navId)) return [];
            const where = channelFrom(target);
            if (!where) return [];
            return [{ label: "Saaf karo", danger: true, action: () => ask(where) }];
        });

        function ask(where) {
            if (job) return api.toast("DMS Saaf is already cleaning a chat. Stop it first.");
            const name = nameOf(where.channelId);
            const back = api.el("div", { className: "bt-saaf-back" });
            const box = api.el("div", { className: "bt-saaf" });
            const some = api.el("input", { type: "radio", name: "bt-saaf-mode", checked: true });
            const all = api.el("input", { type: "radio", name: "bt-saaf-mode" });
            const count = api.el("input", { type: "number", min: 1, max: 100000, value: 50 });
            count.addEventListener("focus", () => { some.checked = true; });
            for (const t of ["keydown", "keyup", "keypress"]) count.addEventListener(t, e => e.stopPropagation());
            const l1 = api.el("label");
            l1.append(some, api.el("span", { textContent: "My last" }), count, api.el("span", { textContent: "messages" }));
            const l2 = api.el("label");
            l2.append(all, api.el("span", { textContent: "All my messages here" }));
            const cancel = api.el("button", { type: "button", textContent: "Cancel" });
            const go = api.el("button", { type: "button", className: "bt-saaf-go", textContent: "Saaf karo" });
            const btns = api.el("div", { className: "bt-saaf-btns" });
            btns.append(cancel, go);
            box.append(api.el("h3", { textContent: `Saaf karo: ${name}` }),
                api.el("p", { textContent: "Deletes only messages you sent, newest first. This can't be undone." }), l1, l2, btns);
            back.append(box);
            document.body.append(back);
            const close = () => back.remove();
            cancel.onclick = close;
            back.onclick = e => { if (e.target === back) close(); };
            go.onclick = () => {
                const limit = all.checked ? Infinity : Math.max(1, Math.floor(Number(count.value) || 0));
                close();
                run(where.channelId, name, limit);
            };
            count.focus();
        }

        let panel = null;
        const drawPanel = () => {
            if (!job) { panel?.remove(); panel = null; return; }
            if (!panel) { panel = api.el("div", { className: "bt-saaf-run" }); document.body.append(panel); }
            const finite = Number.isFinite(job.limit);
            const bar = api.el("div", { className: `bt-saaf-bar${finite ? "" : " bt-saaf-all"}` });
            const fill = api.el("div");
            if (finite) fill.style.width = `${Math.min(100, (job.deleted / job.limit) * 100)}%`;
            bar.append(fill);
            const stop = api.el("button", { type: "button", textContent: job.stop ? "Stopping…" : "Stop" });
            stop.onclick = () => { if (job) { job.stop = true; drawPanel(); } };
            panel.replaceChildren(api.el("b", { textContent: `Saaf karo: ${job.name}` }),
                api.el("span", { textContent: `Deleted ${job.deleted}${finite ? ` of ${job.limit}` : ""} · checked ${job.scanned} messages${job.wait ? ` · Discord asked to wait ${job.wait}s` : ""}` }),
                bar, stop);
        };
        async function del(channelId, messageId) {
            for (let attempt = 0; attempt < 5; attempt++) {
                try {
                    await api.discord.rest.del(`/channels/${channelId}/messages/${messageId}`);
                    return true;
                } catch (error) {
                    if (error.status === 429) {
                        const wait = Math.ceil(Number(error.data?.retry_after) || 2) + 1;
                        job.wait = wait; drawPanel();
                        await sleep(wait * 1000);
                        job.wait = 0;
                        continue;
                    }
                    if (error.status === 404) return true;
                    return false;
                }
            }
            return false;
        }
        async function run(channelId, name, limit) {
            const me = api.discord.currentUser()?.id;
            if (!me) return api.toast("Couldn't tell which account you're on.");
            job = { channelId, name, limit, deleted: 0, scanned: 0, stop: false, wait: 0 };
            drawPanel();
            let before = "";
            try {
                outer: while (!job.stop && job.deleted < limit) {
                    let batch;
                    try {
                        batch = await api.discord.rest.get(`/channels/${channelId}/messages?limit=100${before ? `&before=${before}` : ""}`);
                    } catch (error) {
                        if (error.status === 429) { await sleep((Math.ceil(Number(error.data?.retry_after) || 2) + 1) * 1000); continue; }
                        throw error;
                    }
                    if (!Array.isArray(batch) || !batch.length) break;
                    before = batch[batch.length - 1].id;
                    for (const m of batch) {
                        job.scanned++;
                        if (job.stop || job.deleted >= limit) break outer;
                        if (m.author?.id !== me) continue;
                        if (await del(channelId, m.id)) job.deleted++;
                        drawPanel();
                        await sleep(Math.max(400, Number(api.settings.delay) || 1100));
                    }
                    drawPanel();
                }
                api.toast(`Saaf: deleted ${job.deleted} of your messages in ${name}.${job.stop ? " (stopped)" : ""}`, 5000);
            } catch (error) {
                api.toast(`DMS Saaf stopped: ${error.message || error}`, 6000);
            } finally {
                job = null;
                drawPanel();
            }
        }

        api.onDispose(() => { if (job) job.stop = true; panel?.remove(); document.querySelectorAll(".bt-saaf-back").forEach(b => b.remove()); });
    },
});
