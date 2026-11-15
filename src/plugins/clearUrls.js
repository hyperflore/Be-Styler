const EVERYWHERE = /^(utm_\w+|fbclid|gclid|gclsrc|dclid|gbraid|wbraid|msclkid|yclid|twclid|ttclid|mc_cid|mc_eid|igshid|igsh|_hsenc|_hsmi|mkt_tok|vero_id|oly_anon_id|oly_enc_id|rb_clickid|s_cid|ref_src|ref_url|trk|trkCampaign|sc_campaign|wt_mc|ncid)$/i;

const PER_SITE = [
    [/(^|\.)(twitter|x)\.com$/i, /^(s|t|ref_src|ref_url)$/i],
    [/(^|\.)(youtube\.com|youtu\.be)$/i, /^(si|feature|pp)$/i],
    [/(^|\.)spotify\.com$/i, /^(si|context|nd|dlsi)$/i],
    [/(^|\.)instagram\.com$/i, /^(igsh|igshid|img_index)$/i],
    [/(^|\.)tiktok\.com$/i, /^(_r|_t|is_from_webapp|sender_device|sender_web_id|is_copy_url|share_app_id|share_item_id)$/i],
    [/(^|\.)reddit\.com$/i, /^(share_id|utm_\w+|ref|ref_source)$/i],
    [/(^|\.)amazon\.[a-z.]+$/i, /^(ref|ref_|pd_rd_\w+|pf_rd_\w+|crid|sprefix|qid|sr|dib|dib_tag|content-id|linkCode|linkId|tag)$/i],
    [/(^|\.)facebook\.com$/i, /^(mibextid|sfnsn|__tn__|__cft__\[0\])$/i],
];

const URL_RE = /https?:\/\/[^\s<>"'`)\]]+/g;

function cleanUrl(raw) {
    let url;
    try {
        url = new URL(raw);
    } catch {
        return raw;
    }
    const site = PER_SITE.filter(([host]) => host.test(url.hostname)).map(([, params]) => params);
    let changed = false;
    for (const key of [...url.searchParams.keys()]) {
        if (EVERYWHERE.test(key) || site.some(re => re.test(key))) {
            url.searchParams.delete(key);
            changed = true;
        }
    }
    if (!changed) return raw;
    let out = url.href;
    if (!url.search) out = out.replace(/\?(?=#|$)/, "");
    return out;
}

const cleanText = text => text.replace(URL_RE, cleanUrl);

const MESSAGE_ENDPOINT = /\/api\/v\d+\/channels\/\d+\/messages(\/\d+)?(\?|$)/;

function cleanBody(body) {
    const fix = json => {
        let data;
        try {
            data = JSON.parse(json);
        } catch {
            return null;
        }
        if (!data || typeof data.content !== "string") return null;
        const content = cleanText(data.content);
        if (content === data.content) return null;
        data.content = content;
        return JSON.stringify(data);
    };
    if (typeof body === "string") return fix(body);
    if (typeof FormData !== "undefined" && body instanceof FormData && typeof body.get("payload_json") === "string") {
        const fixed = fix(body.get("payload_json"));
        if (!fixed) return null;
        body.set("payload_json", fixed);
        return body;
    }
    return null;
}

BThemer.definePlugin({
    id: "clearUrls",
    name: "Clear URLs",
    description: "Removes tracking junk (utm_*, fbclid, si, …) from links in messages you send or edit.",
    author: "Be Themer",
    version: "1.0.0",

    settings: {
        notify: { type: "toggle", label: "Show a notice when a link was cleaned", default: false },
    },

    start(api) {
        api.net.onRequest(req => {
            if ((req.method !== "POST" && req.method !== "PATCH") || !MESSAGE_ENDPOINT.test(req.url)) return;
            const body = cleanBody(req.body);
            if (!body) return;
            if (api.settings.notify) api.toast("Tracking removed from your link");
            return { body };
        });
    },
});
