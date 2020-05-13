using NUnit.Framework;
using AtCoder.Web;
using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.Linq;
using Newtonsoft.Json;
using System.Threading.Tasks;
using System.Reflection;

namespace AtCoder.Web.Tests
{
    [TestFixture()]
    public class AtCoderClientTests
    {
        [Test()]
        public void LoginTest()
        {
            Assert.Fail();
        }

        [Test()]
        public void LoginTest1()
        {
            Assert.Fail();
        }

        static IEnumerable<string> GetFields(Type T)
            => T.GetFields().Select(x => x.Name);
        static TestCaseData[] CompetitionHistoryAsyncTestCases = new[]
        {
            new TestCaseData("keymoon", JsonConvert.DeserializeObject<CompetitionResult>("{\"IsRated\":true,\"Place\":17,\"OldRating\":0,\"NewRating\":400,\"Performance\":1600,\"InnerPerformance\":1833,\"ContestScreenName\":\"abc078.contest.atcoder.jp\",\"ContestName\":\"AtCoder Beginner Contest 078\",\"ContestNameEn\":\"\",\"EndTime\":\"2017-11-11T22:40:00+09:00\"}")).SetName("normal data"),
            new TestCaseData("keymoon?&", null).SetName("invalid charactors"),
        };

        [TestCaseSource("CompetitionHistoryAsyncTestCases")]
        public void GetCompetitionHistoryAsyncTest(string userScreenName, CompetitionResult expected)
        {
            var result = new AtCoderClient().GetCompetitionHistoryAsync(userScreenName).Result?.First();
            Assert.IsTrue(result == expected || 
                (result != null && expected != null &&
                result.ContestName == expected.ContestName &&
                result.ContestScreenName == expected.ContestScreenName &&
                result.EndTime == expected.EndTime &&
                result.InnerPerfomance == expected.InnerPerfomance &&
                result.IsRated == expected.IsRated &&
                result.NewRating == expected.NewRating &&
                result.Perfomance == expected.Perfomance &&
                result.Place == expected.Place &&
                result.OldRating == expected.OldRating));
        }

        [Test()]
        public void GetStandingsAsyncTest()
        {
            Assert.Fail();
        }
    }
}