import { PredictorModel } from "./PredictorModel";
import {
    calcRatingFromHistory,
    positivizeRating
} from "atcoder-userscript-libs/src/libs/rating";

export class CalcFromRankModel extends PredictorModel {
    updateData(rankValue, perfValue, rateValue) {
        perfValue = this.contest.getPerf(rankValue);
        rateValue = positivizeRating(
            calcRatingFromHistory([perfValue].concat(this.history))
        );
        super.updateData(rankValue, perfValue, rateValue);
    }
}
