using System;
using System.Collections.Generic;
using System.Text;

namespace AtCoder
{
    public partial struct Range
    {
        public readonly static Range All = new Range() { Start = int.MinValue, End = int.MaxValue };
        public readonly static Range None = new Range() { Start = 0, End = -1 };
        public static Range Parse(string s)
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
            return new Range() { Start = rangeStart, End = rangeEnd };
        }
    }
}
