import {EstimatorModel} from "./EstimatorModel"
import {CalcPerfModel} from "./CalcPerfModel";
import {calcRatingFromHistory} from "../../../libs/utils/atcoderRating";

export class CalcRatingModel extends EstimatorModel{
    constructor(inputValue, perfHistory){
        super(inputValue, perfHistory);
        this.inputDesc = "パフォーマンス";
        this.resultDesc = "到達レーティング";
    }

    toggle(){
        return new CalcPerfModel(this.resultValue, this.perfHistory);
    }
    calcResult(input){
        return calcRatingFromHistory([input].concat(this.perfHistory));
    }
}