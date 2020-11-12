export class EstimatorModel {
    constructor(inputValue, perfHistory) {
        this.inputDesc = "";
        this.resultDesc = "";
        this.perfHistory = perfHistory;
        this.updateInput(inputValue);
    }

    updateInput(value) {
        this.inputValue = value;
        this.resultValue = this.calcResult(value);
    }

    toggle() {}

    /**
     * @param {Number} [input]
     * @return {Number}
     */
    calcResult(input) {
        return input;
    }
}
