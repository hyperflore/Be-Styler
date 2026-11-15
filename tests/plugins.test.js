const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = process.argv[2] || path.resolve(__dirname, "..");
const { variantFor } = require("./variant");
const V = variantFor(ROOT);
const renderer = fs.readFileSync(`${ROOT}/dist/renderer.js`, "utf8");

const results = [];
const ok = (name, cond, extra = "") => results.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
const sleep = ms => new Promise(r => setTimeout(r, ms));
class Sheet { constructor() { this.text = ""; this.disabled = false; } replaceSync(t) { this.text = t; } }

const html = `<!doctype html><html><head><title>Discord | #general | Example Server</title></head><body>
<nav class="guilds_x"></nav>
<ol>
  <li class="messageListItem_x" id="chat-messages-1-100">
    <div class="message_x groupStart_x">
      <img class="avatar_x" src="https://cdn.discordapp.com/avatars/55/abc.webp">
      <h3 class="header_x"><span><span class="username_x">Tone</span></span> <time datetime="2026-11-13T00:01:02.000Z">Today at 12:01 AM</time></h3>
      <div id="message-content-100">see https://example.com/page?utm_source=x&id=7 bye</div>
      <div class="buttonsInner_x"><div>👍</div></div>
    </div>
  </li>
  <li class="messageListItem_x" id="chat-messages-1-101"><div class="message_x"><div id="message-content-101">mine</div></div></li>
</ol>
<div class="membersWrap_x"><div class="members_x">
  <div class="member_x"><img class="avatar_x" src="https://cdn.discordapp.com/avatars/55/abc.webp"><div class="name_x">Tone</div></div>
</div></div>
</body></html>`;

(async () => {
    const dom = new JSDOM(html, { url: "https://discord.com/channels/9/1", runScripts: "outside-only", pretendToBeVisual: true });
    const w = dom.window;
    w.CSSStyleSheet = Sheet;
    let adopted = [];
    Object.defineProperty(w.document, "adoptedStyleSheets", { get: () => adopted, set: v => (adopted = [...v]) });
    w.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: () => () => {} });
    w.indexedDB = { open() { const r = {}; setTimeout(() => r.onerror && r.onerror()); return r; } };
    const copied = [];
    w.DiscordNative = { clipboard: { copy: t => copied.push(t) } };
    w.BThemerNative = {
        getState: () => ({ version: "t", dataDir: "", quickCss: "", themes: [], settings: {} }),
        setSettings: () => Promise.resolve(true), setQuickCss: () => Promise.resolve(true),
        openPath: () => Promise.resolve(""), fetchImage: () => Promise.reject(new Error("x")),
        reloadPlugins: () => {}, onThemesChanged: () => {}, onRendererChanged: () => {},
    };
    const css = () => w.document.adoptedStyleSheets.filter(s => !s.disabled).map(s => s.text).join("\n");

    const discordFake = `
      (() => {
        const modules = {}, cache = {};
        const req = id => { if (cache[id]) return cache[id].exports; const m = (cache[id] = { exports: {} }); modules[id].call(m.exports, m, m.exports, req); return m.exports; };
        req.c = cache;
        const jsonp = (parent, data) => { for (const k in data[1]) modules[k] = data[1][k]; if (typeof data[2] === "function") data[2](req); if (parent) parent(data); };
        const g = (self.webpackChunkdiscord_app = self.webpackChunkdiscord_app || []);
        g.forEach(jsonp.bind(null, 0));
        g.push = jsonp.bind(null, g.push.bind(g));
        window.__req = req;
      })();
      (self.webpackChunkdiscord_app = self.webpackChunkdiscord_app || []).push([[1], {
        20: function (e, t) {
          const messages = { "1:100": { id: "100", content: "original text", author: { id: "55", username: "Tone" }, attachments: [] },
                             "1:101": { id: "101", content: "mine", author: { id: "77", username: "Me" }, attachments: [] },
                             "1:102": { id: "102", content: "theirs", author: { id: "55", username: "Tone" }, attachments: [] },
                             "2:103": { id: "103", content: "elsewhere", author: { id: "55", username: "Tone" }, attachments: [] } };
          class Store { constructor(n) { this.n = n; } getName() { return this.n; } }
          const MessageStore = Object.assign(new Store("MessageStore"), { getMessage: (c, m) => messages[c + ":" + m] || null });
          const UserStore = Object.assign(new Store("UserStore"), { getCurrentUser: () => ({ id: "77" }) });
          const ChannelStore = Object.assign(new Store("ChannelStore"), { getChannel: id => ({ id, name: id === "2" ? "other" : "general", guild_id: "9" }) });
          const PresenceStore = Object.assign(new Store("PresenceStore"), { getState: () => ({ clientStatuses: { 55: { desktop: "online", mobile: "idle" } } }) });
          const GuildMemberCountStore = Object.assign(new Store("GuildMemberCountStore"), { getMemberCount: () => 1234, getOnlineCount: () => 56 });
          const subs = {};
          const Dispatcher = {
            _subscriptions: subs, register() {},
            _interceptors: [],
            addInterceptor(f) { this._interceptors.push(f); },
            dispatch(a) {
              if (Dispatcher._interceptors.some(f => f(a))) return; // like Discord: true = dropped
              if (a.type === "MESSAGE_DELETE") delete messages[a.channelId + ":" + a.id];
              if (a.type === "MESSAGE_UPDATE") messages[a.message.channel_id + ":" + a.message.id].content = a.message.content;
              (subs[a.type] || []).forEach(f => f(a));
              window.__dispatched = (window.__dispatched || []).concat(a.type);
            },
            subscribe(t, f) { (subs[t] = subs[t] || []).push(f); },
            unsubscribe(t, f) { subs[t] = (subs[t] || []).filter(x => x !== f); },
          };
          window.__earlyDispatch = Dispatcher.dispatch.bind(Dispatcher); // e.g. the gateway, captured before Be Themer hooks in
          // Discord's ComponentDispatch: a UI event bus that also has dispatch / subscribe / unsubscribe (but no register).
          // Listed first, as it can be in Discord's modules: picking it meant deletes were never seen.
          t.ComponentDispatch = { _subscriptions: {}, _savedDispatches: {}, dispatch() {}, subscribe() {}, unsubscribe() {} };
          MessageStore._dispatcher = Dispatcher; // Discord's stores keep their dispatcher (this._dispatcher)
          Object.defineProperty(t, "Z", { enumerable: true, get: () => Dispatcher });
          Object.assign(t, { MessageStore, UserStore, ChannelStore, PresenceStore, GuildMemberCountStore });
          window.__messages = messages;
        },
      }]);
    `;
    w.eval(renderer);
    w.eval(discordFake);
    w.__req(20);
    const B = w.BThemer;
    await sleep(50);
    const D = w.__req(20).Z;

    if (V.hasPlugin("messageLogger")) {
        B.plugins.enable("messageLogger");
        await sleep(30);
        D.dispatch({ type: "MESSAGE_UPDATE", message: { id: "100", channel_id: "1", content: "edited text", edited_timestamp: "2026-11-13T00:05:00.000Z" } });
        await sleep(40);
        const editsBox = w.document.querySelector('.bt-ml-edits[data-id="100"]');
        ok("logger: earlier version shown above the message", !!editsBox && editsBox.nextElementSibling === w.document.getElementById("message-content-100") && editsBox.textContent.includes("original text") && editsBox.textContent.includes("(edited)"));
        D.dispatch({ type: "MESSAGE_DELETE", id: "100", channelId: "1" });
        await sleep(40);
        ok("logger: delete is intercepted (message stays in the store)", !!w.__messages["1:100"] && !(w.__dispatched || []).includes("MESSAGE_DELETE"));
        ok("logger: deleted message styled (red text by default)", css().includes("#chat-messages-1-100") && css().includes("--text-default: var(--status-danger"));
        ok("logger: toolbar buttons hidden on deleted message", css().includes('[class*="buttonsInner_"] [role="button"]:not(.bt-ml-clear)'));
        w.__dispatched = [];
        D.dispatch({ type: "MESSAGE_DELETE", id: "101", channelId: "1" });
        await sleep(40);
        ok("logger: own messages are kept too by default (ignoreSelf off)", !!w.__messages["1:101"] && css().includes("#chat-messages-1-101"));
        {
            const target = w.document.querySelector("#chat-messages-1-100 #message-content-100") || w.document.getElementById("message-content-100");
            target.dispatchEvent(new w.MouseEvent("contextmenu", { bubbles: true }));
            const menu = w.document.createElement("div");
            menu.setAttribute("role", "menu");
            menu.id = "message";
            menu.innerHTML = '<div class="scroller_x">'
                + '<div role="group" class="quickReactions_x" style="display:flex;flex-direction:row"><div role="menuitem" class="reaction_x" id="message-quick-1"><img class="emoji" alt="🌈"></div><div role="menuitem" class="reaction_x" id="message-quick-2"><img class="emoji" alt="💀"></div></div>'
                + '<div class="separator_x"></div>'
                + '<div role="group" class="group_x"><div role="menuitem" class="item_x" id="message-reply"><div class="label_x">Reply</div></div><div role="menuitem" class="item_x" id="message-copy-link"><div class="label_x">Copy Message Link</div></div></div></div>';
            w.document.body.append(menu);
            await sleep(20);
            const item = menu.querySelector('[id="message-ml-remove-history"]');
            ok("logger: right-click a deleted message → Clear Message Log, in red (and visible)", item && item.textContent === "Clear Message Log" && item.classList.contains("bt-menuitem-danger") && item.style.display !== "none", item ? item.outerHTML.slice(0, 160) : menu.innerHTML.slice(0, 300));
            const ourGroup = item && item.parentElement;
            ok("menus: our items are one-line items like Copy Message Link (not copied from the quick-reactions row)", item && item.classList.contains("item_x") && !item.classList.contains("reaction_x") && item.querySelector(".label_x") && ourGroup.classList.contains("group_x") && !ourGroup.classList.contains("quickReactions_x") && ourGroup.style.flexDirection !== "row", item ? item.outerHTML.slice(0, 200) : "");
            menu.remove();
        }
        const clearBtn = w.document.querySelector("#chat-messages-1-100 .bt-ml-clear");
        ok("logger: Clear history button in the toolbar", !!clearBtn);
        clearBtn && clearBtn.click();
        await sleep(40);
        ok("logger: clearing a deleted message really removes it", !w.__messages["1:100"] && !css().includes("#chat-messages-1-100"));
        B.settings.plugins.messageLogger.settings.deleteStyle = "overlay";
        B.plugins.disable("messageLogger");
        B.plugins.enable("messageLogger");
        await sleep(30);
        D.dispatch({ type: "MESSAGE_DELETE", id: "101", channelId: "1" });
        await sleep(40);
        ok("logger: overlay style option", css().includes("#chat-messages-1-101") && css().includes("background-color: color-mix"));
        w.__earlyDispatch({ type: "MESSAGE_DELETE", id: "102", channelId: "1" });
        await sleep(40);
        ok("logger: someone else's delete is caught on every dispatch path", !!w.__messages["1:102"] && css().includes("#chat-messages-1-102"));
        w.__earlyDispatch({ type: "MESSAGE_DELETE", id: "103", channelId: "2" });
        await sleep(40);

        const rightClick = async (navId, listItemId) => {
            const t = w.document.createElement("div");
            t.setAttribute("data-list-item-id", listItemId);
            w.document.body.append(t);
            t.dispatchEvent(new w.MouseEvent("contextmenu", { bubbles: true }));
            const menu = w.document.createElement("div");
            menu.setAttribute("role", "menu");
            menu.id = navId;
            menu.innerHTML = `<div class="scroller_x"><div role="group"><div role="menuitem" class="item_x" id="${navId}-mark-read"><div class="label_x">Mark As Read</div></div></div></div>`;
            w.document.body.append(menu);
            await sleep(20);
            return menu.querySelector(`[id="${navId}-ml-clear-channel"]`);
        };
        let clearItem = await rightClick("channel-context", "channels___1");
        ok("logger: right-click a channel → Clear Message Logs with a count", clearItem && clearItem.textContent === "Clear Message Logs (2)", clearItem && clearItem.textContent);
        clearItem.click();
        await sleep(40);
        ok("logger: one click clears every logged message in that channel", !w.__messages["1:101"] && !w.__messages["1:102"] && !css().includes("#chat-messages-1-101") && !css().includes("#chat-messages-1-102") && !!w.__messages["2:103"]);
        clearItem = await rightClick("channel-context", "channels___1");
        ok("logger: nothing logged → still listed, greyed out", clearItem && clearItem.textContent === "Clear Message Logs (none)" && clearItem.getAttribute("aria-disabled") === "true");
        clearItem = await rightClick("gdm-context", "private-channels-uid_1___2");
        ok("logger: right-click a DM / group DM", clearItem && clearItem.textContent === "Clear Message Logs (1)", clearItem && clearItem.textContent);
        clearItem = await rightClick("guild-context", "guildsnav___9");
        ok("logger: right-click a server → its logs", clearItem && clearItem.textContent === "Clear Message Logs (1)", clearItem && clearItem.textContent);
        clearItem.click();
        await sleep(40);
        ok("logger: server's logs cleared at once", !w.__messages["2:103"] && !css().includes("#chat-messages-2-103"));

        const quickTitles = () => [...(w.document.querySelectorAll(".bt-quick-actions button"))].map(b => b.textContent);
        B.open("general");
        await sleep(20);
        ok("logger: optional saved log in quick actions", quickTitles().some(x => x.includes("Deleted message log")), quickTitles().join(" | "));
        ok("logger: Clear all message logs in quick actions", quickTitles().includes("Clear all message logs"));

    }
    if (V.hasPlugin("meowSoundboard")) {
        const tileWrap = w.document.createElement("div");
        tileWrap.innerHTML = '<div class="tile_q"><div class="avatarWrap_q"><img class="avatar_q" src="https://cdn.discordapp.com/avatars/55/abc.webp"></div></div>' +
            '<div class="tile_q" id="other-tile"><img src="https://cdn.discordapp.com/avatars/66/def.webp"></div>';
        w.document.body.append(tileWrap);
        const tile55 = tileWrap.querySelector(".tile_q");
        ok("soundboard glow: pink rules in the theme variables", css().includes(".bt-sb-playing, .bt-sb-playing * { --status-speaking: #ff5fa2 !important;") && css().includes("@keyframes bt-sb-glow") && css().includes("--bt-sb-ring: #ff5fa2;"));
        D.dispatch({ type: "GUILD_SOUNDBOARD_SOUND_PLAY_START", soundId: "999", userId: "55" });
        await sleep(30);
        ok("soundboard glow: their tile and avatar light up while it plays", tile55.classList.contains("bt-sb-playing") && tile55.querySelector("img").classList.contains("bt-sb-playing") && !w.document.getElementById("other-tile").classList.contains("bt-sb-playing"));
        tile55.className = "tile_q";
        await sleep(300);
        ok("soundboard glow: survives Discord re-rendering the tile", tile55.classList.contains("bt-sb-playing"));
        D.dispatch({ type: "GUILD_SOUNDBOARD_SOUND_PLAY_END", soundId: "999", userId: "55" });
        await sleep(30);
        ok("soundboard glow: gone when the sound ends", !w.document.querySelector(".bt-sb-playing"));
        tileWrap.remove();

    }
    const xhr = (method, url, body) => new Promise(resolve => {
        const x = new w.XMLHttpRequest();
        x.open(method, url);
        x.onload = () => resolve({ status: x.status, sent: true });
        x.onerror = () => resolve({ status: x.status, error: true });
        x.send(body);
    });
    if (V.hasPlugin("silentTyping") && V.hasPlugin("noTrack")) {

        B.plugins.enable("silentTyping");
        await sleep(10);
        const typing = await xhr("POST", "/api/v9/channels/1/typing");
        ok("silent typing: typing request answered locally (204)", typing.status === 204);

        B.plugins.enable("noTrack");
        await sleep(10);
        const science = await xhr("POST", "/api/v9/science", "{}");
        ok("no track: analytics request blocked (204)", science.status === 204);

    }
    {
        w.document.body.insertAdjacentHTML("beforeend", '<div class="bar_x"><div class="leading_x">back</div><div class="trailing_x"><div class="winButton_x" aria-label="Minimize"></div><div class="winButton_x" aria-label="Maximize"></div><div class="winButton_x" aria-label="Close"></div></div></div>');
        const calls = [];
        const nativeBefore = w.DiscordNative;
        w.DiscordNative = { ...(nativeBefore || {}), window: { minimize: () => calls.push("minimize"), maximize: () => calls.push("maximize"), close: () => calls.push("close") } };
        B.plugins.enable("macmize");
        await sleep(30);
        const mac = w.document.querySelector(".bt-mac");
        const lights = mac ? [...mac.querySelectorAll("button")].map(b => b.getAttribute("aria-label")) : [];
        ok("macmize: red, yellow, green traffic lights (Close, Minimise, Zoom)", lights.join() === "Close,Minimise,Zoom" && [".bt-mac-close", ".bt-mac-minimize", ".bt-mac-zoom"].every(c => mac.querySelector(c)), lights.join());
        ok("macmize: red, yellow and green, Discord's own window buttons hidden", css().includes("background: #ff5f57") && css().includes("background: #febc2e") && css().includes("background: #28c840") && css().includes('[class*="winButton"] { display: none !important; }'));
        ok("macmize: never part of the window-drag area", css().includes("-webkit-app-region: no-drag"));
        for (const id of ["minimize", "zoom", "close"]) mac.querySelector(".bt-mac-" + id).click();
        await sleep(20);
        ok("macmize: they minimise, maximise and close Discord's window", calls.join() === "minimize,maximize,close", calls.join());
        w.dispatchEvent(new w.Event("blur"));
        ok("macmize: grey while Discord isn't the active window", mac.classList.contains("bt-mac-inactive"));
        B.plugins.disable("macmize");
        await sleep(20);
        ok("macmize: turning it off brings Discord's buttons back", !w.document.querySelector(".bt-mac") && !css().includes('[class*="winButton"] { display: none !important; }'));
        if (nativeBefore) w.DiscordNative = nativeBefore; else delete w.DiscordNative;
        w.document.querySelector(".bar_x").remove();
    }
    if (V.hasPlugin("clearUrls")) {
        B.plugins.enable("clearUrls");
        let sentBody = null;
        B.definePlugin({ id: "spy", enabledByDefault: true, start(api) { api.net.onRequest(r => { if (/\/messages$/.test(r.url)) { sentBody = r.body; return { block: true }; } }); } });
        await sleep(10);
        await xhr("POST", "/api/v9/channels/1/messages", JSON.stringify({ content: "look https://www.youtube.com/watch?v=abc&si=TRACK and https://x.com/a/status/1?s=20&t=xyz ok https://example.com/?utm_source=a&utm_medium=b", nonce: "1" }));
        const content = sentBody && JSON.parse(sentBody).content;
        ok("clear urls: tracking params removed, real ones kept", content === "look https://www.youtube.com/watch?v=abc and https://x.com/a/status/1 ok https://example.com/", content);

    }
    if (V.hasPlugin("exactTimestamps")) {
        B.plugins.enable("exactTimestamps");
        await sleep(20);
        const time = w.document.querySelector("time");
        ok("exact timestamps: full time attached", /\d{1,2}:\d{2}:\d{2}/.test(time.getAttribute("data-bt-exact") || ""), time.getAttribute("data-bt-exact"));
        ok("exact timestamps: hover CSS", css().includes('[class*="message_"]:hover h3 time[data-bt-exact]::after'));

    }
    if (V.hasPlugin("copyRaw")) {
        B.plugins.enable("copyRaw");
        await sleep(20);
        const btn = w.document.querySelector("#chat-messages-1-101 .bt-copy-raw") || w.document.querySelector(".bt-copy-raw");
        ok("copy raw: button added to the message toolbar", !!btn);
        btn.click();
        ok("copy raw: copies the message text (store, or what is shown once Message Logger cleared it)", String(copied.at(-1)).includes("see https://example.com") || copied.at(-1) === "edited text", copied.at(-1));
        btn.dispatchEvent(new w.MouseEvent("click", { shiftKey: true, bubbles: true }));
        ok("copy raw: shift+click copies the id", copied.at(-1) === "100");

    }
    if (V.hasPlugin("platformIndicators")) {
        B.plugins.enable("platformIndicators");
        await sleep(400);
        const badges = [...w.document.querySelectorAll(".bt-platforms")];
        ok("platform indicators: shown in chat and member list", badges.length === 2 && badges.every(b => b.querySelectorAll(".bt-platform svg").length === 2 && /Desktop/.test(b.title) && /Mobile/.test(b.title)), String(badges.length));

    }
    if (V.hasPlugin("memberCount")) {
        B.plugins.enable("memberCount");
        await sleep(20);
        const count = w.document.querySelector(".bt-member-count");
        ok("member count: shown on top of the member list", count && /1,234 members/.test(count.textContent) && /56 online/.test(count.textContent), count && count.textContent);

    }
    for (const id of ["copyRaw", "platformIndicators", "memberCount", "exactTimestamps"]) B.plugins.disable(id);
    await sleep(20);
    ok("disabling removes everything they added", !w.document.querySelector(".bt-copy-raw, .bt-platforms, .bt-member-count, [data-bt-exact]"));
    B.plugins.disable("silentTyping");
    await sleep(10);
    const typing2 = await xhr("POST", "/api/v9/channels/1/typing");
    ok("silent typing off: request goes out normally again", typing2.status !== 204);

    if (V.hasPlugin("messageLogger")) {
        {
            const late = new JSDOM(html, { url: "https://discord.com/channels/9/1", runScripts: "outside-only", pretendToBeVisual: true });
            const lw = late.window;
            lw.CSSStyleSheet = Sheet;
            let lAdopted = [];
            Object.defineProperty(lw.document, "adoptedStyleSheets", { get: () => lAdopted, set: v => (lAdopted = [...v]) });
            lw.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: () => () => {} });
            lw.indexedDB = { open() { const r = {}; setTimeout(() => r.onerror && r.onerror()); return r; } };
            lw.BThemerNative = { ...w.BThemerNative, getState: () => ({ version: "t", dataDir: "", quickCss: "", themes: [], settings: { plugins: { messageLogger: { enabled: true } } } }) };
            lw.eval(`(() => {
              const cache = { 1: { exports: { unrelated: true } } };
              const req = id => cache[id] && cache[id].exports; req.c = cache;
              const g = (self.webpackChunkdiscord_app = self.webpackChunkdiscord_app || []);
              const parent = g.push.bind(g);
              g.push = data => { if (typeof data[2] === "function") data[2](req); return parent(data); };
            })()`);
            lw.eval(discordFake);
            lw.eval(renderer);
            await sleep(30);
            lw.__req(20);
            await sleep(700);
            const LD = lw.__req(20).Z;
            LD.dispatch({ type: "MESSAGE_DELETE", id: "102", channelId: "1" });
            await sleep(60);
            const lcss = lAdopted.filter(x => !x.disabled).map(x => x.text).join("\n");
            ok("logger: works when Discord loaded its modules before Be Themer started, with several webpack runtimes (the deleted message stays, red)", !!lw.__messages["1:102"] && lcss.includes("#chat-messages-1-102"), JSON.stringify({ kept: !!lw.__messages["1:102"] }));
        }

    }
    console.log(results.join("\n"));
    console.log(`\n${results.filter(x => x.startsWith("PASS")).length}/${results.length} passed`);
    process.exit(results.some(r => r.startsWith("FAIL")) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
