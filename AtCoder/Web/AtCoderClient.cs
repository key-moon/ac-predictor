using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace AtCoder.Web
{
    public class AtCoderClient
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

        private async Task<T> GetParsedJsonResponseAsync<T>(string path)
        {
            var response = await Client.GetAsync(path);
            if (response.StatusCode == HttpStatusCode.NotFound) return default;
            if (!response.IsSuccessStatusCode) 
                throw new WebException($"API returns {response.StatusCode}", WebExceptionStatus.ProtocolError);
            string json = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<T>(json);
            return result;
        }

        public Task<CompetitionResult[]> GetCompetitionHistoryAsync(string userScreenName)
            => GetParsedJsonResponseAsync<CompetitionResult[]>($"/users/{Uri.EscapeDataString(userScreenName)}/history/json");
    
        public Task<Standings> GetStandingsAsync(string contestScreenName)
            => GetParsedJsonResponseAsync<Standings>($"/contests/{Uri.EscapeDataString(contestScreenName)}/standings/json");

        public Task<CompetitionResult[]> GetReslutsAsync(string contestScreenName)
            => GetParsedJsonResponseAsync<CompetitionResult[]>($"/contests/{Uri.EscapeDataString(contestScreenName)}/results/json");

    }
}
