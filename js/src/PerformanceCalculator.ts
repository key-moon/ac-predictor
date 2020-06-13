export interface PerformanceCalculator {
    getPerformance(rank: number): number;
}

// O(m)
function calcRankVal(X: number, aPerfs: number[]): number {
    let res = 0;
    aPerfs.forEach(function(aperf) {
        res += 1.0 / (1.0 + Math.pow(6.0, (X - aperf) / 400.0));
    });
    return res;
}

export class PreCalcedPerformanceCalculator implements PerformanceCalculator {
    maxPerf = Infinity;
    aperfs: number[] = [];
    caches: { [key: number]: number } = {};

    addAPerfs(aperfs: number[]): void {
        for (const cache in this.caches) {
            this.caches[cache] += calcRankVal(Number(cache), aperfs);
        }
        this.aperfs = this.aperfs.concat(aperfs);
    }

    getRank(perf: number): number {
        if (typeof this.caches[perf] === "undefined") this.caches[perf] = calcRankVal(perf, this.aperfs);
        return this.caches[perf];
    }

    getPerformance(rank: number): number {
        let large = 8192.5;
        let small = -8191.5;
        while (large - small > 1) {
            const mid = (large + small) / 2;
            if (rank > this.getRank(mid)) large = mid;
            else small = mid;
        }
        return Math.min(Math.round((large + small) / 2), this.maxPerf);
    }
}
