/**
 * オブジェクト生成用のコンストラクタです
 * @param {Function} [getNewData] 更新の際に新たなデータオブジェクトを返す関数です。
 * @param {string} [lsKey] 保存に用いるローカルストレージのkeyです。
 * @param {Function} [onUpdate] 更新の際に呼ばれる関数です。
 */
export class DataBase {
    /**
     * オブジェクト生成用のコンストラクタです
     * @param {string} [name] indexedDBにアクセスする際に用いる名前です。
     * @param {Number} [version] indexedDBにアクセスする際に用いるバージョンです。
     */
    constructor(name, version, update) {
        this.name = name;
        this.version = version;
        indexedDB.open(name, version).onupgradeneeded = update;
    }

    /**
     * データをデータベースに追加/更新します。
     * @param {string} [storeName] indexedDBからストアを取得する際の名前です。
     * @param {string} [key] ストアにセットする際に用いるkeyです。
     * @param {Object} [value] ストアにセットする値です。
     * @returns {Promise} 非同期のpromiseです。
     */
    async setData(storeName, key, value) {
        return new Promise((resolve, reject) => {
            try {
                indexedDB.open(this.name).onsuccess = e => {
                    const db = e.target.result;
                    const trans = db.transaction(storeName, "readwrite");
                    const objStore = trans.objectStore(storeName);
                    const data = { id: key, data: value };
                    const putReq = objStore.put(data);
                    putReq.onsuccess = () => {
                        db.close();
                        resolve();
                    };
                };
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * データをデータベースから取得します。存在しなかった場合はrejectされます。
     * @param {string} [storeName] indexedDBからストアを取得する際の名前です。
     * @param {string} [key] ストアにセットする際に用いるkeyです。
     * @returns {Promise} 非同期のpromiseです。
     */
    async getData(storeName, key) {
        return new Promise((resolve, reject) => {
            try {
                indexedDB.open(this.name).onsuccess = openEvent => {
                    const db = openEvent.target.result;
                    const trans = db.transaction(storeName, "readwrite");
                    const objStore = trans.objectStore(storeName);
                    objStore.get(key).onsuccess = getEvent => {
                        const result = getEvent.target.result;
                        db.close();
                        if (!result)
                            reject(
                                `key '${key}' not found in store '${storeName}'`
                            );
                        else resolve(result.data);
                    };
                };
            } catch (e) {
                reject(e);
            }
        });
    }
}
