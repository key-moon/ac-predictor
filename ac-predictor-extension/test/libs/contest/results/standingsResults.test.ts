import * as fs from "fs";
import { dataDir } from "../../../data/data";
import {OnDemandResults} from "../../../../src/libs/contest/results/standingsResults";
import {Contest} from "../../../../src/libs/contest/contest";
import {aperfs, contestInformation, results, standings} from "../../../data/wtf19";

const contest = new Contest("wtf19", contestInformation, standings, aperfs);
const onDemandResults = new OnDemandResults(contest, contest.templateResults);

test("test OnDemandResults", () => {
    results.forEach(result => {
        const generatedResult = onDemandResults.getUserResult(result.UserScreenName);
        expect(generatedResult.UserScreenName).toBe(result.UserScreenName);
        expect(generatedResult.Performance).toBeCloseTo(result.Performance);
        expect(generatedResult.Place).toBe(result.Place);
    });
});

test("test not participated user", () => {
    expect(onDemandResults.getUserResult("keymoon")).toBeNull();
    expect(onDemandResults.getUserResult("constructor")).toBeNull();
});
