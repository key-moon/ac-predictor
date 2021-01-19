import {
    ContestInformation,
    getAPerfsDataAsync, getContestInformationAsync, getHistoryDataAsync,
    getResultsDataAsync,
    getStandingsDataAsync
} from "../../../src/libs/utils/data";
import * as fs from "fs";
import Mock = jest.Mock;
import {dataDir} from "../../data/data";
import {aperfsPath, contestInformation, infoPath, resultsPath, standingsPath} from "../../data/wtf19";

function isNodeEnv(): boolean {
    return (
        Object.prototype.toString.call(
            typeof process !== "undefined" ? process : 0
        ) === "[object process]"
    );
}

let globalObj = isNodeEnv() ? global : window ?? self ?? this;

let fetchMock: Mock;
let content: string;

beforeEach(() => {
    fetchMock = globalObj.fetch = jest.fn().mockReturnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(JSON.parse(content)),
        text: () => Promise.resolve(content)
    } as Response));
});

afterEach(() => {
    (globalObj.fetch as Mock).mockClear();
    delete global.fetch;
});

test("standingsData", async () => {
    content = fs.readFileSync(standingsPath).toString();
    const standings = await getStandingsDataAsync("wtf19");
    expect(standings).toEqual(standings);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://atcoder.jp/contests/wtf19/standings/json");
});

test("resultsData", async () => {
    content = fs.readFileSync(resultsPath).toString();
    const results = await getResultsDataAsync("wtf19");
    expect(results).toEqual(results);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://atcoder.jp/contests/wtf19/results/json");
});

test("aperfsData", async () => {
    content = fs.readFileSync(aperfsPath).toString();
    const aperfs = await getAPerfsDataAsync("wtf19");
    expect(aperfs).toEqual(aperfs);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://data.ac-predictor.com/aperfs/wtf19.json");
});

test("test getContestInformation", async () => {
    content = fs.readFileSync(infoPath).toString();
    const results = await getContestInformationAsync("wtf19");
    expect(results).toEqual(contestInformation);
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://atcoder.jp/contests/wtf19");
});

test("test getHistoryData", async () => {
    const historyJson = content = fs.readFileSync(dataDir + "/tourist_history.json").toString();
    const results = await getHistoryDataAsync("tourist");
    expect(results).toEqual(JSON.parse(historyJson));
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://atcoder.jp/users/tourist/history/json");
});
