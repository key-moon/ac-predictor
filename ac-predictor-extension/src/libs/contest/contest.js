import { Result } from "./results/result";

export class Contest {
    constructor(contestScreenName, contestInformation, standings, aPerfs) {
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

        /** @return {{contestantAPerf: number[], templateResults: Object<string, Result>, isRated: boolean}} */
        function analyzeStandingsData(
            fixed,
            standingsData,
            aPerfs,
            defaultAPerf,
            ratedLimit
        ) {
            let analyzedData = analyze(
                data => data.IsRated && data.TotalResult.Count !== 0
            );
            analyzedData.isRated = true;
            if (analyzedData.contestantAPerf.length === 0) {
                analyzedData = analyze(
                    data =>
                        data.OldRating < ratedLimit &&
                        data.TotalResult.Count !== 0
                );
                analyzedData.isRated = false;
            }
            return analyzedData;

            /** @return {{contestantAPerf: number[], templateResults: Object.<string, Result>}}*/
            function analyze(isUserRated) {
                let contestantAPerf = [];
                let templateResults = {};

                let currentRatedRank = 1;

                let lastRank = 0;
                let tiedUsers = [];
                let ratedInTiedUsers = 0;
                function applyTiedUsers() {
                    tiedUsers.forEach(data => {
                        if (isUserRated(data)) {
                            contestantAPerf.push(
                                aPerfs[data.UserScreenName] || defaultAPerf
                            );
                            ratedInTiedUsers++;
                        }
                    });

                    let ratedRank =
                        currentRatedRank +
                        Math.max(0, ratedInTiedUsers - 1) / 2;
                    tiedUsers.forEach(data => {
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

                standingsData.forEach(data => {
                    if (lastRank !== data.Rank) applyTiedUsers();
                    lastRank = data.Rank;
                    tiedUsers.push(data);
                });
                applyTiedUsers();

                return {
                    contestantAPerf: contestantAPerf,
                    templateResults: templateResults
                };
            }
        }
    }

    getRatedRank(X) {
        if (this.rankMemo[X]) return this.rankMemo[X];
        return (this.rankMemo[X] = this.contestantAPerf.reduce(
            (val, APerf) =>
                val + 1.0 / (1.0 + Math.pow(6.0, (X - APerf) / 400.0)),
            0
        ));
    }

    getPerf(ratedRank) {
        return Math.min(this.getInnerPerf(ratedRank), this.perfLimit);
    }

    getInnerPerf(ratedRank) {
        let upper = 6144;
        let lower = -2048;
        while (upper - lower > 0.5) {
            const mid = (upper + lower) / 2;
            if (ratedRank - 0.5 > this.getRatedRank(mid)) upper = mid;
            else lower = mid;
        }
        return Math.round((upper + lower) / 2);
    }
}
