import { FixedResults } from "../../../../src/libs/contest/results/fIxedResults";
import * as fs from "fs";
import { dataDir } from "../../../data/data";
import { Result } from "../../../../src/libs/contest/results/result";
import { results, standings } from "../../../data/wtf19";

// TODO: resultsを作る処理を纏める
test("test FixedResults", () => {
    const sortedStandingsData = Array.from(standings.StandingsData).filter(
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
    const rawResult = results;
    let deletedCount = 0;
    let lastPerformance = Infinity;
    const fixedResults = new FixedResults(
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
    expect(fixedResults.getUserResult("apiad").Place).toBe(1);
    expect(fixedResults.getUserResult("yutaka1999").Place).toBe(2);
    expect(fixedResults.getUserResult("Petr").Place).toBe(3);
    expect(fixedResults.getUserResult("LHiC").Place).toBe(4);
    expect(fixedResults.getUserResult("Um_nik").Place).toBe(5);
    expect(fixedResults.getUserResult("ksun48").Place).toBe(6);
    expect(fixedResults.getUserResult("tourist").Place).toBe(7);
    expect(fixedResults.getUserResult("cospleermusora").Place).toBe(8);
    expect(fixedResults.getUserResult("keymoon")).toBeNull();
    expect(fixedResults.getUserResult("constructor")).toBeNull();
});
