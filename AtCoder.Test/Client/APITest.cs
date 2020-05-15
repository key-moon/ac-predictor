using AtCoder.Client;
using System.Linq;
using NUnit.Framework;
using Microsoft.Extensions.Configuration;


namespace AtCoder.Client.Tests
{
    [TestFixture()]
    public partial class AtCoderClientTests
    {

        static TestCaseData[] CompetitionHistoryAsyncTestCases = new[]
        {
            new TestCaseData("keymoon", 1833).SetName("history-normal"),
            new TestCaseData("keymoon?&", null).SetName("history-invalid charactors"),
        };

        [TestCaseSource("CompetitionHistoryAsyncTestCases")]
        public void GetCompetitionHistoryAsyncTest(string userScreenName, int? firstInnerPerformance)
        {
            var firstHistory = new AtCoderClient().GetCompetitionHistoryAsync(userScreenName).Result?.FirstOrDefault();
            Assert.AreEqual(firstInnerPerformance, firstHistory?.InnerPerformance);
        }

        [TestCase("agc001", "cgy4ever")]
        public void GetStandingsAsyncTest(string contestScreenName, string topScreenName)
        {
            var client = new AtCoderClient();
            client.LoginAsync(Configuration["RevelSession"]).Wait();
            var standings = client.GetStandingsAsync(contestScreenName).Result;
            Assert.AreEqual(topScreenName, standings.StandingsData[0].UserScreenName);
        }

        [TestCase("agc001", "cgy4ever")]
        public void GetResultsAsyncTest(string contestScreenName, string topScreenName)
        {
            var client = new AtCoderClient();
            client.LoginAsync(Configuration["RevelSession"]).Wait();
            var results = client.GetReslutsAsync(contestScreenName).Result;
            Assert.AreEqual(topScreenName, results[0].UserScreenName);
        }
    }
}