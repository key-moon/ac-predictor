import Cache from "./cache";

type History = {
  IsRated: boolean,
  Place: number,
  OldRating: number,
  NewRating: number,
  Performance: number,
  InnerPerformance: number,
  ContestScreenName: string,
  ContestName: string,
  ContestNameEn: string,
  EndTime: string,
}

class HistoriesWrapper {
  data: History[]
  constructor(data: History[]) {
    this.data = data;
  }

  public toPerformances() {
    const results: number[] = [];
    for (const history of this.data) {
      if (!history.IsRated) continue;
      results.push(history.Performance);
    }
    return results;
  }

  public toPerformanceAndTimes() {
    const results: { performance: number, date: Date }[] = [];
    for (const history of this.data) {
      if (!history.IsRated) continue;
      const date = new Date(history.EndTime);
      results.push({ performance: history.Performance, date });
    }
    return results;
  }
}

const HISTORY_CACHE_DURATION = 60 * 60 * 1000;
const cache = new Cache<History[]>(HISTORY_CACHE_DURATION);
export default async function getHistory(userScreenName: string, contestType: ("algorithm" | "heuristic")="algorithm"): Promise<HistoriesWrapper> {
  const key = `${userScreenName}:${contestType}`;
  if (!cache.has(key)) {
    const result = await fetch(`https://atcoder.jp/users/${userScreenName}/history/json?contestType=${contestType}`);
    if (!result.ok) {
      throw new Error(`Failed to fetch history: ${result.status}`);
    }
    cache.set(key, await result.json());
  }
  return new HistoriesWrapper(cache.get(key)!);
}
