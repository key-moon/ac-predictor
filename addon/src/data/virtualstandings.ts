import { unpositivizeRating } from "../domain/rating";
import Cache from "./cache";
import { addHandler } from "./mitm";

type TaskInfo = {
  Assignment: string,
  TaskName: string,
  TaskScreenName: string,
};
type StandingsData = {
  Rank: number,
  Additional: { "standings.virtualElapsed": number },
  UserName: string,
  UserScreenName: string,
  UserIsDeleted: boolean,
  Affiliation: string,
  Country: string,
  Rating: number,
  OldRating: number,
  IsRated: boolean,
  IsTeam: boolean,
  Competitions: number,
  AtCoderRank: number,
  TaskResults: {
    [key: string]: {
      Count: number,
      Failure: number,
      Penalty: number,
      Score: number,
      Elapsed: number,
      Status: number,
      Pending: boolean,
      Frozen: boolean,
      SubmissionID: number,
      Additional: null,
    },
  },
  TotalResult: {
    Count: number,
    Accepted: number,
    Penalty: number,
    Score: number,
    Elapsed: number,
    Frozen: boolean,
    Additional: null,
  },
};

type Standings = {
  Fixed: boolean,
  AdditionalColumns: null,
  TaskInfo: TaskInfo[],
  StandingsData: StandingsData[],
}

type Scores = Map<string, { score: number, penalty: number }>;

class StandingsWrapper {
  data: Standings
  constructor(data: Standings) {
    this.data = data;
  }

  toRanks(onlyRated: boolean=false): Map<string, number> {
    const res = new Map<string, number>();
    for (const data of this.data.StandingsData) {
      if (onlyRated && (!data.IsRated || data.Additional["standings.virtualElapsed"] !== -2)) continue;
      const userScreenName = data.Additional["standings.virtualElapsed"] === -2 ? `ghost:${data.UserScreenName}` : data.UserScreenName;
      res.set(userScreenName, data.Rank);
    }
    return res;
  }

  toRatedUsers(): string[] {
    const res: string[] = [];
    for (const data of this.data.StandingsData) {
      if (data.IsRated && data.Additional["standings.virtualElapsed"] === -2) {
        res.push(data.UserScreenName);
      }
    }
    return res;
  }

  toScores(): Scores {
    const res = new Map<string, { score: number, penalty: number }>();
    for (const data of this.data.StandingsData) {
      const userScreenName = data.Additional["standings.virtualElapsed"] === -2 ? `ghost:${data.UserScreenName}` : data.UserScreenName;
      res.set(userScreenName, { score: data.TotalResult.Score, penalty: data.TotalResult.Elapsed });
    }
    return res;
  }
}

function createCacheKey(contestScreenName: string, showGhost: boolean) {
  return `${contestScreenName}:${showGhost}`;
}

const STANDINGS_CACHE_DURATION = 10 * 1000;
const cache = new Cache<Standings>(STANDINGS_CACHE_DURATION);
export default async function getVirtualStandings(contestScreenName: string, showGhost: boolean): Promise<StandingsWrapper> {
  const cacheKey = createCacheKey(contestScreenName, showGhost);
  if (!cache.has(cacheKey)) {
    const result = await fetch(`https://atcoder.jp/contests/${contestScreenName}/standings/virtual/json${showGhost ? "?showGhost=true" : ""}`);
    if (!result.ok) {
      throw new Error(`Failed to fetch standings: ${result.status}`);
    }
    cache.set(cacheKey, await result.json());
  }
  return new StandingsWrapper(cache.get(cacheKey)!);
}

addHandler(
  (content, path) => {
    const match = path.match(/^\/contests\/([^/]*)\/standings\/virtual\/json(\?showGhost=true)?$/);
    if (!match) return;
    const contestScreenName = match[1];
    const showGhost = match[2] != "";
    cache.set(createCacheKey(contestScreenName, showGhost), JSON.parse(content));
  }
)
