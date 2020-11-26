//Copyright © 2017 koba-e964.
//from : https://github.com/koba-e964/atcoder-rating-estimator

const finf = bigf(400);

function bigf(n: number): number {
    let numerator = 1.0;
    let denominator = 1.0;
    for (let i = 0; i < n; ++i) {
        numerator *= 0.81;
        denominator *= 0.9;
    }
    numerator = ((1 - numerator) * 0.81) / 0.19;
    denominator = ((1 - denominator) * 0.9) / 0.1;
    return Math.sqrt(numerator) / denominator;
}

function f(n: number): number {
    return ((bigf(n) - finf) / (bigf(1) - finf)) * 1200.0;
}

/**
 * calculate unpositivized rating from performance history
 * @param {Number[]} [history] performance history
 * @returns {Number} unpositivized rating
 */
export function calcRatingFromHistory(history: number[]): number {
    const n = history.length;
    let numerator = 0.0;
    let denominator = 0.0;
    for (let i = n - 1; i >= 0; --i) {
        numerator *= 0.9;
        numerator += 0.9 * Math.pow(2, history[i] / 800.0);
        denominator *= 0.9;
        denominator += 0.9;
    }
    return Math.log2(numerator / denominator) * 800.0 - f(n);
}

/**
 * calculate unpositivized rating from last state
 * @param {Number} [last] last unpositivized rating
 * @param {Number} [perf] performance
 * @param {Number} [ratedMatches] count of participated rated contest
 * @returns {number} estimated unpositivized rating
 */
export function calcRatingFromLast(last: number, perf: number, ratedMatches: number): number {
    if (ratedMatches === 0) return perf - 1200;
    last += f(ratedMatches);
    const weight = 9 - 9 * 0.9 ** ratedMatches;
    const numerator = weight * 2 ** (last / 800.0) + 2 ** (perf / 800.0);
    const denominator = 1 + weight;
    return Math.log2(numerator / denominator) * 800.0 - f(ratedMatches + 1);
}

/**
 * (-inf, inf) -> (0, inf)
 * @param {Number} [rating] unpositivized rating
 * @returns {number} positivized rating
 */
export function positivizeRating(rating: number): number {
    if (rating >= 400.0) {
        return rating;
    }
    return 400.0 * Math.exp((rating - 400.0) / 400.0);
}

/**
 * (0, inf) -> (-inf, inf)
 * @param {Number} [rating] positivized rating
 * @returns {number} unpositivized rating
 */
export function unpositivizeRating(rating: number): number {
    if (rating >= 400.0) {
        return rating;
    }
    return 400.0 + 400.0 * Math.log(rating / 400.0);
}

/**
 * calculate the performance required to reach a target rate
 * @param {Number} [targetRating] targeted unpositivized rating
 * @param {Number[]} [history] performance history
 * @returns {number} performance
 */
export function calcRequiredPerformance(targetRating: number, history: number[]): number {
    let upper = 10000.0;
    let lower = -10000.0;
    for (let i = 0; i < 100; ++i) {
        const mid = (lower + upper) / 2;
        const rating = calcRatingFromHistory([mid].concat(history));
        if (targetRating <= rating) upper = mid;
        else lower = mid;
    }
    return lower;
}

export const colorBounds = {
    gray: 0,
    brown: 400,
    green: 800,
    cyan: 1200,
    blue: 1600,
    yellow: 2000,
    orange: 2400,
    red: 2800
};

type ColorName = "unrated" | "gray" | "brown" | "green" | "cyan" | "blue" | "yellow" | "orange" | "red";

export const colorNames: ColorName[] = ["unrated", "gray", "brown", "green", "cyan", "blue", "yellow", "orange", "red"];

export function getColor(rating: number): ColorName {
    const colorIndex = rating > 0 ? Math.min(Math.floor(rating / 400) + 1, 8) : 0;
    return colorNames[colorIndex];
}
