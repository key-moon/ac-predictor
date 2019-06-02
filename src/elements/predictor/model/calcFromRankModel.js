import {PredictorModel} from "./PredictorModel";
import {calcRatingFromHistory, positivizeRating} from "../../../libs/utils/atcoderRating";

export class CalcFromRankModel extends PredictorModel{
    updateData(rankValue, perfValue, rateValue) {
        perfValue = this.contest.getPerf(rankValue);
        rateValue = positivizeRating(calcRatingFromHistory([perfValue].concat(this.history)));
        super.updateData(rankValue, perfValue, rateValue);
    }
}