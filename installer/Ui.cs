using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace BThemer.Installer
{
    static class Mac
    {
        public static readonly Color Window = Color.FromArgb(28, 28, 30);
        public static readonly Color TitleBar = Color.FromArgb(36, 36, 39);
        public static readonly Color Card = Color.FromArgb(44, 44, 46);
        public static readonly Color CardBorder = Color.FromArgb(58, 58, 61);
        public static readonly Color Field = Color.FromArgb(58, 58, 60);
        public static readonly Color Text = Color.FromArgb(245, 245, 247);
        public static readonly Color Secondary = Color.FromArgb(152, 152, 157);
        public static readonly Color Separator = Color.FromArgb(56, 56, 58);
        public static readonly Color Blue = Color.FromArgb(10, 132, 255);
        public static readonly Color Green = Color.FromArgb(48, 209, 88);
        public static readonly Color Red = Color.FromArgb(255, 69, 58);
        public static readonly Color Orange = Color.FromArgb(255, 159, 10);
        public static readonly Color Grey = Color.FromArgb(72, 72, 74);
        public static readonly Color Pink = Color.FromArgb(255, 95, 162);

        public static GraphicsPath Rounded(RectangleF r, float radius)
        {
            var p = new GraphicsPath();
            float d = Math.Min(radius * 2, Math.Min(r.Width, r.Height));
            if (d <= 0) { p.AddRectangle(r); return p; }
            p.AddArc(r.X, r.Y, d, d, 180, 90);
            p.AddArc(r.Right - d, r.Y, d, d, 270, 90);
            p.AddArc(r.Right - d, r.Bottom - d, d, d, 0, 90);
            p.AddArc(r.X, r.Bottom - d, d, d, 90, 90);
            p.CloseFigure();
            return p;
        }

        public static Color Mix(Color a, Color b, float t)
        {
            return Color.FromArgb(
                (int)(a.R + (b.R - a.R) * t), (int)(a.G + (b.G - a.G) * t), (int)(a.B + (b.B - a.B) * t));
        }

        public static Font UiFont(float size, FontStyle style)
        {
            foreach (var name in new[] { "Segoe UI Variable Text", "Segoe UI" })
            {
                try
                {
                    var f = new Font(name, size, style);
                    if (f.Name == name) return f;
                    f.Dispose();
                }
                catch { }
            }
            return new Font(FontFamily.GenericSansSerif, size, style);
        }
    }

    static class Dwm
    {
        [DllImport("dwmapi.dll")] static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int value, int size);
        [StructLayout(LayoutKind.Sequential)] struct Margins { public int Left, Right, Top, Bottom; }
        [DllImport("dwmapi.dll")] static extern int DwmExtendFrameIntoClientArea(IntPtr hwnd, ref Margins m);
        [DllImport("user32.dll")] public static extern bool ReleaseCapture();
        [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr hWnd, int msg, IntPtr wParam, IntPtr lParam);

        public static void Apply(IntPtr hwnd)
        {
            try
            {
                int dark = 1; DwmSetWindowAttribute(hwnd, 20, ref dark, 4);
                int round = 2; DwmSetWindowAttribute(hwnd, 33, ref round, 4);
                int policy = 2; DwmSetWindowAttribute(hwnd, 2, ref policy, 4);
                var m = new Margins { Left = 0, Right = 0, Top = 1, Bottom = 0 };
                DwmExtendFrameIntoClientArea(hwnd, ref m);
            }
            catch { }
        }

        public static void Drag(Form form)
        {
            ReleaseCapture();
            SendMessage(form.Handle, 0xA1, (IntPtr)2, IntPtr.Zero);
        }
    }

    class Card : Panel
    {
        public float Radius = 14;
        public Color Fill = Mac.Card;
        public Color Border = Mac.CardBorder;

        public Card()
        {
            DoubleBuffered = true;
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.ResizeRedraw | ControlStyles.UserPaint, true);
            BackColor = Mac.Window;
            Padding = new Padding(18, 14, 18, 14);
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.Clear(Parent != null ? Parent.BackColor : Mac.Window);
            var r = new RectangleF(0.5f, 0.5f, Width - 1.5f, Height - 1.5f);
            using (var path = Mac.Rounded(r, Radius))
            using (var fill = new SolidBrush(Fill))
            using (var pen = new Pen(Border, 1f))
            {
                g.FillPath(fill, path);
                g.DrawPath(pen, path);
            }
        }

        protected override void OnControlAdded(ControlEventArgs e)
        {
            base.OnControlAdded(e);
            e.Control.BackColor = Fill;
        }
    }

    class PillButton : Button
    {
        public Color Fill;
        public float Radius = 10;
        bool hover, down;

        public PillButton(string text, Color fill)
        {
            Text = text;
            Fill = fill;
            FlatStyle = FlatStyle.Flat;
            FlatAppearance.BorderSize = 0;
            ForeColor = Color.White;
            Cursor = Cursors.Hand;
            Font = Mac.UiFont(10.5f, FontStyle.Bold);
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
        }

        protected override void OnMouseEnter(EventArgs e) { hover = true; Invalidate(); base.OnMouseEnter(e); }
        protected override void OnMouseLeave(EventArgs e) { hover = false; down = false; Invalidate(); base.OnMouseLeave(e); }
        protected override void OnMouseDown(MouseEventArgs e) { down = true; Invalidate(); base.OnMouseDown(e); }
        protected override void OnMouseUp(MouseEventArgs e) { down = false; Invalidate(); base.OnMouseUp(e); }
        protected override void OnEnabledChanged(EventArgs e) { Invalidate(); base.OnEnabledChanged(e); }

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;
            g.Clear(Parent != null ? Parent.BackColor : Mac.Window);
            var c = !Enabled ? Mac.Mix(Fill, Mac.Window, 0.55f) : down ? Mac.Mix(Fill, Color.Black, 0.18f) : hover ? Mac.Mix(Fill, Color.White, 0.12f) : Fill;
            var r = new RectangleF(1, 1, Width - 2.5f, Height - 2.5f);
            using (var path = Mac.Rounded(r, Radius))
            using (var fill = new SolidBrush(c))
            using (var rim = new Pen(Color.FromArgb(40, 255, 255, 255), 1f))
            {
                g.FillPath(fill, path);
                g.DrawPath(rim, path);
            }
            if (Focused && ShowFocusCues)
            {
                using (var path = Mac.Rounded(new RectangleF(3, 3, Width - 6.5f, Height - 6.5f), Radius - 2))
                using (var pen = new Pen(Color.FromArgb(150, 255, 255, 255), 1.5f)) g.DrawPath(pen, path);
            }
            TextRenderer.DrawText(g, Text, Font, ClientRectangle, Enabled ? ForeColor : Color.FromArgb(160, ForeColor),
                TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);
        }
    }

    class MacTitleBar : Control
    {
        readonly Form form;
        int hot = -1;
        bool overLights;
        static readonly Color[] Fills = { Color.FromArgb(255, 95, 87), Color.FromArgb(254, 188, 46), Color.FromArgb(40, 200, 64) };
        static readonly Color[] Glyph = { Color.FromArgb(76, 0, 2), Color.FromArgb(152, 87, 0), Color.FromArgb(10, 90, 18) };
        const int D = 13, Gap = 8, Left0 = 14;

        public MacTitleBar(Form form)
        {
            this.form = form;
            Dock = DockStyle.Top;
            Height = 40;
            Font = Mac.UiFont(10f, FontStyle.Bold);
            SetStyle(ControlStyles.AllPaintingInWmPaint | ControlStyles.OptimizedDoubleBuffer | ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
            form.Activated += (s, e) => Invalidate();
            form.Deactivate += (s, e) => Invalidate();
            form.TextChanged += (s, e) => Invalidate();
        }

        Rectangle Light(int i)
        {
            return new Rectangle(Left0 + i * (D + Gap), (Height - D) / 2, D, D);
        }

        int HitLight(Point p)
        {
            for (int i = 0; i < 3; i++)
            {
                var r = Light(i);
                r.Inflate(3, 3);
                if (r.Contains(p)) return i;
            }
            return -1;
        }

        protected override void OnMouseMove(MouseEventArgs e)
        {
            int h = HitLight(e.Location);
            bool over = new Rectangle(Left0 - 4, 0, 3 * D + 2 * Gap + 8, Height).Contains(e.Location);
            if (h != hot || over != overLights) { hot = h; overLights = over; Invalidate(); }
            base.OnMouseMove(e);
        }

        protected override void OnMouseLeave(EventArgs e) { hot = -1; overLights = false; Invalidate(); base.OnMouseLeave(e); }

        protected override void OnMouseDown(MouseEventArgs e)
        {
            base.OnMouseDown(e);
            if (e.Button != MouseButtons.Left) return;
            if (HitLight(e.Location) >= 0) return;
            if (e.Clicks == 2) { ToggleZoom(); return; }
            Dwm.Drag(form);
        }

        protected override void OnMouseUp(MouseEventArgs e)
        {
            base.OnMouseUp(e);
            if (e.Button != MouseButtons.Left) return;
            switch (HitLight(e.Location))
            {
                case 0: form.Close(); break;
                case 1: form.WindowState = FormWindowState.Minimized; break;
                case 2: ToggleZoom(); break;
            }
        }

        void ToggleZoom()
        {
            form.WindowState = form.WindowState == FormWindowState.Maximized ? FormWindowState.Normal : FormWindowState.Maximized;
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;
            g.Clear(Mac.TitleBar);
            using (var sep = new Pen(Mac.Separator)) g.DrawLine(sep, 0, Height - 1, Width, Height - 1);
            bool active = form.ContainsFocus || Form.ActiveForm == form;
            for (int i = 0; i < 3; i++)
            {
                var r = Light(i);
                var fill = active || overLights ? Fills[i] : Color.FromArgb(78, 78, 82);
                using (var b = new SolidBrush(fill)) g.FillEllipse(b, r);
                using (var p = new Pen(Color.FromArgb(50, 0, 0, 0), 0.8f)) g.DrawEllipse(p, r);
                if (!overLights) continue;
                using (var pen = new Pen(Glyph[i], 1.5f) { StartCap = LineCap.Round, EndCap = LineCap.Round })
                {
                    float cx = r.X + D / 2f, cy = r.Y + D / 2f, k = 3f;
                    if (i == 0) { g.DrawLine(pen, cx - k, cy - k, cx + k, cy + k); g.DrawLine(pen, cx + k, cy - k, cx - k, cy + k); }
                    else if (i == 1) g.DrawLine(pen, cx - k - 0.5f, cy, cx + k + 0.5f, cy);
                    else
                    {
                        using (var b = new SolidBrush(Glyph[i]))
                        {
                            g.FillPolygon(b, new[] { new PointF(cx - 3.2f, cy + 0.6f), new PointF(cx - 3.2f, cy - 3.2f), new PointF(cx + 0.6f, cy - 3.2f) });
                            g.FillPolygon(b, new[] { new PointF(cx + 3.2f, cy - 0.6f), new PointF(cx + 3.2f, cy + 3.2f), new PointF(cx - 0.6f, cy + 3.2f) });
                        }
                    }
                }
            }
            TextRenderer.DrawText(g, form.Text, Font, new Rectangle(0, 0, Width, Height), active ? Mac.Text : Mac.Secondary,
                TextFormatFlags.HorizontalCenter | TextFormatFlags.VerticalCenter | TextFormatFlags.EndEllipsis);
        }
    }
}
