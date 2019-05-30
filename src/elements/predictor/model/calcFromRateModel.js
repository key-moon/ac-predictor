import {PredictorModel} from "./PredictorModel";
import {calcRatingFromHistory, calcRequiredPerformance, unpositivizeRating} from "../../../libs/utils/atcoderRating";

export class CalcFromRateModel extends PredictorModel{
    updateData(rankValue, perfValue, rateValue) {
        perfValue = calcRequiredPerformance(unpositivizeRating(rateValue), this.history);
        rankValue = this.contest.getRatedRank(perfValue);
        super.updateData(rankValue, perfValue, rateValue);
    }
}