# YouTube

A YouTube player above your user panel. When Spotify Controls is also on, it sits right under the Spotify player.

- **Search:** type in the search bar and results appear as you type. Click a result, or press Enter for the highlighted one. The arrow keys move through the results and Esc clears the search.
- **Links:** paste a YouTube link (`watch?v=`, `youtu.be/`, `shorts/`, `live/`, playlists, `&t=` timestamps) and it plays right away.
- **Header:** shows the title and channel. Its buttons open the video on youtube.com at the current time, stop the video, and collapse the widget with the chevron.
- **Collapsed:** one row with the title, a red play/pause button and a thin progress line. The video keeps playing.
- **Settings:** **Show the video** (off gives an audio-only bar) and **Reopen the last video after restarting Discord**.

## Following channels (no sign-in)

Google blocks sign-in from windows inside apps, so this plugin doesn't sign in. Instead you follow channels, and their latest videos (newest first) appear under the library button → **Subscriptions**. **Channels** lists who you follow; click one to see only its videos, or × to unfollow.

Ways to follow:
- **Plugin settings:** paste a channel link (`youtube.com/@name`, `/channel/UC…`, `/c/…`, `/user/…`) or an `@handle` into **Channel to follow**, then press **Follow**.
- **Search bar:** paste a channel link there and it's followed right away.
- **Import from Google Takeout:** go to takeout.google.com, click Deselect all, tick **YouTube and YouTube Music**, and set "All YouTube data included" to only *subscriptions*. Export, unzip, then press **Import…** in the plugin settings and pick `subscriptions.csv`.

Videos come from YouTube's public per-channel feeds (`/feeds/videos.xml?channel_id=…`), about the latest 15 per channel. Shorts are hidden unless you turn on **Show Shorts in Subscriptions**. Liked videos and Watch later aren't available without signing in.

## How it works

- **Playback** uses YouTube's normal embedded player, controlled through its `postMessage` API (play/pause, title and progress). Videos whose owners turned off embedding can't play here; use the open-on-YouTube button for those.
- **Search** reads youtube.com's own results page (the `ytInitialData` the site is built from) in Discord's main process. YouTube has no search API that works without a key, so a YouTube redesign can break this until it's updated.
- **Content-Security-Policy:** Be Themer allows YouTube's player frame and thumbnail images (`i.ytimg.com`) on Discord's page.
