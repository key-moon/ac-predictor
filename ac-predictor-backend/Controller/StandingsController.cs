using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

using AtCoder;
using AtCoder.Client;

namespace ac_predictor_backend.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class StandingsController : ControllerBase
    {
        [HttpGet("{contestScreenName}.json")]
        public async Task<MinimalStandings> GetAsync(string contestScreenName)
        {
            AtCoderClient client = new AtCoderClient();
            var res = (MinimalStandings)(await client.GetStandingsAsync(contestScreenName));
            if (res is null) res = new MinimalStandings() { Fixed = true, StandingsData = Array.Empty<MinimalStandingData>() };
            return res;
        }
    }

    public class MinimalStandings
    {
        public bool Fixed;
        public MinimalStandingData[] StandingsData;

        public static explicit operator MinimalStandings(Standings standings)
        {
            return new MinimalStandings()
            {
                Fixed = standings.Fixed,
                StandingsData = standings.StandingsData.Cast<MinimalStandingData>().ToArray()
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
        public int Penalty { get; private set; }
        public static explicit operator MinimalTotalResult(TotalResult totalResult)
        {
            return new MinimalTotalResult()
            {
                Penalty = totalResult.Penalty
            };
        }
    }
}
