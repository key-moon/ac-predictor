using System;
using System.IO;
using System.Linq;
using System.Runtime;
using System.Reflection;
using System.Diagnostics;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using static System.Math;


class P
{
    static void Main()
    {
        int n = int.Parse(Console.ReadLine());
        //2つずつ
        List<int> hoge = new List<int>();
        for (int i = 1; i < 1000; i++)
        {
            if (n == (i * (i - 1)) / 2)
            {
                Console.WriteLine("Yes");
                Console.WriteLine(i);
                List<int>[] res = Enumerable.Repeat(0, i).Select(_ => new List<int>()).ToArray();
                int p = 1;
                for (int j = 0; j < i - 1; j++)
                {
                    for (int k = j + 1; k < i; k++)
                    {
                        res[j].Add(p);
                        res[k].Add(p);
                        p++;
                    }
                }
                Console.WriteLine(string.Join("\n", res.Select(x => $"{res[0].Count} {string.Join(" ", x)}")));
                return;
            }
        }
        Console.WriteLine("No");
    }
}
