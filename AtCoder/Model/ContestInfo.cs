using System;
using System.Collections.Generic;
using System.Text;

namespace AtCoder
{
    public partial class ContestInfo
    {
        public DateTime StartTime { get; set; }
        public string ContestName { get; set; }
        public string ContestScreenName { get; set; }
        public TimeSpan Duration { get; set; }
        public Range RatedRange { get; set; }
    }

    public partial struct Range
    {
        public int Start { get; set; }
        public int End { get; set; }
    }
}
