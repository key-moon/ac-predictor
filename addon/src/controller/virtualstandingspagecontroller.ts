import getAPerfs from "../data/aperfs";
import getContestDetailsList from "../data/contestdetails";
import getResults from "../data/results";
import getStandings from "../data/standings";
import getVirtualStandings from "../data/virtualstandings";
import ContestDetails from "../domain/contestdetails";
import EloPerformanceProvider from "../domain/performanceprovider/elo";
import FixedPerformanceProvider from "../domain/performanceprovider/fixed";
import InterpolatePerformanceProvider from "../domain/performanceprovider/interpolate";
import PerformanceProvider from "../domain/performanceprovider/performanceprovider";
import { normalizeRank } from "../domain/ranks";
import { positivizeRating } from "../domain/rating";
import getContestScreenName from "../parse/contestScreenName";
import duringVirtualParticipation from "../parse/duringVirtualParticipation";
import { getConfig } from "../util/config";
import hasOwnProperty from "../util/hasOwnProperty";
import StandingsLoadingView from "../view/standingsloading";
import StandingsTableView from "../view/standingstable";

type Scores = Map<string, { score: number, penalty: number }>;

function forgeCombinedRanks(a: Scores, b: Scores): Map<string, number> {
  const res = new Map<string, number>();

  const merged = [...a.entries(), ...b.entries()].sort((a, b) => a[1].score !== b[1].score ? b[1].score - a[1].score : a[1].penalty - b[1].penalty);

  let rank = 0;
  let prevScore = NaN;
  let prevPenalty = NaN;
  for (const [userScreenName, { score, penalty }] of merged) {
    if (score !== prevScore || penalty !== prevPenalty) {
      rank++;
      prevScore = score;
      prevPenalty = penalty;
    }
    res.set(userScreenName, rank);
  }

  return res;
}

function remapKey<KeyT, ValT, NewKeyT>(map: Map<KeyT, ValT>, mappingFunction: (key: KeyT) => NewKeyT): Map<NewKeyT, ValT> {
  const newMap = new Map<NewKeyT, ValT>();
  for (const [key, val] of map) {
    newMap.set(mappingFunction(key), val);
  }
  return newMap;
}

export default class VirtualStandingsPageController {
  contestDetails?: ContestDetails;

  performanceProvider?: PerformanceProvider;
  standingsTableView?: StandingsTableView;

  public async register() {
    const loading = StandingsLoadingView.Get();
    loading.onLoad(() => this.initialize());
  }

  private async initialize() {
    const contestScreenName = getContestScreenName();

    const contestDetailsList = await getContestDetailsList();    
    const contestDetails = contestDetailsList.find(details => details.contestScreenName == contestScreenName);
    if (contestDetails === undefined) {
      throw new Error("contest details not found");
    }
    this.contestDetails = contestDetails;

    this.standingsTableView = StandingsTableView.Get(async userScreenName => {
      if (!this.performanceProvider) return { "type": "error", "message": "performanceProvider missing" };
      if (!this.performanceProvider.availableFor(userScreenName)) return { "type": "error", "message": `performance not available for ${userScreenName}` };

      const originalPerformance = this.performanceProvider.getPerformance(userScreenName);
      const positivizedPerformance = Math.round(positivizeRating(originalPerformance));
      return { type: "perfonly", performance: positivizedPerformance };
    });
    this.standingsTableView.onRefreshed(async () => {
      await this.updateData();
      this.standingsTableView!.update();
    });
    await this.updateData();
    this.standingsTableView.update();
  }

  private async updateData() {
    if (!this.contestDetails) throw new Error("contestDetails missing");

    const virtualStandings = await getVirtualStandings(this.contestDetails.contestScreenName, true);
    const results = await getResults(this.contestDetails.contestScreenName);
    
    let ranks: Map<string, number>;
    let basePerformanceProvider: PerformanceProvider;
    if (!duringVirtualParticipation() || getConfig("useFinalResultOnVirtual")) {
      const standings = await getStandings(this.contestDetails.contestScreenName);
      const referencePerformanceMap = remapKey(results.toPerformanceMaps(), userScreenName => `reference:${userScreenName}`);
      basePerformanceProvider = new FixedPerformanceProvider(referencePerformanceMap);

      ranks = forgeCombinedRanks(remapKey(standings.toScores(), userScreenName => `reference:${userScreenName}`), virtualStandings.toScores());
    }
    else {
      const aperfsObj = await getAPerfs(this.contestDetails.contestScreenName);
      const defaultAPerf = this.contestDetails.defaultAPerf;
      const normalizedRanks = normalizeRank(virtualStandings.toRanks(true));
      const aperfsList = virtualStandings.toRatedUsers().map(userScreenName => hasOwnProperty(aperfsObj, userScreenName) ? aperfsObj[userScreenName] : defaultAPerf);
      
      basePerformanceProvider = new EloPerformanceProvider(normalizedRanks, aperfsList, this.contestDetails.performanceCap);

      ranks = virtualStandings.toRanks();
    }
    
    this.performanceProvider = new InterpolatePerformanceProvider(ranks, basePerformanceProvider);
  }
}
