using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Web;
using System.Web.Http;
using Newtonsoft.Json;
using ac_predictor.AtCoder;

namespace ac_predictor.AtCoder
{
    public static class Scraping
    {
        public static Standings GetStandings(string contestID)
        {
            string HTML = getHTML($"https://beta.atcoder.jp/contests/{contestID}/standings/json");
            var standings = JsonConvert.DeserializeObject<Standings>(HTML);
            return standings;
        }

        public static CompetitionResult[] GetCompetitionHistory(string userName)
        {
            string HTML = getHTML($"https://beta.atcoder.jp/users/{userName}/history/json");
            var history = JsonConvert.DeserializeObject<CompetitionResult[]>(HTML);
            return history;
        }

        private static string getHTML(string URL)
        {
            string res;
            using (WebClient client = new WebClient())
            {
                client.Encoding = Encoding.UTF8;
                res = client.DownloadString(URL);
            }
            return res;
        }
    }
}