using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ac_predictor.Util;

namespace ac_predictor.Handlers
{
    public class OPTIONSHandler : IHttpHandler
    {
        public bool IsReusable => true;

        public void ProcessRequest(HttpContext context)
        {
            HttpRequest request = context.Request;
            HttpResponse responce = context.Response;
            if (!request.Headers.AllKeys.Contains("Origin")) return;
            var requestUrl = request.Url;
            var originUrl = new Uri(request.Headers["Origin"]);
            if (!CrossOriginSettings.IsAllowed(requestUrl, originUrl)) return;
            responce.Headers.Add("Access-Control-Allow-Origin", originUrl.GetLeftPart(UriPartial.Authority));
            responce.Headers.Add("Access-Control-Allow-Methods", "GET");
            responce.Headers.Add("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, Origin");
            responce.Headers.Add("Access-Control-Max-Age", "86400");
        }
    }
}