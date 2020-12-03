import {
    ContestInformation,
    getAPerfsDataAsync, getContestInformationAsync, getHistoryDataAsync,
    getResultsDataAsync,
    getStandingsDataAsync
} from "../../../src/libs/utils/data";
import * as fs from "fs";
import Mock = jest.Mock;

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
    const standingsData = content = fs.readFileSync(__dirname + "/data/wtf19_standings.json").toString();
    const standings = await getStandingsDataAsync("wtf19");
    expect(standings).toEqual(JSON.parse(standingsData));
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://atcoder.jp/contests/wtf19/standings/json");
});

test("resultsData", async () => {
    const resultsJson = content = fs.readFileSync(__dirname + "/data/wtf19_results.json").toString();
    const results = await getResultsDataAsync("wtf19");
    expect(results).toEqual(JSON.parse(resultsJson));
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://atcoder.jp/contests/wtf19/results/json");
});

test("aperfsData", async () => {
    const aperfsJson = content = fs.readFileSync(__dirname + "/data/wtf19_aperfs.json").toString();
    const aperfs = await getAPerfsDataAsync("wtf19");
    expect(aperfs).toEqual(JSON.parse(aperfsJson));
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://data.ac-predictor.com/aperfs/wtf19.json");
});

test("test getContestInformation", async () => {
    const infoHtml = content = fs.readFileSync(__dirname + "/data/wtf19_info.html").toString();
    const results = await getContestInformationAsync("wtf19");
    expect(results).toEqual(new ContestInformation([0, -1], [0, Infinity], 5 * 60 * 1000));
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://atcoder.jp/contests/wtf19");
});

test("test getHistoryData", async () => {
    const historyJson = content = fs.readFileSync(__dirname + "/data/tourist_history.json").toString();
    const results = await getHistoryDataAsync("tourist");
    expect(results).toEqual(JSON.parse(historyJson));
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://atcoder.jp/users/tourist/history/json");
});
