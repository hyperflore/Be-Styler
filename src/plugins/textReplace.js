const SEND = /\/api\/v\d+\/channels\/\d+\/messages(\/\d+)?(\?|$)/;

function parseRules(text) {
    const rules = [];
    for (const line of String(text || "").split(/\r?\n|;;/)) {
        const at = line.indexOf("=>");
        if (at < 0) continue;
        const find = line.slice(0, at).trim();
        const replace = line.slice(at + 2).trim().replace(/\\n/g, "\n");
        if (!find) continue;
        const rx = /^\/(.+)\/([gimsuy]*)$/.exec(find);
        try {
            rules.push({ match: rx ? new RegExp(rx[1], rx[2].includes("g") ? rx[2] : rx[2] + "g") : find, replace });
        } catch { }
    }
    return rules;
}

function unindentBlocks(text) {
    return text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
        const lines = code.split("\n");
        const indents = lines.filter(l => l.trim()).map(l => /^[ \t]*/.exec(l)[0].length);
        const cut = indents.length ? Math.min(...indents) : 0;
        return "```" + lang + "\n" + lines.map(l => l.slice(cut)).join("\n") + "```";
    });
}

const applyRules = (text, rules) =>
    rules.reduce((t, r) => (typeof r.match === "string" ? t.split(r.match).join(r.replace) : t.replace(r.match, r.replace)), text);

BThemer.definePlugin({
    id: "textReplace",
    name: "Text Replace",
    description: "Auto-replace text in messages you send (your own find => replace rules) and unindent code blocks.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        rules: { type: "text", label: "Rules (find => replace, separate with ;;)", default: "" },
        unindent: { type: "toggle", label: "Unindent code blocks", default: true },
        skipCode: { type: "toggle", label: "Don't replace inside code", default: true },
    },

    start(api) {
        api.net.onRequest(req => {
            if ((req.method !== "POST" && req.method !== "PATCH") || !SEND.test(req.url) || typeof req.body !== "string") return;
            let body;
            try {
                body = JSON.parse(req.body);
            } catch {
                return undefined;
            }
            if (typeof body.content !== "string" || !body.content) return undefined;
            const rules = parseRules(api.settings.rules);
            let text = body.content;
            if (rules.length) {
                text = api.settings.skipCode
                    ? text.split(/(```[\s\S]*?```|`[^`]*`)/).map((part, i) => (i % 2 ? part : applyRules(part, rules))).join("")
                    : applyRules(text, rules);
            }
            if (api.settings.unindent) text = unindentBlocks(text);
            if (text === body.content) return undefined;
            body.content = text;
            return { body: JSON.stringify(body) };
        });
    },
});
