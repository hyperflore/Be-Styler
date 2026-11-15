import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VENDOR = path.join(ROOT, "vendor");
const require = createRequire(import.meta.url);
fs.mkdirSync(VENDOR, { recursive: true });

const pkg = require("@ghostery/adblocker-electron/package.json");
await esbuild.build({
    stdin: { contents: 'module.exports = require("@ghostery/adblocker-electron");', resolveDir: ROOT, loader: "js" },
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node22",
    external: ["electron"],
    minify: true,
    legalComments: "inline",
    outfile: path.join(VENDOR, "adblock.js"),
    banner: { js: `/* @ghostery/adblocker-electron ${pkg.version} (MPL-2.0, https://github.com/ghostery/adblocker), bundled for Be Themer's Lazy browser. */` },
    plugins: [{
        name: "preload-path",
        setup(build) {
            build.onLoad({ filter: /adblocker-electron[\\/]dist[\\/].*preload_path\.(c?js)$/ }, () => ({
                contents: 'exports.PRELOAD_PATH = require("node:path").join(__dirname, "adblock-preload.js");',
                loader: "js",
            }));
        },
    }],
});
fs.copyFileSync(require.resolve("@ghostery/adblocker-electron-preload"), path.join(VENDOR, "adblock-preload.js"));
const kb = f => `${(fs.statSync(path.join(VENDOR, f)).size / 1024).toFixed(1)} KB`;
console.log(`✔ vendor/adblock.js (${kb("adblock.js")}) · vendor/adblock-preload.js (${kb("adblock-preload.js")})`);
