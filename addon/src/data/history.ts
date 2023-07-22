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

const HISTORY_CACHE_DURATION = 60 * 60 * 1000;

const cacheExpires = new Map<string, Date>();
const cacheData = new Map<string, History[]>();
export default async function getHistory(userScreenName: string, contestType: ("algorithm" | "heuristic")="algorithm"): Promise<History[]> {
  const now = new Date();
  const key = `${userScreenName}:${contestType}`;
  if (!cacheExpires.has(key) || cacheExpires.get(key)! < now) {
    const result = await fetch(`https://atcoder.jp/users/${userScreenName}/history/json?contestType=${contestType}`);
    if (!result.ok) {
      throw new Error(`Failed to fetch history: ${result.status}`);
    }
    const expire = new Date(now.getTime() + HISTORY_CACHE_DURATION);
    cacheExpires.set(key, expire);
    cacheData.set(key, await result.json());
  }
  return cacheData.get(key)!;
}
