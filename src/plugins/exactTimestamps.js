const ATTR = "data-bt-exact";

const format = (iso, style) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return style === "time"
        ? d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

let style = "full";
const tag = el => {
    const text = format(el.getAttribute("datetime"), style);
    if (text) el.setAttribute(ATTR, text);
};

BThemer.definePlugin({
    id: "exactTimestamps",
    name: "Exact Timestamps",
    description: "Shows the exact date and time (with seconds) next to message timestamps.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        when: { type: "select", label: "Show", options: [["hover", "When hovering a message"], ["always", "Always"]], default: "hover" },
        style: { type: "select", label: "Format", options: [["full", "Date + time"], ["time", "Time with seconds"]], default: "full" },
    },

    css: s => {
        const scope = s.when === "always" ? "" : '[class*="message_"]:hover ';
        return `${scope}h3 time[${ATTR}]::after { content: " · " attr(${ATTR}); opacity: .7; font-size: .95em; }`;
    },

    start(api) {
        style = api.settings.style;
        api.observe("time[datetime]", tag);
        api.onDispose(() => document.querySelectorAll(`[${ATTR}]`).forEach(el => el.removeAttribute(ATTR)));
    },

    onSettingChange(key, value) {
        if (key !== "style") return;
        style = value;
        document.querySelectorAll("time[datetime]").forEach(tag);
    },
});
