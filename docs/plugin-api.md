# Writing plugins

## Quick start

```powershell
npm run new-plugin -- "Anime Clock"
```

This creates `%APPDATA%\B-Themer\plugins\animeClock.js` from [templates/plugin.js](templates/plugin.js). The template shows every API feature. The `/// <reference>` line at the top gives you autocomplete in VS Code via [types/b-themer.d.ts](types/b-themer.d.ts).

The plugin appears right away under **User Settings → Be Themer → Plugins**. Every time you **save** the file, Be Themer reloads it. To ship a plugin inside Be Themer, use `npm run new-plugin -- "Name" --builtin`. That puts it in `src/plugins/`, where it's bundled by the build.

## A minimal plugin

```js
BThemer.definePlugin({
    id: "roundAvatars",
    name: "Square-ish Avatars",
    description: "Gives avatars soft square corners.",
    settings: {
        radius: { type: "range", label: "Corner radius", min: 0, max: 50, unit: "%", default: 30 },
    },
    css: s => `[class*="avatar_"] img { border-radius: ${s.radius}% !important; }`,
});
```

## `definePlugin({...})`

| Field | |
|---|---|
| `id` | **required**, unique. Starts with a letter; letters, digits, `-`, `_` |
| `name`, `description`, `author`, `version` | shown in the panel |
| `enabledByDefault` | `true` to start switched on for new users (default `false`) |
| `settings` | `{ key: { type, label, default, … } }`; each becomes a control. Types: `toggle` · `range` (`min`, `max`, `unit`) · `color` · `text` · `select` (`options`) · `button` (`text`; a click calls `onSettingChange(key)`) · `info` (read-only text, set with `api.setSetting`) |
| `css` | a string, or `(settings, api) => string`. Applied while on; re-run when settings change |
| `start(api)` / `stop(api)` | run when switched on / off |
| `onSettingChange(key, value, api)` | one of its settings changed |
| `onCoreChange(core, api)` | Be Themer's appearance changed (e.g. `core.accent`) |

## The `api` object

| | |
|---|---|
| `api.settings` / `api.setSetting(key, value)` | read / change this plugin's settings |
| `api.core` | Be Themer appearance settings (read-only) |
| `api.css(text)` | add a stylesheet → `{ update(text), remove() }` |
| `api.observe(selector, fn)` | run `fn(el)` for every matching element, now and as Discord adds more |
| `api.onKey("Ctrl+Alt+K", fn)` | keyboard shortcut |
| `api.addMenuItem(label, fn)` | button under **Be Themer → Quick actions** |
| `api.toast(text)` | small notification |
| `api.storage.get/set/delete(key)` | persistent storage for this plugin |
| `api.webpack.findStore("MessageStore")` · `findByProps(...)` · `find(fn)` · `waitFor(fn, cb)` | Discord's internal modules and stores |
| `api.flux.intercept(fn)` · `api.flux.subscribe(type, cb)` | Discord's events (return `false` from an interceptor to drop one) |
| `api.net.onRequest(fn)` | rewrite or block Discord's network requests |
| `api.discord.store(name)` · `api.discord.rest.get/post/put/patch/del(path)` · `api.discord.route()` · `api.discord.currentUser()` · `api.discord.messageIdsOf(el)` · `api.discord.getMessage(c, m)` · `api.discord.dispatch(action)` · `api.discord.onMessageSend(fn)` · `api.discord.onMessageEdit(fn)` | shared Discord helpers (stores, REST as you, current channel, messages); message hooks run before Discord sends or saves an edit and can mutate parsed content or return `{ cancel: true }` |
| `api.contextMenu("message" \| ["channel-context", …], ({ target }) => [{ label, action, danger }] \| { items, hide })` | add items to (or hide items in) Discord's right-click menus |
| `api.copy(text)` · `api.openWindow(title, el)` | clipboard, your own window |
| `api.spotify.login(clientId, port)` · `refresh(clientId, refreshToken)` · `request(token, method, path, body)` | Spotify Web API (PKCE login via `http://127.0.0.1:<port>/callback`; requests limited to `api.spotify.com/v1`) |
| `api.onDispose(fn)` | cleanup when the plugin stops |
| `api.el(tag, props)` · `api.log` · `api.warn` | helpers |

Everything registered through `api` is undone automatically when the plugin is switched off, reloaded or deleted. A plugin that throws is shown with ⚠ in the panel and doesn't affect the others. Files starting with `_` are ignored.

> ⚠ Plugins run inside Discord with full access to the page, and that includes your account. Only install plugins you wrote or have read.
