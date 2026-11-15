const ATTR = "data-bt-keyword";
const CONTENT = '[id^="message-content-"]';

let words = [];
const parseWords = text =>
    String(text || "")
        .split(",")
        .map(w => w.trim().toLowerCase())
        .filter(Boolean);

const mark = el => {
    const item = el.closest("li");
    if (!item) return;
    const text = el.textContent.toLowerCase();
    if (words.some(w => text.includes(w))) item.setAttribute(ATTR, "");
    else item.removeAttribute(ATTR);
};
const markAll = () => document.querySelectorAll(CONTENT).forEach(mark);
const clearAll = () => document.querySelectorAll(`[${ATTR}]`).forEach(el => el.removeAttribute(ATTR));

BThemer.definePlugin({
    id: "keywordHighlight",
    name: "Keyword Highlight",
    description: "Highlights messages containing any of your keywords (comma-separated).",
    author: "Be Themer",
    version: "1.1.0",

    settings: {
        keywords: { type: "text", label: "Keywords", default: "" },
        color: { type: "color", label: "Highlight colour", default: "#ffd166" },
    },

    css: s => `
        li[${ATTR}] > [class*="message_"] {
            background: color-mix(in srgb, ${s.color} 14%, transparent) !important;
            box-shadow: inset 3px 0 0 ${s.color} !important;
        }`,

    start(api) {
        words = parseWords(api.settings.keywords);
        api.observe(CONTENT, mark);
        api.onDispose(clearAll);
    },

    onSettingChange(key, value) {
        if (key === "keywords") {
            words = parseWords(value);
            markAll();
        }
    },
});
