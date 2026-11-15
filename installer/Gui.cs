using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading;
using System.Windows.Forms;

namespace BThemer.Installer
{
    public class MainForm : Form
    {
        static readonly Color Bg = Mac.Window;
        static readonly Color Input = Mac.Field;
        static readonly Color Line = Mac.Separator;
        static readonly Color Fg = Mac.Text;
        static readonly Color Muted = Mac.Secondary;
        static readonly Color Accent = Mac.Pink;
        static readonly Color Green = Mac.Green;
        static readonly Color Blurple = Mac.Blue;
        static readonly Color Red = Mac.Red;
        static readonly Color Grey = Mac.Grey;

        readonly FlowLayoutPanel installList = new FlowLayoutPanel();
        readonly List<RadioButton> radios = new List<RadioButton>();
        readonly RadioButton customRadio = new RadioButton();
        readonly TextBox customBox = new TextBox();
        readonly Label installerVersion = new Label(), localVersion = new Label(), latestVersion = new Label(), status = new Label();
        readonly Label bannerText = new Label();
        readonly Button[] actions;
        bool busy;

        public MainForm()
        {
            Text = "Be Themer Installer";
            AutoScaleMode = AutoScaleMode.Dpi;
            AutoScaleDimensions = new SizeF(96F, 96F);
            ClientSize = new Size(900, 812);
            MinimumSize = new Size(760, 640);
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Bg;
            ForeColor = Fg;
            Font = Mac.UiFont(10.5f, FontStyle.Regular);
            FormBorderStyle = FormBorderStyle.None;
            Padding = new Padding(Edge, 0, Edge, Edge);
            DoubleBuffered = true;
            try { Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { }

            var root = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                ColumnCount = 1,
                Padding = new Padding(34, 10, 34, 18),
                AutoScroll = true,
                BackColor = Bg,
            };
            root.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            Controls.Add(root);
            var titleBar = new MacTitleBar(this);
            Controls.Add(titleBar);
            titleBar.SendToBack();
            Action<Control> add = c => { root.RowStyles.Add(new RowStyle(SizeType.AutoSize)); root.Controls.Add(c); };

            try
            {
                var stream = typeof(MainForm).Assembly.GetManifestResourceStream("logo.png");
                if (stream != null)
                {
                    var logo = new PictureBox
                    {
                        Image = Image.FromStream(stream),
                        SizeMode = PictureBoxSizeMode.Zoom,
                        Size = new Size(84, 84),
                        Anchor = AnchorStyles.None,
                        Margin = new Padding(0, 8, 0, 0),
                        BackColor = Color.Transparent,
                    };
                    add(logo);
                }
            }
            catch { }
            add(new Label
            {
                Text = "Be Themer Installer",
                Font = Mac.UiFont(22f, FontStyle.Bold),
                ForeColor = Color.White,
                TextAlign = ContentAlignment.MiddleCenter,
                Dock = DockStyle.Fill,
                Height = 80,
                Margin = new Padding(0, 0, 0, 12),
            });

            var pathRow = Row();
            pathRow.Controls.Add(new Label { Text = "Files will be installed to: " + Core.DistDir, AutoSize = true, Margin = new Padding(0, 3, 8, 0) });
            var openDir = SmallButton("Open Directory");
            openDir.Click += (s, e) => { Directory.CreateDirectory(Core.DataDir); Process.Start("explorer.exe", "\"" + Core.DataDir + "\""); };
            pathRow.Controls.Add(openDir);
            add(pathRow);
            add(Text_("To customise this location, set the environment variable 'BTHEMER_DATA_DIR' and restart me", Muted, new Padding(0, 2, 0, 14)));

            var versionsCard = new Card { Dock = DockStyle.Fill, AutoSize = true, AutoSizeMode = AutoSizeMode.GrowAndShrink, Margin = new Padding(0, 6, 0, 12) };
            var versionsList = new FlowLayoutPanel { FlowDirection = FlowDirection.TopDown, WrapContents = false, AutoSize = true, Dock = DockStyle.Fill, Margin = new Padding(0) };
            versionsList.Controls.AddRange(new Control[] { installerVersion, localVersion, latestVersion });
            versionsCard.Controls.Add(versionsList);
            add(versionsCard);
            foreach (var l in new[] { installerVersion, localVersion, latestVersion }) { l.AutoSize = true; l.Margin = new Padding(0, 2, 0, 2); l.BackColor = Mac.Card; }
            installerVersion.Cursor = Cursors.Default;
            installerVersion.Click += (s, e) => { if (Remote.InstallerOutdated && Remote.Latest.PageUrl != null) Process.Start(Remote.Latest.PageUrl); };


            var banner = new Card { Fill = Color.FromArgb(58, 46, 22), Border = Color.FromArgb(112, 86, 34), Dock = DockStyle.Fill, Padding = new Padding(16, 12, 16, 12), AutoSize = true, AutoSizeMode = AutoSizeMode.GrowAndShrink, Margin = new Padding(0, 0, 0, 14) };
            bannerText.ForeColor = Color.FromArgb(255, 214, 140);
            bannerText.AutoSize = true;
            bannerText.Dock = DockStyle.Fill;
            bannerText.Text = Remote.RepoUrl != null
                ? "GitHub (" + Remote.RepoUrl.Replace("https://", "") + ") is the only official place to get Be Themer.\nIf you downloaded it from anywhere else, delete it, run a malware scan and change your Discord password."
                : "Only get Be Themer from its official GitHub repository.\nIf you downloaded it from anywhere else, delete it, run a malware scan and change your Discord password.";
            banner.Controls.Add(bannerText);
            banner.Resize += (s, e) => bannerText.MaximumSize = new Size(banner.ClientSize.Width - banner.Padding.Horizontal, 0);
            add(banner);

            add(new Label { Text = "Choose a Discord to patch", Font = Mac.UiFont(15f, FontStyle.Bold), AutoSize = true, Margin = new Padding(0, 0, 0, 8) });
            installList.FlowDirection = FlowDirection.TopDown;
            installList.WrapContents = false;
            installList.AutoSize = true;
            installList.Dock = DockStyle.Fill;
            installList.Margin = new Padding(0);
            var installsCard = new Card { Dock = DockStyle.Fill, AutoSize = true, AutoSizeMode = AutoSizeMode.GrowAndShrink, Margin = new Padding(0, 0, 0, 16) };
            var installsInner = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, AutoSize = true, Margin = new Padding(0) };
            installsInner.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            installsInner.Controls.Add(installList);
            installsCard.Controls.Add(installsInner);
            add(installsCard);

            customRadio.Text = "Custom Install Location";
            customRadio.AutoSize = true;
            customRadio.Margin = new Padding(2, 4, 0, 8);

            var customRow = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, AutoSize = true, Margin = new Padding(0, 2, 0, 4) };
            customRow.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            customRow.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            var boxHost = new Card { Fill = Input, Border = Color.FromArgb(78, 78, 82), Radius = 10, Dock = DockStyle.Fill, Height = 42, Padding = new Padding(14, 11, 14, 6), Margin = new Padding(0, 0, 8, 0) };
            customBox.BorderStyle = BorderStyle.None;
            customBox.BackColor = Input;
            customBox.ForeColor = Fg;
            customBox.Dock = DockStyle.Fill;
            SetCue(customBox, "The custom location");
            customBox.TextChanged += (s, e) => { if (customBox.Focused) customRadio.Checked = true; };
            boxHost.Controls.Add(customBox);
            boxHost.Click += (s, e) => customBox.Focus();
            var browse = SmallButton("Browse…");
            browse.Height = 42;
            browse.Click += (s, e) => Browse();
            customRow.Controls.Add(boxHost, 0, 0);
            customRow.Controls.Add(browse, 1, 0);
            installsInner.Controls.Add(customRow);

            var buttons = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 4, Height = 50, Margin = new Padding(0, 0, 0, 10) };
            for (int i = 0; i < 4; i++) buttons.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 25));
            actions = new[]
            {
                BigButton("Install", Green),
                BigButton("Reinstall / Repair", Blurple),
                BigButton("Uninstall", Red),
                BigButton("Start Discord", Grey),
            };
            actions[0].Click += (s, e) => Run("Install", false);
            actions[1].Click += (s, e) => Run("Repair", false);
            actions[2].Click += (s, e) => Run("Uninstall", true);
            actions[3].Click += (s, e) => { var d = Selected(true); if (d != null) Core.Start(d, x => { }); };
            for (int i = 0; i < 4; i++) buttons.Controls.Add(actions[i], i, 0);

            status.AutoSize = true;
            status.ForeColor = Muted;
            status.Margin = new Padding(0, 4, 0, 0);

            Load += (s, e) =>
            {
                RefreshInstalls();
                installList.Controls.Add(customRadio);
                root.RowStyles.Add(new RowStyle(SizeType.Absolute, 58)); root.Controls.Add(buttons);
                root.RowStyles.Add(new RowStyle(SizeType.AutoSize)); root.Controls.Add(status);
                UpdateVersions();
                CheckLatest();
            };
        }

        static FlowLayoutPanel Row()
        {
            return new FlowLayoutPanel { AutoSize = true, WrapContents = true, Dock = DockStyle.Fill, Margin = new Padding(0) };
        }

        static Label Text_(string text, Color color, Padding margin)
        {
            return new Label { Text = text, ForeColor = color, AutoSize = true, Margin = margin };
        }

        Button SmallButton(string text)
        {
            var b = new PillButton(text, Blurple) { Radius = 9, Margin = new Padding(0), Padding = new Padding(14, 0, 14, 0), Font = Mac.UiFont(10f, FontStyle.Bold) };
            var size = TextRenderer.MeasureText(text, b.Font);
            b.Size = new Size(size.Width + 34, 34);
            return b;
        }

        Button BigButton(string text, Color color)
        {
            return new PillButton(text, color) { Dock = DockStyle.Fill, Radius = 12, Margin = new Padding(0, 0, 10, 0), Font = Mac.UiFont(11f, FontStyle.Bold) };
        }

        const int Edge = 6;
        protected override CreateParams CreateParams
        {
            get
            {
                var cp = base.CreateParams;
                cp.Style |= 0x20000 | 0x10000;
                return cp;
            }
        }

        protected override void OnHandleCreated(EventArgs e)
        {
            base.OnHandleCreated(e);
            Dwm.Apply(Handle);
        }

        protected override void OnResize(EventArgs e)
        {
            if (WindowState != FormWindowState.Maximized)
            {
                try { MaximizedBounds = Screen.FromHandle(Handle).WorkingArea; } catch { }
            }
            base.OnResize(e);
            Invalidate();
        }

        protected override void WndProc(ref Message m)
        {
            base.WndProc(ref m);
            if (m.Msg != 0x84 || WindowState == FormWindowState.Maximized) return;
            var p = PointToClient(new Point((short)((long)m.LParam & 0xFFFF), (short)(((long)m.LParam >> 16) & 0xFFFF)));
            bool l = p.X < Edge, r = p.X >= ClientSize.Width - Edge, b = p.Y >= ClientSize.Height - Edge;
            if (b && l) m.Result = (IntPtr)16;
            else if (b && r) m.Result = (IntPtr)17;
            else if (l) m.Result = (IntPtr)10;
            else if (r) m.Result = (IntPtr)11;
            else if (b) m.Result = (IntPtr)15;
        }

        [System.Runtime.InteropServices.DllImport("user32.dll", CharSet = System.Runtime.InteropServices.CharSet.Unicode)]
        static extern IntPtr SendMessage(IntPtr hWnd, int msg, IntPtr wParam, string lParam);

        static void SetCue(TextBox box, string cue)
        {
            box.HandleCreated += (s, e) => SendMessage(box.Handle, 0x1501, (IntPtr)1, cue);
        }

        void UpdateVersions()
        {
            installerVersion.Text = "Installer Version: v" + BuildConfig.Version + " (" + BuildConfig.Commit + ")" + (Remote.InstallerOutdated ? " - OUTDATED" : "");
            installerVersion.ForeColor = Remote.InstallerOutdated ? Color.FromArgb(255, 170, 120) : Fg;
            installerVersion.Cursor = Remote.InstallerOutdated ? Cursors.Hand : Cursors.Default;
            string local = Core.InstalledVersion;
            localVersion.Text = "Local Be Themer Version: " + (local != null ? "v" + local : "not installed");
            string latest = Remote.Latest != null ? "v" + Remote.Latest.Version
                : Remote.Error != null ? "v" + Core.PayloadVersion + " (bundled; GitHub: " + Remote.Error + ")"
                : "checking…";
            latestVersion.Text = "Latest Be Themer Version: " + latest;
        }

        void CheckLatest()
        {
            ThreadPool.QueueUserWorkItem(_ =>
            {
                Remote.Fetch();
                try { BeginInvoke(new Action(UpdateVersions)); } catch { }
            });
        }

        static string StateTag(PatchState s)
        {
            switch (s)
            {
                case PatchState.Patched: return " [PATCHED]";
                case PatchState.Broken: return " [NEEDS REPAIR]";
                case PatchState.OtherMod: return " [OTHER MOD INSTALLED]";
                case PatchState.Missing: return " [BROKEN]";
                default: return "";
            }
        }

        void RefreshInstalls()
        {
            string previous = radios.Where(r => r.Checked).Select(r => ((DiscordInstall)r.Tag).Resources).FirstOrDefault();
            bool customWasChecked = customRadio.Checked;
            installList.SuspendLayout();
            foreach (var r in radios) installList.Controls.Remove(r);
            radios.Clear();

            int i = 0;
            foreach (var d in Core.FindInstalls())
            {
                var rb = new RadioButton
                {
                    Text = d.Branch + " - " + (d.Root ?? d.AppDir) + StateTag(d.State),
                    Tag = d,
                    AutoSize = true,
                    Margin = new Padding(2, 2, 0, 4),
                };
                radios.Add(rb);
                installList.Controls.Add(rb);
                installList.Controls.SetChildIndex(rb, i++);
            }
            installList.ResumeLayout();

            var keep = radios.FirstOrDefault(r => ((DiscordInstall)r.Tag).Resources == previous);
            if (customWasChecked) customRadio.Checked = true;
            else if (keep != null) keep.Checked = true;
            else if (radios.Count > 0) radios[0].Checked = true;
            else customRadio.Checked = true;
        }

        void Browse()
        {
            using (var dlg = new FolderBrowserDialog { Description = "Select your Discord folder (it contains Update.exe or app-x.y.z folders)", ShowNewFolderButton = false })
            {
                if (dlg.ShowDialog(this) != DialogResult.OK) return;
                customBox.Text = dlg.SelectedPath;
                customRadio.Checked = true;
            }
        }

        DiscordInstall Selected(bool showErrors)
        {
            try
            {
                if (customRadio.Checked)
                {
                    if (string.IsNullOrWhiteSpace(customBox.Text)) throw new Exception("Enter the path to your Discord folder in the custom location box.");
                    return Core.FromLocation(customBox.Text);
                }
                var r = radios.FirstOrDefault(x => x.Checked);
                if (r == null) throw new Exception("No Discord installation found. Use “Custom Install Location”.");
                var d = (DiscordInstall)r.Tag;
                d.State = Core.GetState(d.Resources);
                return d;
            }
            catch (Exception e)
            {
                if (showErrors) MessageBox.Show(this, e.Message, "Be Themer Installer", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return null;
            }
        }

        void Run(string action, bool uninstall)
        {
            if (busy) return;
            var d = Selected(true);
            if (d == null) return;
            if (uninstall && d.State != PatchState.Patched && d.State != PatchState.Broken)
            {
                MessageBox.Show(this, "Be Themer isn't installed on Discord " + d.Branch + ".", "Uninstall", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }
            if (!uninstall && d.State == PatchState.OtherMod)
            {
                MessageBox.Show(this, "Another client modification is installed on this Discord.\n\nUninstall it with its own installer first, then install Be Themer.", action, MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            busy = true;
            foreach (var b in actions) b.Enabled = false;
            UseWaitCursor = true;
            var lines = new List<string>();
            Action<string> log = line =>
            {
                lock (lines) lines.Add(line);
                try { BeginInvoke(new Action(() => status.Text = line)); } catch { }
            };
            log(action + "ing Discord " + d.Branch + "…");

            ThreadPool.QueueUserWorkItem(_ =>
            {
                string error = null;
                try
                {
                    if (uninstall) Core.Uninstall(d, false, log);
                    else Core.Install(d, true, false, log);
                }
                catch (UnauthorizedAccessException e) { error = e.Message + "\n\nMake sure Discord is fully closed (check the system tray). For installs outside your user folder, run the installer as administrator."; }
                catch (Exception e) { error = e.Message; }

                BeginInvoke(new Action(() =>
                {
                    busy = false;
                    foreach (var b in actions) b.Enabled = true;
                    UseWaitCursor = false;
                    RefreshInstalls();
                    UpdateVersions();
                    if (error != null)
                    {
                        status.Text = "✖ " + error.Split('\n')[0];
                        MessageBox.Show(this, error, action + " failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                    else
                    {
                        status.Text = lines.LastOrDefault(l => l.StartsWith("✔")) ?? "Done.";
                        string summary = uninstall
                            ? "Successfully uninstalled Be Themer!\n\nYour settings, themes and plugins were kept in " + Core.DataDir + "."
                            : "Successfully installed Be Themer!\n\nOpen Discord → User Settings → Be Themer.";
                        MessageBox.Show(this, summary, action, MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                }));
            });
        }
    }
}
