using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.DurableTask;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Octokit;

namespace AzureFunctions
{
    public static class PutContests
    {
        [FunctionName("PutContests")]
        public static async Task Func([ActivityTrigger] string[] contests, ILogger log)
        {
            var json = JsonSerializer.Serialize(contests);

            var ghClient = GitHubUtil.Client;


            log.LogInformation("fetching all contents..");
            var contestsJson = (await ghClient.Repository.Content.GetAllContents(GitHubUtil.Owner, GitHubUtil.Repo, "contests.json")).First();
            log.LogInformation("fetched");
            var request = new UpdateFileRequest($"update contests.json", json, contestsJson.Sha)
            {
                Committer = GitHubUtil.Comitter
            };
            log.LogInformation("updating contests...");
            await ghClient.Repository.Content.UpdateFile(GitHubUtil.Owner, GitHubUtil.Repo, "contests.json", request);
            log.LogInformation("updated");
        }
    }
}