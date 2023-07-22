import hasOwnProperty from "../../util/hasOwnProperty";
import PerformanceProvider from "./performanceprovider";

type Ranks = { [userScreenName: string]: number };
type Ratings = number[];

class EloPerformanceProvicer implements PerformanceProvider {
  ranks: Ranks
  ratings: Ratings
  private rankMemo: { [rank: number]: number };
  constructor(ranks: Ranks, ratings: Ratings) {
    this.ranks = ranks;
    this.ratings = ratings;
    this.rankMemo = {};
  }

  availableFor(userScreenName: string): boolean {
    return hasOwnProperty(this.ranks, userScreenName);
  }

  getPerformance(userScreenName: string): number {
    if (!this.availableFor(userScreenName)){
      throw new Error(`User ${userScreenName} not found`);
    }

    const rank = this.ranks[userScreenName];
    return this.getPerformanceForRank(rank);
  }

  getPerformances(): { [userScreenName: string]: number; } {
    const performances: { [userScreenName: string]: number; } = {};
    for (const userScreenName in this.ranks) {
      performances[userScreenName] = this.getPerformance(userScreenName);
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
    return Math.round((upper + lower) / 2);
  }

  private getRankForPerformance(performance: number): number {
    if (this.rankMemo[performance]) return this.rankMemo[performance];

    return (this.rankMemo[performance] = this.ratings.reduce(
        (val, APerf) => val + 1.0 / (1.0 + Math.pow(6.0, (performance - APerf) / 400.0)),
        0.5
    ));
  }
}

export default EloPerformanceProvicer
