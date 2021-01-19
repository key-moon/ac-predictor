import { EstimatorModel } from "./EstimatorModel";
import { CalcPerfModel } from "./CalcPerfModel";
import { calcRatingFromHistory, positivizeRating } from "../../../libs/utils/rating";

export class CalcRatingModel extends EstimatorModel {
    constructor(inputValue: number, perfHistory: number[]) {
        super(inputValue, perfHistory);
        this.inputDesc = "パフォーマンス";
        this.resultDesc = "到達レーティング";
    }

    toggle(): EstimatorModel {
        return new CalcPerfModel(this.resultValue, this.perfHistory);
    }

    calcResult(input: number): number {
        return positivizeRating(calcRatingFromHistory(this.perfHistory.concat([input])));
    }
}
