using System;
using System.Web;
using System.Linq;
using System.Diagnostics;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace ac_predictor.Modules
{
    /// <summary>
    /// 送信するHeaderを
    /// </summary>
    public class HTTPHeaderModule : IHttpModule
    {
        public void Init(HttpApplication context)
        {
            context.PreSendRequestHeaders += AddHeaderFromURL;
        }

        /// <summary>
        /// HeaderをURLに応じて追加する
        /// </summary>
        private void AddHeaderFromURL(object sender, EventArgs e)
        {
            HttpRequest request = (HttpRequest)sender.GetType().GetProperty("Request").GetValue(sender);
            HttpResponse responce = (HttpResponse)sender.GetType().GetProperty("Response").GetValue(sender);
            var url = request.Url;
            if (Regex.IsMatch(url.AbsolutePath, "^/api", RegexOptions.IgnoreCase))
            {
                if (request.Headers.AllKeys.Contains("Origin"))
                {
                    Uri hostUrl = new Uri(request.Headers["Origin"]);
                    if (IsAllowedHost(hostUrl.Host))
                    {
                        responce.Headers.Add("Access-Control-Allow-Origin", hostUrl.GetLeftPart(UriPartial.Authority));
                    }
                }
            }
            if (Regex.IsMatch(url.AbsolutePath, "^/sw", RegexOptions.IgnoreCase))
            {
                if (request.Headers.AllKeys.Contains("Origin"))
                {
                    Uri hostUrl = new Uri(request.Headers["Origin"]);
                    if (IsAllowedHost(hostUrl.Host))
                    {
                        responce.Headers.Add("Access-Control-Allow-Origin", hostUrl.GetLeftPart(UriPartial.Authority));
                        responce.Headers.Add("Service-Worker-Allowed", hostUrl.GetLeftPart(UriPartial.Authority));
                    }
                }
            }
        }

        public void Dispose(){}

        private bool IsAllowedHost(string host)
        {
            return Regex.IsMatch(host, ".*atcoder\\.jp", RegexOptions.IgnoreCase);
        }
    }
}