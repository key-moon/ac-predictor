import { Results } from "./results";
import { Result } from "./result";

export class FixedResults extends Results {
    resultsDic: { [key: string]: Result };
    constructor(results: Result[]) {
        super();
        this.resultsDic = {};
        results.forEach((result) => {
            this.resultsDic[result.UserScreenName] = result;
        });
    }
    getUserResult(userScreenName: string): Result {
        return Object.prototype.hasOwnProperty.call(this.resultsDic, userScreenName)
            ? this.resultsDic[userScreenName]
            : null;
    }
}
