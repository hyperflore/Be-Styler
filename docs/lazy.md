# Lazy (browser)

A small browser above your user panel, under the Spotify and YouTube widgets when those are on.

A brown-themed card with the Lazy fox as its logo, and its own interface:

- **Tabs:** a tab strip under the header, like a regular browser. **+** opens a new tab on the start page. Click a tab to switch to it, and use × (or middle-click) to close it. Links that open a new window, and middle-clicked search results, open in a new tab. Each tab keeps its own history and Shields count.
- **Start page:** the fox, a big search box, **Recently visited** sites, and **Recommended** sites by category (Popular, News, Learn, Fun, Shopping).
- **Suggestions:** search suggestions appear under the search box and the address bar as you type. Use the arrow keys and Enter, or click one.
- **Search results:** results show in Lazy's own list (site icon and name, title, a short description) with **More results**. Click to open a result in the current tab, or middle-click for a new tab.
- **Toolbar:** back, forward, reload/stop, the address bar (a web address opens directly, anything else searches), back to results, and the start page.
- **Header:** the site's icon and title, the **Shields badge** (ads and trackers blocked in this tab; click it to switch Shields on or off), **open in a big window** and the **chevron** to collapse.
- **Colours:** presets (Cocoa, Midnight, Forest, Rose, Ocean) or Custom, with your own background, panel, accent and text colours. Every part of the widget follows them.
- **Settings:** **Shields** on/off, the Shields level (Standard or Aggressive), search suggestions on/off, browser height (220–700 px), reopening the last page after a restart, **Update** for the filter lists, and **Clear** for Lazy's cookies, logins and cache.

## Shields

Lazy blocks with the standard ad-block filter lists: EasyList, EasyPrivacy, uBlock Origin's filters, Peter Lowe's list and others. It handles network requests, cosmetic (element-hiding) filters and scriptlets, which defuse anti-adblock and tracking scripts in the page.

- **Standard:** ads and trackers.
- **Aggressive:** also cookie banners, popups and other annoyances.

The **Shields** switch in the settings (or a click on the badge) turns blocking off and on.

The engine is [Ghostery's adblocker](https://github.com/ghostery/adblocker) (MPL-2.0), bundled as `dist/adblock.js` (plus its page preload `dist/adblock-preload.js`) by `npm run build:adblock`. The lists are downloaded prebuilt, cached in `%APPDATA%\B-Themer\lazy-shields-*.bin`, and refreshed every 3 days or when you press **Update**.

## How it works

- **Suggestions** come from DuckDuckGo's public autocomplete, and site icons on the start page from DuckDuckGo's icon service.
- **Search:** Brave Search's results page loads in a hidden page in Lazy's own session (it turns away plain HTTP clients). Lazy reads the results out of that page and draws them in its own list. If the engine ever asks to check you're human, its page opens so you can do that, and searching works again afterwards.
- **Isolated session:** every page runs in its own session (`persist:bt-lazy`), with its own cookies and logins, apart from Discord's. Shields only apply to that session, so Discord's own traffic is never filtered.
- **Off-screen pages:** each tab is a hidden off-screen Chromium page (Electron offscreen rendering). Its frames (JPEG, up to 30 fps, only for the visible tab) are streamed into a `<canvas>` in the widget. Clicks, scrolling and typing go back to the page as input events, copy/cut/paste/select-all/undo/redo map to the page's own edit commands, and the page's mouse cursor is mirrored. Nothing is laid over Discord's window, so Discord's menus and dialogs sit on top normally and the page has rounded corners. A troubleshooting log is written to `%APPDATA%\B-Themer\lazy-debug.log`.
- **New windows:** links that try to open a new window open in a new tab. **Open in a big window** shows the page in a normal resizable window with the same session and Shields.
- **User agent:** the browser identifies itself as regular Chrome so sites don't serve a broken "unsupported browser" page.
