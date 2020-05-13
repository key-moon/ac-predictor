using System.Collections.Generic;

namespace AtCoder
{
    public partial class Standings
    {
        public bool Fixed { get; private set; }
        public string AdditionalColumns { get; private set; }
        public TaskInfo[] TaskInfo { get; private set; }
        public StandingData[] StandingsData { get; private set; }
    }

    public partial class TaskInfo
    {
        public string Assignment { get; private set; }
        public string TaskName { get; private set; }
        public string TaskScreenName { get; private set; }
    }

    public partial class StandingData
    {
        public int Rank { get; private set; }
        public string Additional { get; private set; }
        public string UserName { get; private set; }
        public string UserScreenName { get; private set; }
        public bool UserIsDeleted { get; private set; }
        public string Affiliation { get; private set; }
        public string Country { get; private set; }
        public int Rating { get; private set; }
        public int OldRating { get; private set; }
        public bool IsRated { get; private set; }
        public int Competitions { get; private set; }
        public Dictionary<string, TaskResult> TaskResults { get; private set; }
        public TotalResult TotalResult { get; private set; }
    }

    public partial class TotalResult
    {
        public int Count { get; private set; }
        public int Accepted { get; private set; }
        public int Penalty { get; private set; }
        public int Score { get; private set; }
        public long Elapsed { get; private set; }
        public bool Frozen { get; private set; }
    }

    public partial class TaskResult
    {
        public int Count { get; private set; }
        public int Failure { get; private set; }
        public int Penalty { get; private set; }
        public int Score { get; private set; }
        public long Elapsed { get; private set; }
        public int Status { get; private set; }
        public bool Pending { get; private set; }
        public bool Frozen { get; private set; }
    }
}