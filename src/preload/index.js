"use strict";

const { contextBridge, ipcRenderer, webFrame } = require("electron");

const originalPreload = ipcRenderer.sendSync("BT_ORIGINAL_PRELOAD");
if (originalPreload) require(originalPreload);

const run = (code, label) =>
    webFrame.executeJavaScript(code).catch(err => console.error(`[Be Themer] ${label} failed:`, err));

const wrapPlugin = (file, source) =>
    `window.BThemer && window.BThemer.__withFile(${JSON.stringify(`user:${file}`)}, function () {\n${source}\n});\n` +
    `//# sourceURL=bethemer://plugins/${encodeURIComponent(file)}`;

function loadUserPlugins() {
    const list = ipcRenderer.sendSync("BT_USER_PLUGINS") || [];
    run(`window.BThemer && window.BThemer.__syncUserPlugins(${JSON.stringify(list.map(p => p.file))});`, "plugin sync");
    for (const { file, source } of list) run(wrapPlugin(file, source), `plugin ${file}`);
}

contextBridge.exposeInMainWorld("BThemerNative", {
    getState: () => ipcRenderer.sendSync("BT_GET_STATE"),
    setSettings: settings => ipcRenderer.invoke("BT_SET_SETTINGS", JSON.stringify(settings, null, 2)),
    setQuickCss: css => ipcRenderer.invoke("BT_SET_QUICKCSS", String(css)),
    openPath: which => ipcRenderer.invoke("BT_OPEN_PATH", which),
    fetchImage: url => ipcRenderer.invoke("BT_FETCH_IMAGE", url),
    captureWindow: () => ipcRenderer.invoke("BT_CAPTURE_WINDOW"),
    spotifyLogin: (clientId, port) => ipcRenderer.invoke("BT_SPOTIFY_LOGIN", String(clientId), Number(port)),
    spotifyRefresh: (clientId, refreshToken) => ipcRenderer.invoke("BT_SPOTIFY_REFRESH", String(clientId), String(refreshToken)),
    spotifyApi: (token, method, path, body, via) => ipcRenderer.invoke("BT_SPOTIFY_API", String(token), String(method), String(path), body, via ? String(via) : ""),
    spotifyCookieToken: cookie => ipcRenderer.invoke("BT_SPOTIFY_COOKIE_TOKEN", String(cookie)),
    spotifyKeepAlive: on => ipcRenderer.invoke("BT_SPOTIFY_KEEPALIVE", !!on),
    spotifyLaunch: () => ipcRenderer.invoke("BT_SPOTIFY_LAUNCH"),
    spotifyWebLogin: () => ipcRenderer.invoke("BT_SPOTIFY_WEB_LOGIN"),
    spotifyWebToken: force => ipcRenderer.invoke("BT_SPOTIFY_WEB_TOKEN", !!force),
    spotifyWebLogout: () => ipcRenderer.invoke("BT_SPOTIFY_WEB_LOGOUT"),
    spotifyWebStatus: () => ipcRenderer.invoke("BT_SPOTIFY_WEB_STATUS"),
    spotifyLog: msg => ipcRenderer.send("BT_SPOTIFY_LOG", String(msg)),
    spotifyLike: (id, want) => ipcRenderer.invoke("BT_SPOTIFY_LIKE", String(id), want == null ? null : !!want),
    spotifyLibrary: (kind, id) => ipcRenderer.invoke("BT_SPOTIFY_LIBRARY", String(kind), id ? String(id) : ""),
    lyrics: query => ipcRenderer.invoke("BT_LYRICS", query),
    ytSearch: q => ipcRenderer.invoke("BT_YT_SEARCH", String(q)),
    ytResolveChannel: text => ipcRenderer.invoke("BT_YT_RESOLVE_CHANNEL", String(text)),
    kickLogin: () => ipcRenderer.invoke("BT_KICK_LOGIN"),
    kickStatus: () => ipcRenderer.invoke("BT_KICK_STATUS"),
    kickLogout: () => ipcRenderer.invoke("BT_KICK_LOGOUT"),
    kickList: (kind, q) => ipcRenderer.invoke("BT_KICK_LIST", String(kind), q ? String(q) : ""),
    twLogin: () => ipcRenderer.invoke("BT_TW_LOGIN"),
    twStatus: () => ipcRenderer.invoke("BT_TW_STATUS"),
    twLogout: () => ipcRenderer.invoke("BT_TW_LOGOUT"),
    twList: (kind, q) => ipcRenderer.invoke("BT_TW_LIST", String(kind), q ? String(q) : ""),
    lazyShields: (level, force) => ipcRenderer.invoke("BT_LAZY_SHIELDS", String(level), !!force),
    lazyOpen: (url, newTab) => ipcRenderer.invoke("BT_LAZY_OPEN", String(url), !!newTab),
    lazyTab: (action, id) => ipcRenderer.invoke("BT_LAZY_TAB", String(action), Number(id)),
    lazySearch: (q, page, kind) => ipcRenderer.invoke("BT_LAZY_SEARCH", String(q), Number(page) || 0, kind === "images" ? "images" : "web"),
    lazySummary: q => ipcRenderer.invoke("BT_LAZY_SUMMARY", String(q)),
    lazyZoom: f => ipcRenderer.invoke("BT_LAZY_ZOOM", Number(f)),
    lazySuggest: q => ipcRenderer.invoke("BT_LAZY_SUGGEST", String(q)),
    lazyViewport: vp => ipcRenderer.send("BT_LAZY_VIEWPORT", vp),
    lazyInput: ev => ipcRenderer.send("BT_LAZY_INPUT", ev),
    lazyEdit: cmd => ipcRenderer.invoke("BT_LAZY_EDIT", String(cmd)),
    onLazyFrame: cb => {
        const fn = (_e, f) => { try { cb({ id: f.id, width: f.width, height: f.height, data: new Uint8Array(f.data) }); } catch {} };
        ipcRenderer.on("BT_LAZY_FRAME", fn);
        return () => ipcRenderer.removeListener("BT_LAZY_FRAME", fn);
    },
    lazyNav: action => ipcRenderer.invoke("BT_LAZY_NAV", String(action)),
    lazyState: () => ipcRenderer.invoke("BT_LAZY_STATE"),
    lazyClose: () => ipcRenderer.invoke("BT_LAZY_CLOSE"),
    lazyPopout: url => ipcRenderer.invoke("BT_LAZY_POPOUT", url ? String(url) : ""),
    lazyClear: () => ipcRenderer.invoke("BT_LAZY_CLEAR"),
    onLazyEvent: cb => {
        const fn = (_e, data) => { try { cb(data); } catch {} };
        ipcRenderer.on("BT_LAZY_EVENT", fn);
        return () => ipcRenderer.removeListener("BT_LAZY_EVENT", fn);
    },
    ytChannelVideos: (ids, shorts) => ipcRenderer.invoke("BT_YT_CHANNEL_VIDEOS", ids, !!shorts),
    openExternal: url => ipcRenderer.invoke("BT_OPEN_EXTERNAL", String(url)),
    reloadPlugins: () => loadUserPlugins(),
    recDefaultDir: () => ipcRenderer.invoke("BT_REC_DEFAULT_DIR"),
    recStart: opts => ipcRenderer.invoke("BT_REC_START", opts),
    recChunk: (id, data) => ipcRenderer.send("BT_REC_CHUNK", String(id), data),
    recStop: id => ipcRenderer.invoke("BT_REC_STOP", String(id)),
    recPickDir: current => ipcRenderer.invoke("BT_REC_PICK_DIR", current),
    recOpenDir: dir => ipcRenderer.invoke("BT_REC_OPEN_DIR", dir),
    owlSources: () => ipcRenderer.invoke("BT_OWL_SOURCES"),
    owlStart: opts => ipcRenderer.invoke("BT_OWL_START", opts),
    owlChunk: (id, data) => ipcRenderer.send("BT_OWL_CHUNK", String(id), data),
    owlStop: id => ipcRenderer.invoke("BT_OWL_STOP", String(id)),
    owlPickDir: current => ipcRenderer.invoke("BT_OWL_PICK_DIR", current),
    owlOpen: (dir, file) => ipcRenderer.invoke("BT_OWL_OPEN", dir, file),
    owlDefaultDir: () => ipcRenderer.invoke("BT_OWL_DEFAULT_DIR"),
    recShow: file => ipcRenderer.invoke("BT_REC_SHOW", String(file)),
    recList: dir => ipcRenderer.invoke("BT_REC_LIST", dir),
    onThemesChanged: callback => {
        ipcRenderer.on("BT_THEMES_CHANGED", () => callback());
    },
    onRendererChanged: callback => {
        ipcRenderer.on("BT_RENDERER_CHANGED", () => callback());
    },
});

const source = ipcRenderer.sendSync("BT_RENDERER_SRC");
if (source) {
    run(`${source}\n//# sourceURL=bethemer://renderer.js`, "renderer");
    loadUserPlugins();
    ipcRenderer.on("BT_PLUGINS_CHANGED", loadUserPlugins);
}
