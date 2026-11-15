"use strict";

const path = require("path");

const MARKER = "B-Themer loader";
const ORIGINAL_NAME = "app.orig.asar";
const LEGACY_START = "// >>> B-Themer >>>";
const LEGACY_END = "// <<< B-Themer <<<";
const KNOWN_MARKERS = [MARKER, "Moonberry loader"];

function buildAsar(files) {
    const tree = { files: {} };
    let offset = 0;
    for (const { name, data } of files) {
        tree.files[name] = { size: data.length, offset: String(offset) };
        offset += data.length;
    }
    const json = Buffer.from(JSON.stringify(tree), "utf8");
    const padded = (json.length + 3) & ~3;
    const header = Buffer.alloc(8 + padded);
    header.writeUInt32LE(4 + padded, 0);
    header.writeUInt32LE(json.length, 4);
    json.copy(header, 8);
    const size = Buffer.alloc(8);
    size.writeUInt32LE(4, 0);
    size.writeUInt32LE(header.length, 4);
    return Buffer.concat([size, header, ...files.map(f => f.data)]);
}

function readAsarFile(asarPath, inner, fsImpl = require("fs")) {
    const fd = fsImpl.openSync(asarPath, "r");
    try {
        const sizeBuf = Buffer.alloc(8);
        fsImpl.readSync(fd, sizeBuf, 0, 8, 0);
        const headerSize = sizeBuf.readUInt32LE(4);
        const header = Buffer.alloc(headerSize);
        fsImpl.readSync(fd, header, 0, headerSize, 8);
        const json = JSON.parse(header.toString("utf8", 8, 8 + header.readUInt32LE(4)));

        let node = json;
        for (const part of inner.split("/")) {
            node = node.files && node.files[part];
            if (!node) throw new Error(`${inner} not found in ${asarPath}`);
        }
        if (node.unpacked) return fsImpl.readFileSync(path.join(`${asarPath}.unpacked`, inner));

        const data = Buffer.alloc(node.size);
        fsImpl.readSync(fd, data, 0, node.size, 8 + headerSize + Number(node.offset));
        return data;
    } finally {
        fsImpl.closeSync(fd);
    }
}

function shimSource(mainPath) {
    return [
        `// ${MARKER}. Discord's original app is in ${ORIGINAL_NAME}.`,
        `"use strict";`,
        `const path = require("path");`,
        `const { app } = require("electron");`,
        `const original = path.join(__dirname, "..", ${JSON.stringify(ORIGINAL_NAME)});`,
        `try {`,
        `    require(${JSON.stringify(mainPath)});`,
        `} catch (err) {`,
        `    console.error("[Be Themer] failed to load, so Discord started without it:", err);`,
        `}`,
        `const pkg = require(path.join(original, "package.json"));`,
        `const entry = path.join(original, pkg.main || "index.js");`,
        `if (typeof app.setAppPath === "function") app.setAppPath(original);`,
        `if (require.main) require.main.filename = entry;`,
        `require(entry);`,
        ``,
    ].join("\n");
}

function buildShim(originalPackageJson, mainPath) {
    const pkg = JSON.parse(originalPackageJson);
    pkg.main = "index.js";
    return buildAsar([
        { name: "index.js", data: Buffer.from(shimSource(mainPath), "utf8") },
        { name: "package.json", data: Buffer.from(JSON.stringify(pkg), "utf8") },
    ]);
}

function isShim(asarPath, fsImpl = require("fs")) {
    try {
        const src = readAsarFile(asarPath, "index.js", fsImpl).toString("utf8");
        return KNOWN_MARKERS.some(m => src.includes(m));
    } catch {
        return false;
    }
}

const compareVersions = (a, b) => {
    const pa = (a.match(/\d+/g) || []).map(Number);
    const pb = (b.match(/\d+/g) || []).map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const d = (pa[i] || 0) - (pb[i] || 0);
        if (d) return d;
    }
    return 0;
};

module.exports = {
    MARKER,
    ORIGINAL_NAME,
    LEGACY_START,
    LEGACY_END,
    buildAsar,
    readAsarFile,
    shimSource,
    buildShim,
    isShim,
    compareVersions,
};
