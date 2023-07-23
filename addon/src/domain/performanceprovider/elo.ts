import PerformanceProvider from "./performanceprovider";

type Ranks = Map<string, number>;
type Ratings = number[];

class EloPerformanceProvider implements PerformanceProvider {
  ranks: Ranks
  ratings: Ratings
  cap: number
  private rankMemo = new Map<number, number>();
  constructor(ranks: Ranks, ratings: Ratings, cap: number) {
    this.ranks = ranks;
    this.ratings = ratings;
    this.cap = cap;
  }

  availableFor(userScreenName: string): boolean {
    return this.ranks.has(userScreenName);
  }

  getPerformance(userScreenName: string): number {
    if (!this.availableFor(userScreenName)){
      throw new Error(`User ${userScreenName} not found`);
    }

    const rank = this.ranks.get(userScreenName)!;
    return this.getPerformanceForRank(rank);
  }

  getPerformances(): Map<string, number> {
    const performances = new Map<string, number>();
    for (const userScreenName of this.ranks.keys()) {
      performances.set(userScreenName, this.getPerformance(userScreenName));
    }
    return performances;
  }

  private getPerformanceForRank(rank: number): number {
    let upper = 6144;
    let lower = -2048;
    while (upper - lower > 0.5) {
        const mid = (upper + lower) / 2;
        if (rank > this.getRankForPerformance(mid)) upper = mid;
        else lower = mid;
    }
    return Math.min(this.cap, Math.round((upper + lower) / 2));
  }

  private getRankForPerformance(performance: number): number {
    if (this.rankMemo.has(performance)) return this.rankMemo.get(performance)!;

    const res = this.ratings.reduce(
        (val, APerf) => val + 1.0 / (1.0 + Math.pow(6.0, (performance - APerf) / 400.0)),
        0.5
    );
    this.rankMemo.set(performance, res);
    return res;
  }
}

export default EloPerformanceProvider
