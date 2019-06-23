import { EstimatorModel } from "./EstimatorModel";
import { CalcPerfModel } from "./CalcPerfModel";
import {
    calcRatingFromHistory,
    positivizeRating
} from "atcoder-userscript-libs/src/libs/rating";

export class CalcRatingModel extends EstimatorModel {
    constructor(inputValue, perfHistory) {
        super(inputValue, perfHistory);
        this.inputDesc = "パフォーマンス";
        this.resultDesc = "到達レーティング";
    }

    toggle() {
        return new CalcPerfModel(this.resultValue, this.perfHistory);
    }
    calcResult(input) {
        return positivizeRating(
            calcRatingFromHistory([input].concat(this.perfHistory))
        );
    }
}
