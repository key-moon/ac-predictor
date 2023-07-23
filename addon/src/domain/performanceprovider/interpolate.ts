import PerformanceProvider from "./performanceprovider";

function getRankToUsers(ranks: Map<string, number>) {
  const rankToUsers = new Map<number, string[]>();
  for (const [userScreenName, rank] of ranks) {
    if (!rankToUsers.has(rank)) rankToUsers.set(rank, []);
    rankToUsers.get(rank)!.push(userScreenName);
  }
  return rankToUsers;
}
function getMaxRank(ranks: Map<string, number>) {
  return Math.max(...ranks.values());
}

class InterpolatePerformanceProvider implements PerformanceProvider {
  private ranks: Map<string, number>;
  private maxRank: number;
  private rankToUsers: Map<number, string[]>;
  private baseProvider: PerformanceProvider;
  constructor(ranks: Map<string, number>, baseProvider: PerformanceProvider) {
    this.ranks = ranks;
    this.maxRank = getMaxRank(ranks);
    this.rankToUsers = getRankToUsers(ranks);
    this.baseProvider = baseProvider;
  }

  availableFor(userScreenName: string): boolean {
    return this.ranks.has(userScreenName);
  }

  getPerformance(userScreenName: string): number {
    if (!this.availableFor(userScreenName)) {
      throw new Error(`User ${userScreenName} not found`);
    }

    if (this.performanceCache.has(userScreenName)) return this.performanceCache.get(userScreenName)!;
    let rank = this.ranks.get(userScreenName)!;
    while (rank <= this.maxRank) {
      const perf = this.getPerformanceIfAvailable(rank);
      if (perf !== null) {
        return perf;
      }
      rank++;
    }
    this.performanceCache.set(userScreenName, -Infinity);
    return -Infinity;
  }
  
  private performanceCache = new Map<string, number>();
  getPerformances(): Map<string, number> {
    let currentPerformance = -Infinity;
    const res = new Map<string, number>();
    for (let rank = this.maxRank; rank >= 0; rank--) {
      const users = this.rankToUsers.get(rank);
      if (users === undefined) continue;
      const perf = this.getPerformanceIfAvailable(rank);
      if (perf !== null) currentPerformance = perf;
      for (const userScreenName of users) {
        res.set(userScreenName, currentPerformance);
      }
    }
    this.performanceCache = res
    return res;
  }

  private cacheForRank = new Map<number, number>();
  private getPerformanceIfAvailable(rank: number): number | null {
    if (!this.rankToUsers.has(rank)) return null;
    if (this.cacheForRank.has(rank)) return this.cacheForRank.get(rank)!;

    for (const userScreenName of this.rankToUsers.get(rank)!) {
      if (!this.baseProvider.availableFor(userScreenName)) continue;
      const perf = this.baseProvider.getPerformance(userScreenName);
      this.cacheForRank.set(rank, perf);
      return perf;
    }
    return null;
  }
}

export default InterpolatePerformanceProvider
