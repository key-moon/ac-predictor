import { Results } from "./results";
import {
    calcRatingFromLast,
    positivizeRating,
    unpositivizeRating
} from "atcoder-userscript-libs/src/libs/rating";

export class OnDemandResults extends Results {
    /**
     * @param {Contest} contest
     * @param {Results[]} templateResults
     */
    constructor(contest, templateResults) {
        super();
        this.Contest = contest;
        this.TemplateResults = templateResults;
    }
    /**
     * @param {string} userScreenName
     * @return {Result}
     */
    getUserResult(userScreenName) {
        const baseResults = this.TemplateResults[userScreenName];
        if (!baseResults) return null;
        if (!baseResults.Performance) {
            baseResults.InnerPerformance = this.Contest.getInnerPerf(
                baseResults.RatedRank
            );
            baseResults.Performance = Math.min(
                baseResults.InnerPerformance,
                this.Contest.perfLimit
            );
            baseResults.NewRating = Math.round(
                positivizeRating(
                    calcRatingFromLast(
                        unpositivizeRating(baseResults.OldRating),
                        baseResults.Performance,
                        baseResults.Competitions
                    )
                )
            );
        }
        return baseResults;
    }
}
