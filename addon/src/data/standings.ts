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
  Additional: null,
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

class StandingsWrapper {
  data: Standings
  constructor(data: Standings) {
    this.data = data;
  }
  toRanks(onlyRated: boolean=false): { [userScreenName: string]: number } {
    const res: { [userScreenName: string]: number } = {};
    for (const data of this.data.StandingsData) {
      if (onlyRated && !data.IsRated) continue;
      res[data.UserScreenName] = data.Rank;
    }
    return res;
  }

  toRatedUsers(): string[] {
    const res: string[] = [];
    for (const data of this.data.StandingsData) {
      if (data.IsRated) {
        res.push(data.UserScreenName);
      }
    }
    return res;
  }

  toIsRatedMaps(): Map<string, boolean> {
    const res = new Map<string, boolean>();
    for (const data of this.data.StandingsData) {
      res.set(data.UserScreenName, data.IsRated);
    }
    return res;
  }

  toOldRatingMaps(unpositivize=false): Map<string, number> {
    const res = new Map<string, number>();
    for (const data of this.data.StandingsData) {
      const rating = this.data.Fixed ? data.OldRating : data.Rating;
      res.set(data.UserScreenName, unpositivize ? unpositivizeRating(rating) : rating);
    }
    return res;
  }

  toCompetitionMaps(): Map<string, number> {
    const res = new Map<string, number>();
    for (const data of this.data.StandingsData) {
      res.set(data.UserScreenName, data.Competitions);
    }
    return res;
  }
}

const STANDINGS_CACHE_DURATION = 10 * 1000;
const cache = new Cache<Standings>(STANDINGS_CACHE_DURATION);
export default async function getStandings(contestScreenName: string): Promise<StandingsWrapper> {
  if (!cache.has(contestScreenName)) {
    const result = await fetch(`https://atcoder.jp/contests/${contestScreenName}/standings/json`);
    if (!result.ok) {
      throw new Error(`Failed to fetch standings: ${result.status}`);
    }
    cache.set(contestScreenName, await result.json());
  }
  return new StandingsWrapper(cache.get(contestScreenName)!);
}

addHandler(
  (content, path) => {
    const match = path.match(/^\/contests\/([^/]*)\/standings\/json$/);
    if (!match) return;
    const contestScreenName = match[1];
    cache.set(contestScreenName, JSON.parse(content));
  }
)
