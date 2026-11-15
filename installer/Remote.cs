using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Script.Serialization;

namespace BThemer.Installer
{
    public class Release
    {
        public string Version;
        public string PageUrl;
        public string DistZipUrl;
        public string InstallerUrl;
    }

    public static class Remote
    {
        public static Release Latest;
        public static string Error;

        public static string RepoUrl
        {
            get { return string.IsNullOrEmpty(BuildConfig.Repo) ? null : "https://github.com/" + BuildConfig.Repo; }
        }

        static WebClient Client()
        {
            ServicePointManager.SecurityProtocol |= (SecurityProtocolType)3072;
            var wc = new WebClient();
            wc.Headers[HttpRequestHeader.UserAgent] = "BeThemerInstaller/" + BuildConfig.Version;
            return wc;
        }

        public static Release Fetch()
        {
            if (string.IsNullOrEmpty(BuildConfig.Repo)) { Error = "not set up yet"; return null; }
            try
            {
                using (var wc = Client())
                {
                    wc.Headers[HttpRequestHeader.Accept] = "application/vnd.github+json";
                    string json = wc.DownloadString("https://api.github.com/repos/" + BuildConfig.Repo + "/releases/latest");
                    var data = new JavaScriptSerializer().DeserializeObject(json) as Dictionary<string, object>;
                    var r = new Release
                    {
                        Version = Convert.ToString(data["tag_name"]).TrimStart('v', 'V'),
                        PageUrl = Convert.ToString(data["html_url"]),
                    };
                    object assets;
                    if (data.TryGetValue("assets", out assets) && assets is object[])
                    {
                        foreach (var a in ((object[])assets).OfType<Dictionary<string, object>>())
                        {
                            string name = Convert.ToString(a["name"]), url = Convert.ToString(a["browser_download_url"]);
                            if (name.Equals("dist.zip", StringComparison.OrdinalIgnoreCase)) r.DistZipUrl = url;
                            else if (name.Equals("BeThemerInstaller.exe", StringComparison.OrdinalIgnoreCase)) r.InstallerUrl = url;
                        }
                    }
                    Error = null;
                    return Latest = r;
                }
            }
            catch (WebException e)
            {
                var resp = e.Response as HttpWebResponse;
                Error = resp != null && resp.StatusCode == HttpStatusCode.NotFound ? "no public release found" : "offline";
                return null;
            }
            catch (Exception e)
            {
                Error = e.Message;
                return null;
            }
        }

        public static void Download(string url, string path)
        {
            using (var wc = Client()) wc.DownloadFile(url, path);
        }

        public static bool InstallerOutdated
        {
            get { return Latest != null && Core.CompareVersions(Latest.Version, BuildConfig.Version) > 0; }
        }
    }
}
