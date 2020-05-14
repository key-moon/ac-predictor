using Newtonsoft.Json;
using System.Collections.Generic;

namespace AtCoder
{
    [JsonObject]
    public partial class Standings
    {
        [JsonProperty]
        public bool Fixed { get; private set; }
        [JsonProperty]
        public string AdditionalColumns { get; private set; }
        [JsonProperty]
        public TaskInfo[] TaskInfo { get; private set; }
        [JsonProperty]
        public StandingData[] StandingsData { get; private set; }
    }

    [JsonObject]
    public partial class TaskInfo
    {
        [JsonProperty]
        public string Assignment { get; private set; }
        [JsonProperty]
        public string TaskName { get; private set; }
        [JsonProperty]
        public string TaskScreenName { get; private set; }
    }

    [JsonObject]
    public partial class StandingData
    {
        [JsonProperty]
        public int Rank { get; private set; }
        [JsonProperty]
        public string Additional { get; private set; }
        [JsonProperty]
        public string UserName { get; private set; }
        [JsonProperty]
        public string UserScreenName { get; private set; }
        [JsonProperty]
        public bool UserIsDeleted { get; private set; }
        [JsonProperty]
        public string Affiliation { get; private set; }
        [JsonProperty]
        public string Country { get; private set; }
        [JsonProperty]
        public int Rating { get; private set; }
        [JsonProperty]
        public int OldRating { get; private set; }
        [JsonProperty]
        public bool IsRated { get; private set; }
        [JsonProperty]
        public int Competitions { get; private set; }
        [JsonProperty]
        public Dictionary<string, TaskResult> TaskResults { get; private set; }
        [JsonProperty]
        public TotalResult TotalResult { get; private set; }
    }

    [JsonObject]
    public partial class TotalResult
    {
        [JsonProperty]
        public int Count { get; private set; }
        [JsonProperty]
        public int Accepted { get; private set; }
        [JsonProperty]
        public int Penalty { get; private set; }
        [JsonProperty]
        public int Score { get; private set; }
        [JsonProperty]
        public long Elapsed { get; private set; }
        [JsonProperty]
        public bool Frozen { get; private set; }
    }

    [JsonObject]
    public partial class TaskResult
    {
        [JsonProperty]
        public int Count { get; private set; }
        [JsonProperty]
        public int Failure { get; private set; }
        [JsonProperty]
        public int Penalty { get; private set; }
        [JsonProperty]
        public int Score { get; private set; }
        [JsonProperty]
        public long Elapsed { get; private set; }
        [JsonProperty]
        public int Status { get; private set; }
        [JsonProperty]
        public bool Pending { get; private set; }
        [JsonProperty]
        public bool Frozen { get; private set; }
    }
}