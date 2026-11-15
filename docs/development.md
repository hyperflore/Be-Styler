# Development

```powershell
npm install        # once: dev dependencies for the tests
npm run dev        # leave running; rebuilds dist/ on every save
npm test           # build, then run tests/*.test.js against dist/
npm run check      # syntax and plugin id check only, no output written
```

## Tests

`tests/run.mjs` builds Be Themer and runs each `tests/*.test.js` suite in its own Node process. The suites load `dist/renderer.js` into a [jsdom](https://github.com/jsdom/jsdom) page together with a small fake of Discord's webpack modules, stores and event dispatcher, then exercise the renderer and plugins through `window.BThemer`. Pass a word to run only matching suites, e.g. `npm test -- plugins`.

## Project layout

| You changed | To see it |
|---|---|
| `themes/*.css` | nothing, it hot-reloads |
| `src/renderer/*` or `src/plugins/*` | Discord shows a "rebuilt" toast → `Ctrl+R` |
| `src/main/*`, `src/preload/*`, `src/shared/*` | fully quit and restart Discord |

```
Be-Themer/
├─ .github/                    CI workflow, issue and pull request templates
├─ docs/                       plugin API, architecture, development
├─ tests/                      jsdom test suites + runner (npm test)
├─ scripts/build.mjs           build → dist/  (--watch, --check)
├─ scripts/build-installer.mjs build → release/ (C# compiler built into Windows)
├─ scripts/new-plugin.mjs      plugin scaffolder
├─ installer/*.cs              Windows installer: Core, Remote (GitHub releases), Gui, Cli, Program
├─ injector/index.js           dev inject / uninject / status (all platforms)
├─ src/shared/shim.js          loader + asar helpers
├─ src/main/index.js           inside Discord: window hook, files, IPC, CSP, watchers, F12, update carry-over
├─ src/preload/index.js        runs Discord's preload, bridge, loads renderer + user plugins
├─ src/renderer/renderer.js    core: module patcher, settings section, themes, live settings, wallpaper, plugin system
├─ src/plugins/*.js            built-in plugins
├─ themes/*.css                bundled themes
├─ templates/plugin.js         plugin template
└─ types/b-themer.d.ts         editor types for plugins
```

## Publishing a release

```powershell
npm version minor            # bump the version
npm run build:installer      # → release/
gh release create v1.4.0 release/BeThemerInstaller.exe release/BeThemerInstallerCli.exe release/dist.zip
```

The installer reads `"repository"` from `package.json` and installs `dist.zip` from the latest release when it's newer than the build inside it. It also shows **OUTDATED** next to its own version when a newer installer exists.


## When a Discord update breaks something

Discord's class names look like `sidebar_a4d4d9`. The part after `_` changes between builds, so the theme matches on the stable prefix: `[class*="sidebar_"]`.

1. Press **F12** → element picker → click the broken part → read its `class="…"`.
2. Update the selector in the theme section (each is labelled, e.g. `6. CHANNEL SIDEBAR`) or in the plugin.
3. Test it in **QuickCSS** first (applies as you type), then move it into the theme or plugin.

- Prefer roles, ids and attributes (`[role="menu"]`, `[id^="message-content-"]`, `a[href="/store"]`). They survive updates better.
- **Settings section missing?** Run `BThemer.debug()` in the Console. If `patchesPending` lists `"settings section"`, Discord changed that code; use `Ctrl+Alt+B` meanwhile.
- **Everything gone?** Open the installer: if it says *[NEEDS REPAIR]* or nothing, click **Reinstall / Repair**.

> Client mods break Discord's Terms of Service. Mods that only change appearance are widely used and rarely acted on, but use Be Themer at your own risk.
