using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace AzureFunctions
{
    static class Secrets
    {
        static IConfiguration Configuration { get; set; } = new ConfigurationBuilder()
                .AddUserSecrets<Class>().Build();
        public static string GetSecret(string key)
        {
            var res = Environment.GetEnvironmentVariable(key, EnvironmentVariableTarget.Process);
            if (res is null) res = Configuration[key];
            return res;
        }
    }
    class Class { }
}
