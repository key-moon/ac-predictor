using System;
using System.Collections.Generic;
using System.Text;

namespace AtCoder
{
    public partial struct RatingRange
    {
        public readonly static RatingRange All = new RatingRange() { Start = int.MinValue, End = int.MaxValue };
        public readonly static RatingRange None = new RatingRange() { Start = 0, End = -1 };
        public static RatingRange Parse(string s)
        {
            s = s.Trim();
            if (s == "All") return All;
            if (s == "-") return None;
            var splitted = s.Split('~');
            int rangeStart = 0, rangeEnd = int.MaxValue;
            if (splitted.Length != 2 ||
                (splitted[0].Length != 0 && !int.TryParse(splitted[0].Trim(), out rangeStart)) ||
                (splitted[1].Length != 0 && !int.TryParse(splitted[1].Trim(), out rangeEnd)))
                throw new FormatException();
            return new RatingRange() { Start = rangeStart, End = rangeEnd };
        }

        public static bool operator ==(RatingRange l, RatingRange r) => l.Start == r.Start && l.End == r.End;
        public static bool operator !=(RatingRange l, RatingRange r) => l.Start == r.Start && l.End == r.End;
    }
}
