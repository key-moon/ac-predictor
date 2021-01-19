import { Result } from "./results/result";
import { ContestInformation } from "../utils/data";

type AnalyzedStandingsData = {
    contestantAPerf: number[];
    templateResults: { [key: string]: Result };
    isRated: boolean;
};
function analyzeStandingsData(
    fixed: boolean,
    standingsData: StandingData[],
    aPerfs: { [key: string]: number },
    defaultAPerf: number,
    ratedLimit: number
): AnalyzedStandingsData {
    type AnalyzedData = { contestantAPerf: number[]; templateResults: { [s: string]: Result } };
    function analyze(isUserRated: (val: StandingData) => boolean): AnalyzedData {
        const contestantAPerf: number[] = [];
        const templateResults: { [s: string]: Result } = {};

        let currentRatedRank = 1;

        let lastRank = 0;
        const tiedUsers: StandingData[] = [];
        let ratedInTiedUsers = 0;
        function applyTiedUsers(): void {
            tiedUsers.forEach((data) => {
                if (isUserRated(data)) {
                    contestantAPerf.push(aPerfs[data.UserScreenName] || defaultAPerf);
                    ratedInTiedUsers++;
                }
            });

            const ratedRank: number = currentRatedRank + Math.max(0, ratedInTiedUsers - 1) / 2;
            tiedUsers.forEach((data) => {
                templateResults[data.UserScreenName] = new Result(
                    isUserRated(data),
                    data.TotalResult.Count !== 0,
                    data.UserScreenName,
                    data.Rank,
                    ratedRank,
                    fixed ? data.OldRating : data.Rating,
                    null,
                    data.Competitions,
                    null,
                    null
                );
            });
            currentRatedRank += ratedInTiedUsers;
            tiedUsers.length = 0;
            ratedInTiedUsers = 0;
        }

        standingsData.forEach((data) => {
            if (lastRank !== data.Rank) applyTiedUsers();
            lastRank = data.Rank;
            tiedUsers.push(data);
        });
        applyTiedUsers();

        return {
            contestantAPerf: contestantAPerf,
            templateResults: templateResults,
        };
    }

    let analyzedData = analyze((data) => data.IsRated && data.TotalResult.Count !== 0);
    let isRated = true;
    if (analyzedData.contestantAPerf.length === 0) {
        analyzedData = analyze(
            (data: StandingData): boolean => data.OldRating < ratedLimit && data.TotalResult.Count !== 0
        );
        isRated = false;
    }
    const res = analyzedData as AnalyzedStandingsData;
    res.isRated = isRated;
    return res;
}

export class Contest {
    ratedLimit: number;
    perfLimit: number;
    standings: Standings;
    aPerfs: { [key: string]: number };
    rankMemo: { [key: number]: number };
    contestantAPerf: number[];
    templateResults: { [key: string]: Result };
    IsRated: boolean;
    constructor(
        contestScreenName: string,
        contestInformation: ContestInformation,
        standings: Standings,
        aPerfs: { [key: string]: number }
    ) {
        this.ratedLimit = contestInformation.RatedRange[1] + 1;
        this.perfLimit = this.ratedLimit + 400;
        this.standings = standings;
        this.aPerfs = aPerfs;
        this.rankMemo = {};

        const analyzedData = analyzeStandingsData(
            standings.Fixed,
            standings.StandingsData,
            aPerfs,
            { 2000: 800, 2800: 1000, Infinity: 1200 }[this.ratedLimit] || 1200,
            this.ratedLimit
        );
        this.contestantAPerf = analyzedData.contestantAPerf;
        this.templateResults = analyzedData.templateResults;
        this.IsRated = analyzedData.isRated;
    }

    getRatedRank(X: number): number {
        if (this.rankMemo[X]) return this.rankMemo[X];
        return (this.rankMemo[X] = this.contestantAPerf.reduce(
            (val, APerf) => val + 1.0 / (1.0 + Math.pow(6.0, (X - APerf) / 400.0)),
            0.5
        ));
    }

    getPerf(ratedRank: number): number {
        return Math.min(this.getInnerPerf(ratedRank), this.perfLimit);
    }

    getInnerPerf(ratedRank: number): number {
        let upper = 6144;
        let lower = -2048;
        while (upper - lower > 0.5) {
            const mid = (upper + lower) / 2;
            if (ratedRank > this.getRatedRank(mid)) upper = mid;
            else lower = mid;
        }
        return Math.round((upper + lower) / 2);
    }
}
