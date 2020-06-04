using NUnit.Framework;
using AzureFunctions;
using System;
using System.Collections.Generic;
using System.Text;
using Moq;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using AtCoder;
using System.Threading.Tasks;
using System.Linq;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;

namespace AzureFunctions.Tests
{
    [TestFixture()]
    public class CrawlSchedulerTests
    {
        [Test()]
        public async Task PeriodicCrawlSchedulerTest()
        {
            var contextMock = new Mock<IDurableOrchestrationContext>();
            var now = DateTime.UtcNow;
            contextMock.Setup(x => x.CallActivityAsync<DateTime>("GetCurrentTime", null)).ReturnsAsync(now);
            contextMock.Setup(x => x.CallActivityAsync<ContestInfo[]>("GetUpcomingContest", null)).ReturnsAsync(
                new[]{
                    new ContestInfo()
                    {
                        ContestName = "Test Contest 001",
                        ContestScreenName = "tc001",
                        StartTime = now.AddHours(2),
                        Duration = new TimeSpan(2, 0, 0),
                        RatedRange = RatingRange.All
                    },
                    new ContestInfo()
                    {
                        ContestName = "Test Contest 002",
                        ContestScreenName = "tc002",
                        StartTime = now.AddHours(2),
                        Duration = new TimeSpan(2, 0, 0),
                        RatedRange = RatingRange.All
                    }
                });
            contextMock.Setup(x => x.CallActivityAsync<string[]>("GetCrawledContest", null)).ReturnsAsync(new[] { "tc001" });
            bool putContestCalled = false;
            //mock.Setup(x => DurableContextExtensions.CallActivityAsync(x, "PutContests", new string[] { "tc002" })).Callback(() => putContestCalled = true);
            contextMock.Setup(x => x.CallActivityAsync<bool>("UpdateAPerfs", "tc001")).ReturnsAsync(false).Callback(Assert.Fail);
            bool updateAperfstc002 = false;
            contextMock.Setup(x => x.CallActivityAsync<bool>("UpdateAPerfs", "tc002")).ReturnsAsync(false).Callback(() => updateAperfstc002 = true);
            Mock<ILogger> loggerMock = new Mock<ILogger>();
            CrawlScheduler.RunOrchestrator(contextMock.Object, loggerMock.Object).Wait();
            Assert.IsTrue(putContestCalled && updateAperfstc002);;
        }

        [Test()]
        public void GetNeedCrawlContestsTest()
        {
            var now = DateTime.UtcNow;
            var crawled = new[] { "tc001" };
            var upcoming = new[]
            {
                new ContestInfo()
                {
                    ContestName = "Test Contest 001",
                    ContestScreenName = "tc001",
                    StartTime = now.AddHours(2),
                    Duration = new TimeSpan(2, 0, 0),
                    RatedRange = RatingRange.All
                },
                new ContestInfo()
                {
                    ContestName = "Test Contest 002",
                    ContestScreenName = "tc002",
                    StartTime = now.AddHours(2),
                    Duration = new TimeSpan(2, 0, 0),
                    RatedRange = RatingRange.All
                }
            };
            var needCrawlContests = CrawlScheduler.GetNeedCrawlContests(upcoming, crawled, now);
            Assert.IsTrue(needCrawlContests.SequenceEqual(new[] { "tc002" }));
        }
    }
}