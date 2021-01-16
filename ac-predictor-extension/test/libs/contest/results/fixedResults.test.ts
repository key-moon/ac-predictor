import { FixedResults } from "../../../../src/libs/contest/results/fIxedResults";
import * as fs from "fs";
import { dataDir } from "../../../data/data";
import { Result } from "../../../../src/libs/contest/results/result";

// TODO: resultsを作る処理を纏める
test("test FixedResults", () => {
    const standingsJson = fs.readFileSync(dataDir + "/wtf19_standings.json").toString();
    const resultsJson = fs.readFileSync(dataDir + "/wtf19_results.json").toString();
    const standingsData = JSON.parse(standingsJson) as Standings;
    const sortedStandingsData = Array.from(standingsData.StandingsData).filter(
        x => x.TotalResult.Count !== 0
    );
    sortedStandingsData.sort((a, b) => {
        if (a.TotalResult.Count === 0 && b.TotalResult.Count === 0) return 0;
        if (a.TotalResult.Count === 0) return 1;
        if (b.TotalResult.Count === 0) return -1;
        if (a.Rank !== b.Rank) return a.Rank - b.Rank;
        if (b.OldRating !== a.OldRating) return b.OldRating - a.OldRating;
        if (a.UserIsDeleted) return -1;
        if (b.UserIsDeleted) return 1;
        return 0;
    });
    const rawResult = JSON.parse(resultsJson) as Result[];
    let deletedCount = 0;
    let lastPerformance = Infinity;
    const results = new FixedResults(
        sortedStandingsData.map((data, index) => {
            let result = rawResult[index - deletedCount];
            if (!result || data.OldRating !== result.OldRating) {
                deletedCount++;
                result = null;
            }
            return new Result(
                result ? result.IsRated : false,
                data.TotalResult.Count !== 0,
                data.UserScreenName,
                data.Rank,
                -1,
                data.OldRating,
                result ? result.NewRating : 0,
                0,
                result && result.IsRated ? (lastPerformance = result.Performance) : lastPerformance,
                result ? result.InnerPerformance : 0
            );
        })
    );
    expect(results.getUserResult("apiad").Place).toBe(1);
    expect(results.getUserResult("yutaka1999").Place).toBe(2);
    expect(results.getUserResult("Petr").Place).toBe(3);
    expect(results.getUserResult("LHiC").Place).toBe(4);
    expect(results.getUserResult("Um_nik").Place).toBe(5);
    expect(results.getUserResult("ksun48").Place).toBe(6);
    expect(results.getUserResult("tourist").Place).toBe(7);
    expect(results.getUserResult("cospleermusora").Place).toBe(8);
    expect(results.getUserResult("keymoon")).toBeNull();
});
