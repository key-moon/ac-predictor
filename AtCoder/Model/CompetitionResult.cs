using Newtonsoft.Json;
using System;

namespace AtCoder
{
    [JsonObject]
    public partial class CompetitionResult
    {
        [JsonProperty]
        public bool IsRated { get; private set; }
        [JsonProperty]
        public int Place { get; private set; }
        [JsonProperty]
        public int OldRating { get; private set; }
        [JsonProperty]
        public int NewRating { get; private set; }
        [JsonProperty]
        public int Performance { get; private set; }
        [JsonProperty]
        public int InnerPerformance { get; private set; }
        [JsonProperty]
        public string ContestName { get; private set; }
        [JsonProperty]
        public string ContestNameEn { get; private set; }
        [JsonProperty]
        public string ContestScreenName { get; private set; }
        [JsonProperty]
        public DateTime EndTime { get; private set; }
        [JsonProperty]
        public string UserName { get; private set; }
        [JsonProperty]
        public string UserScreenName { get; private set; }
        [JsonProperty]
        public string Country { get; private set; }
        [JsonProperty]
        public string Affiliation { get; private set; }
        [JsonProperty]
        public string Rating { get; private set; }
        [JsonProperty]
        public string Competitions { get; private set; }
    }
}