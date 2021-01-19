export class EstimatorModel {
    inputValue: number;
    resultValue: number;
    perfHistory: number[];
    inputDesc: string;
    resultDesc: string;
    constructor(inputValue: number, perfHistory: number[]) {
        this.inputDesc = "";
        this.resultDesc = "";
        this.perfHistory = perfHistory;
        this.updateInput(inputValue);
    }

    updateInput(value: number): void {
        this.inputValue = value;
        this.resultValue = this.calcResult(value);
    }

    toggle(): EstimatorModel {
        return null;
    }

    calcResult(input: number): number {
        return input;
    }
}
