import { calcRequiredPerformance, unpositivizeRating } from "../../../libs/utils/rating";
import { PredictorModel } from "./PredictorModel";

export class CalcFromRateModel extends PredictorModel {
    updateData(rankValue: number, perfValue: number, rateValue: number): void {
        perfValue = calcRequiredPerformance(unpositivizeRating(rateValue), this.history);
        rankValue = this.contest.getRatedRank(perfValue);
        super.updateData(rankValue, perfValue, rateValue);
    }
}
