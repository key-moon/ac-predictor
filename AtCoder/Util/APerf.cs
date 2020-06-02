using System;
using System.Collections.Generic;
using System.Text;

namespace AtCoder.Util
{
    public partial class Rating
    {
        public static double? CalcAPerf(IEnumerable<int> perfs)
        {
            if (perfs is null) return null;
            double denominator = 0;
            double numerator = 0;
            foreach (var perf in perfs)
            {
                denominator *= 0.9;
                denominator += perf;
                numerator *= 0.9;
                numerator += 1;
            }
            if (numerator == 0) return null;
            return denominator / numerator;
        }
    }
}
