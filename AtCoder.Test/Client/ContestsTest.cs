using AtCoder.Client;
using System.Linq;
using NUnit.Framework;
using Microsoft.Extensions.Configuration;
using System;

namespace AtCoder.Client.Tests
{
    [TestFixture()]
    public partial class AtCoderClientTests
    {
        [Test()]
        public void GetUpcomingContestsAsyncTest()
        {
            var client = new AtCoderClient();
            var contests = client.GetUpcomingContestsAsync().Result;
            Assert.IsTrue(contests.All(x => DateTime.Now.ToUniversalTime() < x.StartTime));
        }

        [Test()]
        public void GetPastContestsAsyncTest()
        {
            var client = new AtCoderClient();
            var page1contests = client.GetPastContestsAsync(1).Result.ToArray();
            var page2contests = client.GetPastContestsAsync(2).Result.ToArray();
            var lastTime = DateTime.Now.ToUniversalTime();
            foreach (var item in page1contests.Concat(page2contests))
            {
                if (lastTime < item.StartTime) Assert.Fail();
                lastTime = item.StartTime;
            }
        }
    }
}