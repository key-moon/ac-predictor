using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

using AngleSharp.Html;
using AngleSharp.Dom;
using AngleSharp.Html.Parser;
using System.Linq;

namespace AtCoder.Client
{
    public partial class AtCoderClient
    {
        private IEnumerable<ContestInfo> ParseContestInfosFromTable(IElement tbody)
        {
            foreach (var row in tbody.GetElementsByTagName("tr"))
            {
                var res = new ContestInfo();

                var tds = row.GetElementsByTagName("td");
                var dateTimeStr = tds[0].FirstElementChild.GetAttribute("href").Split('?')[1].Substring(4, 13);
                res.StartTime = DateTime.ParseExact(dateTimeStr, "yyyyMMddTHHmm", null).AddHours(9);

                var contestAnchor = tds[1].GetElementsByTagName("a")[0];
                res.ContestName = contestAnchor.TextContent;
                res.ContestScreenName = contestAnchor.GetAttribute("href").Split('/').Last();

                var durationHourAndMin = tds[2].TextContent.Split(':');
                res.Duration = new TimeSpan(int.Parse(durationHourAndMin[0]), int.Parse(durationHourAndMin[1]), 0);

                var ratedRange = tds[3].TextContent;
                res.RatedRange = RatingRange.Parse(ratedRange);

                yield return res;
            }
        }

        //TODO:Add Filter
        public async Task<IEnumerable<ContestInfo>> GetUpcomingContestsAsync()
        {
            var body = await Client.GetStringAsync("/contests");
            var document = await new HtmlParser().ParseDocumentAsync(body);
            var upcomingDiv = document.GetElementById("contest-table-upcoming");
            var tbody = upcomingDiv.GetElementsByTagName("tbody")[0];

            return ParseContestInfosFromTable(tbody);
        }

        //TODO:Add Filter
        public async Task<IEnumerable<ContestInfo>> GetPastContestsAsync(int page)
        {
            var body = await Client.GetStringAsync($"/contests/archive?page={page}");
            var document = await new HtmlParser().ParseDocumentAsync(body);
            var tbody = document.GetElementsByTagName("tbody")[0];
            if (tbody == null) Enumerable.Empty<ContestInfo>();
            return ParseContestInfosFromTable(tbody);
        }
    }
}
