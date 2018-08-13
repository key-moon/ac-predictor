using System;
using System.Web;
using System.Linq;
using System.Diagnostics;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using ac_predictor.Util;

namespace ac_predictor.Modules
{
    /// <summary>
    /// 送信するHeaderを調節
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
            if (!request.Headers.AllKeys.Contains("Origin")) return;
            var requestUrl = request.Url;
            var originUrl = new Uri(request.Headers["Origin"]);
            var crossorigin = CrossOriginSettings.AllowedRequestPolicy(requestUrl, originUrl);
            if (crossorigin is null) return;
            responce.Headers.Add("Access-Control-Allow-Origin", originUrl.GetLeftPart(UriPartial.Authority));
            if (crossorigin.RequestAbsolutePathRegex.IsMatch("/sw")) responce.Headers.Add("Service-Worker-Allowed", originUrl.GetLeftPart(UriPartial.Authority));   
        }

        public void Dispose(){}
    }
}