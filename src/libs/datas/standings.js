import { WebData } from './data';

/**
 * コンテストの順位表データを取得し、他のタブと同期的にデータを扱います。
 */
export class StandingsData extends WebData {
    constructor(contestScreenName) {
        super(
            `https://atcoder.jp/contests/${contestScreenName}/standings/json`
        );
    }
}
