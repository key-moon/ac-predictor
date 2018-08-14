using System;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ac_predictor.Util
{
    public static class CrossOriginSettings
    {
        public static List<CrossOriginPolicy> CrossOriginPolicies = new List<CrossOriginPolicy>
        {
            new CrossOriginPolicy("^/api",".*atcoder\\.jp")
        };

        public class CrossOriginPolicy
        {
            public Regex RequestAbsolutePathRegex { get; set; }
            public Regex OriginHostRegex { get; set; }
            public CrossOriginPolicy(Regex requestAbsolutePathRegex, Regex originHostRegex)
            {
                RequestAbsolutePathRegex = requestAbsolutePathRegex;
                OriginHostRegex = originHostRegex;
            }
            public CrossOriginPolicy(string requestAbsolutePathRegexString,string originHostRegexString):this(new Regex(requestAbsolutePathRegexString, RegexOptions.IgnoreCase),new Regex(originHostRegexString, RegexOptions.IgnoreCase)) { }

            public bool IsAllowedHost(string requestAbsolutePath, string originHost)
            {
                return RequestAbsolutePathRegex.IsMatch(requestAbsolutePath) && OriginHostRegex.IsMatch(originHost);
            }
            public bool IsAllowedHost(Uri request, Uri origin)
            {
                return IsAllowedHost(request.AbsolutePath, origin.GetLeftPart(UriPartial.Authority));
            }
        }

        public static bool IsAllowed(Uri requestURL, Uri originURL)
        {
            return !(AllowedRequestPolicy(requestURL, originURL) is null);
        }

        public static CrossOriginPolicy AllowedRequestPolicy(Uri requestURL,Uri originURL)
        {
            return CrossOriginPolicies.FirstOrDefault(x => x.IsAllowedHost(requestURL, originURL));
        }
    }
}