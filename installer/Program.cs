using System;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("Be Themer Installer")]
[assembly: AssemblyProduct("Be Themer")]
[assembly: AssemblyDescription("Installs Be Themer into the Discord desktop app")]

namespace BThemer.Installer
{
    static class Program
    {
        [STAThread]
        static int Main(string[] args)
        {
#if CLI
            return Cli.Run(args);
#else
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
            return 0;
#endif
        }
    }
}
