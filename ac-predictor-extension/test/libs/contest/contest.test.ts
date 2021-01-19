import { Contest } from "../../../src/libs/contest/contest";
import { aperfs, contestInformation, results, standings } from "../../data/wtf19";

const contest = new Contest("wtf19", contestInformation, standings, aperfs);

test("test getRatedRank", () => {
    results.forEach(result => {
        expect(contest.getRatedRank(result.Performance)).toBeCloseTo(result.Place);
    });
});

test("test getPerf", () => {
    results.forEach(result => {
        expect(contest.getPerf(result.Place)).toBeCloseTo(result.Performance);
    });
});
