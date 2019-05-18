import { WebData } from './data';

/**
 * ユーザのパフォーマンス履歴を取得し、他のタブと同期的にデータを扱います。
 */
export class HistoryData extends WebData {
    constructor(userScreenName) {
        super(
            `https://atcoder.jp/users/${userScreenName}/history/json`
        );
    }
}
