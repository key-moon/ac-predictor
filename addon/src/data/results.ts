type Result = {
  IsRated: boolean,
  Place: number,
  OldRating: number,
  NewRating: number,
  Performance: number,
  InnerPerformance: number,
  ContestName: string,
  ContestNameEn: string,
  ContestScreenName: string,
  EndTime: string,
  ContestType: 0 | 1,
  UserName: string,
  UserScreenName: string,
  Country: string,
  Affiliation: string,
  Rating: number,
  Competitions: number,
  AtCoderRank: number,
};

const STANDINGS_CACHE_DURATION = 10 * 1000;

const cacheExpires = new Map<string, Date>();
const cacheData = new Map<string, Result[]>();
export default async function getResults(contestScreenName: string): Promise<Result[]> {
  const now = new Date();
  if (!cacheExpires.has(contestScreenName) || cacheExpires.get(contestScreenName)! < now) {
    const result = await fetch(`https://atcoder.jp/contests/${contestScreenName}/results/json`);
    if (!result.ok) {
      throw new Error(`Failed to fetch results: ${result.status}`);
    }
    const expire = new Date(now.getTime() + STANDINGS_CACHE_DURATION);
    cacheExpires.set(contestScreenName, expire);
    cacheData.set(contestScreenName, await result.json());
  }
  return cacheData.get(contestScreenName)!;
}
