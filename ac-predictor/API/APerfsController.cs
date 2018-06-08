using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;
using ac_predictor.MongoDB;
using ac_predictor.AtCoder;

namespace ac_predictor.API
{
    public class APerfsController : ApiController
    {
        /// <summary>DBに入ってるコンテスト一覧の取得</summary>
        public string Get()
        {
            APerfsDB db = new APerfsDB();
            string[] contestIDs = db.ContestIDs.ToArray();
            return JsonConvert.SerializeObject(contestIDs);
        }

        /// <summary>APerf一覧の取得</summary>
        public string Get(string id)
        {
            APerfsDB db = new APerfsDB();
            APerfs aperfs = db.GetAPerfs(id);
            return JsonConvert.SerializeObject(aperfs);
        }

        public void Post(string contestID)
        {
            APerfsDB db = new APerfsDB();
            CompetitionResult[] results = CompetitionResult.GetFromJson(contestID);
            APerfs aPerfs = new APerfs(contestID);
            foreach (var result in results)
            {
                CompetitionResult.CalcAPerf(result.)
            }
        }
    }
}