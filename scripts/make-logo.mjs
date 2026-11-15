import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "assets");
const SOURCE = path.join(ASSETS, "logo.png");
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];

if (process.platform !== "win32") throw new Error("make-logo uses Windows' imaging; run it on Windows.");
if (!fs.existsSync(SOURCE)) throw new Error(`Put the logo at ${path.relative(ROOT, SOURCE)} first.`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bt-logo-"));
const resizeScript = path.join(tmp, "resize.ps1");
fs.writeFileSync(
    resizeScript,
    `param([string]$In, [string]$OutDir, [string]$Sizes)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile($In)
try {
    foreach ($s in $Sizes.Split(",")) {
        $n = [int]$s
        $bmp = New-Object System.Drawing.Bitmap($n, $n, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $g.Clear([System.Drawing.Color]::Transparent)
        $g.DrawImage($src, 0, 0, $n, $n)
        $g.Dispose()
        $bmp.Save((Join-Path $OutDir "$n.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
    }
} finally { $src.Dispose() }
"ok"
`,
);
try {
    const out = execFileSync(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", resizeScript, "-In", SOURCE, "-OutDir", tmp, "-Sizes", ICO_SIZES.join(",")],
        { encoding: "utf8", windowsHide: true },
    );
    if (!/\bok\b/.test(out)) throw new Error(`resizing failed: ${out}`);

    const pngs = ICO_SIZES.map(n => ({ n, data: fs.readFileSync(path.join(tmp, `${n}.png`)) }));
    const header = Buffer.alloc(6 + 16 * pngs.length);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngs.length, 4);
    let offset = header.length;
    pngs.forEach(({ n, data }, i) => {
        const e = 6 + i * 16;
        header[e] = n >= 256 ? 0 : n;
        header[e + 1] = n >= 256 ? 0 : n;
        header[e + 2] = 0;
        header[e + 3] = 0;
        header.writeUInt16LE(1, e + 4);
        header.writeUInt16LE(32, e + 6);
        header.writeUInt32LE(data.length, e + 8);
        header.writeUInt32LE(offset, e + 12);
        offset += data.length;
    });
    fs.writeFileSync(path.join(ASSETS, "logo.ico"), Buffer.concat([header, ...pngs.map(p => p.data)]));
    fs.copyFileSync(path.join(tmp, "64.png"), path.join(ASSETS, "logo-64.png"));
    fs.copyFileSync(path.join(tmp, "256.png"), path.join(ASSETS, "logo-256.png"));
    console.log(`✔ assets/logo.ico (${ICO_SIZES.join(", ")} px), assets/logo-64.png and assets/logo-256.png made from assets/logo.png`);
} finally {
    fs.rmSync(tmp, { recursive: true, force: true });
}
