import moment from "moment";
import { WebData } from './data';
import { userScreenName } from "../../atcoder-lib/global";

class HistoryData extends WebData {
    constructor(userScreenName) {
        super(
            `https://atcoder.jp/users/${userScreenName}/history/json`
        );
    }
}

let historyData = null;

/**
 * パフォーマンス履歴を取得します。
 * @return {Promise<{}[]>} パフォーマンス履歴を返すpromise
 */
export async function getHistory(){
    return new Promise((resolve) => {
        if (historyData) resolve(historyData);
        new HistoryData(userScreenName).update().then((data) => {
            resolve(historyData = data);
        })
    });
}

/**
 * レーテっと
 * @return {Promise<number[]>}
 */
export async function getRatedContestPerformanceHistory() {
    return  getHistory().then((data) => data.filter(x => x.IsRated)
        .sort((a, b) => moment(b.EndTime) - moment(a.EndTime))
        .map(x => x.Performance));
}