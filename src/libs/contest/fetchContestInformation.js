import * as moment from "moment";

class ContestInformation{
    /**
     * @param {number[]} [participatableRange]
     * @param {number[]} [ratedRange]
     * @param {number} [penalty]
     */
    constructor(participatableRange, ratedRange, penalty){
        this.ParticipatableRange = participatableRange;
        this.RatedRange = ratedRange;
        this.Penalty = penalty;
    }

    /**
     * @param {object} object
     * @return {ContestInformation}
     */
    static GenerateFromObject(object){
        return new ContestInformation(object.ParticipatableRange, object.RatedRange, object.Penalty);
    }
}

/**
 * @param contestScreenName
 * @return {Promise<ContestInformation>}
 */
export async function fetchContestInformations(contestScreenName) {
    return new Promise(async (resolve) => {
        const topPageDom = await $.ajax(`https://atcoder.jp/contests/${contestScreenName}`).then(x => new DOMParser().parseFromString(x, "text/html"));
        const dataParagraph = topPageDom.getElementsByClassName("small")[0];
        const data = Array.from(dataParagraph.children).map(x => x.innerText.split(':')[1].trim());
        resolve(new ContestInformation(parseRangeString(data[0]), parseRangeString(data[1]), parseDurationString(data[2])));
    });

    /**
     * @param {string} [s]
     * @return {number[]}
     */
    function parseRangeString(s){
        if (s === 'All') return [0, Infinity];
        if (s.indexOf('~') === -1) return [0, -1];
        let res = s.split('~').map(x => parseInt(x.trim()));
        if (isNaN(res[0])) res[0] = 0;
        if (isNaN(res[1])) res[1] = Infinity;
        return res;
    }
    /**
     * parse duration string and return a millisecond
     * @param {string} [s]
     * @return {number}
     */
    function parseDurationString(s) {
        const dic = {ヶ月: "month", 日: "day", 時間: "hour", 分: "minute", 秒: "second"};
        let res = {};
        s.match(/(\d+[^\d]+)/g).forEach(x => {
            const trimmed = x.trim(' ','s');
            const num = trimmed.match(/\d+/)[0];
            const unit = trimmed.match(/[^\d]+/)[0];
            const convertedUnit = dic[unit]||unit;
            res[convertedUnit] = num;
        });
        return moment.duration(res).asMilliseconds();
    }
}
