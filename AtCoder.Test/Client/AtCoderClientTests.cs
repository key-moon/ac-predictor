using System.Linq;
using NUnit.Framework;
using Microsoft.Extensions.Configuration;


namespace AtCoder.Client.Tests
{
    [TestFixture()]
    public class AtCoderClientTests
    {
        static IConfiguration Configuration { get; set; } = new ConfigurationBuilder()
                .AddUserSecrets<AtCoderClientTests>().Build();

        static TestCaseData[] LoginWithSessionTestCases = new[]
        {
            new TestCaseData(Configuration["RevelSession"], Configuration["UserScreenName"])
            .SetName("session-valid"),
            new TestCaseData("invalid session", null)
            .SetName("session-invalid")
        };
        [TestCaseSource("LoginWithSessionTestCases")]
        public void LoginWithSessionTest(string revelSession, string userScreenName)
        {
            var client = new AtCoderClient();
            client.LoginAsync(revelSession).Wait();
            Assert.AreEqual(userScreenName, client.LoggedInUserScreenName);
        }

        static TestCaseData[] LoginWithPassTestCases = new[]
        {
            new TestCaseData(Configuration["UserScreenName"], Configuration["Password"], true)
            .SetName("pass-valid"),
            new TestCaseData("keymoon", "invalid pass", false)
            .SetName("pass-invalid")
        };
        [TestCaseSource("LoginWithPassTestCases")]
        public void LoginWithPassTest(string userScreenName, string pass, bool shouldSuccess)
        {
            var client = new AtCoderClient();
            client.LoginAsync(userScreenName, pass).Wait();
            Assert.AreEqual(userScreenName == client.LoggedInUserScreenName, shouldSuccess);
        }

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