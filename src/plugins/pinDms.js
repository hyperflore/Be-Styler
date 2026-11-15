const DM_ROW = '[data-list-item-id^="private-channels-"]';
const isId = value => /^\d{1,25}$/.test(String(value));

BThemer.definePlugin({
    id: "pinDms",
    name: "Pin DMs",
    description: "Pin direct messages for quick access from the sidebar and Quick actions.",
    author: "Be Themer",
    version: "1.0.0",

    css: `
        ${DM_ROW} { position: relative; }
        .bt-pin-dm-toggle { position: absolute; top: 50%; right: 5px; z-index: 2; width: 26px; height: 26px; transform: translateY(-50%); border: 0; border-radius: 5px; background: var(--background-secondary); color: var(--interactive-normal); cursor: pointer; opacity: 0; }
        ${DM_ROW}:hover .bt-pin-dm-toggle, .bt-pin-dm-toggle:focus-visible { opacity: 1; }
        .bt-pin-dm-toggle[data-pinned="true"] { color: var(--bt-accent, var(--text-positive)); opacity: 1; }
        .bt-pin-dm-list { display: flex; flex-direction: column; gap: 6px; min-width: 260px; }
        .bt-pin-dm-entry { display: flex; align-items: center; gap: 6px; }
        .bt-pin-dm-open { flex: 1; min-width: 0; overflow: hidden; text-align: left; text-overflow: ellipsis; white-space: nowrap; }
    `,

    start(api) {
        let pins = new Set();
        let listWindow = null;

        const channelName = id => {
            try {
                const channel = api.discord.store("ChannelStore")?.getChannel(id);
                if (channel?.name) return channel.name;
                const recipientId = channel?.recipients?.[0] || Object.keys(channel?.recipientIds || {})[0];
                const user = recipientId && api.discord.store("UserStore")?.getUser(recipientId);
                return user?.globalName || user?.global_name || user?.username || `Direct message ${id}`;
            } catch {
                return `Direct message ${id}`;
            }
        };

        const openDm = id => {
            if (!isId(id)) return;
            history.pushState({}, "", `/channels/@me/${id}`);
            dispatchEvent(new PopStateEvent("popstate"));
        };

        const refreshButtons = () => {
            for (const row of document.querySelectorAll(DM_ROW)) {
                const id = /^(?:private-channels-)(\d+)$/.exec(row.getAttribute("data-list-item-id") || "")?.[1];
                if (!id) continue;
                let button = row.querySelector(":scope > .bt-pin-dm-toggle");
                if (!button) {
                    button = api.el("button", { className: "bt-pin-dm-toggle", type: "button" });
                    button.addEventListener("click", event => {
                        event.preventDefault();
                        event.stopPropagation();
                        togglePin(button.dataset.channelId);
                    });
                    row.append(button);
                }
                button.dataset.channelId = id;
                button.dataset.pinned = String(pins.has(id));
                button.textContent = pins.has(id) ? "★" : "☆";
                button.title = pins.has(id) ? "Unpin direct message" : "Pin direct message";
                button.setAttribute("aria-label", button.title);
            }
        };

        const renderPinned = () => {
            if (!listWindow) return;
            listWindow.replaceChildren();
            const ids = [...pins];
            if (!ids.length) {
                listWindow.append(api.el("div", { className: "bt-empty", textContent: "No pinned direct messages." }));
                return;
            }
            for (const id of ids) {
                const entry = api.el("div", { className: "bt-pin-dm-entry" });
                const open = api.el("button", { className: "bt-btn bt-pin-dm-open", type: "button", textContent: channelName(id), title: channelName(id) });
                open.addEventListener("click", () => openDm(id));
                const unpin = api.el("button", { className: "bt-btn", type: "button", textContent: "Remove", title: "Unpin direct message" });
                unpin.addEventListener("click", () => togglePin(id));
                entry.append(open, unpin);
                listWindow.append(entry);
            }
        };

        const togglePin = id => {
            if (!isId(id)) return;
            if (pins.has(id)) pins.delete(id);
            else pins.add(id);
            api.storage.set("channels", [...pins]).catch(error => api.warn("Couldn't save pinned DMs:", error));
            refreshButtons();
            renderPinned();
        };

        const showPinned = () => {
            listWindow = api.el("div", { className: "bt-pin-dm-list" });
            renderPinned();
            api.openWindow("Pinned DMs", listWindow);
        };

        api.storage.get("channels").then(saved => {
            if (Array.isArray(saved)) pins = new Set(saved.map(String).filter(isId));
            refreshButtons();
        }).catch(error => api.warn("Couldn't load pinned DMs:", error));

        api.observe(DM_ROW, refreshButtons);
        const timer = setInterval(refreshButtons, 1500);
        api.onDispose(() => {
            clearInterval(timer);
            document.querySelectorAll(".bt-pin-dm-toggle").forEach(button => button.remove());
        });
        api.addMenuItem("Pinned DMs", showPinned);
        refreshButtons();
    },
});