const LINKS = {
    hideStore: 'a[href="/store"]',
    hideShop: 'a[href="/shop"]',
    hideQuests: 'a[href="/quest-home"]',
};

BThemer.definePlugin({
    id: "hideNitro",
    name: "Hide Nitro & Shop",
    description: "Hides the Nitro, Shop and Quests entries in the DM list and the gift button in the message box.",
    author: "Be Themer",
    version: "1.1.0",

    settings: {
        hideStore: { type: "toggle", label: "Nitro tab", default: true },
        hideShop: { type: "toggle", label: "Shop tab", default: true },
        hideQuests: { type: "toggle", label: "Quests tab", default: true },
        hideGift: { type: "toggle", label: "Gift button", default: true },
    },

    css(s) {
        const links = Object.entries(LINKS).filter(([key]) => s[key]).map(([, sel]) => sel);
        const rules = [];
        if (links.length) {
            const any = `:is(${links.join(", ")})`;
            rules.push(`${any}, li:has(> ${any}), li:has(> * > ${any}) { display: none !important; }`);
        }
        if (s.hideGift) {
            rules.push(`form [class*="buttons_"] > :has(button[aria-label*="gift" i]), form button[aria-label*="gift" i] { display: none !important; }`);
        }
        return rules.join("\n");
    },
});
