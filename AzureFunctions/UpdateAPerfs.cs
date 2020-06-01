using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;
using Octokit;
using AtCoder.Util;
using AtCoder.Client;
using System.Linq;

namespace AzureFunctions
{
    public static class UpdateAPerfs
    {
        [FunctionName("UpdateAPerfs")]
        public static async Task<bool> Run([ActivityTrigger] string contestScreenName, ILogger log)
        {
            log.LogInformation("start updating {0}", contestScreenName);
            var ghClient = GitHubUtil.GetClient();
            var acClient = new AtCoderClient();

            var session = Secrets.GetSecret("AtCoderSession");
            await acClient.LoginAsync(session);

            var standings = await acClient.GetStandingsAsync(contestScreenName);

            var jsonPath = $"aperfs/{contestScreenName}.json";

            bool found;
            RepositoryContent content;
            try
            {
                content = (await ghClient.Repository.Content.GetAllContents(GitHubUtil.Owner, GitHubUtil.Repo, jsonPath)).First();
                found = true;
            }
            catch (NotFoundException)
            {
                content = null;
                found = false;
            }
            var dic = content is null ? new Dictionary<string, double>() : JsonSerializer.Deserialize<Dictionary<string, double>>(content.Content);
            log.LogInformation("start crawling.");
            foreach (var standingData in standings.StandingsData)
            {
                if (standingData.UserIsDeleted || 
                    standingData.Competitions == 0 ||
                    dic.ContainsKey(standingData.UserScreenName)) continue;
                var history = await acClient.GetCompetitionHistoryAsync(standingData.UserScreenName);
                var beforeContestPerfs = history?.TakeWhile(x => x.ContestScreenName.Split('.', 2).First() != contestScreenName)?.Where(x => x.IsRated)?.Select(x => x.InnerPerformance)?.ToArray();
                var aperf = Rating.CalcAPerf(beforeContestPerfs);
                if (aperf is null)
                {
                    log.LogWarning($"aperf is null. screenName: {standingData.UserScreenName}");
                    continue;
                }
                dic.Add(standingData.UserScreenName, aperf.Value);
                await Task.Delay(100);
            }
            log.LogInformation("end crawling.");

            var json = JsonSerializer.Serialize(dic);
            if (!found)
            {
                var request = new CreateFileRequest($"add aperfs data of {contestScreenName}", json)
                {
                    Committer = GitHubUtil.Comitter
                };
                await ghClient.Repository.Content.CreateFile(GitHubUtil.Owner, GitHubUtil.Repo, jsonPath, request);
            }
            else
            {
                var request = new UpdateFileRequest($"update aperfs data of {contestScreenName}", json, content.Sha)
                {
                    Committer = GitHubUtil.Comitter
                };
                await ghClient.Repository.Content.UpdateFile(GitHubUtil.Owner, GitHubUtil.Repo, jsonPath, request);
            }

            return !standings.Fixed;
        }
    }
}