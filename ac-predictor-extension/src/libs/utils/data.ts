import { HttpClient } from "./client/httpClient";
import { Client } from "./client/client";

export class Data {
    client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    public async getStandingsDataAsync(contestScreenName): Promise<Standings> {
        return await this.client.fetchJsonDataAsync(`https://atcoder.jp/contests/${contestScreenName}/standings/json`);
    }

    public async getAPerfsDataAsync(contestScreenName: string): Promise<{ [s: string]: number }> {
        return await this.client.fetchJsonDataAsync(`https://data.ac-predictor.com/aperfs/${contestScreenName}.json`);
    }

    public async getResultsDataAsync(contestScreenName: string): Promise<UserResult[]> {
        return await this.client.fetchJsonDataAsync(`https://atcoder.jp/contests/${contestScreenName}/results/json`);
    }

    public async getHistoryDataAsync(userScreenName: string): Promise<UserResult[]> {
        return await this.client.fetchJsonDataAsync(`https://atcoder.jp/users/${userScreenName}/history/json`);
    }
}

const data = new Data(new HttpClient());

export function getStandingsDataAsync(contestScreenName: string): Promise<Standings> {
    return data.getStandingsDataAsync(contestScreenName);
}

export function getAPerfsDataAsync(contestScreenName: string): Promise<{ [s: string]: number }> {
    return data.getAPerfsDataAsync(contestScreenName);
}

export function getResultsDataAsync(contestScreenName: string): Promise<UserResult[]> {
    return data.getResultsDataAsync(contestScreenName);
}

export function getHistoryDataAsync(userScreenName: string): Promise<UserResult[]> {
    return data.getHistoryDataAsync(userScreenName);
}

import { userScreenName } from "./global";
let myHistoryData: UserResult[] = null;
/**
 * 自分のパフォーマンス履歴を取得
 */
export async function getMyHistoryData(): Promise<UserResult[]> {
    return new Promise(resolve => {
        if (myHistoryData || !userScreenName) resolve(myHistoryData);
        getHistoryDataAsync(userScreenName).then(data => {
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
