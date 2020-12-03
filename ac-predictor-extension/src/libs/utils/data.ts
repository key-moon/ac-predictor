export class ContestInformation {
    CanParticipateRange: number[];
    RatedRange: number[];
    Penalty: number;
    constructor(canParticipateRange: number[], ratedRange: number[], penalty: number) {
        this.CanParticipateRange = canParticipateRange;
        this.RatedRange = ratedRange;
        this.Penalty = penalty;
    }
}

function parseRangeString(s: string): number[] {
    s = s.trim();
    if (s === "-") return [0, -1];
    if (s === "All") return [0, Infinity];
    if (!/[-~]/.test(s)) return [0, -1];
    const res = s.split(/[-~]/).map((x: string) => parseInt(x.trim()));
    if (isNaN(res[0])) res[0] = 0;
    if (isNaN(res[1])) res[1] = Infinity;
    return res;
}

function parseDurationString(s: string): number {
    if (s === "None" || s === "なし") return 0;
    if (!/(\d+[^\d]+)/.test(s)) return NaN;
    const durationDic = {
        日: 24 * 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        days: 24 * 60 * 60 * 1000,
        時間: 60 * 60 * 1000,
        hour: 60 * 60 * 1000,
        hours: 60 * 60 * 1000,
        分: 60 * 1000,
        minute: 60 * 1000,
        minutes: 60 * 1000,
        秒: 1000,
        second: 1000,
        seconds: 1000
    };
    let res = 0;
    s.match(/(\d+[^\d]+)/g).forEach((x: string) => {
        const trimmed = x.trim();
        const num = parseInt(/\d+/.exec(trimmed)[0]);
        const unit = /[^\d]+/.exec(trimmed)[0];
        const duration = durationDic[unit] || unit;
        res += num * duration;
    });
    return res;
}

async function fetchJsonDataAsync<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (response.ok) return response.json();
    throw new Error(`request to ${url} returns ${response.status}`);
}

async function fetchTextDataAsync(url: string): Promise<string> {
    const response = await fetch(url);
    if (response.ok) return response.text();
    throw new Error(`request to ${url} returns ${response.status}`);
}

export async function getStandingsDataAsync(contestScreenName: string): Promise<Standings> {
    return await fetchJsonDataAsync(`https://atcoder.jp/contests/${contestScreenName}/standings/json`);
}

export async function getAPerfsDataAsync(contestScreenName: string): Promise<{ [s: string]: number }> {
    return await fetchJsonDataAsync(`https://data.ac-predictor.com/aperfs/${contestScreenName}.json`);
}

export async function getResultsDataAsync(contestScreenName: string): Promise<UserResult[]> {
    return await fetchJsonDataAsync(`https://atcoder.jp/contests/${contestScreenName}/results/json`);
}

export async function getHistoryDataAsync(userScreenName: string): Promise<UserResult[]> {
    return await fetchJsonDataAsync(`https://atcoder.jp/users/${userScreenName}/history/json`);
}

export async function getContestInformationAsync(contestScreenName: string): Promise<ContestInformation> {
    const html = await fetchTextDataAsync(`https://atcoder.jp/contests/${contestScreenName}`);
    const topPageDom = new DOMParser().parseFromString(html, "text/html");
    const dataParagraph = topPageDom.getElementsByClassName("small")[0];
    const data = Array.from(dataParagraph.children).map(x => x.innerHTML.split(":")[1].trim());
    return new ContestInformation(parseRangeString(data[0]), parseRangeString(data[1]), parseDurationString(data[2]));
}

/**
 * ユーザーのパフォーマンス履歴を時間降順で取得
 */
export function getPerformanceHistories(history: UserResult[]): number[] {
    const onlyRated = history.filter(x => x.IsRated);
    onlyRated.sort((a, b) => {
        return new Date(b.EndTime).getTime() - new Date(a.EndTime).getTime();
    });
    return onlyRated.map(x => x.Performance);
}
