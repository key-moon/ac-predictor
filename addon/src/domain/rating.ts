//Copyright © 2017 koba-e964.
//from : https://github.com/koba-e964/atcoder-rating-estimator

import { RatingMaterial } from "../data/history";

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
 * calculate the performance required to reach a target rate
 * @param {Number} [targetRating] targeted unpositivized rating
 * @param {Number[]} [history] performance history with ascending order
 * @returns {number} performance
 */
export function calcRequiredPerformance(targetRating: number, history: number[]): number {
    let valid = 10000.0;
    let invalid = -10000.0;
    for (let i = 0; i < 100; ++i) {
        const mid = (invalid + valid) / 2;
        const rating = Math.round(calcAlgRatingFromHistory(history.concat([mid])));
        if (targetRating <= rating) valid = mid;
        else invalid = mid;
    }
    return valid;
}

/**
 * Gets the weight used in the heuristic rating calculation
 * based on its start and end dates
 * @param {Date} startAt - The start date of the contest.
 * @param {Date} endAt - The end date of the contest.
 * @returns {number} The weight of the contest.
 */
export function getWeight(startAt: Date, endAt: Date) {
    const isShortContest = endAt.getTime() - startAt.getTime() < 24 * 60 * 60 * 1000;

    if (endAt < new Date("2025-01-01T00:00:00+09:00")) {
        return 1;
    }
    return isShortContest ? 0.5 : 1;
}

/**
 * calculate unpositivized rating from performance history
 * @param {RatingMaterial[]} [history] performance histories
 * @returns {Number} unpositivized rating
 */
export function calcHeuristicRatingFromHistory(history: RatingMaterial[]): number {
    const S = 724.4744301;
    const R = 0.8271973364;
    const qs: { q: number, weight: number }[] = [];
    for (const material of history) {
        const adjustedPerformance = material.Performance + 150 - 100 * material.DaysFromLatestContest / 365;
        for (let i = 1; i <= 100; i++) {
            qs.push({ q: adjustedPerformance - S * Math.log(i), weight: material.Weight });
        }
    }
    qs.sort((a, b) => b.q - a.q);

    let r = 0.0;
    let s = 0.0;
    for (const { q, weight } of qs) {
        s += weight;
        r += q * (R ** (s - weight) - R ** s);
    }
    return r;
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
