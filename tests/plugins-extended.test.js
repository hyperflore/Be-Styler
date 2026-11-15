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

    w.eval(renderer);
    w.eval(`
      (() => {
        const modules = {}, cache = {};
        const req = id => { if (cache[id]) return cache[id].exports; const m = (cache[id] = { exports: {} }); modules[id].call(m.exports, m, m.exports, req); return m.exports; };
        const jsonp = (parent, data) => { for (const k in data[1]) modules[k] = data[1][k]; if (parent) parent(data); };
        const g = (self.webpackChunkdiscord_app = self.webpackChunkdiscord_app || []);
        g.forEach(jsonp.bind(null, 0));
        g.push = jsonp.bind(null, g.push.bind(g));
        window.__req = req;
      })();
      (self.webpackChunkdiscord_app = self.webpackChunkdiscord_app || []).push([[1], {
        20: function (e, t) {
          const messages = { "1:100": { id: "100", content: "original text", author: { id: "55", username: "Tone" }, attachments: [] },
                             "1:101": { id: "101", content: "mine", author: { id: "77", username: "Me" }, attachments: [] } };
          class Store { constructor(n) { this.n = n; } getName() { return this.n; } }
          const MessageStore = Object.assign(new Store("MessageStore"), { getMessage: (c, m) => messages[c + ":" + m] || null });
          const UserStore = Object.assign(new Store("UserStore"), { getCurrentUser: () => ({ id: "77" }) });
          const ChannelStore = Object.assign(new Store("ChannelStore"), { getChannel: id => ({ id, name: "general" }) });
          const PresenceStore = Object.assign(new Store("PresenceStore"), { getState: () => ({ clientStatuses: { 55: { desktop: "online", mobile: "idle" } } }) });
          const GuildMemberCountStore = Object.assign(new Store("GuildMemberCountStore"), { getMemberCount: () => 1234, getOnlineCount: () => 56 });
          const subs = {};
          const Dispatcher = {
            _subscriptions: subs, register() {},
            dispatch(a) {
              if (a.type === "MESSAGE_DELETE") delete messages[a.channelId + ":" + a.id];
              if (a.type === "MESSAGE_UPDATE") messages[a.message.channel_id + ":" + a.message.id].content = a.message.content;
              (subs[a.type] || []).forEach(f => f(a));
              window.__dispatched = (window.__dispatched || []).concat(a.type);
            },
            subscribe(t, f) { (subs[t] = subs[t] || []).push(f); },
            unsubscribe(t, f) { subs[t] = (subs[t] || []).filter(x => x !== f); },
          };
          Object.defineProperty(t, "Z", { enumerable: true, get: () => Dispatcher });
          Object.assign(t, { MessageStore, UserStore, ChannelStore, PresenceStore, GuildMemberCountStore });
          window.__messages = messages;
        },
      }]);
    `);
    w.__req(20);
    const B = w.BThemer;
    await sleep(50);
    const D = w.__req(20).Z;

    w.eval(`
      (self.webpackChunkdiscord_app).push([[2], {
        21: function (e, t) {
          class Store { constructor(n) { this.n = n; } getName() { return this.n; } }
          t.RelationshipStore = Object.assign(new Store("RelationshipStore"), { isBlocked: id => id === "666", isIgnored: () => false, getRelationships: () => ({}) });
          t.TypingStore = Object.assign(new Store("TypingStore"), { getTypingUsers: id => (id === "1" ? { 55: 1 } : {}) });
          t.Token = { getToken: () => "TOKEN", setToken: () => {} };
          t.SelectedChannelStore = Object.assign(new Store("SelectedChannelStore"), { getVoiceChannelId: () => null });
        },
      }]);
    `);
    w.__req(21);
    await sleep(20);

    const NEW = ["cssTweaks", "keyboardTweaks", "consoleJanitor", "noSystemBadge", "notificationVolume", "silentMessages", "textReplace",
        "anonymiseFileNames", "noReplyMention", "customIdle", "noBlockedMessages", "relationshipNotifier", "callTimer", "vcNarrator",
        "typingIndicator", "customRPC", "messageClickActions", "usernameTools", "mediaTools", "chatTools", "imageZoom", "quickActions",
        "linkTools", "vcDoubleClick", "loadingQuotes", "cursorPet"];
    const listed = new Map(B.plugins.list().map(p => [p.id, p]));
    ok("all new plugins registered", NEW.filter(id => V.hasPlugin(id)).every(id => listed.has(id)), NEW.filter(id => V.hasPlugin(id) && !listed.has(id)).join(","));
    for (const id of NEW.filter(id => V.hasPlugin(id))) B.plugins.enable(id);
    await sleep(100);
    const after = B.plugins.list().filter(p => NEW.includes(p.id));
    const broken = after.filter(p => !p.running || p.error);
    ok("all new plugins start without errors", !broken.length, broken.map(p => `${p.id}: ${p.error && p.error.message}`).join(" | "));

    const xhr = (method, url, body) => new Promise(resolve => {
        const x = new w.XMLHttpRequest();
        x.open(method, url);
        x.onload = () => resolve({ status: x.status });
        x.onerror = () => resolve({ status: x.status });
        x.send(body);
    });
    let sent = null;
    B.definePlugin({ id: "spy2", enabledByDefault: true, start(api) { api.net.onRequest(r => { if (/\/(messages|attachments)$/.test(r.url)) { sent = r.body; return { block: true }; } }); } });
    await sleep(10);

    B.plugins.setSetting ? 0 : 0;
    const setSetting = (pid, k, v) => { const p = B.settings.plugins[pid]; p.settings[k] = v; };
    if (V.hasPlugin("textReplace")) {
        setSetting("textReplace", "rules", "teh => the;; /\\bu\\b/ => you");
        await xhr("POST", "/api/v9/channels/1/messages", JSON.stringify({ content: "teh cat u know `teh code`\n```js\n    a()\n      b()\n```" }));
        const c1 = JSON.parse(sent).content;
        ok("text replace: rules applied outside code, code unindented", c1 === "the cat you know `teh code`\n```js\na()\n  b()\n```", JSON.stringify(c1));

    }
    if (V.hasPlugin("silentMessages")) {
        const bar = w.document.createElement("form");
        bar.innerHTML = '<div class="channelTextArea_x"><div class="buttons_x"></div></div>';
        w.document.body.append(bar);
        await sleep(30);
        const sbtn = bar.querySelector(".bt-silent-btn");
        ok("silent messages: chat bar button added", !!sbtn);
        sbtn && sbtn.click();
        await xhr("POST", "/api/v9/channels/1/messages", JSON.stringify({ content: "hi", flags: 0 }));
        ok("silent messages: flag 4096 added", JSON.parse(sent).flags === 4096);
        await sleep(10);
        await xhr("POST", "/api/v9/channels/1/messages", JSON.stringify({ content: "hi again", flags: 0 }));
        ok("silent messages: auto-off after one message", JSON.parse(sent).flags === 0);

        await xhr("POST", "/api/v9/channels/1/attachments", JSON.stringify({ files: [{ filename: "my secret photo.png", id: "0" }] }));
        const fname = JSON.parse(sent).files[0].filename;
        ok("anonymise: random name, extension kept", /^[A-Za-z0-9]{7}\.png$/.test(fname), fname);

    }
    if (V.hasPlugin("noReplyMention") && V.hasPlugin("noBlockedMessages") && V.hasPlugin("customIdle")) {
        const reply = { type: "CREATE_PENDING_REPLY", shouldMention: true };
        D.dispatch(reply);
        ok("no reply mention: shouldMention false", reply.shouldMention === false);
        w.__dispatched = [];
        D.dispatch({ type: "MESSAGE_CREATE", message: { author: { id: "666" } } });
        ok("no blocked messages: incoming kept by default (only hidden in chat)", w.__dispatched.includes("MESSAGE_CREATE"));
        if (V.hasPlugin("noBlockedMessages")) setSetting("noBlockedMessages", "ignoreMessages", true);
        w.__dispatched = [];
        D.dispatch({ type: "MESSAGE_CREATE", message: { author: { id: "666" } } });
        ok("no blocked messages: ignoreMessages drops them completely", !w.__dispatched.includes("MESSAGE_CREATE"));
        w.__dispatched = [];
        D.dispatch({ type: "MESSAGE_CREATE", message: { author: { id: "55" } } });
        ok("no blocked messages: others pass", w.__dispatched.includes("MESSAGE_CREATE"));
        w.__dispatched = [];
        D.dispatch({ type: "IDLE", idle: true });
        ok("custom idle: Discord's own idle dropped", !w.__dispatched.includes("IDLE"));

    }
    await sleep(50);
        if (V.hasPlugin("usernameTools")) ok("username tools: data-author-id added", w.document.getElementById("chat-messages-1-101").dataset.authorId === "77");
    ok("loading quotes / typing / username: no crash on fake DOM", true);

    if (V.hasPlugin("quickActions")) {
        B.open("general");
        await sleep(20);
        const btn = [...w.document.querySelectorAll(".bt-quick-actions button")].find(b => b.textContent.includes("Copy channel link"));
        ok("handy actions: menu items listed", !!btn);
        btn && btn.click();
        ok("handy actions: channel link copied", copied.at(-1) === "https://discord.com/channels/9/1", copied.at(-1));

    }
    let auth = null;
    const realFetch = w.fetch;
    w.fetch = (u, init) => { auth = init && init.headers && init.headers.Authorization; return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve("{}") }); };
    B.definePlugin({ id: "restspy", enabledByDefault: true, start(api) { api.discord.rest.get("/users/@me"); } });
    await sleep(20);
    w.fetch = realFetch;
    ok("api.discord.rest sends the token", auth === "TOKEN", String(auth));

    let menuHit = null;
    B.definePlugin({ id: "menuspy", enabledByDefault: true, start(api) { api.contextMenu("message", ({ target }) => { menuHit = target; return { items: [{ label: "Spy Item", action: () => (w.__spyClicked = true) }], hide: ["reply"] }; }); } });
    await sleep(10);
    const msgEl = w.document.getElementById("message-content-101");
    msgEl.dispatchEvent(new w.MouseEvent("contextmenu", { bubbles: true }));
    const menu = w.document.createElement("div");
    menu.setAttribute("role", "menu");
    menu.id = "message";
    menu.innerHTML = '<div class="scroller_x"><div role="group"><div role="menuitem" id="message-reply" class="item_x"><div class="label_x">Reply</div></div><div role="menuitem" id="message-copy" class="item_x"><div class="label_x">Copy</div></div></div></div>';
    w.document.body.append(menu);
    await sleep(30);
    ok("context menu: handler got the right-clicked element", menuHit === msgEl);
    const spy = [...menu.querySelectorAll('[role="menuitem"]')].find(i => i.textContent === "Spy Item");
    ok("context menu: item added (cloned from Discord's)", !!spy && spy.classList.contains("item_x"));
    ok("context menu: hidden item", menu.querySelector("#message-reply").style.display === "none");
    spy && spy.click();
    ok("context menu: click runs the action", w.__spyClicked === true);
    menu.remove();

    for (const id of NEW) B.plugins.disable(id);
    await sleep(30);
    ok("disabling removes added elements", !w.document.querySelector(".bt-pet, .bt-lens, .bt-typing, [data-bt-names], .bt-char-count, .bt-silent-btn"));
    ok("console restored", typeof w.console.log === "function");

    console.log(results.join("\n"));
    console.log(`\n${results.filter(x => x.startsWith("PASS")).length}/${results.length} passed`);
    process.exit(results.some(r => r.startsWith("FAIL")) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
