using Newtonsoft.Json;
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
