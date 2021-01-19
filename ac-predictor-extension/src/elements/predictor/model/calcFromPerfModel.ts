import { calcRatingFromHistory, positivizeRating } from "../../../libs/utils/rating";
import { PredictorModel } from "./PredictorModel";

export class CalcFromPerfModel extends PredictorModel {
    updateData(rankValue: number, perfValue: number, rateValue: number): void {
        rankValue = this.contest.getRatedRank(perfValue);
        rateValue = positivizeRating(calcRatingFromHistory(this.history.concat([perfValue])));
        super.updateData(rankValue, perfValue, rateValue);
    }
}
