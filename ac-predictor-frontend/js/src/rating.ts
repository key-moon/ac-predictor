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

const finf = bigf(400);
function f(n: number): number {
    return ((bigf(n) - finf) / (bigf(1) - finf)) * 1200.0;
}

/**
 * calculate unpositivized rating from performance history
 * @param {number[]} [history] performance history
 * @returns {number} unpositivized rating
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
    return Math.log(numerator / denominator) * Math.LOG2E * 800.0 - f(n);
}

/**
 * calculate unpositivized rating from last state
 * @param {number} [last] last unpositivized rating
 * @param {number} [perf] performance
 * @param {number} [ratedMatches] count of participated rated contest
 * @returns {number} estimated unpositivized rating
 */
export function calcRatingFromLast(last: number, perf: number, ratedMatches: number): number {
    if (ratedMatches === 0) return perf - 1200;
    last += f(ratedMatches);
    const weight = 9 - 9 * 0.9 ** ratedMatches;
    const numerator = weight * 2 ** (last / 800.0) + 2 ** (perf / 800.0);
    const denominator = 1 + weight;
    return Math.log(numerator / denominator) * Math.LOG2E * 800.0 - f(ratedMatches + 1);
}

/**
 * (-inf, inf) -> (0, inf)
 * @param {number} [rating] unpositivized rating
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
 * @param {number} [rating] positivized rating
 * @returns {number} unpositivized rating
 */
export function unpositivizeRating(rating: number): number {
    if (rating >= 400.0) {
        return rating;
    }
    return 400.0 + 400.0 * Math.log(rating / 400.0);
}

const colors = ["unrated", "gray", "brown", "green", "cyan", "blue", "yellow", "orange", "red"];
export function getColor(rating: number): string {
    let colorIndex = 0;
    if (rating > 0) {
        colorIndex = Math.min(Math.floor(rating / 400) + 1, 8);
    }
    return colors[colorIndex];
}
