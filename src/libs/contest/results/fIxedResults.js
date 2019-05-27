import {Result} from "./result";
import {Results} from "./results";

const defaultResult = new Result(false, false, "", 0 , 0 , 0 ,0 ,0,0,0);

export class FixedResults extends Results{
    /**
     * @param {Result[]} results
     */
    constructor(results){
        super();
        this.resultsDic = {};
        results.forEach((result) => {
            this.resultsDic[result.UserScreenName] = result;
        });
    }
    /**
     * @param {string} userScreenName
     * @return {Result}
     */
    getUserResult(userScreenName){
        return this.resultsDic[userScreenName] || defaultResult;
    }
}