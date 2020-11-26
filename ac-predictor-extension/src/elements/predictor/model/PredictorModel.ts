import { Contest } from "../../../libs/contest/contest";

export class PredictorModel {
    enabled: boolean;
    contest: Contest;
    history: number[];
    information: string;
    rankValue: number;
    perfValue: number;
    rateValue: number;
    constructor(model: PredictorModel) {
        this.enabled = model.enabled;
        this.contest = model.contest;
        this.history = model.history;
        this.updateInformation(model.information);
        this.updateData(model.rankValue, model.perfValue, model.rateValue);
    }

    setEnable(state: boolean): void {
        this.enabled = state;
    }

    updateInformation(information: string): void {
        this.information = information;
    }

    updateData(rankValue: number, perfValue: number, rateValue: number): void {
        this.rankValue = rankValue;
        this.perfValue = perfValue;
        this.rateValue = rateValue;
    }
}
