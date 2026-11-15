# Changelog

All notable changes to Be Themer are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [2.2.0] - 2026-11-14

### Added
- **Spotify Controls**: a player above your user panel (seek, volume, shuffle, repeat, search, lyrics, Liked Songs and playlists), collapsible, with Spotify kept running in the tray.
- **YouTube**: a player widget with search, pasted links, followed channels and Google Takeout import.
- **Twitch** and **Kick**: live players with search, top live channels, chat and optional account login.
- **Lazy**: a small browser widget with tabs, its own search (results, images, summary), ad and tracker blocking, zoom and colour themes.
- **Owlie**: a screen recorder (a screen or a window, PC sound and/or microphone, up to 4K at 60 fps) with an owl button next to the settings gear.
- **Calculate**: a glassy calculator on a key combination you choose.
- **DMS Saaf**: "Saaf karo" in the right-click menu of a DM or channel deletes your own messages there.
- Fake Nitro: client themes and premium app icons on your client.
- A Discord-style colour picker; plugin settings can have buttons and status lines.

### Fixed
- The terminal install command (`irm … | iex`) opened the installer's menu instead of installing: `install.ps1` now passes `--install` as an argument.
- Right-click menu items added by plugins could copy a greyed-out item's look and appear disabled.
- Calls to Discord's API keep working after Discord updates that confused Be Themer's HTTP helper.
- Switching between a themed server and your DMs no longer flashes the wrong wallpaper.

## [2.1.2] - 2026-11-14

### Fixed
- Patches now reach the modules built into Discord's main bundle (`web.*.js`). These are defined inline in webpack's runtime and never pass through the chunk array, so the Fake Nitro stream quality, quality preset, preview pause and stream tile patches never applied and streams stayed capped at 720p30. Be Themer now hooks webpack's module table assignment (`require.m`) the way Vencord does and patches those factories before they run.
- The stream quality bypass reads its setting directly from saved settings at startup instead of a helper declared later in the file, which could throw and silently skip the patch.

## [2.1.1] - 2026-11-14

### Fixed
- Fake Nitro stream quality now uses Vencord FakeNitro's exact patches: `canStreamQuality` and `canUseHighVideoUploadQuality` forced on (`$&()=>true,_$&`), and the `guildPremiumTier` requirement removed from the stream FPS/resolution presets. "Allow streaming in nitro quality" is on by default; changing it needs a Discord restart.
- Module patches that target `#{intl::KEY}` now hash the key the way Discord ships it (Vencord's `runtimeHashMessageKey`), so the stream preset and message-edit patches find their modules. `\i` is supported in patch regexes.

## [2.1.0] - 2026-11-14

### Added
- Plugins page: an Enabled section above the list shows which plugins are on.

### Changed
- Macmize: Discord's back / forward arrows move to the right end of the title bar instead of sitting behind the window buttons.
- Meow no longer shows a recording bar at the top of the window.

### Fixed
- Clear Message Log (and other red menu items) is red, label included.
- Repository links point to hyperflore/Be-Themer, where releases are published.

## [2.0.0] - 2026-11-13

### Changed
- The name is **Be Themer** everywhere again (it was briefly called Moonberry): the settings section, window, messages, console tags and loader.
- Settings live in **%APPDATA%\B-Themer** again, the same folder as the installed build. On first start, %APPDATA%\Moonberry is merged in (the newer copy of each file wins) and a MOVED.txt is left there. Loaders written as "Moonberry loader" are still recognised by the installer and by main.js.
- The Moonberry motion-video loading screen is removed (with its videos, player code and build step). The default loading screen is **Discord logo**; an old "motion video" setting switches to it.
- New README: install (terminal, GUI, CLI), every feature and plugin, where files are, how it works, privacy and network use, and the legal status (MIT license, not affiliated with Discord, Discord's Terms of Service, call-recording consent, Message Logger etiquette).
- Code comments rewritten to describe the code clearly.

### Fixed
- Message Logger: the earlier version of an edited message could be blank. It's drawn with Discord's own message renderer, and Discord ships more than one React build; the renderer now matches React's version, and if the line still comes out empty the text is shown as it is.
- Right-click menus: Be Themer's items (Clear Message Log, Toggle Deleted Highlight, …) were squashed side by side, word by word, because they copied the first menu group, which on a message is the horizontal row of quick-reaction buttons. They now copy a normal one-line item from a normal group, like Copy Message Link.
- Message Logger: earlier versions of an edited message are clearly dull (muted colour, faded), so the current text stands out.
- The red NEW line (and date lines) in chat ran through the next message: Discord leaves their gap to the first message's top margin, which the bubbles made smaller. They now have their own gap above and below.

- **Minimise, maximise and close did nothing** (Discord's own buttons and Macmize's): Electron only treats a window as a BrowserWindow when its class is named exactly "BrowserWindow" (BrowserWindow.fromId / getAllWindows check constructor.name), and Discord finds its main window with BrowserWindow.fromId. Be Themer's window class was named BThemerWindow, so Discord found no window. It now carries the name Electron expects. New test: tests/main.test.js loads the built main.js against a fake Electron with the same check.

### Added
- Releases: pushing a version tag builds the Windows installer on GitHub, runs the tests and publishes the installer, CLI, dist.zip and SHA256SUMS.txt as the latest release. README: download badges and a direct "Download for Windows" link to the latest installer.
- Discord Theme → Colours, font and shape: **Notification colour follows my theme** (on by default). Mention badges, the NEW line and the new-messages bar use your accent; off keeps Discord's red.
- **Theme Maker**: a node-based editor for your own colour themes. Input nodes (Color, Value), colour nodes (Mix, Brightness, Hue Shift, Saturation, Invert, Harmony: one colour → analogous, complementary and triad colours), Math, and a Theme Output whose sockets are your theme: accents, the four glows, background, glass tint, glow strength, glass opacity and blur, corner roundness. Drag between sockets to connect (colours yellow, numbers grey), drag a wire off to disconnect, pan, zoom, Shift+A to add, Delete to remove. Start from a starter graph or any of the 15 built-in presets. Your themes appear in your Colour presets and in every server's preset list; Apply to me (follows your edits live) or Apply to a server.
- Installer: a redesigned window (traffic-light window buttons, rounded corners and shadow on Windows 11, drag and resize), rounded cards and pill buttons. The build no longer has a fallback icon: the installer always carries the app logo.
- `install.ps1`: install from a terminal with `irm https://raw.githubusercontent.com/hyperflore/Be-Themer/main/install.ps1 | iex`. It checks the installer against the release's SHA256SUMS.txt before running it; `BETHEMER_ARGS` passes other options (`--uninstall`, `--branch all`, …).
- The installer build writes release/SHA256SUMS.txt.

### Added
- A **GitHub** button at the top of the Be Themer page: a round, faceted ice-crystal button (flat facets, no gradients) with GitHub's mark, opening the repository in your browser. The link comes from package.json "repository" at build time.
- **Macmize** plugin: traffic-light window buttons. Red, yellow and green buttons in the top-left corner (or top-right), symbols on hover, grey while Discord isn't the active window, sizes 12 / 14 / 16 px, and the green button maximises or goes full screen. They call Discord's own window functions; Discord's buttons come back when it's off.
- Discord Theme's sections (Colour presets, Wallpaper, Gradient, Glass panels, Role colours, Colours font and shape, Messages, Voice, Theme files) are listed under it in Discord's own settings sidebar, like Account → Account Info, Password & Security. Each section is a Discord settings category, so Discord draws the list, highlights where you are and scrolls there when clicked.

### Fixed
- **Message Logger works in the real Discord app** (verified end to end against Discord's own code): Discord runs **four webpack runtimes** on one chunk array, and each answers Be Themer's request for its module cache. Be Themer kept only the last answer, a runtime with ~100 modules, while Discord's event dispatcher and all 529 stores are in the main runtime (~6,900 modules). It now keeps and reads every runtime (rescanning one only when its cache has grown), and hooks the dispatcher MessageStore is registered with, chosen once the scan has finished. In Discord's real code, with its real MessageStore and dispatcher: a deleted message stays and is marked red; with Message Logger off it's deleted as normal. A status line in Discord's log (`[Be Themer] status`) says what Be Themer can see.
- **The real reason Message Logger never kept a deleted message** (and why no plugin event ever arrived): Discord loads and runs its core modules (its event dispatcher, MessageStore, …) before Be Themer starts, and Be Themer only saw modules loaded after it. It now also reads webpack's cache of already-loaded modules (by pushing a chunk with a runtime callback, as other client mods do), so it finds Discord's dispatcher and hooks it. Deleted messages stay in the chat, in red. Discord's log says `[Be Themer] events: hooked Discord's dispatcher` when it's connected.
- **Message Logger never saw deletes** (or edits) in current Discord: Be Themer hooked the first object that looked like Discord's event dispatcher, which could be Discord's UI event bus (ComponentDispatch) instead of the real one. It now uses the dispatcher Discord's MessageStore is registered with (and requires register(), which only the real one has). Deleted messages stay in the chat, in red, again.
- Right-click on a deleted message: **Clear Message Log** (red) is visible. Items Be Themer adds copy one of Discord's menu items, and copying one that was hidden on deleted messages made ours hidden too.
- Window buttons (minimise, maximise, close) are explicitly outside the window-drag area, so a click reaches them instead of starting a window drag. Presses in the title bar are also written to Discord's log (`[Be Themer] title bar`), to see what a click hit if they still don't respond.

### Performance
- Stylesheets are only re-applied when their text changes. Re-applying identical CSS made Chromium re-check styles on the whole page, and Message Logger did that on almost every frame while chat was changing.
- One shared page watcher for the core, right-click menus and plugins' observe() instead of one each (5 watchers to 2 with Message Logger on). The right-click menu hook no longer searches every chat message that scrolls in.
- The animated background moves along the same ease-in-out curve at the same speed, but in steps of at most 0.15° (about 11 a second at the default 40 s, instead of every frame), so the blurred glass above it is redrawn far less. Its layer is GPU-cached (will-change: filter).
- Screen Effects doesn't clear an already-empty canvas; Message Logger doesn't scan chat for its buttons when nothing is logged.

### Fixed
- Discord's own loading screen (and its reconnecting screen) was see-through, so the app showed through it. It has a solid background again.

### Added
- Splash: the animated loading screen is now a motion design video of the app logo (1920×1080, 60 fps, with motion blur), no text. A pink dot pops and the logo's colours wipe across the screen; the logo lands with a burst (shockwave rings, speed lines, confetti) and a sheen; little shapes from the logo fly out and orbit it, with a dotted orbit and two arcs in its colours. A 3 s intro (`dist/splash/splash-intro.webm`) hands off to a 4 s loop (`splash-loop.webm`) that repeats seamlessly for as long as Discord loads. `npm run splash-video` re-renders both from `scripts/splash-video.html` (headless Chromium + ffmpeg). Until Discord is fully restarted (it reads the videos from disk), your logo is shown instead. The vector logo animation, wordmark, ribbons, sparkles and grain are gone; "Show the logo" now applies to My wallpaper / My picture.
- Splash: new **Shapes into Discord logo** loading screen. A square, a triangle and a circle play around, then really morph (outlines resampled and blended point by point) into Discord's logo: the square becomes its body, the triangle and circle its eyes. The logo pulses and blinks, then breaks back into shapes, or stays ("Stay as the logo"). Flat colours, with all the usual colour, size, speed, position, pattern and text options.
- Splash: the flat loading screens got their own options. All: position (centre, upper or lower third, bottom corners), a flat background pattern (dot grid, grid lines, diagonal lines, plus signs, as SVG) and its strength, and your text now sits quietly just under it (text size and visibility). Discord logo: Glitch animation, two-colour look, ripples. Minimal: arc, dot wheel, ticks, two squares or ripples, with thickness. Terminal: a window frame, timestamps, block/underline/bar cursor, and your own lines. Equalizer: 3-24 bars, width, roundness, colours, grow from the middle or up. Shapes: hop, spin, orbit or one morphing shape. Counter: percent, number or honest seconds elapsed, bold/thin/monospace, line on or off.
- Splash: its videos stop when it closes (a removed looping video kept playing in the background).
- Emoji Links is now called Emoji (same id, settings kept).
- Message Logger logs what happens to each delete in Discord's log (`[Moonberry] message logger:` in renderer_js.log).
- Splash: six new flat loading screens, no gradients: **Discord logo** (pulse, breathe, bounce, float, flip, wobble, heartbeat or still; solid or outline; nothing, three dots, a loading bar or a spinner under it), **Minimal spinner**, **Terminal** (types a boot log with your real theme and plugin counts), **Equalizer**, **Shapes** and **Counter**. Each takes a background colour, main colour, second colour, size and speed. The Splash page only shows the settings for the screen you pick.
- Splash: gradients removed everywhere: the colour blobs and radial background are gone, and the motion video was re-rendered on a flat background (no glow, flash, sheen or gradient arcs).
- Splash: the video was playing but invisible: Discord's loading screen sets `visibility: hidden` on videos inside it, which also hid ours. Our splash videos (and your picture/video splash) are now always visible. The splash also logs each step to Discord's log (`[Moonberry] splash @…ms` in renderer_js.log).
- Splash: on start it goes up the moment Moonberry is injected and stays until Discord's app is on screen, then fades. It used to wait for the page's DOMContentLoaded, which Discord's scripts hold back for ~3 s, so it only showed for the last fraction of a second (too short for the video). Reconnects still use Discord's loading screen as before.
- Splash: the motion design video now actually plays. It was encoded with full-range colour (from the JPEG frames), which Chromium, and so Discord, refuses to decode (`PIPELINE_ERROR_DECODE`), leaving a blank screen. It's now TV-range BT.709. The splash also checks the video really plays (blob:, then data: URL) and shows your logo if it can't, noting why in `splashVideoIssue` in settings.json.
- Splash: a splash picture too small to look sharp (from before this version) switches to the animated splash once, with a notice. A picture you choose yourself is kept.
- Splash: screen effects (rain, petals, cursor pet…) never draw over the splash: they were only hidden on the very first load, not when Discord reconnects or in Preview. With no logo, your text sits at the bottom instead of over the middle of the picture.
- Splash page: when your splash picture is smaller than your screen, it says so plainly and offers **Use my wallpaper instead**.
- Splash: Moonberry's own loading screen, in place of Discord's. It sits inside Discord's loading screen (Discord's spinner and tips hidden) for exactly as long as Discord shows it, when Discord starts and when it reconnects, and goes with it. The default is animated, in your theme's colours: the logo bouncing with a pulsing ring and orbiting sparkles, a shimmering title, a moving progress bar, drifting colour blobs and a line of text that changes. Or use your own picture, GIF or video (any size; fill or fit, darken). A new Splash settings page has the style (Moonberry / My picture or video / Discord's own), your own lines separated by |, show the logo, fit and darken, Preview, and choose / remove your picture or video.

### Changed
- Meow is now a voice call recorder (the soundboard is gone, and its saved sounds are removed from your PC on first start; sounds it added to servers' soundboards stay there). Click the Meow button next to Discord's Soundboard button, press Ctrl+Alt+M, or use the Meow page to start and stop. It records what you hear (your PC's sound output: everyone in the call, plus any other sound playing) mixed with your microphone, shows a red REC bar while recording, stops when you leave the channel, and by default posts a notice in the channel's chat when it starts and stops. The recording is written as it goes to a WAV in your recordings folder (Documents\Meow Recordings by default, or one you choose; created if needed), and on stop Windows' own MP3 encoder converts it (192 or 128 kbps; the WAV is kept if conversion fails). The Meow page has the folder (Change / Open / Use default), options and your recordings (Show in folder).
- New app logo (`assets/logo.png`): the installer's icon (16–256 px), the Moonberry entry in Discord's settings sidebar, the settings window title and the README. `node scripts/make-logo.mjs` remakes the icon files from it.
- Meow records your voice from the microphone Discord uses (matched by name: Discord's device ids differ from the page's). It used to open Windows' default microphone, which recorded silence when Discord uses another one (a headset, say). The Meow page has a "Your voice" section: record my voice on/off, microphone (same as Discord, or pick one), my voice volume (0–200%), leave my voice out while muted in Discord, and Test my mics: every microphone at once, each with a live level meter on a dB scale (like Discord's input meter), with "Use" to record your voice from the one that hears you; after 15 seconds it says which one heard you best. The REC bar shows your mic (live / muted), and after saving Meow warns if your microphone stayed silent.
- `BThemer.debug()` also lists which of Discord's stores plugins can reach.
- `api.discord.rest` goes through Discord's own HTTP client, which handles your login itself. The plain-request fallback takes your token from Discord's AuthenticationStore; it used to call the multi-account token module, whose `getToken` needs a user id, so requests failed with 401 Unauthorized (e.g. Meow's recording notice). New `api.discord.sendMessage(channelId, text)` sends through Discord itself, as if you typed it; Meow's notices use it.

### Added
- Screen Effects plugin: snow, twinkling stars, warp speed, fireflies, bubbles, confetti, floating hearts, rain, thunderstorm, matrix code, autumn leaves, embers or bokeh lights; cursor trails (sparkles, stars, hearts, rainbow, bubbles, fire); click bursts (fireworks, hearts, confetti, ripple). Colours: the effect's own, your accent, rainbow or one colour. Amount, speed, size, opacity, behind-the-glass, pause when Discord isn't the active window, and Pause / resume in Shortcuts.
- Meow plugin: your own soundboards.
  - A Meow page in the settings (next to Plugins and Themes): make boards, upload sounds from your PC (several at once, or drag and drop), rename them, set an emoji and a volume, move them between boards, preview and remove them. Everything is kept on your PC, and edits also update copies already on a server's soundboard.
  - Any audio file plays for you. Sounds that fit Discord's soundboard (MP3 / OGG, up to 512 KB, about 5 seconds) are marked "Everyone": in a voice channel they play for everyone there. Meow adds them to your chosen home server's soundboard the first time, then plays them through Discord's soundboard. Other servers follow Discord's rule (Nitro and Use External Sounds).
  - A Meow button right after every Soundboard button (voice panel, call controls) opens a quick picker with your boards as tabs. Also "Open Meow soundboards" in Shortcuts.
- Plugins can fill a settings page (api.settingsPage), and right-click menu items can be greyed out (disabled).
- Per-server gradients: each server can pick a gradient preset and fine-tune its glows, base colour, exposure, animation, accents and glass tint. Anything not changed falls back to the preset, then to your own settings.
- "Gradient background" switch for your own gradient only (off = plain base colour). Servers with their own gradient keep it.
- Per-server on/off switch (keeps the settings) and a master "Per-server themes on" switch.
- Notice on the main page when the server you're in overrides its colours, with "Edit this server" and "Turn it off here".
- All the on/off switches together at the top of the main page: My theme, This server's look, Per-server looks, Liquid glass, Everything.
- A server can have its own liquid glass setting.
- Red banner on every settings page while everything is switched off (Ctrl+Alt+A), with a button to turn it back on.
- Role colours: coloured role names in chat and the member list can Shine, flow into your accent (Gradient), Glow or go Holographic, at a speed you choose. Each server can have its own style. Roles Discord already draws with its own gradient are left alone.
- Each server can also have its own font, corner roundness and message bubbles. Its settings are grouped into Gradient, Colours and glass, and Names and text.
- Plugins page: search box, a count of plugins that are on, and each plugin's settings fold away behind a Settings button.

### Changed
- Meow has its own drawn cat (head, ears, cut-out eyes, nose, mouth, whiskers) instead of an emoji, in the button, the picker and the settings sidebar. On hover it animates like Discord's own buttons: the head tilts, the ears twitch, the eyes blink and the whiskers wiggle (skipped when the OS asks for reduced motion). In the voice panel, where Discord's Soundboard icon is an animation player, Meow used to fall back to an emoji and wrap onto a second row. It now shows the cat in the icon's place and keeps the row on one line. Meow is added as its own cell in the row: Discord wraps the voice panel's Soundboard button in a cell, and Meow used to land inside it, under the button.
- Settings pages: Moonberry (on/off switches, shortcuts, advanced), Discord Theme (your own look: its own on/off, presets, wallpaper, gradient, glass, role colours, colours/font, messages and theme files), Server Theme (server looks), Plugins, Meow and Custom CSS. BThemer.open("themes") still works and opens Discord Theme.
- A plugin that's off says so inside its settings, with a "Turn it on" button. The "your theme is off" notice has a "Turn my theme on" button.
- Theme 1.5.0: embeds (link previews, bot embeds) are rounded glass cards, keeping their colour bar. Pictures and videos in embeds, and attachments in chat, have rounded corners.
- Settings redesigned: twirl-down sections that remember being closed, compact property rows, blue values you drag left/right to change (Shift for 10×), click to type or nudge with the arrow keys, colours as swatches with their hex code, and colour presets as a grid of gradient tiles. Flat underlined tabs.
- Building the installer while the old one is open now warns clearly that the old .exe was not updated, and names the new file.
- Settings pages look like Discord's own: its colours (themed or not), switches, sliders, buttons, cards and dividers, with a short description under each setting. Switches sit on the right.
- Plain wording throughout: pages are Moonberry, Plugins, Themes and Custom CSS, and settings, notices and toasts say what they do.
- Picking a colour preset for a server only replaces its colours, not its font, role style or other settings.

### Fixed
- Wallpaper: with liquid glass off, the panels are solid and cover the wallpaper completely (since the title bar follows the glass too). The Wallpaper section now says so, with a "Turn liquid glass on" button. Wallpapers are kept exactly as chosen, at any size.
- Meow: sounds longer than about 5 seconds (or WAV / FLAC / over 512 KB) only ever played for you, because Discord's soundboard won't take them. Meow now makes a small OGG/Opus copy of the first 5.2 seconds (decoded, resampled to 48 kHz and encoded on your PC with Chromium's built-in encoder, then written as a standard Ogg file) and sends that, so everyone hears it. The full sound still plays when it's just for you. Badges show "Everyone · first 5 s" / "Everyone · converted".
- Voice: the ring Discord draws around someone playing a soundboard sound is pink (Discord Theme → Voice, changeable); talking on the mic stays green.
- Voice: call tiles outlined whoever played a soundboard sound (Meow's included) in Discord's speaking green. While someone plays a soundboard sound (Discord's GUILD_SOUNDBOARD_SOUND_PLAY_START / _END), their tile and avatars now use the soundboard colour with a pulsing glow, re-applied while Discord re-renders the tile. Meow's "playing" outline and "Everyone" badges use the same pink instead of green.
- Meow: others didn't hear sounds unless a home server had been chosen, and the "choose a home server" message was easy to miss. Meow now plays in the server you're talking in: the first time there it asks to add the sound to that server's soundboard (once per server), then plays it, with no Nitro needed. The home server is optional (DM calls, servers where you can't add sounds). While you're muted or deafened, Discord won't play soundboard sounds for others, so Meow plays it just for you and says why. Errors explain the likely cause (permissions, full soundboard, Nitro for other servers).
- Ctrl+R didn't reload on some Discord builds. Be Themer now handles Ctrl+R, Ctrl+Shift+R and F5 itself, and Shortcuts has a "Reload Discord" button.
- Theme 1.5.1: the message box and the voice / user panel (bottom-left) float over scrolling content but were only lightly tinted, so messages and member names showed through them. They're now hard frosted glass: at least 92% opaque with a strong blur, and fully solid with liquid glass off.
- Theme: the window title bar was fully transparent, so the raw, unblurred wallpaper showed in a sharp strip above glass (or solid) panels. It now uses the same glass as the server list.
- Petals and other screen effects no longer appear on Discord's loading screen, and don't draw anything until the app is up.
- Message Logger missed deletes and edits that Discord delivered through code holding the original dispatch function (the gateway, i.e. other people's deletes), so those messages vanished instead of staying in red. Plugins now hook events through Discord's own interceptor, which sees every dispatch.
- Message Logger: right-clicking a channel, thread, DM, group DM, user or server always offers "Clear Message Logs (N)", which clears everything logged there at once (greyed out when nothing is). Servers are new, and "Clear all message logs" was added to Shortcuts.
- Picking a gradient preset for a server did nothing visible when you had a wallpaper image. Picking one now shows the server's gradient, and existing profiles with a preset are migrated to it.
- Picking a preset now replaces colours you'd tweaked, instead of being hidden behind them.
- A server's extra themes load after yours, so they actually override them (they used to follow folder order).
- The "theme is off" warning took no account of a server's "use only these themes".
- Broken per-server entries in settings no longer break the per-server list.
- Turning off your own theme no longer turns off servers that have their own look.
- Liquid glass off is now fully solid (some panels stayed slightly see-through and blurred).
- Loading Quotes replaced member-list names (anything inside a tooltip) with loading-screen quotes. It now only changes the loading screen's tip.

## [1.9.0] - 2026-11-13

### Added
- Plugins: Message Link Embeds, Pin DMs, Who Reacted, Translate Selection.
- `npm test`: renderer and plugin test suites (jsdom) run against a fresh build.
- Continuous integration on GitHub Actions (build check, tests, installer build on Windows).
- `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `.editorconfig`, `.gitattributes`, issue and pull request templates.
- Documentation split into `docs/plugin-api.md`, `docs/architecture.md` and `docs/development.md`.

### Changed
- Consistent product name ("Be Themer") in code, logs and UI. Persisted identifiers (data folder, loader marker) are unchanged, so existing installs keep working.
- Decorative emoji removed from menus, buttons, toasts and logs; icon buttons (copy, silent message, platform indicators) use inline SVG icons.
- Section comments use plain text instead of box-drawing banners.
- Line endings normalised to LF (C# sources CRLF).

## [1.8.0] - 2026-11-13

### Changed
- Message Logger rewritten: red text or red overlay styles, hidden toolbar buttons and grey media on deleted messages, inline edit history rendered with Discord's markdown, edit history window, kept deleted attachments, Clear history button, context menu actions, optional collapsing, ignore lists, ephemeral and nonce-replacement handling. History is kept in memory; the saved log is opt-in.
- Settings, defaults and options aligned for Silent Typing, Silent Message Toggle, Custom Idle, No Blocked Messages, Relationship Notifier, Voice Narrator, No Reply Mention, Anonymise File Names, Message Click Actions, Typing Indicator, Username Tools, Media Tools, Chat Tools, Image Zoom, Call Timer, Notification Volume, Loading Quotes, Console Janitor, Link Tools, Small Fixes, Handy Actions and Member Count.

### Added
- Plugin API: `api.contextMenu` to add or hide items in Discord's context menus.

## [1.7.0] - 2026-11-13

### Added
- 26 plugins: Silent Messages, Text Replace, Anonymise File Names, No Reply Mention, Message Click Actions, No Blocked Messages, Relationship Notifier, Custom Idle, Custom Activity, Call Timer, Voice Narrator, Voice Double-Click, Typing Indicator, Username Tools, Media Tools, Chat Tools, Image Zoom, Handy Actions, Link Tools, Notification Volume, No Taskbar Badge, Small Fixes, Keyboard Tweaks, Console Janitor, Loading Quotes, Cursor Pet.
- Plugin API: `api.discord` (stores, REST, route, messages, dispatch).
- Main process: external link opening with a protocol allow-list.

## [1.6.0] - 2026-11-13

### Changed
- Pop-ups, menus and profiles are solid by default; message bubbles are opt-in.

### Added
- 15 colour presets for per-server looks.

## [1.5.2] - 2026-11-13

### Added
- Per-server wallpaper and accent colours.

## [1.5.1] - 2026-11-13

### Fixed
- Solid profile pop-outs; no two-tone message groups.

## [1.5.0] - 2026-11-13

### Added
- Message Logger, chat tools, privacy and UI plugins.

## [1.4.0] - 2026-11-13

### Added
- Theme on/off switches and per-server themes.

## [1.3.1] - 2026-11-13

### Fixed
- Settings page crash.

### Changed
- Removed the floating launcher button; cleaner window chrome.

## [1.3.0] - 2026-11-13

### Added
- Native Be Themer section in Discord's User Settings.
- Windows installer (GUI and CLI) that downloads releases from GitHub.

## [1.0.0] - 2026-11-12

### Added
- Initial release: standalone Discord client mod with the glass theme, live appearance settings and a plugin system.

[1.9.0]: https://github.com/hyperflore/Be-Themer/compare/d13cd80...HEAD
[1.8.0]: https://github.com/hyperflore/Be-Themer/compare/e9d0200...d13cd80
[1.7.0]: https://github.com/hyperflore/Be-Themer/compare/3b1d9df...e9d0200
