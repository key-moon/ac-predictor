using AtCoder.Client;
using System.Linq;
using NUnit.Framework;
using Microsoft.Extensions.Configuration;


namespace AtCoder.Client.Tests
{
    [TestFixture()]
    public partial class AtCoderClientTests
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
    }
}