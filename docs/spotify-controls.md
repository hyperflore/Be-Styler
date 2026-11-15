# Spotify Controls

A Spotify player above your user panel (bottom left): album art, track and artist links, a seek bar, play/pause, previous/next, shuffle, repeat, volume, Liked Songs and device switching.

Spotify only allows playback control for **Premium** accounts. Without Premium the player shows what's playing, and the buttons report that Premium is needed.

## Keeping Spotify running

With **Keep Spotify running in the tray** on (the default), Be Themer keeps the Spotify desktop app running while the plugin is enabled. If Spotify isn't running, or quits when you close its window, it's restarted with `--minimized`, so it sits in the tray and there's always a device to control. Pressing play (or picking a search result) with nothing active wakes that device, starting Spotify first if needed. Turn the setting off to stop this. The Microsoft Store version can't be started minimised, so it opens its window.

## Logging in

Press **Log in with Spotify** on the player, or use **Be Themer → Quick actions → Spotify: log in with Spotify**. Spotify's official login page opens in your browser. Approve it, come back to Discord, and the player connects within a few seconds.

This uses Discord's own Spotify connection, so nothing needs setting up. The same thing happens when you link Spotify under **Discord Settings → Connections**, and Spotify shows up there afterwards. To log out, remove it there.

How it works: the plugin asks Discord to start its Spotify link (`/connections/spotify/authorize`) and opens the returned Spotify URL. Afterwards it asks Discord for the access token of that link. These Discord endpoints aren't documented and could change.

### Log in with Spotify (full access)

**Log in with Spotify** on the player (or **Quick actions → Spotify: log in with Spotify**) opens Spotify's own login page in a small window. Log in as usual (email, Google, Apple or Facebook). The window closes by itself and the player connects.

There's nothing to copy or paste. The session lives in its own isolated storage (`persist:bt-spotify`), apart from Discord's. For the access token, Be Themer loads Spotify's web player hidden in that session and reads the token the web player gets for itself. It does this again when the token expires, roughly hourly. This token has full access, including Liked Songs. **Spotify: log out** clears the session.

This uses Spotify's web player and isn't a documented API for other apps, so a Spotify update could break it. Discord's linked account stays as the backup. While only that link is in use, the player shows a small **Log in for Liked Songs** button, because Discord's link can't change Liked Songs.

### For maintainers: shipping your own Spotify app

If Discord's endpoints ever stop working, a build can set `BUILTIN_CLIENT_ID` in `src/plugins/spotifyControls.js` to its own Spotify app. Register that app with the Redirect URI `http://127.0.0.1:8888/callback` and Web API ticked. Its PKCE login is then tried first, with Discord's connection as the backup. While the app is in development mode, Spotify only lets 25 users you add by hand log in.
