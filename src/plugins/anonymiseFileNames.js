const UPLOAD = /\/api\/v\d+\/channels\/\d+\/(attachments|messages)(\?|$)/;
const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const splitName = name => {
    const n = String(name || "file");
    const spoiler = n.startsWith("SPOILER_") ? "SPOILER_" : "";
    const base = n.slice(spoiler.length);
    const ext = (/(\.tar)?\.[a-z0-9]{1,8}$/i.exec(base) || [""])[0];
    return { spoiler, ext };
};

BThemer.definePlugin({
    id: "anonymiseFileNames",
    name: "Anonymise File Names",
    description: "Uploads get an anonymous file name (random, fixed or timestamp); the extension is kept.",
    author: "Be Themer",
    version: "2.0.0",

    settings: {
        anonymiseByDefault: { type: "toggle", label: "Anonymise by default (Shift while sending keeps real names)", default: true },
        method: { type: "select", label: "Method", options: [["random", "Random characters"], ["consistent", "Fixed name"], ["timestamp", "Timestamp"]], default: "random" },
        randomisedLength: { type: "range", label: "Random characters length", min: 1, max: 32, default: 7 },
        consistent: { type: "text", label: "Fixed name", default: "image" },
    },

    start(api) {
        let shift = false;
        const track = e => (shift = e.shiftKey);
        for (const t of ["keydown", "keyup", "mousedown"]) window.addEventListener(t, track, true);
        api.onDispose(() => ["keydown", "keyup", "mousedown"].forEach(t => window.removeEventListener(t, track, true)));

        const anonymise = original => {
            const { spoiler, ext } = splitName(original);
            const s = api.settings;
            let name;
            if (s.method === "consistent") name = s.consistent || "image";
            else if (s.method === "timestamp") name = String(Date.now());
            else {
                name = "";
                for (const b of crypto.getRandomValues(new Uint8Array(Math.max(1, s.randomisedLength)))) name += CHARS[b % CHARS.length];
            }
            return spoiler + name + ext;
        };
        const names = new Map();
        const rename = n => {
            if (!names.has(n)) names.set(n, anonymise(n));
            if (names.size > 200) names.delete(names.keys().next().value);
            return names.get(n);
        };

        api.net.onRequest(req => {
            if (req.method !== "POST" || !UPLOAD.test(req.url) || typeof req.body !== "string") return;
            if (api.settings.anonymiseByDefault === shift) return;
            let body;
            try {
                body = JSON.parse(req.body);
            } catch {
                return undefined;
            }
            let changed = false;
            for (const list of [body.files, body.attachments]) {
                if (!Array.isArray(list)) continue;
                for (const f of list) {
                    if (f && typeof f.filename === "string") {
                        f.filename = rename(f.filename);
                        changed = true;
                    }
                }
            }
            return changed ? { body: JSON.stringify(body) } : undefined;
        });
    },
});
