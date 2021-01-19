import { Results } from "../../../libs/contest/results/results";

class PerfAndRateChangeAppender implements StandingsRowModifier {
    results: Results;

    constructor(results: Results) {
        this.results = results;
    }

    modifyContent(header: HTMLTableRowElement) {
        // TODO
    }

    modifyFooter(header: HTMLTableRowElement) {
        // TODO
    }

    modifyHeader(header: HTMLTableRowElement) {
        // TODO
    }
}
