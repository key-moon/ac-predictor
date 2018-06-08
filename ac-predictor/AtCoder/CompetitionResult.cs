using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace ac_predictor.AtCoder
{
    public class CompetitionResult
    {
        public bool IsRated { get; private set; }
        public int Place { get; private set; }
        public int NewRating { get; private set; }
        public int Perfomance { get; private set; }
        public int InnerPerfomance { get; private set; }
        public string ContestScreenName { get; private set; }
        public string ContestName { get; private set; }
        public DateTime EndTime { get; private set; }
        public CompetitionResult(CompetitionResult competitionResult) : this(competitionResult.IsRated, competitionResult.EndTime, competitionResult.ContestScreenName, competitionResult.ContestName, competitionResult.Place, competitionResult.Perfomance, competitionResult.InnerPerfomance, competitionResult.NewRating) { }
        [JsonConstructor]
        public CompetitionResult(bool isRated, string endTime, string contestScreenName, string contestName, int place, int performance, int innerPerformance, int newRating) : this(isRated, new DateTime(int.Parse(endTime.Substring(0, 4)), int.Parse(endTime.Substring(5, 2)), int.Parse(endTime.Substring(8, 2)), int.Parse(endTime.Substring(11, 2)), int.Parse(endTime.Substring(14, 2)), int.Parse(endTime.Substring(17, 2))), contestScreenName, contestName, place, performance, innerPerformance, newRating) { }
        public CompetitionResult(bool isRated, DateTime endTime, string contestScreenName, string contestName, int place, int performance, int innerPerformance, int newRating)
        {
            IsRated = isRated;
            EndTime = endTime;
            ContestScreenName = contestScreenName;
            ContestName = contestName;
            Place = place;
            Perfomance = performance;
            InnerPerfomance = innerPerformance;
            NewRating = newRating;
        }
        public static CompetitionResult[] GetFromJson(string userName) => Scraping.GetCompetitionHistory(userName);

        public static double CalcAPerf(CompetitionResult[] results, double defaultValue) => CalcAPerf(results.Select(x => x.InnerPerfomance).ToArray(), defaultValue);

        public static double CalcAPerf(int[] perfs, double defalutValue)
        {
            if (perfs == null || perfs.Length == 0) return defalutValue;
            double coefficient = 1;
            double denominator = 0;
            double numerator = 0;
            for (int i = 0; i < perfs.Length; i++)
            {
                coefficient *= 0.9d;
                denominator += perfs[i] * coefficient;
                numerator += coefficient;
            }
            return denominator / numerator;
        }
    }
}