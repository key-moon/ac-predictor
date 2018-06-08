using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Newtonsoft.Json;
using ac_predictor.MongoDB;

namespace ac_predictor.API
{
    public class APrefsController : ApiController
    {
        /// <summary>DBに入ってるコンテスト一覧の取得</summary>
        public string Get()
        {
            APrefsDB db = new APrefsDB();
            string[] contestIDs = db.ContestIDs.ToArray();
            return JsonConvert.SerializeObject(contestIDs);
        }

        public string Get(string id)
        {
            return "value";
        }
    }
}