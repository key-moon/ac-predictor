import { Results } from "../../../../libs/contest/results/results";
import { getColor, positivizeRating } from "../../../../libs/utils/rating";
import { StandingsRowModifier } from "./standingsRowModifier";

export class PerfAndRateChangeAppender extends StandingsRowModifier {
    results: Results;
    isRated: boolean;

    modifyContent(content: HTMLTableRowElement): void {
        this.removeOldElem(content);
        if (content.firstElementChild.textContent === "-") {
            const longCell = content.getElementsByClassName("standings-result")[0];
            longCell.setAttribute("colspan", (parseInt(longCell.getAttribute("colspan")) + 2).toString());
            return;
        }
        const userScreenName = content.querySelector(".standings-username .username span").textContent;
        const result = this.results?.getUserResult(userScreenName);
        const performance = Math.round(positivizeRating(result.Performance));

        const perfElem = result.IsSubmitted ? this.getRatingSpan(performance) : "-";
        const ratingElem =
            result?.IsRated && this?.isRated
                ? this.getChangedRatingElem(result.OldRating, result.NewRating)
                : this.getUnratedElem(result.OldRating);

        content.insertAdjacentHTML("beforeend", `<td class="standings-result standings-perf">${perfElem}</td>`);
        content.insertAdjacentHTML("beforeend", `<td class="standings-result standings-rate">${ratingElem}</td>`);
    }
    getChangedRatingElem(oldRate: number, newRate: number): string {
        const oldRateSpan = this.getRatingSpan(oldRate);
        const newRateSpan = this.getRatingSpan(newRate);
        const diff = this.toSignedString(newRate - oldRate);
        return `<span class="bold">${oldRateSpan}</span> → <span class="bold">${newRateSpan}</span> <span class="grey">(${diff})</span>`;
    }
    toSignedString(n: number): string {
        return `${n >= 0 ? "+" : ""}${n}`;
    }
    getUnratedElem(rate: number): string {
        return `<span class="bold">${this.getRatingSpan(rate)}</span> <span class="grey">(unrated)</span>`;
    }
    getRatingSpan(rate: number): string {
        return `<span class="user-${getColor(rate)}">${rate}</span>`;
    }

    modifyFooter(footer: HTMLTableRowElement): void {
        this.removeOldElem(footer);
        footer.insertAdjacentHTML(
            "beforeend",
            '<td class="standings-result standings-perf standings-rate" colspan="2">-</td>'
        );
    }

    modifyHeader(header: HTMLTableRowElement): void {
        this.removeOldElem(header);
        header.insertAdjacentHTML(
            "beforeend",
            '<th class="standings-result-th" style="width:84px;min-width:84px;">perf</th><th class="standings-result-th" style="width:168px;min-width:168px;">レート変化</th>'
        );
    }

    removeOldElem(row: HTMLTableRowElement): void {
        row.querySelectorAll(".standings-perf, .standings-rate").forEach((elem) => elem.remove());
    }
}
