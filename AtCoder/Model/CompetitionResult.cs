using System;

namespace AtCoder
{
    public partial class CompetitionResult
    {
        public bool IsRated { get; private set; }
        public int Place { get; private set; }
        public int OldRating { get; private set; }
        public int NewRating { get; private set; }
        public int Perfomance { get; private set; }
        public int InnerPerfomance { get; private set; }
        public string ContestScreenName { get; private set; }
        public string ContestName { get; private set; }
        public string ContestNameEn { get; private set; }
        public DateTime EndTime { get; private set; }
    }
}