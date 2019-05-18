/**
 * データを保存/更新するためのクラスです。
 */
export class Data {
    /**
     * オブジェクト生成用のコンストラクタです
     * @param {Function} [getNewData] 更新の際に新たなデータオブジェクトを返す関数です。
     */
    constructor(getNewData) {
        this.getNewData = getNewData;
    }

    /**
     * データのアップデートをする関数です。
     */
    async update() {
        this.data = await this.getNewData();
        return this.data;
    }
}

/**
 * GETでデータを取得します。
 */
export class WebData extends Data {
    /**
     * オブジェクト生成用のコンストラクタです
     * @param {string} [dataURL] データ取得先のURLです。
     */
    constructor(dataURL) {
        super(async () => {
            return await $.ajax(dataURL);
        });
    }
}
