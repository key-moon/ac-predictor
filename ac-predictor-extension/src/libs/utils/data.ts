export async function fetchTextData(url: string): Promise<string> {
    const response = await fetch(url);
    if (response.ok) return response.text();
    throw new Error(`request to ${url} returns ${response.status}`);
}

export async function fetchJsonData<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (response.ok) return response.json();
    throw new Error(`request to ${url} returns ${response.status}`);
}

export async function getStandingsData(contestScreenName): Promise<Standings> {
    return await fetchJsonData(`https://atcoder.jp/contests/${contestScreenName}/standings/json`);
}

export async function getAPerfsData(contestScreenName: string): Promise<{ [s: string]: number }> {
    return await fetchJsonData(`https://data.ac-predictor.com/aperfs/${contestScreenName}.json`);
}

export async function getResultsData(contestScreenName: string): Promise<UserResult[]> {
    return await fetchJsonData(`https://atcoder.jp/contests/${contestScreenName}/results/json`);
}

export async function getHistoryData(userScreenName: string): Promise<UserResult[]> {
    return await fetchJsonData(`https://atcoder.jp/users/${userScreenName}/history/json`);
}

import { userScreenName } from "./global";

let myHistoryData: UserResult[] = null;
/**
 * 自分のパフォーマンス履歴を取得
 */
export async function getMyHistoryData(): Promise<UserResult[]> {
    return new Promise(resolve => {
        if (myHistoryData || !userScreenName) resolve(myHistoryData);
        getHistoryData(userScreenName).then(data => {
            resolve((myHistoryData = data));
        });
    });
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
