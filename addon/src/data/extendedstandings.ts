import Cache from "./cache";
import { addHandler } from "./mitm";

type TaskInfo = {
  Assignment: string,
  TaskName: string,
  TaskScreenName: string,
};
type StandingsData = {
  Rank: number,
  Additional: { "standings.extendedContestRank": number | undefined },
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

  toRanks(onlyRated: boolean=false, contestType: "algorithm" | "heuristic"="algorithm"): Map<string, number> {
    const res = new Map<string, number>();
    for (const data of this.data.StandingsData) {
      if (onlyRated && !this.isRated(data, contestType))  continue;
      const userScreenName = typeof(data.Additional["standings.extendedContestRank"]) == "undefined" ? `extended:${data.UserScreenName}` : data.UserScreenName;
      res.set(userScreenName, data.Rank);
    }
    return res;
  }

  toRatedUsers(contestType: "algorithm" | "heuristic"): string[] {
    const res: string[] = [];
    for (const data of this.data.StandingsData) {
      if (this.isRated(data, contestType)) {
        res.push(data.UserScreenName);
      }
    }
    return res;
  }

  toScores(): Scores {
    const res = new Map<string, { score: number, penalty: number }>();
    for (const data of this.data.StandingsData) {
      const userScreenName = typeof(data.Additional["standings.extendedContestRank"]) == "undefined" ? `extended:${data.UserScreenName}` : data.UserScreenName;
      res.set(userScreenName, { score: data.TotalResult.Score, penalty: data.TotalResult.Elapsed });
    }
    return res;
  }

  private isRated(data: StandingsData, contestType: "algorithm" | "heuristic") {
    if (contestType === "algorithm") {
      return data.IsRated && typeof(data.Additional["standings.extendedContestRank"]) != "undefined";
    }
    else {
      return data.IsRated && typeof(data.Additional["standings.extendedContestRank"]) != "undefined" && data.TotalResult.Count !== 0;
    }
  }
}


const STANDINGS_CACHE_DURATION = 10 * 1000;
const cache = new Cache<Standings>(STANDINGS_CACHE_DURATION);
export default async function getExtendedStandings(contestScreenName: string): Promise<StandingsWrapper> {
  if (!cache.has(contestScreenName)) {
    const result = await fetch(`https://atcoder.jp/contests/${contestScreenName}/standings/extended/json`);
    if (!result.ok) {
      throw new Error(`Failed to fetch extended standings: ${result.status}`);
    }
    cache.set(contestScreenName, await result.json());
  }
  return new StandingsWrapper(cache.get(contestScreenName)!);
}

addHandler(
  (content, path) => {
    const match = path.match(/^\/contests\/([^/]*)\/standings\/extended\/json$/);
    if (!match) return;
    const contestScreenName = match[1];
    cache.set(contestScreenName, JSON.parse(content));
  }
)
