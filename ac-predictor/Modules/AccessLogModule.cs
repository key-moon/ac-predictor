using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MongoDB.Bson;
using ac_predictor.MongoDB;

namespace ac_predictor.Modules
{
    public class AccessLogModule : IHttpModule
    {
        DateTime beginTime = new DateTime();
        public void Init(HttpApplication context)
        {
            context.BeginRequest += SetBeginTime;
            context.EndRequest += Logging;
        }

        public void SetBeginTime(object sender, EventArgs e)
        {
            beginTime = DateTime.Now;
        }
        
        public void Logging(object sender, EventArgs e)
        {
            DateTime endTime = DateTime.Now;
            HttpRequest request = (HttpRequest)sender.GetType().GetProperty("Request").GetValue(sender);
            if (request.UserHostAddress == ":::0") return;
            AccessLogDB db = new AccessLogDB();
            LogObj log = new LogObj
            {
                RequestedTime = new BsonDateTime(beginTime),
                Elapsedms = (int)(endTime - beginTime).TotalMilliseconds,
                Url = request.RawUrl,
                Verb = request.RequestType,
                Referrer = request.UrlReferrer is null ? "" : request.UrlReferrer.OriginalString,
                Addres = request.UserHostAddress,
                UserAgent = request.UserAgent
            };
            Console.WriteLine(log.Addres);
            db.CreateLog(log);
        }

        public void Dispose() { }
    }
}