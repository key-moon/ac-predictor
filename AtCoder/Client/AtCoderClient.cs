﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AtCoder.Client
{
    public partial class AtCoderClient
    {
        const string revelSessionKey = "REVEL_SESSION";
        static readonly Uri AtCoderDomain = new Uri("https://atcoder.jp");

        CookieContainer Container;
        HttpClient Client;
        string CsrfToken;
        public string LoggedInUserScreenName { get; private set; }

        public AtCoderClient()
        {
            Container = new CookieContainer();
            Client = new HttpClient(new HttpClientHandler() { CookieContainer = Container })
            {
                BaseAddress = AtCoderDomain
            };
        }

        public async Task LoginAsync(string revelSession)
        {
            var revelSessionCookie = new Cookie(revelSessionKey, revelSession, "/", AtCoderDomain.Host);
            Container.Add(revelSessionCookie);
            await UpdateSessionDataAsync();
        }
        
        public async Task LoginAsync(string userName, string password)
        {
            await UpdateSessionDataAsync();
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "username", userName },
                { "password", password },
                { "csrf_token", CsrfToken }
            });
            var result = await Client.PostAsync("/login", content);
            UpdateSessionData(await result.Content.ReadAsStringAsync());
        }

        private async Task UpdateSessionDataAsync()
            => UpdateSessionData(await Client.GetStringAsync("/"));

        private void UpdateSessionData(string responseBody)
        {
            CsrfToken = GetJSVariable(responseBody, "csrfToken");
            LoggedInUserScreenName = GetJSVariable(responseBody, "userScreenName");
            if (LoggedInUserScreenName == "") LoggedInUserScreenName = null;

            string GetJSVariable(string body, string name)
            {
                var match = Regex.Match(body, $@"var {name} = ""(.*)""");
                if (match.Success)
                {
                    var res = match.Groups[1].Value;
                    return res;
                }
                return null;
            }
        }

    }
}
