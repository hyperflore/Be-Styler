const fs = require("fs");
const path = require("path");

function variantFor(root) {
    const info = JSON.parse(fs.readFileSync(path.join(root, "dist", "build-info.json"), "utf8"));
    const features = info.features || {};
    return { info, hasPlugin: id => info.plugins.includes(id), featureOn: name => features[name] !== false };
}

module.exports = { variantFor };
