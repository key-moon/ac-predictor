using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace AtCoder.Web
{
    public class AtCoderClient
    {
        static readonly Uri AtCoderDomain = new Uri("https://atcoder.jp");
        CustomWebClient Client = new CustomWebClient();
        
        public void Login(string revelSession)
        {
            const string revelSessionKey = "REVEL_SESSION";
            var cookie = new Cookie(revelSessionKey, revelSession, "/");
            Client.CookieContainer.Add(AtCoderDomain, cookie);
        }
        
        public void Login(string userName, string password)
        {
            //TODO
            throw new NotImplementedException();
        }

        private async Task<T> GetParsedJsonResponseAsync<T>(string path)
        {
            UriBuilder builder = new UriBuilder(AtCoderDomain);
            builder.Path = path;
            string json;
            try
            {
                json = await Client.DownloadStringTaskAsync(builder.Uri);
            }
            catch (WebException e)
            {
                if ((e.Response as HttpWebResponse).StatusCode == HttpStatusCode.NotFound)
                {
                    return default;
                }
                throw e;
            }
            var result = JsonConvert.DeserializeObject<T>(json);
            return result;
        }

        public Task<CompetitionResult[]> GetCompetitionHistoryAsync(string userScreenName)
            => GetParsedJsonResponseAsync<CompetitionResult[]>($"/users/{userScreenName}/history/json");
    
        public Task<Standings> GetStandingsAsync(string contestScreenName)
            => GetParsedJsonResponseAsync<Standings>($"/contests/{contestScreenName}/standings/json");
    }
}
