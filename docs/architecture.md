# Architecture


- **The settings section:** Discord builds its User Settings sidebar from a tree of layout nodes. Be Themer watches Discord's webpack chunks as they load and rewrites the one module that builds that tree, so its own section is added. For this to run, Discord's page Content-Security-Policy gets `'unsafe-eval'` (plus `blob:`/`data:` images for wallpapers). Discord's own header listener keeps working.
- **If Discord changes that code:** the section disappears, but everything stays reachable through `Ctrl+Alt+B`. `BThemer.debug()` in the console shows which patches applied.
- **Everything else** (themes, wallpaper, plugins) works on the page itself: DOM + CSS.

## How it's installed

```
Discord/app-x.y.z/resources/
  app.orig.asar   ← Discord's original app.asar, renamed, untouched
  app.asar        ← Be Themer's loader: Discord's package.json (only "main" changed) + index.js
```

The loader runs Be Themer's `main.js`, then starts Discord exactly as before (same app path, name and version). If Be Themer fails to load, Discord still starts normally.
