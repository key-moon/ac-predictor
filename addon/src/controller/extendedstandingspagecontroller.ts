import getAPerfs from "../data/aperfs";
import getContestDetailsList from "../data/contestdetails";
import getExtendedStandings from "../data/extendedstandings";
import ContestDetails from "../domain/contestdetails";
import EloPerformanceProvider from "../domain/performanceprovider/elo";
import InterpolatePerformanceProvider from "../domain/performanceprovider/interpolate";
import PerformanceProvider from "../domain/performanceprovider/performanceprovider";
import { normalizeRank } from "../domain/ranks";
import { positivizeRating } from "../domain/rating";
import getContestScreenName from "../parse/contestScreenName";
import hasOwnProperty from "../util/hasOwnProperty";
import StandingsLoadingView from "../view/standingsloading";
import StandingsTableView from "../view/standingstable";

export default class ExtendedStandingsPageController {
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

    const extendedStandings = await getExtendedStandings(this.contestDetails.contestScreenName);
    const aperfsObj = await getAPerfs(this.contestDetails.contestScreenName);
    const defaultAPerf = this.contestDetails.defaultAPerf;

    const normalizedRanks = normalizeRank(extendedStandings.toRanks(true, this.contestDetails.contestType));
    const aperfsList = extendedStandings.toRatedUsers(this.contestDetails.contestType).map(userScreenName => hasOwnProperty(aperfsObj, userScreenName) ? aperfsObj[userScreenName] : defaultAPerf);
    
    const basePerformanceProvider = new EloPerformanceProvider(normalizedRanks, aperfsList, this.contestDetails.performanceCap);
    const ranks = extendedStandings.toRanks();
    this.performanceProvider = new InterpolatePerformanceProvider(ranks, basePerformanceProvider);
  }
}
