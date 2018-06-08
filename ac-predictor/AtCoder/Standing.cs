using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace ac_predictor.AtCoder
{
    public class Standings
    {
        public bool Fixed { get; private set; }
        public string AdditionalColumns { get; private set; }
        private TaskInfo[] _taskinfo;
        public TaskInfo[] TaskInfo { get { return _taskinfo.Select(x => new TaskInfo(x)).ToArray(); } private set { _taskinfo = value.Select(x => new TaskInfo(x)).ToArray(); } }
        private StandingData[] _standingdata;
        public StandingData[] StandingsData { get { return _standingdata.Select(x => new StandingData(x)).ToArray(); } private set { _standingdata = value.Select(x => new StandingData(x)).ToArray(); } }
        public Standings(Standings standings) : this(standings.Fixed, standings.AdditionalColumns, standings._taskinfo, standings._standingdata) { }
        [JsonConstructor]
        public Standings(bool Fixed, string additionalColumns, TaskInfo[] taskInfo, StandingData[] standingsData)
        {
            this.Fixed = Fixed;
            AdditionalColumns = additionalColumns;
            TaskInfo = taskInfo;
            StandingsData = standingsData;
        }

        static Standings GetStandings(string contestID) => Scraping.GetStandings(contestID);
    }
    public class TaskInfo
    {
        public string Assignment { get; private set; }
        public string TaskName { get; private set; }
        public string TaskScreenName { get; private set; }
        public TaskInfo(TaskInfo taskInfo) : this(taskInfo.Assignment, taskInfo.TaskName, taskInfo.TaskScreenName) { }
        [JsonConstructor]
        public TaskInfo(string assignment, string taskName, string taskScreenName)
        {
            Assignment = assignment;
            TaskName = taskName;
            TaskScreenName = taskScreenName;
        }
    }
    public class StandingData
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
        private Dictionary<string, TaskResult> _taskresults;
        public Dictionary<string, TaskResult> TaskResults { get { return _taskresults.ToDictionary(x => x.Key, x => x.Value); } private set { _taskresults = value.ToDictionary(x => x.Key, x => x.Value); } }
        private TotalResult _totalresult;
        public TotalResult TotalResult { get { return new TotalResult(_totalresult); } private set { _totalresult = new TotalResult(value); } }
        public StandingData(StandingData standingData) : this(standingData.Rank, standingData.Additional, standingData.UserName, standingData.UserScreenName, standingData.UserIsDeleted, standingData.Affiliation, standingData.Country, standingData.Rating, standingData.OldRating, standingData.IsRated, standingData.Competitions, standingData._taskresults, standingData._totalresult) { }
        [JsonConstructor]
        public StandingData(int rank, string additional, string userName, string userScreenName, bool userIsDeleted, string affiliation, string country, int rating, int oldRating, bool isRated, int competitions, Dictionary<string, TaskResult> taskResults, TotalResult totalResult)
        {
            Rank = rank;
            Additional = additional;
            UserName = userName;
            UserScreenName = userScreenName;
            UserIsDeleted = userIsDeleted;
            Affiliation = affiliation;
            Country = country;
            Rating = rating;
            OldRating = oldRating;
            IsRated = isRated;
            Competitions = competitions;
            TaskResults = taskResults;
            TotalResult = totalResult;
        }
    }
    public class TotalResult
    {
        public int Count { get; private set; }
        public int Accepted { get; private set; }
        public int Penalty { get; private set; }
        public int Score { get; private set; }
        public long Elapsed { get; private set; }
        public bool Frozen { get; private set; }
        public TotalResult(TotalResult totalResult) : this(totalResult.Count, totalResult.Accepted, totalResult.Penalty, totalResult.Score, totalResult.Elapsed, totalResult.Frozen) { }
        [JsonConstructor]
        public TotalResult(int count, int accepted, int penalty, int score, long elapsed, bool frozen)
        {
            Count = count;
            Accepted = accepted;
            Penalty = penalty;
            Score = score;
            Elapsed = elapsed;
            Frozen = frozen;
        }
    }
    public class TaskResult
    {
        public int Count { get; private set; }
        public int Failure { get; private set; }
        public int Penalty { get; private set; }
        public int Score { get; private set; }
        public long Elapsed { get; private set; }
        public int Status { get; private set; }
        public bool Pending { get; private set; }
        public bool Frozen { get; private set; }
        public TaskResult(TaskResult taskResult) : this(taskResult.Count, taskResult.Failure, taskResult.Penalty, taskResult.Score, taskResult.Elapsed, taskResult.Status, taskResult.Pending, taskResult.Frozen) { }
        [JsonConstructor]
        public TaskResult(int count, int failure, int penalty, int score, long elapsed, int status, bool pending, bool frozen)
        {
            Count = count;
            Failure = failure;
            Penalty = penalty;
            Score = score;
            Elapsed = elapsed;
            Status = status;
            Pending = pending;
            Frozen = frozen;
        }
    }
}