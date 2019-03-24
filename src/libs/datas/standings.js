import { JsonData } from './data';

/**
 * コンテストの順位表データを取得し、他のタブと同期的にデータを扱います。
 */
export class StandingsData extends JsonData {
    constructor(contestScreenName, onUpdate) {
        super(
            `https://beta.atcoder.jp/contests/${contestScreenName}/standings/json`,
            `predictor-standings-${contestScreenName}`,
            onUpdate
        );
    }
}
