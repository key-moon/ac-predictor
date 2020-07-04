import { getColor, calcRatingFromLast, positivizeRating } from "../rating";
import { PerformanceCalculator } from "../PerformanceCalculator";

export interface Row {
    rank: number;
    userScreenName: string;
    isRated: boolean;
    oldRating: number;
    newRating: number;
    performance: number;
}

function GetRowHTML(row: Row): string {
    function getRatingSpan(rate: number | null): string {
        if (rate === null) return '<span class="bold">?</span>';
        return `<span class="bold user-${getColor(rate)}">${rate}</span>`;
    }

    function getRatingChangeStr(oldRate: number | null, newRate: number | null): string {
        let ratingChangeSpan: string;
        if (oldRate === null || newRate === null) ratingChangeSpan = '<span class="gray">(?)';
        else {
            const delta = newRate - oldRate;
            ratingChangeSpan = `<span class="gray">(${0 <= delta ? "+" : ""}${delta})</span>`;
        }

        return `${getRatingSpan(oldRate)} → ${getRatingSpan(newRate)}${ratingChangeSpan}`;
    }

    const oldRating = row.oldRating !== null ? Math.round(row.oldRating) : 0;
    const newRating = row.newRating !== null ? Math.round(row.newRating) : null;
    const performance = row.performance !== null ? Math.round(row.performance) : null;

    const unratedStr = `${getRatingSpan(oldRating)}<span class="gray">(unrated)</span>`;

    const rankCell = `<td>${row.rank}</td>`;
    const href = `http://atcoder.jp/users/${row.userScreenName}`;
    const userCell = `<td><a class="user-${getColor(oldRating)}" href=${href}>${row.userScreenName}</a></td>`;
    const perfCell = `<td>${getRatingSpan(performance)}</td>`;
    const rateChangeCell = `<td>${row.isRated ? getRatingChangeStr(oldRating, newRating) : unratedStr}</td>`;

    return `<tr>${rankCell}${userCell}${perfCell}${rateChangeCell}</tr>`;
}

export class FixedRow implements Row {
    rank: number;
    userScreenName: string;
    isRated: boolean;
    oldRating: number;
    newRating: number;
    performance: number;
    constructor(
        rank: number,
        userScreenName: string,
        isRated: boolean,
        oldRating: number,
        newRating: number,
        performance: number
    ) {
        this.rank = rank;
        this.userScreenName = userScreenName;
        this.isRated = isRated;
        this.oldRating = oldRating;
        this.newRating = newRating;
        this.performance = performance;
    }
}

export class ResultFixedRow implements Row {
    perfCalculator: PerformanceCalculator;
    internalRank: number;

    rank: number;
    userScreenName: string;
    isRated: boolean;
    oldRating: number;
    newRating: number;
    get performance(): number {
        return positivizeRating(this.perfCalculator.getPerformance(this.internalRank - 0.5));
    }
    constructor(
        perfCalculator: PerformanceCalculator,
        internalRank: number,
        rank: number,
        userScreenName: string,
        isRated: boolean,
        oldRating: number,
        newRating: number
    ) {
        this.perfCalculator = perfCalculator;
        this.internalRank = internalRank;
        this.rank = rank;
        this.userScreenName = userScreenName;
        this.isRated = isRated;
        this.oldRating = oldRating;
        this.newRating = newRating;
    }
}

export class OndemandRow implements Row {
    public perfCalculator: PerformanceCalculator;
    public ratedMatches: number;
    public internalRank: number;

    public rank: number;
    public userScreenName: string;
    public isRated: boolean;
    public oldRating: number;
    get rawPerformance(): number {
        return this.perfCalculator.getPerformance(this.internalRank - 0.5);
    }
    get newRating(): number {
        return calcRatingFromLast(this.oldRating, this.rawPerformance, this.ratedMatches);
    }
    get performance(): number {
        return positivizeRating(this.rawPerformance);
    }

    constructor(
        perfCalculator: PerformanceCalculator,
        ratedMatches: number,
        internalRank: number,
        rank: number,
        userScreenName: string,
        isRated: boolean,
        oldRating: number
    ) {
        this.perfCalculator = perfCalculator;
        this.ratedMatches = ratedMatches;
        this.internalRank = internalRank;
        this.rank = rank;
        this.userScreenName = userScreenName;
        this.isRated = isRated;
        this.oldRating = oldRating;
    }
}

export class Table {
    body: HTMLElement;
    rows: Row[] = [];
    page = 0;
    rowsPerPage: number;
    constructor(body: HTMLElement, rowsPerPage = 20) {
        this.body = body;
        this.rows = [];
        this.rowsPerPage = rowsPerPage;
        this.setPage(0);
    }

    public draw(): void {
        this.body.innerHTML = "";

        const start = this.rowsPerPage * this.page;
        this.rows.slice(start, start + this.rowsPerPage).forEach(e => {
            this.body.insertAdjacentHTML("beforeend", GetRowHTML(e));
        });
    }

    public setPage(page: number): void {
        this.page = page;
        this.draw();
    }

    public highlight(index: number): void {
        this.setPage(Math.floor(index / this.rowsPerPage));
        const ind = index % this.rowsPerPage;
        const elem = this.body.children[ind];
        elem.setAttribute("style", "border: 3px solid rgb(221, 40, 154);");
    }
}

export function getRow(
    fixed: boolean,
    internalRank: number,
    performanceCalculator: PerformanceCalculator,
    standingData: StandingData
): Row {
    if (fixed) {
        return new ResultFixedRow(
            performanceCalculator,
            internalRank,
            standingData.Rank,
            standingData.UserScreenName,
            standingData.IsRated,
            standingData.OldRating,
            null
        );
    } else {
        return new OndemandRow(
            performanceCalculator,
            standingData.Competitions,
            internalRank,
            standingData.Rank,
            standingData.UserScreenName,
            standingData.IsRated,
            standingData.Rating
        );
    }
}
