using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;

using System;
using AtCoder.Client;
using System.Text.Json;
using AngleSharp.Text;
using AtCoder;
using System.Threading;
using System.Linq;

namespace AzureFunctions
{

    public static class CrawlScheduler
    {
        //execute every hour
        [FunctionName("TimerTriggeredCrawlStarter")]
        public static async Task TimerStart(
            [TimerTrigger("7 0 * * * *")] TimerInfo timer,
            [DurableClient] IDurableOrchestrationClient starter,
            ILogger log)
        {
            // Function input comes from the request content.
            string instanceId = await starter.StartNewAsync("PeriodicCrawlScheduler", null);
            log.LogInformation($"Started orchestration with ID = '{instanceId}'.");
        }

        [FunctionName("HttpTriggeredCrawlStarter")]
        public static async Task<HttpResponseMessage> HttpStart(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestMessage req,
            [DurableClient] IDurableOrchestrationClient starter,
            ILogger log)
        {
            var content = await req.Content.ReadAsAsync<string[]>();
            // Function input comes from the request content.
            string instanceId = await starter.StartNewAsync("PeriodicCrawlScheduler", null, content);
            log.LogInformation($"Started orchestration with ID = '{instanceId}'.");
            return starter.CreateCheckStatusResponse(req, instanceId);
        }

        [FunctionName("PeriodicCrawlScheduler")]
        public static async Task RunOrchestrator(
            [OrchestrationTrigger] IDurableOrchestrationContext context, ILogger logger)
        {
            var currentTime = context.CurrentUtcDateTime;

            var crawledContest = await context.CallActivityAsync<string[]>("GetCrawledContest", null);
            var upcomingContests = await context.CallActivityAsync<ContestInfo[]>("GetUpcomingContest", null);

            var needCrawlContests = 
                GetNeedCrawlContests(upcomingContests, crawledContest, currentTime)
                .Concat(context.GetInput<string[]>() ?? Enumerable.Empty<string>())
                .Distinct()
                .ToList();
            if (needCrawlContests.Count == 0) return;

            await context.CallActivityAsync("PutContests", needCrawlContests.Concat(crawledContest).Distinct().ToArray());
            _ = context.CallSubOrchestratorAsync("PeriodicCrawlExecuter", needCrawlContests);
        }

        public static List<string> GetNeedCrawlContests(ContestInfo[] upcomingContests, string[] crawledContests, DateTime current)
        {
            var needCrawlContests = new List<string>();
            foreach (var contest in upcomingContests)
            {
                if (crawledContests.Contains(contest.ContestScreenName)) continue;
                if (contest.RatedRange == RatingRange.None) continue;

                //  Start-2h       Start     End
                //       |-----------|--------|
                if (contest.StartTime.AddHours(-2.3) <= current &&
                    current < contest.StartTime.Add(contest.Duration) &&
                    !needCrawlContests.Contains(contest.ContestScreenName))
                    needCrawlContests.Add(contest.ContestScreenName);
            }
            return needCrawlContests;
        }

        [FunctionName("PeriodicCrawlExecuter")]
        public static async Task PeriodicCrawlExecuter(
            [OrchestrationTrigger] IDurableOrchestrationContext context, ILogger logger)
        {
            logger = context.CreateReplaySafeLogger(logger);

            var startAt = context.CurrentUtcDateTime;

            var needCrawlContests = context.GetInput<List<string>>() ?? new List<string>();
            var tasks = new Task<bool>[needCrawlContests.Count];
            logger.LogInformation($"needCrawlContests : [{string.Join(", ", needCrawlContests)}]");

            for (int i = 0; i < tasks.Length; i++)
            {
                logger.LogInformation($"start updating {needCrawlContests[i]}");
                tasks[i] = context.CallActivityAsync<bool>("UpdateAPerfs", needCrawlContests[i]);
            }
            for (int i = 0; i < tasks.Length; i++)
                await tasks[i];
            logger.LogInformation("completed"); 

            for (int i = tasks.Length - 1; i >= 0; i--)
                if (!tasks[i].Result) 
                    needCrawlContests.RemoveAt(i);
            
            if (needCrawlContests.Count == 0) return;

            await context.CreateTimer(startAt.AddMinutes(15), CancellationToken.None);
            context.ContinueAsNew(needCrawlContests);
        }

        [FunctionName("GetUpcomingContest")]
        public static async Task<ContestInfo[]> GetUpcomingContest([ActivityTrigger] object obj, ILogger log)
        {
            var client = new AtCoderClient();
            var res = (await client.GetUpcomingContestsAsync()).ToArray();
            //var res = await client.GetUpcomingContestsAsync();
            log.LogInformation($"upcoming contest fetched.\n{string.Join("\n", res.Length)}");
            return res;
        }

        [FunctionName("GetCrawledContest")]
        public static async Task<string[]> GetCrawledContest([ActivityTrigger] object obj, ILogger log)
        {
            const string contestsUrl = "https://key-moon.github.io/ac-predictor-data/contests.json";
            HttpClient client = new HttpClient();
            var res = JsonSerializer.Deserialize<string[]>(await client.GetStringAsync(contestsUrl));
            log.LogInformation($"crawled contest fetched. length:{res.Length}");
            return res;
        }
    }
}