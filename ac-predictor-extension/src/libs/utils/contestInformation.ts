import { fetchTextData } from "./data";

export class ContestInformation {
    ParticipatableRange: number[];
    RatedRange: number[];
    Penalty: number;
    constructor(participatableRange: number[], ratedRange: number[], penalty: number) {
        this.ParticipatableRange = participatableRange;
        this.RatedRange = ratedRange;
        this.Penalty = penalty;
    }
}

export async function fetchContestInformation(contestScreenName: string): Promise<ContestInformation> {
    const topPageDom = await fetchTextData(`https://atcoder.jp/contests/${contestScreenName}`).then((x: string) =>
        new DOMParser().parseFromString(x, "text/html")
    );
    const dataParagraph = topPageDom.getElementsByClassName("small")[0];
    const data = Array.from(dataParagraph.children).map(x => x.innerHTML.split(":")[1].trim());
    return new ContestInformation(parseRangeString(data[0]), parseRangeString(data[1]), parseDurationString(data[2]));

    function parseRangeString(s: string): number[] {
        s = s.trim();
        if (s === "-") return [0, -1];
        if (s === "All") return [0, Infinity];
        if (!/[-~]/.test(s)) return [0, -1];
        const res = s.split(/[-~]/).map((x: string) => parseInt(x.trim()));
        if (isNaN(res[0])) res[0] = 0;
        if (isNaN(res[1])) res[1] = Infinity;
        return res;
    }

    function parseDurationString(s: string): number {
        if (s === "None" || s === "なし") return 0;
        if (!/(\d+[^\d]+)/.test(s)) return NaN;
        const durationDic = {
            日: 24 * 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            days: 24 * 60 * 60 * 1000,
            時間: 60 * 60 * 1000,
            hour: 60 * 60 * 1000,
            hours: 60 * 60 * 1000,
            分: 60 * 1000,
            minute: 60 * 1000,
            minutes: 60 * 1000,
            秒: 1000,
            second: 1000,
            seconds: 1000
        };
        let res = 0;
        s.match(/(\d+[^\d]+)/g).forEach((x: string) => {
            const trimmed = x.trim();
            const num = parseInt(/\d+/.exec(trimmed)[0]);
            const unit = /[^\d]+/.exec(trimmed)[0];
            const duration = durationDic[unit] || unit;
            res += num * duration;
        });
        return res;
    }
}
