using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

using AtCoder;
using AtCoder.Client;
using Microsoft.AspNetCore.DataProtection;
using AzureFunctions;

namespace ac_predictor_backend.Controller
{
    [Route("[controller]")]
    [ApiController]
    public class StandingsController : ControllerBase
    {
        [HttpGet("{contestScreenName}.json")]
        public async Task<MinimalStandings> GetAsync(string contestScreenName)
        {
            AtCoderClient client = new AtCoderClient();
            await client.LoginAsync(Secrets.GetSecret("AtCoderCSRFToken"));
            var res = await client.GetStandingsAsync(contestScreenName);
            if (res is null) return null;
            return (MinimalStandings)res;
        }
    }

    public class MinimalStandings
    {
        public bool Fixed { get; private set; }
        public MinimalStandingData[] StandingsData { get; private set; }

        public static explicit operator MinimalStandings(Standings standings)
        {
            return new MinimalStandings()
            {
                Fixed = standings.Fixed,
                StandingsData = standings.StandingsData.Select(x => (MinimalStandingData)x).ToArray()
            };
        }
    }

    public class MinimalStandingData
    {
        public int Rank { get; private set; }
        public string UserScreenName { get; private set; }
        public bool UserIsDeleted { get; private set; }
        public int Rating { get; private set; }
        public int OldRating { get; private set; }
        public bool IsRated { get; private set; }
        public int Competitions { get; private set; }
        public MinimalTotalResult TotalResult { get; private set; }

        public static explicit operator MinimalStandingData(StandingData standingData)
        {
            return new MinimalStandingData()
            {
                Rank = standingData.Rank,
                UserScreenName = standingData.UserScreenName,
                UserIsDeleted = standingData.UserIsDeleted,
                Rating = standingData.Rating,
                OldRating = standingData.OldRating,
                IsRated = standingData.IsRated,
                Competitions = standingData.Competitions,
                TotalResult = (MinimalTotalResult)standingData.TotalResult,
            };
        }
    }

    public class MinimalTotalResult
    {
        public int Count { get; private set; }
        public int Penalty { get; private set; }
        public static explicit operator MinimalTotalResult(TotalResult totalResult)
        {
            return new MinimalTotalResult()
            {
                Count = totalResult.Count,
                Penalty = totalResult.Penalty
            };
        }
    }
}
