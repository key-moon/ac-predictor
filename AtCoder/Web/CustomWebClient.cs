using System;
using System.Net;


namespace AtCoder.Web
{
    class CustomWebClient : WebClient
    {
        public CookieContainer CookieContainer { get; private set; } = new CookieContainer();

        protected override WebRequest GetWebRequest(Uri address)
        {
            var request = base.GetWebRequest(address);
            if (request is HttpWebRequest)
            {
                (request as HttpWebRequest).CookieContainer = CookieContainer;
            }
            return request;
        }
    }
}
