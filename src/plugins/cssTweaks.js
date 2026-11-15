BThemer.definePlugin({
    id: "cssTweaks",
    name: "Small Fixes",
    description: "Switchable visual tweaks: still typing dots, plain folders, full-size images, no profile themes and more.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        noTypingAnimation: { type: "toggle", label: "Still typing dots (no animation)", default: true },
        plainFolderIcon: { type: "toggle", label: "Plain server folder icons", default: false },
        noMosaic: { type: "toggle", label: "Show images full size instead of a grid", default: false },
        fixCodeblockGap: { type: "toggle", label: "Remove the gap under code blocks", default: true },
        noProfileThemes: { type: "toggle", label: "Hide other people's profile colours", default: false },
        hideFriendRequestsCount: { type: "toggle", label: "Hide the incoming friend requests count", default: false },
        hideMessageRequestsCount: { type: "toggle", label: "Hide the message requests count", default: false },
        hidePremiumOffersCount: { type: "toggle", label: "Hide the Nitro offers count", default: false },
        colorSighted: { type: "toggle", label: "Plain round status dots (no shapes)", default: false },
    },

    css: s =>
        [
            s.noTypingAnimation && `[class*="typing_"] [class*="dots_"] *, [class*="typingDots"] * { animation: none !important; }`,
            s.plainFolderIcon &&
                `[class*="folderIconWrapper_"] [class*="closedFolderIconWrapper_"] { display: none !important; }
                 [class*="folderIconWrapper_"] [class*="expandedFolderIconWrapper_"] { display: flex !important; opacity: 1 !important; transform: none !important; }`,
            s.noMosaic &&
                `[class*="visualMediaItemContainer_"], [class*="oneByOneGrid_"], [class*="oneByTwoGrid_"], [class*="twoByOneGrid_"], [class*="twoByTwoGrid_"], [class*="threeByThreeGrid_"] { display: flex !important; flex-direction: column !important; height: auto !important; }
                 [class*="mosaicItem_"] { width: auto !important; max-width: 100% !important; height: auto !important; }
                 [class*="mosaicItem_"] img, [class*="mosaicItem_"] video { object-fit: contain !important; height: auto !important; }`,
            s.fixCodeblockGap && `[class*="markup_"] pre { margin-bottom: 0 !important; } [class*="markup_"] pre + br { display: none !important; }`,
            s.noProfileThemes &&
                `[class*="userProfileOuter_"], [class*="userPopoutOuter_"], [class*="userProfileModalOuter_"], [class*="outer_"][class*="custom-theme-background"] {
                    --profile-gradient-primary-color: var(--background-floating) !important;
                    --profile-gradient-secondary-color: var(--background-floating) !important;
                    --profile-gradient-overlay-color: transparent !important;
                    --profile-body-background-color: var(--background-floating) !important; }`,
            s.hideFriendRequestsCount && `[data-list-item-id*="friends"] [class*="numberBadge_"], [class*="tabBar_"] [aria-label*="Pending"] [class*="numberBadge_"] { display: none !important; }`,
            s.hideMessageRequestsCount && `[data-list-item-id*="message-requests"] [class*="numberBadge_"], [data-list-item-id*="message_requests"] [class*="numberBadge_"] { display: none !important; }`,
            s.hidePremiumOffersCount && `[data-list-item-id*="premium"] [class*="numberBadge_"], [data-list-item-id*="nitro"] [class*="numberBadge_"], [data-list-item-id*="shop"] [class*="numberBadge_"] { display: none !important; }`,
            s.colorSighted &&
                `rect[mask*="status-idle"], rect[mask*="status-dnd"], rect[mask*="status-offline"], rect[mask*="status-online-mobile"] { mask: url(#svg-mask-status-online) !important; }`,
        ]
            .filter(Boolean)
            .join("\n"),
});
