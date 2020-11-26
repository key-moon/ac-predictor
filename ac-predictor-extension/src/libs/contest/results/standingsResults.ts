import { Result } from "./result";
import { Results } from "./results";
import { Contest } from "../contest";
import { calcRatingFromLast, positivizeRating, unpositivizeRating } from "../../utils/rating";

export class OnDemandResults extends Results {
    Contest: Contest;
    TemplateResults: { [key: string]: Result };
    constructor(contest: Contest, templateResults: { [key: string]: Result }) {
        super();
        this.Contest = contest;
        this.TemplateResults = templateResults;
    }
    getUserResult(userScreenName: string): Result {
        const baseResults = this.TemplateResults[userScreenName];
        if (!baseResults) return null;
        if (!baseResults.Performance) {
            baseResults.InnerPerformance = this.Contest.getInnerPerf(baseResults.RatedRank);
            baseResults.Performance = Math.min(baseResults.InnerPerformance, this.Contest.perfLimit);
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
