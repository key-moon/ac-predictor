import hasOwnProperty from "../../util/hasOwnProperty";
import PerformanceProvider from "./performanceprovider";

type Ranks = { [userScreenName: string]: number }
type RankToUsers = { [rank: number]: string[] }

function getRankToUsers(ranks: Ranks) {
  const rankToUsers: RankToUsers = {};
  for (const userScreenName in ranks) {
    const rank = ranks[userScreenName];
    if (!rankToUsers[rank]) rankToUsers[rank] = [];
    rankToUsers[rank].push(userScreenName);
  }
  return rankToUsers;
}
function getMaxRank(ranks: Ranks) {
  return Math.max(...Object.values(ranks));
}

// TODO: 命名
class InterpolatePerformanceProvider implements PerformanceProvider {
  private ranks: Ranks;
  private maxRank: number;
  private rankToUsers: RankToUsers;
  private baseProvider: PerformanceProvider;
  constructor(ranks: Ranks, baseProvider: PerformanceProvider) {
    this.ranks = ranks;
    this.maxRank = getMaxRank(ranks);
    this.rankToUsers = getRankToUsers(ranks);
    this.baseProvider = baseProvider;
  }

  availableFor(userScreenName: string): boolean {
    return hasOwnProperty(this.ranks, userScreenName);
  }

  getPerformance(userScreenName: string): number {
    if (!this.availableFor(userScreenName)) {
      throw new Error(`User ${userScreenName} not found`);
    }

    if (this.getPerformancesCache) return this.getPerformancesCache[userScreenName];
    let rank = this.ranks[userScreenName];
    while (rank <= this.maxRank) {
      const perf = this.getPerformanceIfAvailable(rank);
      if (perf !== null) return perf;
      rank++;
    }
    return -Infinity;
  }
  
  private getPerformancesCache?: { [userScreenName: string]: number; };
  getPerformances(): { [userScreenName: string]: number; } {
    if (this.getPerformancesCache) return this.getPerformancesCache;

    let currentPerformance = -Infinity;
    const res: { [userScreenName: string]: number; } = {};
    for (let rank = this.maxRank; rank >= 0; rank--) {
      const users = this.rankToUsers[rank];
      if (!users) continue;
      const perf = this.getPerformanceIfAvailable(rank);
      if (perf !== null) currentPerformance = perf;
      for (const userScreenName of users) {
        res[userScreenName] = currentPerformance;
      }
    }
    return this.getPerformancesCache = res;
  }

  private cacheForRank: { [rank: number]: number; } = {};
  private getPerformanceIfAvailable(rank: number): number | null {
    if (!this.rankToUsers[rank]) return null;
    if (this.cacheForRank[rank]) return this.cacheForRank[rank];

    for (const userScreenName of this.rankToUsers[rank]) {
      if (!this.baseProvider.availableFor(userScreenName)) continue;
      return this.cacheForRank[rank] = this.baseProvider.getPerformance(userScreenName);
    }
    return null;
  }
}

export default InterpolatePerformanceProvider
