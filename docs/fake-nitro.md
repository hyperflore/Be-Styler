# Fake Nitro implementation

Enable **Be Themer > Plugins > Fake Nitro**, open its settings, then choose the features you want. Stream quality unlock, forced capture resolution/FPS and keeping previews active are optional and off by default. Restart Discord once after updating Be Themer so source patches can reach factories before Discord evaluates them. Subsequent setting changes take effect without restarting; an already open quality picker may need reopening.

## Targets

| Target | Change |
| --- | --- |
| Factories containing `STREAM_FPS_OPTION` or `ApplicationStreamingOption` | Use an undefined `guildPremiumTier` requirement while stream quality unlock is active. Preserve the original tier otherwise. |
| `canStreamQuality` export | Add a conditional availability wrapper before module execution. |
| `streamerPaused()` and the focus check in `StreamTile` | Optionally keep local stream/PiP previews active when Discord loses focus. This is preview behavior, not a guarantee that a minimized application's capture continues producing frames. |
| Composer `onMessageSend` / `onMessageEdit` hooks | Replace restricted custom emoji and server sticker selections before sending. Preserve known locally usable media and the existing pending-sticker-link submission fallback. |
| Current user's `perks.activePerksBitmask` | Adds the emoji/sticker picker bits, plus the client theme (`*CLIENT_THEME*`) and app icon (`*APP_ICON*`) perk bits looked up from Discord's perk enum at runtime. Client-side only; originals are restored when the plugin or toggle is turned off. |
| Outgoing message POST/PATCH requests | Fallback transformation for custom emoji markdown and restricted sticker IDs, including edits. |
| Message-content CDN links | Render emoji/sticker images locally, with optional mixed-message support. Only Discord CDN hosts are accepted. Original link nodes are restored when disabled. |
| `MediaEngineStore.getMediaEngine().connections` | Apply optional capture constraints and stream parameters only where `streamUserId` is the current user. Restore saved constraints/parameters on shutdown. |

Each source bridge consults the running plugin and setting at call time. Missing or changed source signatures leave Discord's original factory intact and produce patch diagnostics in `BThemer.debug()`. Factories already executed before Be Themer starts require a restart. Forced constraints can be rejected by the capture device; failures are logged, and a setting change retries them. Actual quality remains subject to capture and encoder behavior.

The receiving implementation uses Be Themer's managed DOM observer rather than Vencord's AST renderer hooks. Recipients without compatible rendering see links/media. Animated emoji and GIF stickers retain their asset formats. APNG stickers use a raster preview; APNG-to-GIF upload conversion is not implemented here. Unknown sticker IDs are preserved rather than removing the selection.

## Public implementation references

- [Vencord FakeNitro](https://github.com/Vendicated/Vencord/blob/main/src/plugins/fakeNitro/index.tsx): quality metadata, availability gates, pre-send conversion, and local media rendering patterns.
- [Vesktop ScreenSharePicker](https://github.com/Vencord/Vesktop/blob/main/src/renderer/components/ScreenSharePicker.tsx): capture constraints and video stream parameters.
- [Equicord NeverPausePreviews](https://github.com/Equicord/Equicord/blob/main/src/equicordplugins/neverPausePreviews/index.tsx): preview pause and focus targets. This related plugin is from Equicord, not upstream Vencord.

These projects publish their referenced files under GPL-3.0-or-later. The Be Themer changes adapt the targeting patterns to its existing plugin lifecycle instead of importing their plugin implementations.

## Verification

`node tests/fake-nitro.test.js` checks send/edit fallback, repeated emoji, usable-media preservation, CDN-only previews, source gates and preview pause toggles, own-stream constraints, and cleanup. `npm run check` checks source syntax. Live Discord verification still needs opening the quality picker, starting a stream, checking capture quality, and testing rendering with plugin toggles.
