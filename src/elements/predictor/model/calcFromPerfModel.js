import {PredictorModel} from "./PredictorModel";
import {calcRatingFromHistory, positivizeRating} from "../../../libs/utils/atcoderRating";

export class CalcFromPerfModel extends PredictorModel{
    updateData(rankValue, perfValue, rateValue) {
        rankValue = this.contest.getRatedRank(perfValue);
        rateValue = positivizeRating(calcRatingFromHistory([perfValue].concat(this.history)));
        super.updateData(rankValue, perfValue, rateValue);
    }
}