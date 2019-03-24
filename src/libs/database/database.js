SideMenu.DataBase = {};
SideMenu.DataBase.Name = "PredictorDB";
SideMenu.DataBase.StoreNames = ["APerfs", "Standings"];

class DataBase {
    name;
    constructor(name, version) {
        this.name = name;
        this.version = version;
    }
    
    async setData(storeName, key, value) {
        var promise = new Promise((resolve, reject) => {
            try {
                indexedDB.open(this.name).onsuccess = (e) => {
                    var db = e.target.result;
                    if (!dp.objectStore.Names.contains(storeName)) db.createObjectStore(storeName, { keyPath: 'id' });
                    var trans = db.transaction(storeName, 'readwrite');
                    var objStore = trans.objectStore(storeName);
                    var data = { id: key, data: value };
                    var putReq = objStore.put(data);
                    putReq.onsuccess = () => {
                        db.close();
                        resolve();
                    };
                };
            }
            catch (e) {
                reject(e);
            }
        });
        return promise;
    }

    async getData(store, key) {
        var promise = new Promise((resolve, reject) => {
            try {
                indexedDB.open(this.name).onsuccess = (openEvent) => {
                    var db = openEvent.target.result;
                    var trans = db.transaction(store, 'readwrite');
                    var objStore = trans.objectStore(store);
                    objStore.get(key).onsuccess = (getEvent) => {
                        var result = getEvent.target.result;
                        db.close();
                        if (!result) reject(`key '${key}' not found in store '${store}'`);
                        else resolve();
                    };
                };
            }
            catch (e) {
                defferd.reject(e);
            }
        });
        return promise;
    }
}
