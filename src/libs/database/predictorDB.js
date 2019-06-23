import { DataBase } from "./database";

export const StoreKeys = { aperfs: "APerfs", standings: "Standings" };
export class PredictorDB extends DataBase {
    constructor() {
        super("PredictorDB", 1, event => {
            const db = event.target.result;
            const storeNames = ["APerfs", "Standings"];
            storeNames.forEach(store => {
                db.createObjectStore(store, { keyPath: "id" });
            });
        });
    }
}
