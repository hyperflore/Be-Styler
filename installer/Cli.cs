using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BThemer.Installer
{
    public static class Cli
    {
        const string Usage =
@"Be Themer Installer (CLI)

Usage:
  BeThemerInstallerCli.exe                       interactive mode
  BeThemerInstallerCli.exe --install   [target]  install / update Be Themer
  BeThemerInstallerCli.exe --repair    [target]  re-copy files and re-patch
  BeThemerInstallerCli.exe --uninstall [target]  remove Be Themer (settings are kept)
  BeThemerInstallerCli.exe --list                show Discord installs and their state

Target (default: Discord Stable):
  --branch stable|ptb|canary|development|all
  --location ""C:\path\to\Discord""                 install root, app-x.y.z or resources folder

Options:
  --no-start    don't start Discord afterwards (it is still restarted if it was running)
  --offline     use the build inside the installer instead of downloading the latest release
  --help";

        public static int Run(string[] args)
        {
            try { Console.OutputEncoding = Encoding.UTF8; } catch { }
            Action<string> log = line => Console.WriteLine(line.Length == 0 ? "" : "  " + line);

            try
            {
                var a = args.Select(x => x.Trim()).ToList();
                if (a.Contains("--help") || a.Contains("-h") || a.Contains("/?")) { Console.WriteLine(Usage); return 0; }

                string action = a.Contains("--install") ? "install" : a.Contains("--repair") ? "repair" : a.Contains("--uninstall") ? "uninstall" : a.Contains("--list") ? "list" : null;
                bool start = a.Contains("--no-start") ? false : action == null;
                bool offline = a.Contains("--offline");
                string branch = Value(a, "--branch");
                string location = Value(a, "--location");

                Console.WriteLine("Be Themer Installer · bundled build v" + Core.PayloadVersion);
                Console.WriteLine();

                if (action == "list")
                {
                    var all = Core.FindInstalls();
                    if (all.Count == 0) Console.WriteLine("  No Discord installs found.");
                    foreach (var d in all) Console.WriteLine("  " + d + "\n    " + d.AppDir);
                    return 0;
                }

                List<DiscordInstall> targets;
                if (action == null)
                {
                    var picked = Interactive(out action);
                    if (picked == null) return 1;
                    targets = new List<DiscordInstall> { picked };
                }
                else if (location != null) targets = new List<DiscordInstall> { Core.FromLocation(location) };
                else if (branch != null && branch.Equals("all", StringComparison.OrdinalIgnoreCase)) targets = Core.FindInstalls();
                else
                {
                    var d = Core.FindBranch(branch ?? "stable");
                    if (d == null) throw new Exception("Discord " + (branch ?? "stable") + " wasn't found. Use --location to point at it, or --list.");
                    targets = new List<DiscordInstall> { d };
                }
                if (targets.Count == 0) throw new Exception("No Discord installs found.");

                foreach (var d in targets)
                {
                    Console.WriteLine(action + " · Discord " + d.Branch + " (v" + d.Version + ")");
                    if (action == "uninstall") Core.Uninstall(d, start, log);
                    else Core.Install(d, start, offline, log);
                    Console.WriteLine();
                }
                return 0;
            }
            catch (Exception e)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.Error.WriteLine("✖ " + e.Message);
                Console.ResetColor();
                return 1;
            }
        }

        static string Value(List<string> a, string name)
        {
            foreach (var x in a)
                if (x.StartsWith(name + "=")) return x.Substring(name.Length + 1).Trim('"');
            int i = a.IndexOf(name);
            return i >= 0 && i + 1 < a.Count && !a[i + 1].StartsWith("--") ? a[i + 1] : null;
        }

        static DiscordInstall Interactive(out string action)
        {
            action = null;
            var installs = Core.FindInstalls();
            Console.WriteLine("Which Discord?");
            for (int i = 0; i < installs.Count; i++) Console.WriteLine("  [" + (i + 1) + "] " + installs[i]);
            Console.WriteLine("  [c] custom location");
            Console.Write("> ");
            string pick = (Console.ReadLine() ?? "").Trim();

            DiscordInstall d = null;
            int n;
            if (pick.Equals("c", StringComparison.OrdinalIgnoreCase))
            {
                Console.Write("Path to Discord: ");
                d = Core.FromLocation(Console.ReadLine() ?? "");
            }
            else if (int.TryParse(pick, out n) && n >= 1 && n <= installs.Count) d = installs[n - 1];
            else if (pick.Length == 0 && installs.Count == 1) d = installs[0];
            if (d == null) { Console.WriteLine("Nothing selected."); return null; }

            Console.WriteLine();
            Console.WriteLine("Discord " + d.Branch + ": " + d.StateText);
            Console.WriteLine("  [i] install / update   [r] repair   [u] uninstall");
            Console.Write("> ");
            switch ((Console.ReadLine() ?? "").Trim().ToLowerInvariant())
            {
                case "i": action = "install"; break;
                case "r": action = "repair"; break;
                case "u": action = "uninstall"; break;
                default: Console.WriteLine("Nothing to do."); return null;
            }
            Console.WriteLine();
            return d;
        }
    }
}
