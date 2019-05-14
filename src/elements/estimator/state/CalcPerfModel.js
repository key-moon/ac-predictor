import {EstimatorModel} from "./EstimatorModel";
import {CalcRatingModel} from "./CalcRatingModel";
import {calcRequiredPerformance} from "../../../libs/utils/atcoderRating";

export class CalcPerfModel extends EstimatorModel{
    constructor(inputValue, perfHistory){
        super(inputValue, perfHistory);
        this.inputDesc = "目標レーティング";
        this.resultDesc = "必要パフォーマンス";
    }

    toggle(){
        return new CalcRatingModel(this.resultValue, this.perfHistory);
    }
    calcResult(input){
        return calcRequiredPerformance(input, this.perfHistory);
    }
}