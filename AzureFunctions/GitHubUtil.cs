using Octokit;
using System;
using System.Collections.Generic;
using System.Text;

namespace AzureFunctions
{
    static class GitHubUtil
    {
        public const string Owner = "key-moon";
        public const string Repo = "ac-predictor-data";
        public static readonly string Token = Secrets.GetSecret("GitHubToken");
        public static readonly Committer Comitter = new Committer("ac-predictor", "kymn0116+predictor@gmail.com", DateTimeOffset.Now);
        public static readonly GitHubClient Client = new GitHubClient(new ProductHeaderValue("ac-predictor-function"))
        {
            Credentials = new Credentials(Token)
        };
    }
}
