import { WebData } from './data';

/**
 * コンテストの結果データを取得します。
 */
export class ResultsData extends WebData {
    constructor(contestScreenName) {
        super(
            `https://atcoder.jp/contests/${contestScreenName}/results/json`
        );
    }
}
