using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ac_predictor.Controllers
{
    public class ContestResultController : Controller
    {
        // GET: ContestResult
        public ActionResult Index()
        {
            return View();
        }

        [Route("{controller}/{contestID}")]
        public ActionResult Result(string contestID)
        {
            return View();
        }
    }
}