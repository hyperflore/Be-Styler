const PRESET = [
    "Polishing the glass…",
    "Brewing a fresh theme…",
    "Fluffing the sakura petals…",
    "Counting pixels, carefully.",
    "Your wallpaper missed you.",
    "Loading vibes…",
    "Teaching messages to float.",
    "Be Themer is warming up…",
    "Gradient goes brrr…",
    "Hydrate while you wait.",
    "Rounding every corner just right.",
    "Asking the servers nicely…",
    "Untangling the emoji drawer.",
    "Dusting off your DMs.",
    "Stretching before the scroll.",
];

BThemer.definePlugin({
    id: "loadingQuotes",
    name: "Loading Quotes",
    description: "Your own (or Be Themer's) lines on Discord's loading screen.",
    author: "Be Themer",
    version: "2.0.0",
    enabledByDefault: true,

    settings: {
        enablePluginPresetQuotes: { type: "toggle", label: "Use Be Themer's quotes", default: true },
        enableDiscordPresetQuotes: { type: "toggle", label: "Keep Discord's own quotes in the mix", default: false },
        replaceEvents: { type: "toggle", label: "Also replace special event (e.g. Halloween) quotes", default: true },
        additionalQuotes: { type: "text", label: "Your own quotes", default: "" },
        additionalQuotesDelimiter: { type: "text", label: "Separator between your quotes", default: "|" },
    },

    start(api) {
        const s = api.settings;
        const pick = original => {
            const sep = s.additionalQuotesDelimiter || "|";
            const own = String(s.additionalQuotes || "").split(sep).map(q => q.trim()).filter(Boolean);
            const pool = [...own, ...(s.enablePluginPresetQuotes ? PRESET : [])];
            if (s.enableDiscordPresetQuotes && original) pool.push(original);
            return pool.length ? pool[Math.floor(Math.random() * pool.length)] : original;
        };
        const TIP = '[class^="tip_"], [class*=" tip_"]';
        const TITLE = '[class^="tipTitle_"], [class*=" tipTitle_"]';
        api.observe(`${TITLE}, ${TIP}`, el => {
            if (el.closest('[class^="layers_"], [class*=" layers_"], [role="list"], [role="listitem"], [id^="chat-messages"]')) return;
            const target = el.matches(TITLE) ? el.nextElementSibling : el;
            if (!target || !target.matches(TIP)) return;
            if (target.dataset.btQuote) return;
            const isEvent = !!target.closest('[class*="event"], [class*="seasonal"], [class*="halloween"]');
            if (isEvent && !s.replaceEvents) return;
            target.dataset.btQuote = "1";
            const next = pick(target.textContent.trim());
            if (next) target.textContent = next;
        });
    },
});
