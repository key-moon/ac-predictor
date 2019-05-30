import {Contest} from "../../../libs/contest/contest";

export class PredictorModel{
    /**
     * @param {PredictorModel} [model]
     */
    constructor(model){
        this.contest = model.contest;
        this.history = model.history;
        this.updateInformation(model.information);
        this.updateInformation(model.rankValue, model.perfValue, model.rateValue);
    }

    updateInformation(information){
        this.information = information;
    }

    updateData(rankValue, perfValue, rateValue){
        this.rankValue = rankValue;
        this.perfValue = perfValue;
        this.rateValue = rateValue;
    }
}
