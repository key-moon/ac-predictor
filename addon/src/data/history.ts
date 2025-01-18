import { getWeight } from "../domain/rating";
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

export type RatingMaterial = {
  Performance: number,
  Weight: number,
  DaysFromLatestContest: number,
};



class HistoriesWrapper {
  data: History[]
  constructor(data: History[]) {
    this.data = data;
  }

  public toRatingMaterials(latestContestDate: Date, contestDurationSecondProvider: (screenName: string) => number) {
    const toUtcDate = (date: Date) => Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
    const results: RatingMaterial[] = [];
    for (const history of this.data) {
      if (!history.IsRated) continue;
      const endTime = new Date(history.EndTime);
      const startTime = new Date(endTime.getTime() - contestDurationSecondProvider(history.ContestScreenName) * 1000);
      results.push({
        Performance: history.Performance,
        Weight: getWeight(startTime, endTime),
        DaysFromLatestContest: toUtcDate(latestContestDate) - toUtcDate(endTime),
      });
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
