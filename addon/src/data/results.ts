import Cache from "./cache";
import { addHandler } from "./mitm";

type Result = {
  IsRated: boolean,
  Place: number,
  OldRating: number,
  NewRating: number,
  Performance: number,
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

export function convertToResultObject(results: Result[]): { [userScreenName: string]: number } {
  const res: { [userScreenName: string]: number } = {};
  for (const result of results) {
    res[result.UserScreenName] = result.Performance;
  }
  return res;
}

const RESULTS_CACHE_DURATION = 10 * 1000;
const cache = new Cache<Result[]>(RESULTS_CACHE_DURATION);
export async function getResults(contestScreenName: string): Promise<Result[]> {
  if (!cache.has(contestScreenName)) {
    const result = await fetch(`https://atcoder.jp/contests/${contestScreenName}/results/json`);
    if (!result.ok) {
      throw new Error(`Failed to fetch results: ${result.status}`);
    }
    cache.set(contestScreenName, await result.json());
  }
  return cache.get(contestScreenName)!;
}

addHandler(
  (content, path) => {
    const match = path.match(/^\/contests\/(.*)\/results\/json$/);
    if (!match) return;
    const contestScreenName = match[1];
    cache.set(contestScreenName, JSON.parse(content));
  }
)
