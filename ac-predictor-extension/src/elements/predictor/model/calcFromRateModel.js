import { PredictorModel } from "./PredictorModel";
import {
    calcRequiredPerformance,
    unpositivizeRating
} from "atcoder-userscript-libs/src/libs/rating";

export class CalcFromRateModel extends PredictorModel {
    updateData(rankValue, perfValue, rateValue) {
        perfValue = calcRequiredPerformance(
            unpositivizeRating(rateValue),
            this.history
        );
        rankValue = this.contest.getRatedRank(perfValue);
        super.updateData(rankValue, perfValue, rateValue);
    }
}
