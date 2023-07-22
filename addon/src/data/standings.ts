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

const STANDINGS_CACHE_DURATION = 10 * 1000;

const cacheExpires = new Map<string, Date>();
const cacheData = new Map<string, Standings>();
export default async function getStandings(contestScreenName: string): Promise<Standings> {
  const now = new Date();
  if (!cacheExpires.has(contestScreenName) || cacheExpires.get(contestScreenName)! < now) {
    const result = await fetch(`https://atcoder.jp/contests/${contestScreenName}/standings/json`);
    if (!result.ok) {
      throw new Error(`Failed to fetch standings: ${result.status}`);
    }
    const expire = new Date(now.getTime() + STANDINGS_CACHE_DURATION);
    cacheExpires.set(contestScreenName, expire);
    cacheData.set(contestScreenName, await result.json());
  }
  return cacheData.get(contestScreenName)!;
}
