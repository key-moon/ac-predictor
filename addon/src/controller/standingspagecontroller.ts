import getAPerfs from "../data/aperfs";
import getContestDetailsList from "../data/contestdetails";
import getHistory from "../data/history";
import getResults from "../data/results";
import getStandings from "../data/standings";
import ContestDetails from "../domain/contestdetails";
import EloPerformanceProvider from "../domain/performanceprovider/elo";
import FixedPerformanceProvider from "../domain/performanceprovider/fixed";
import InterpolatePerformanceProvider from "../domain/performanceprovider/interpolate";
import PerformanceProvider from "../domain/performanceprovider/performanceprovider";
import { normalizeRank } from "../domain/ranks";
import { positivizeRating } from "../domain/rating";
import IncrementalAlgRatingProvider from "../domain/ratingprovider/alg/incremental";
import ConstRatingProvider from "../domain/ratingprovider/const";
import FromHistoryHeuristicRatingProvider from "../domain/ratingprovider/heuristic/fromhistory";
import RatingProvider from "../domain/ratingprovider/ratingprovider";
import getContestScreenName from "../parse/contestScreenName";
import { getConfig } from "../util/config";
import StandingsLoadingView from "../view/standingsloading";
import StandingsTableView from "../view/standingstable";

type RatingProviderInfo = { provider: RatingProvider, lazy: boolean };

export default class StandingsPageController {
  contestDetails?: ContestDetails;

  performanceProvider?: PerformanceProvider;
  ratingProvider?: RatingProviderInfo;
  oldRatings = new Map<string, number>(); 
  isRatedMaps = new Map<string, boolean>();

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

    if (getConfig("hideDuringContest") && this.contestDetails.duringContest(new Date())) return;

    this.standingsTableView = StandingsTableView.Get(async userScreenName => {
      if (!this.ratingProvider) return { "type": "error", "message": "ratingProvider missing" };
      if (!this.performanceProvider) return { "type": "error", "message": "performanceProvider missing" };
      if (!this.isRatedMaps) return { "type": "error", "message": "isRatedMapping missing" };
      if (!this.oldRatings) return { "type": "error", "message": "oldRatings missing" };
      if (!this.oldRatings.has(userScreenName)) return { "type": "error", "message": `oldRating not found for ${userScreenName}` };

      const oldRating = this.oldRatings.get(userScreenName)!;

      if (!this.performanceProvider.availableFor(userScreenName)) return { "type": "error", "message": "performance not available" };

      const originalPerformance = this.performanceProvider.getPerformance(userScreenName);
      const positivizedPerformance = Math.round(positivizeRating(originalPerformance));
      if (this.isRatedMaps.get(userScreenName)) {
        if (!this.ratingProvider.provider.availableFor(userScreenName)) return { "type": "error", "message": `rating not available for ${userScreenName}` };
        if (this.ratingProvider.lazy) {
          const newRatingCalculator = () => this.ratingProvider!.provider.getRating(userScreenName, originalPerformance);
          return { type: "deffered", oldRating, performance: positivizedPerformance, newRatingCalculator };
        }
        else {
          const newRating = await this.ratingProvider.provider.getRating(userScreenName, originalPerformance);
          return { type: "rated", oldRating, performance: positivizedPerformance, newRating };
        }
      }
      else {
        return { type: "unrated", oldRating, performance: positivizedPerformance };
      }
    });
    await this.updateData();
    this.standingsTableView.update();
  }

  private async updateData() {
    if (!this.contestDetails) throw new Error("contestDetails missing");

    const standings = await getStandings(this.contestDetails.contestScreenName);

    let basePerformanceProvider: PerformanceProvider | undefined = undefined;
    if (standings.data.Fixed && getConfig("useResults")) {
      try {
        const results = await getResults(this.contestDetails.contestScreenName);
        basePerformanceProvider = new FixedPerformanceProvider(results.toPerformanceMaps());
        
        this.isRatedMaps = results.toIsRatedMaps();
        this.oldRatings = results.toOldRatingMaps();
        
        this.ratingProvider = { provider: new ConstRatingProvider(results.toNewRatingMaps()), lazy: false };
      }
      catch(e) {
        console.warn("getResults failed", e);
      }
    }
    if (basePerformanceProvider === undefined) {
      const aperfsDict = await getAPerfs(this.contestDetails.contestScreenName);
      const defaultAPerf = this.contestDetails.defaultAPerf;
      const normalizedRanks = normalizeRank(standings.toRanks(true));
      const aperfsList = standings.toRatedUsers().map(user => aperfsDict[user] ?? defaultAPerf);
      basePerformanceProvider = new EloPerformanceProvider(normalizedRanks, aperfsList, this.contestDetails.performanceCap);

      this.isRatedMaps = standings.toIsRatedMaps();
      this.oldRatings = standings.toOldRatingMaps();

      if (this.contestDetails.contestType == "algorithm") {
        this.ratingProvider = { provider: new IncrementalAlgRatingProvider(standings.toOldRatingMaps(true), standings.toCompetitionMaps()), lazy: false }
      }
      else {
        this.ratingProvider = {
          provider: new FromHistoryHeuristicRatingProvider(async userScreenName => {
            const histories = await getHistory(userScreenName, "heuristic");
            histories.data = histories.data.filter(x => new Date(x.EndTime) < this.contestDetails!.endTime);
            return histories.toPerformances();
          }),
          lazy: true
        }
      }
    }
    
    this.performanceProvider = new InterpolatePerformanceProvider(standings.toRanks(), basePerformanceProvider);
  }
}
