using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Configuration;
using System.Web.Http;
using System.Web.Http.Results;
using Newtonsoft.Json;
using ac_predictor.MongoDB;
using ac_predictor.AtCoder;

namespace ac_predictor.API
{
    public class StandingsController : ApiController
    {
        [Route("api/standings/{contestID}")]
        public JsonResult<Standings> Get(string contestID)
        {
            Standings result = Standings.GetStandings(contestID);
            return Json(result);
        }
    }
}
