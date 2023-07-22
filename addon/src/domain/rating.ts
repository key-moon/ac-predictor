//Copyright © 2017 koba-e964.
//from : https://github.com/koba-e964/atcoder-rating-estimator

const finf = bigf(400);

function bigf(n: number): number {
    let pow1 = 1;
    let pow2 = 1;
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; ++i) {
        pow1 *= 0.81;
        pow2 *= 0.9;
        numerator += pow1;
        denominator += pow2;
    }
    return Math.sqrt(numerator) / denominator;
}

function f(n: number): number {
    return ((bigf(n) - finf) / (bigf(1) - finf)) * 1200.0;
}

/**
 * calculate unpositivized rating from performance history
 * @param {Number[]} [history] performance history with ascending order
 * @returns {Number} unpositivized rating
 */
export function calcAlgRatingFromHistory(history: number[]): number {
    const n = history.length;
    let pow = 1;
    let numerator = 0.0;
    let denominator = 0.0;
    for (let i = n - 1; i >= 0; i--) {
        pow *= 0.9;
        numerator += Math.pow(2, history[i] / 800.0) * pow;
        denominator += pow;
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
export function calcAlgRatingFromLast(last: number, perf: number, ratedMatches: number): number {
    if (ratedMatches === 0) return perf - 1200;
    last += f(ratedMatches);
    const weight = 9 - 9 * 0.9 ** ratedMatches;
    const numerator = weight * 2 ** (last / 800.0) + 2 ** (perf / 800.0);
    const denominator = 1 + weight;
    return Math.log2(numerator / denominator) * 800.0 - f(ratedMatches + 1);
}


/**
 * calculate unpositivized rating from performance history
 * @param {Number[]} [history] performance histories
 * @returns {Number} unpositivized rating
 */
export function calcHeuristicRatingFromHistory(history: number[]): number {
    const S = 724.4744301;
    const R = 0.8271973364;
    const qs: number[] = [];
    for (const perf of history) {
        for (let i = 1; i <= 100; i++) {
            qs.push(perf - S * Math.log(i));
        }
    }
    qs.sort((a, b) => b - a);

    let num = 0.0;
    let den = 0.0;
    for (let i = 99; i >= 0; i--) {
        num = num * R + qs[i];
        den = den * R + 1.0;
    }
    return num / den;
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

export const colorBounds = {
    gray: 0,
    brown: 400,
    green: 800,
    cyan: 1200,
    blue: 1600,
    yellow: 2000,
    orange: 2400,
    red: 2800,
};

type ColorName = "unrated" | "gray" | "brown" | "green" | "cyan" | "blue" | "yellow" | "orange" | "red";

export const colorNames: ColorName[] = ["unrated", "gray", "brown", "green", "cyan", "blue", "yellow", "orange", "red"];

export function getColor(rating: number): ColorName {
    const colorIndex = rating > 0 ? Math.min(Math.floor(rating / 400) + 1, 8) : 0;
    return colorNames[colorIndex];
}
