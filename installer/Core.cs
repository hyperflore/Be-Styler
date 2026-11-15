using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web.Script.Serialization;

namespace BThemer.Installer
{
    public enum PatchState { NotPatched, Patched, Broken, OtherMod, Missing }

    public class DiscordInstall
    {
        public string Branch;
        public string Root;
        public string AppDir;
        public string Resources;
        public string ExeName;
        public PatchState State;

        public string Version
        {
            get { return Path.GetFileName(AppDir).Replace("app-", ""); }
        }

        public string StateText
        {
            get
            {
                switch (State)
                {
                    case PatchState.Patched: return "Be Themer installed";
                    case PatchState.NotPatched: return "not installed";
                    case PatchState.Broken: return "needs repair";
                    case PatchState.OtherMod: return "another mod is installed";
                    default: return "app.asar missing";
                }
            }
        }

        public override string ToString()
        {
            return "Discord " + Branch + "  ·  v" + Version + "  ·  " + StateText;
        }
    }

    public static class Asar
    {

        public static byte[] ReadFile(string asarPath, string inner)
        {
            using (var fs = new FileStream(asarPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete))
            using (var br = new BinaryReader(fs))
            {
                br.ReadUInt32();
                uint headerSize = br.ReadUInt32();
                byte[] header = br.ReadBytes((int)headerSize);
                int jsonLen = BitConverter.ToInt32(header, 4);
                string json = Encoding.UTF8.GetString(header, 8, jsonLen);

                var ser = new JavaScriptSerializer { MaxJsonLength = int.MaxValue, RecursionLimit = 1000 };
                var node = ser.DeserializeObject(json) as Dictionary<string, object>;
                foreach (string part in inner.Split('/'))
                {
                    object files;
                    if (node == null || !node.TryGetValue("files", out files)) throw new FileNotFoundException(inner + " not found in " + asarPath);
                    var dir = files as Dictionary<string, object>;
                    object child;
                    if (dir == null || !dir.TryGetValue(part, out child)) throw new FileNotFoundException(inner + " not found in " + asarPath);
                    node = child as Dictionary<string, object>;
                }
                if (node == null) throw new FileNotFoundException(inner + " not found in " + asarPath);

                object unpacked;
                if (node.TryGetValue("unpacked", out unpacked) && unpacked is bool && (bool)unpacked)
                    return File.ReadAllBytes(Path.Combine(asarPath + ".unpacked", inner.Replace('/', '\\')));

                long size = Convert.ToInt64(node["size"]);
                long offset = long.Parse(Convert.ToString(node["offset"]));
                fs.Seek(8 + headerSize + offset, SeekOrigin.Begin);
                return br.ReadBytes((int)size);
            }
        }

        public static byte[] Build(IList<KeyValuePair<string, byte[]>> files)
        {
            var ser = new JavaScriptSerializer();
            var sb = new StringBuilder("{\"files\":{");
            long offset = 0;
            for (int i = 0; i < files.Count; i++)
            {
                if (i > 0) sb.Append(',');
                sb.Append(ser.Serialize(files[i].Key))
                  .Append(":{\"size\":").Append(files[i].Value.Length)
                  .Append(",\"offset\":\"").Append(offset).Append("\"}");
                offset += files[i].Value.Length;
            }
            sb.Append("}}");

            byte[] json = Encoding.UTF8.GetBytes(sb.ToString());
            int padded = (json.Length + 3) & ~3;
            using (var ms = new MemoryStream())
            using (var bw = new BinaryWriter(ms))
            {
                bw.Write((uint)4);
                bw.Write((uint)(8 + padded));
                bw.Write((uint)(4 + padded));
                bw.Write((uint)json.Length);
                bw.Write(json);
                bw.Write(new byte[padded - json.Length]);
                foreach (var f in files) bw.Write(f.Value);
                bw.Flush();
                return ms.ToArray();
            }
        }
    }

    public static class Core
    {
        public const string Marker = "B-Themer loader";
        public const string OriginalName = "app.orig.asar";
        const string LegacyStart = "// >>> B-Themer >>>";
        const string LegacyEnd = "// <<< B-Themer <<<";

        static readonly string[][] Branches =
        {
            new[] { "Stable", "Discord", "Discord" },
            new[] { "PTB", "DiscordPTB", "DiscordPTB" },
            new[] { "Canary", "DiscordCanary", "DiscordCanary" },
            new[] { "Development", "DiscordDevelopment", "DiscordDevelopment" },
        };


        public static string DataDir
        {
            get
            {
                string over = Environment.GetEnvironmentVariable("BTHEMER_DATA_DIR");
                if (!string.IsNullOrEmpty(over)) return over;
                return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "B-Themer");
            }
        }

        public static string DistDir { get { return Path.Combine(DataDir, "dist"); } }
        public static string MainFile { get { return Path.Combine(DistDir, "main.js"); } }

        static string LocalAppData
        {
            get
            {
                string over = Environment.GetEnvironmentVariable("BTHEMER_LOCALAPPDATA");
                if (!string.IsNullOrEmpty(over)) return over;
                return Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            }
        }


        public static int CompareVersions(string a, string b)
        {
            var pa = Regex.Matches(a, @"\d+").Cast<Match>().Select(m => long.Parse(m.Value)).ToArray();
            var pb = Regex.Matches(b, @"\d+").Cast<Match>().Select(m => long.Parse(m.Value)).ToArray();
            for (int i = 0; i < Math.Max(pa.Length, pb.Length); i++)
            {
                long x = i < pa.Length ? pa[i] : 0, y = i < pb.Length ? pb[i] : 0;
                if (x != y) return x < y ? -1 : 1;
            }
            return 0;
        }

        static string[] AppDirs(string root)
        {
            if (root == null || !Directory.Exists(root)) return new string[0];
            return Directory.GetDirectories(root)
                .Where(d => Regex.IsMatch(Path.GetFileName(d), @"^app-\d") && Directory.Exists(Path.Combine(d, "resources")))
                .OrderByDescending(d => Path.GetFileName(d), Comparer<string>.Create(CompareVersions))
                .ToArray();
        }


        public static List<DiscordInstall> FindInstalls()
        {
            var list = new List<DiscordInstall>();
            foreach (var b in Branches)
            {
                string root = Path.Combine(LocalAppData, b[1]);
                var apps = AppDirs(root);
                if (apps.Length == 0) continue;
                var d = new DiscordInstall { Branch = b[0], Root = root, AppDir = apps[0], Resources = Path.Combine(apps[0], "resources"), ExeName = b[2] };
                d.State = GetState(d.Resources);
                list.Add(d);
            }
            return list;
        }

        public static DiscordInstall FindBranch(string branch)
        {
            return FindInstalls().FirstOrDefault(d => d.Branch.Equals(branch, StringComparison.OrdinalIgnoreCase));
        }

        public static DiscordInstall FromLocation(string location)
        {
            string p = Path.GetFullPath(location.Trim().Trim('"'));
            Func<string, bool> hasAsar = dir => File.Exists(Path.Combine(dir, "app.asar")) || File.Exists(Path.Combine(dir, OriginalName));

            string appDir = null, resources = null, root = null;
            if (hasAsar(p)) { resources = p; appDir = Path.GetDirectoryName(p); }
            else if (hasAsar(Path.Combine(p, "resources"))) { appDir = p; resources = Path.Combine(p, "resources"); }
            else
            {
                var apps = AppDirs(p);
                if (apps.Length > 0) { root = p; appDir = apps[0]; resources = Path.Combine(appDir, "resources"); }
            }
            if (resources == null) throw new Exception("No Discord installation found at " + p);

            if (root == null)
            {
                string parent = Path.GetDirectoryName(appDir);
                if (parent != null && File.Exists(Path.Combine(parent, "Update.exe"))) root = parent;
            }

            string exe = Directory.GetFiles(appDir, "Discord*.exe").Select(Path.GetFileNameWithoutExtension).FirstOrDefault() ?? "Discord";
            var d = new DiscordInstall { Branch = "Custom", Root = root, AppDir = appDir, Resources = resources, ExeName = exe };
            d.State = GetState(resources);
            return d;
        }


        static bool IsShim(string asarPath)
        {
            try { var src = Encoding.UTF8.GetString(Asar.ReadFile(asarPath, "index.js")); return src.Contains(Marker) || src.Contains("Moonberry loader"); }
            catch { return false; }
        }

        public static PatchState GetState(string resources)
        {
            string asar = Path.Combine(resources, "app.asar"), orig = Path.Combine(resources, OriginalName);
            if (File.Exists(Path.Combine(resources, "_app.asar")) || Directory.Exists(Path.Combine(resources, "app"))) return PatchState.OtherMod;
            if (File.Exists(orig)) return IsShim(asar) ? PatchState.Patched : PatchState.Broken;
            if (File.Exists(asar)) return IsShim(asar) ? PatchState.Broken : PatchState.NotPatched;
            return PatchState.Missing;
        }


        static readonly Assembly Self = Assembly.GetExecutingAssembly();

        static string[] PayloadNames()
        {
            return Self.GetManifestResourceNames().Where(n => n.StartsWith("payload/")).OrderBy(n => n).ToArray();
        }

        public static string PayloadVersion
        {
            get
            {
                try
                {
                    using (var s = Self.GetManifestResourceStream("payload/build-info.json"))
                    using (var r = new StreamReader(s))
                    {
                        var info = new JavaScriptSerializer().DeserializeObject(r.ReadToEnd()) as Dictionary<string, object>;
                        return Convert.ToString(info["version"]);
                    }
                }
                catch { return "?"; }
            }
        }

        public static string InstalledVersion
        {
            get
            {
                try
                {
                    string json = File.ReadAllText(Path.Combine(DistDir, "build-info.json"));
                    var info = new JavaScriptSerializer().DeserializeObject(json) as Dictionary<string, object>;
                    return Convert.ToString(info["version"]);
                }
                catch { return null; }
            }
        }

        static void ReplaceDist(Action<string> fill)
        {
            Directory.CreateDirectory(DataDir);
            string fresh = DistDir + ".new", old = DistDir + ".old";
            if (Directory.Exists(fresh)) Directory.Delete(fresh, true);
            Directory.CreateDirectory(fresh);
            fill(fresh);
            if (!File.Exists(Path.Combine(fresh, "main.js")) || !File.Exists(Path.Combine(fresh, "renderer.js")))
                throw new Exception("The Be Themer build is incomplete (main.js / renderer.js missing).");

            if (Directory.Exists(old)) Directory.Delete(old, true);
            if (Directory.Exists(DistDir)) Retry(() => Directory.Move(DistDir, old));
            Retry(() => Directory.Move(fresh, DistDir));
            try { if (Directory.Exists(old)) Directory.Delete(old, true); } catch { }
        }

        public static void ExtractPayload(Action<string> log)
        {
            var names = PayloadNames();
            if (names.Length == 0 || !names.Contains("payload/main.js")) throw new Exception("This installer doesn't contain a Be Themer build.");
            ReplaceDist(fresh =>
            {
                foreach (string name in names)
                {
                    string dest = Path.Combine(fresh, name.Substring("payload/".Length).Replace('/', Path.DirectorySeparatorChar));
                    Directory.CreateDirectory(Path.GetDirectoryName(dest));
                    using (var src = Self.GetManifestResourceStream(name))
                    using (var dst = File.Create(dest)) src.CopyTo(dst);
                }
            });
            log("Installed Be Themer v" + PayloadVersion + " (bundled with this installer) to " + DistDir);
        }

        static void ExtractZip(string zipPath, string destination)
        {
            string root = Path.GetFullPath(destination).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            using (var zip = System.IO.Compression.ZipFile.OpenRead(zipPath))
            {
                foreach (var entry in zip.Entries)
                {
                    string target = Path.GetFullPath(Path.Combine(destination, entry.FullName.Replace('/', Path.DirectorySeparatorChar)));
                    if (!target.StartsWith(root, StringComparison.OrdinalIgnoreCase)) throw new Exception("Unsafe path in download: " + entry.FullName);
                    if (entry.FullName.EndsWith("/")) { Directory.CreateDirectory(target); continue; }
                    Directory.CreateDirectory(Path.GetDirectoryName(target));
                    using (var src = entry.Open())
                    using (var dst = File.Create(target)) src.CopyTo(dst);
                }
            }
        }

        public static void InstallFiles(bool offline, Action<string> log)
        {
            Release latest = offline ? null : (Remote.Latest ?? Remote.Fetch());
            if (latest != null && latest.DistZipUrl != null && CompareVersions(latest.Version, PayloadVersion) > 0)
            {
                string tmp = Path.Combine(Path.GetTempPath(), "bethemer-" + Guid.NewGuid().ToString("N") + ".zip");
                try
                {
                    log("Downloading Be Themer v" + latest.Version + " from GitHub…");
                    Remote.Download(latest.DistZipUrl, tmp);
                    ReplaceDist(fresh => ExtractZip(tmp, fresh));
                    log("Installed Be Themer v" + latest.Version + " to " + DistDir);
                    return;
                }
                catch (Exception e) { log("Download failed (" + e.Message + "). Using the bundled build instead."); }
                finally { try { File.Delete(tmp); } catch { } }
            }
            ExtractPayload(log);
        }


        public static string ShimSource(string mainPath)
        {
            var ser = new JavaScriptSerializer();
            return string.Join("\n", new[]
            {
                "// " + Marker + ". Discord's original app is in " + OriginalName + ".",
                "\"use strict\";",
                "const path = require(\"path\");",
                "const { app } = require(\"electron\");",
                "const original = path.join(__dirname, \"..\", " + ser.Serialize(OriginalName) + ");",
                "try {",
                "    require(" + ser.Serialize(mainPath) + ");",
                "} catch (err) {",
                "    console.error(\"[B-Themer] failed to load, starting Discord without it:\", err);",
                "}",
                "const pkg = require(path.join(original, \"package.json\"));",
                "const entry = path.join(original, pkg.main || \"index.js\");",
                "if (typeof app.setAppPath === \"function\") app.setAppPath(original);",
                "if (require.main) require.main.filename = entry;",
                "require(entry);",
                "",
            });
        }

        public static void Patch(DiscordInstall d, string mainPath, Action<string> log)
        {
            string asar = Path.Combine(d.Resources, "app.asar"), orig = Path.Combine(d.Resources, OriginalName);
            var state = GetState(d.Resources);
            if (state == PatchState.OtherMod)
                throw new Exception("Another client modification is installed on this Discord. Uninstall it first.");
            if (state == PatchState.Missing) throw new Exception("app.asar not found in " + d.Resources);

            if (!File.Exists(orig))
            {
                if (IsShim(asar)) throw new Exception("Discord's original app.asar is missing. Reinstall Discord, then run the installer again.");
                Retry(() => File.Move(asar, orig));
            }

            var ser = new JavaScriptSerializer { MaxJsonLength = int.MaxValue };
            string pkgText = Encoding.UTF8.GetString(Asar.ReadFile(orig, "package.json"));
            var pkg = ser.DeserializeObject(pkgText) as Dictionary<string, object>;
            if (pkg == null) throw new Exception("Discord's package.json couldn't be read.");
            pkg["main"] = "index.js";

            var shim = Asar.Build(new List<KeyValuePair<string, byte[]>>
            {
                new KeyValuePair<string, byte[]>("index.js", new UTF8Encoding(false).GetBytes(ShimSource(mainPath))),
                new KeyValuePair<string, byte[]>("package.json", new UTF8Encoding(false).GetBytes(ser.Serialize(pkg))),
            });
            string tmp = asar + ".tmp";
            File.WriteAllBytes(tmp, shim);
            Retry(() => { if (File.Exists(asar)) File.Delete(asar); File.Move(tmp, asar); });
            log("Patched " + d.Resources);
            CleanLegacy(d, log);
        }

        public static int Unpatch(DiscordInstall d, Action<string> log)
        {
            var resourcesDirs = d.Root != null
                ? AppDirs(d.Root).Select(a => Path.Combine(a, "resources")).ToList()
                : new List<string> { d.Resources };
            int count = 0;
            foreach (string res in resourcesDirs)
            {
                string asar = Path.Combine(res, "app.asar"), orig = Path.Combine(res, OriginalName);
                if (!File.Exists(orig)) continue;
                if (File.Exists(asar))
                {
                    if (!IsShim(asar)) { log("Skipped " + res + " (app.asar isn't Be Themer's)"); continue; }
                    Retry(() => File.Delete(asar));
                }
                Retry(() => File.Move(orig, asar));
                log("Restored " + res);
                count++;
            }
            CleanLegacy(d, log);
            return count;
        }

        static void CleanLegacy(DiscordInstall d, Action<string> log)
        {
            var appDirs = d.Root != null ? AppDirs(d.Root) : new[] { d.AppDir };
            var re = new Regex(Regex.Escape(LegacyStart) + @"[\s\S]*?" + Regex.Escape(LegacyEnd) + @"\r?\n?");
            foreach (string appDir in appDirs)
            {
                string modules = Path.Combine(appDir, "modules");
                if (!Directory.Exists(modules)) continue;
                foreach (string core in Directory.GetDirectories(modules, "discord_desktop_core*"))
                {
                    string file = Path.Combine(core, "discord_desktop_core", "index.js");
                    if (!File.Exists(file)) continue;
                    string src = File.ReadAllText(file);
                    if (!src.Contains(LegacyStart)) continue;
                    File.WriteAllText(file, re.Replace(src, ""));
                    log("Removed old-style injection from " + file);
                }
            }
        }

        public static bool AnyPatched()
        {
            return FindInstalls().Any(d => d.State == PatchState.Patched || d.State == PatchState.Broken);
        }


        static Process[] Processes(DiscordInstall d)
        {
            string scope = (d.Root ?? d.AppDir).TrimEnd('\\', '/') + Path.DirectorySeparatorChar;
            return Process.GetProcessesByName(d.ExeName).Where(p =>
            {
                try { return p.MainModule.FileName.StartsWith(scope, StringComparison.OrdinalIgnoreCase); }
                catch { return false; }
            }).ToArray();
        }

        public static bool IsRunning(DiscordInstall d)
        {
            return Processes(d).Length > 0;
        }

        public static void Close(DiscordInstall d, Action<string> log)
        {
            var procs = Processes(d);
            if (procs.Length == 0) return;
            log("Closing Discord " + d.Branch + "…");
            foreach (var p in procs)
            {
                try { p.Kill(); p.WaitForExit(5000); } catch { }
            }
            Thread.Sleep(800);
        }

        public static void Start(DiscordInstall d, Action<string> log)
        {
            try
            {
                string updater = d.Root != null ? Path.Combine(d.Root, "Update.exe") : null;
                if (updater != null && File.Exists(updater))
                    Process.Start(new ProcessStartInfo(updater, "--processStart " + d.ExeName + ".exe") { UseShellExecute = false });
                else
                    Process.Start(Path.Combine(d.AppDir, d.ExeName + ".exe"));
                log("Starting Discord " + d.Branch + "…");
            }
            catch (Exception e) { log("Couldn't start Discord: " + e.Message); }
        }


        public static void Install(DiscordInstall d, bool startAfter, bool offline, Action<string> log)
        {
            if (d.State == PatchState.OtherMod)
                throw new Exception("Another client modification is installed on this Discord. Uninstall it first.");
            bool running = IsRunning(d);
            Close(d, log);
            InstallFiles(offline, log);
            Patch(d, MainFile, log);
            log("✔ Be Themer v" + InstalledVersion + " is installed on Discord " + d.Branch + ".");
            if (startAfter || running) Start(d, log);
        }

        public static void Uninstall(DiscordInstall d, bool startAfter, Action<string> log)
        {
            bool running = IsRunning(d);
            Close(d, log);
            int n = Unpatch(d, log);
            if (n == 0) log("Discord " + d.Branch + " didn't have Be Themer installed.");
            if (!AnyPatched() && Directory.Exists(DistDir))
            {
                try { Directory.Delete(DistDir, true); log("Removed " + DistDir + " (your settings, themes and plugins are kept)."); }
                catch (Exception e) { log("Couldn't remove " + DistDir + ": " + e.Message); }
            }
            log("✔ Be Themer was removed from Discord " + d.Branch + ".");
            if (startAfter || running) Start(d, log);
        }


        public static void Retry(Action action)
        {
            for (int i = 1; ; i++)
            {
                try { action(); return; }
                catch (IOException) { if (i >= 10) throw; }
                catch (UnauthorizedAccessException) { if (i >= 10) throw; }
                Thread.Sleep(400);
            }
        }
    }
}
