import { getColor, calcRatingFromLast } from "../rating";
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
    function getRatingSpan(rate: number): string {
        return `<span class="bold user-${getColor(rate)}">${rate}</span>`;
    }

    function getRatingChangeStr(oldRate: number, newRate: number): string {
        function getRatingChangeSpan(delta: number): string {
            return `<span class="gray">(${0 <= delta ? "+" : ""}${delta})</span>`;
        }
        return `${getRatingSpan(oldRate)} → ${getRatingSpan(newRate)}${getRatingChangeSpan(newRate - oldRate)}`;
    }

    const oldRating = row.oldRating ? Math.round(row.oldRating) : null;
    const newRating = row.newRating ? Math.round(row.newRating) : null;
    const performance = row.performance ? Math.round(row.performance) : null;

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
        return this.perfCalculator.getPerformance(this.internalRank - 0.5);
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
    get newRating(): number {
        return calcRatingFromLast(this.oldRating, this.performance, this.ratedMatches);
    }
    get performance(): number {
        return this.perfCalculator.getPerformance(this.internalRank - 0.5);
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
