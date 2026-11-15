// Focused plugin regressions without a browser or Discord account.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = process.argv[2] || path.resolve(__dirname, "..");

(async () => {
    let plugin, request, timer, onSend, onEdit;
    const disposers = [], observers = [], warnings = [];
    const settings = {};
    const localEmoji = { id: "111", name: "local", guildId: "9", animated: false };
    let captured;
    const actions = { sendMessage(...args) { captured = args; return "sent"; }, editMessage() {}, deleteMessage() {} };
    const originalSend = actions.sendMessage;
    const gates = { canStreamQuality() { return false; } };
    const constraints = { frameRate: { ideal: 30 } };
    const track = { readyState: "live", getConstraints: () => constraints, getSettings: () => ({ aspectRatio: 2 }),
        calls: [], async applyConstraints(c) { this.calls.push(c); } };
    const params = { maxFrameRate: 30 };
    const conn = { streamUserId: "77", videoStreamParameters: [params], input: { stream: { getVideoTracks: () => [track] } } };
    const otherParams = { maxFrameRate: 15 };
    const stores = {
        ChannelStore: { getChannel: () => ({ guild_id: "9", isPrivate: () => false }) },
        EmojiStore: { getCustomEmojiById: id => id === "111" ? localEmoji : { id, name: id === "222" ? "dance" : "outside", animated: id === "222", guildId: "8" } },
        StickersStore: { getStickerById: id => ({ id, name: "wave", guild_id: id === "333" ? "9" : "8", format_type: 1 }) },
        MediaEngineStore: { getMediaEngine: () => ({ connections: [conn, { streamUserId: "88", videoStreamParameters: [otherParams] }] }) },
    };
    const api = {
        settings, webpack: { find: f => [actions, gates].find(f), waitFor() {} },
        discord: { store: n => stores[n], currentUser: () => ({ id: "77", premiumType: 0 }), route: () => ({ guildId: "9" }),
            onMessageSend: f => { onSend = f; return () => { onSend = null; }; },
            onMessageEdit: f => { onEdit = f; return () => { onEdit = null; }; } },
        onDispose: f => disposers.push(f), net: { onRequest: f => { request = f; } },
        observe: (s, f) => observers.push(f), warn: (...a) => warnings.push(a),
        el: (tag, props) => ({ tag, ...props }),
    };
    vm.runInNewContext(fs.readFileSync(path.join(root, "src/plugins/fakeNitro.js"), "utf8"), {
        BThemer: { definePlugin: p => { plugin = p; } }, URL, setInterval: f => { timer = f; return 1; }, clearInterval() {}, setTimeout() {},
        document: { querySelectorAll: () => [] },
    });
    for (const [key, spec] of Object.entries(plugin.settings)) settings[key] = spec.default;
    plugin.start(api);
    const rewrite = (content, extra = {}, method = "POST") => {
        const body = { content, ...extra };
        const result = request({ method, url: "https://discord.com/api/v9/channels/1/messages" + (method === "PATCH" ? "/55" : ""), body: JSON.stringify(body) });
        return result ? JSON.parse(result.body) : body;
    };
    assert.equal(rewrite("<:local:111>").content, "<:local:111>");
    const mixed = rewrite("hi<a:dance:222>bye").content;
    assert.match(mixed, /^hi \[dance\]\(https:\/\/cdn\.discordapp\.com\/emojis\/222\.gif\?/);
    assert.match(mixed, /\) bye$/);
    assert.match(rewrite("<:outside:555>", {}, "PATCH").content, /emojis\/555\.webp/);
    assert.equal(rewrite("\\<:outside:222>").content, "\\<:outside:222>");
    assert.deepEqual(rewrite("", { sticker_ids: ["333"] }).sticker_ids, ["333"]);
    const sticker = rewrite("hi", { sticker_ids: ["444"] });
    assert.equal(sticker.sticker_ids.length, 0);
    assert.match(sticker.content, /stickers\/444\.png/);
    console.log("PASS  fake nitro: preserves usable media; converts mixed text, edits and external stickers");

    const msg = { content: "x<a:dance:222>y<a:dance:222>z", validNonShortcutEmojis: [{ id: "222", name: "dance", animated: true, guildId: "8" }] };
    onSend("1", msg, {});
    assert.equal(msg.content.includes("<a:"), false);
    assert.match(msg.content, /^x \[dance\]/);
    console.log("PASS  fake nitro: composer pre-send handles repeated emoji");

    const stickerMessage = { content: "hello", validNonShortcutEmojis: [] }, options = { stickerIds: ["444"] };
    onSend("1", stickerMessage, options);
    assert.equal(options.stickerIds.length, 0);
    const preserved = rewrite("hello"); // Discord rebuilt the body after the composer hook.
    assert.match(preserved.content, /stickers\/444\.png/);
    assert.equal((preserved.content.match(/stickers\/444/g) || []).length, 1);
    assert.equal(rewrite("next message").content, "next message");
    console.log("PASS  fake nitro: preserves upstream pending-sticker submission fix without duplicating later messages");

    const nodes = [{ text: "wave" }];
    const anchor = { href: "https://media.discordapp.net/stickers/444.png?name=wave", textContent: "wave", childNodes: nodes,
        firstChild: nodes[0], classList: { add() {}, remove() {} }, closest: () => ({ textContent: "wave" }),
        replaceChildren(...children) { this.childNodes = children; this.firstChild = children[0]; } };
    observers[0](anchor);
    assert.equal(anchor.firstChild.tag, "img");
    const foreign = { ...anchor, href: "https://example.com/emojis/222.gif", childNodes: nodes, firstChild: nodes[0] };
    observers[0](foreign);
    assert.equal(foreign.firstChild, nodes[0]);
    console.log("PASS  fake nitro: renders CDN sticker links and ignores foreign hosts");

    settings.forceFps = "60"; settings.forceResolution = "1080";
    timer();
    await new Promise(setImmediate);
    assert.equal(params.maxFrameRate, 60);
    assert.equal(params.maxResolution.width, 2160);
    assert.equal(track.calls[0].height.max, 1080);
    assert.equal(otherParams.maxFrameRate, 15);
    for (const dispose of disposers.reverse()) dispose();
    await new Promise(setImmediate);
    assert.equal(actions.sendMessage, originalSend);
    assert.equal(onSend, null);
    assert.equal(onEdit, null);
    assert.equal(params.maxFrameRate, 30);
    assert.equal("maxResolution" in params, false);
    assert.equal(track.calls.at(-1), constraints);
    assert.equal(anchor.firstChild, nodes[0]);
    assert.equal(warnings.length, 0);
    console.log("PASS  fake nitro: forced capture quality is scoped to self and cleanup restores state");

    // Evaluate the real registration block, then run factories through its replacements.
    const core = fs.readFileSync(path.join(root, "src/renderer/renderer.js"), "utf8");
    const start = core.indexOf("    wp.api.fakeNitroEnabled =");
    const end = core.indexOf("    // Be Themer section", start);
    const patches = [], wp = { api: {} }, state = { settings: { streamQuality: false } };
    const record = { running: true };
    // the real Vencord-port canonicalizer (intl key hashing + \i)
    const cStart = core.indexOf("    const xxh64 =");
    const cEnd = core.indexOf("    wp.api.hashMessageKey =", cStart);
    const canon = {};
    vm.runInNewContext(`${core.slice(cStart, cEnd)};out.canonicalize=canonicalize;out.hash=hashMessageKey;out.xxh64=xxh64;`, { out: canon, TextEncoder, Uint8Array, Uint32Array, BigInt, Math, Number, String, RegExp });
    assert.equal(canon.xxh64(""), 0xEF46DB3751D8E999n);
    assert.equal(canon.xxh64("abc"), 0x44BC2CF5AD770999n);
    assert.equal(canon.xxh64("Nobody inspects the spammish repetition"), 0xFBCEA83C8A378BF1n);
    const fpsKey = canon.hash("STREAM_FPS_OPTION");
    assert.match(fpsKey, /^[\w+/]{6}$/);
    console.log(`PASS  fake nitro: xxh64 vectors + intl hash (STREAM_FPS_OPTION â†’ ${fpsKey})`);

    const context = { wp, plugins: new Map([["fakeNitro", record]]), pluginState: () => state, S: { plugins: { fakeNitro: state } }, window: { BThemer: { __wp: wp.api } },
        definePatch: p => patches.push({ ...p, find: canon.canonicalize(p.find), replacements: p.replacements.map(r => ({ ...r, match: canon.canonicalize(r.match) })) }) };
    vm.runInNewContext(core.slice(start, end), context);
    function patched(source) {
        for (const p of patches) if (source.includes(p.find) && (!p.predicate || p.predicate())) for (const r of p.replacements) source = source.replace(r.match, r.replace);
        return vm.runInNewContext(`(${source})`, context)();
    }
    // Vencord semantics: predicate is read when the module loads (restart needed).
    const intlRef = canon.canonicalize("#{intl::STREAM_FPS_OPTION}");
    const fpsSrc = `function(){const a={b:{TIER_2:2}},t={};return ()=>({label:t${intlRef},guildPremiumTier:a.b.TIER_2,fps:60})}`;
    const gateSrc = 'function(){return {canUseCustomStickersEverywhere:()=>false,canStreamQuality:e=>false,canUseHighVideoUploadQuality:function(e){return false},x:1}}';
    // plugin disabled â†’ Discord's code untouched
    state.enabled = false;
    assert.equal(patched(fpsSrc)().guildPremiumTier, 2);
    assert.equal(patched(gateSrc).canStreamQuality(), false);
    // plugin on, setting off â†’ untouched
    state.enabled = true;
    assert.equal(patched(gateSrc).canUseHighVideoUploadQuality(), false);
    // plugin on, setting on â†’ exactly Vencord's output
    state.settings.streamQuality = true;
    const fps = patched(fpsSrc)();
    assert.equal("guildPremiumTier" in fps, false);
    assert.equal(fps.fps, 60);
    const gated = patched(gateSrc);
    assert.equal(gated.canStreamQuality(), true);
    assert.equal(gated.canUseHighVideoUploadQuality(), true);
    assert.equal(gated._canStreamQuality(), false); // Vencord's `_$&` keeps the original
    console.log("PASS  fake nitro: stream quality patches match Vencord (predicate, $&()=>true,_$&, tier removed)");

    const preview = patched('function(){return {streamerPaused(){return true}}}');
    const tile = patched('function(){const a={b:{isFocused:()=>false}};return ()=>({name:"StreamTile",focused:a.b.isFocused()})}');
    record.running = true;
    assert.equal(preview.streamerPaused(), true);
    assert.equal(tile().focused, false);
    state.settings.disableStreamPause = true;
    assert.equal(preview.streamerPaused(), false);
    assert.equal(tile().focused, true);
    record.running = false;
    assert.equal(preview.streamerPaused(), true);
    assert.equal(tile().focused, false);
    console.log("PASS  fake nitro: preview pause and focus patches are reversible");
})().catch(error => { console.error(error); process.exitCode = 1; });
