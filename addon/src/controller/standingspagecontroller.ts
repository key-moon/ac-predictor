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
import { positivizeRating, unpositivizeRating } from "../domain/rating";
import IncrementalAlgRatingProvider from "../domain/ratingprovider/alg/incremental";
import ConstRatingProvider from "../domain/ratingprovider/const";
import FromHistoryHeuristicRatingProvider from "../domain/ratingprovider/heuristic/fromhistory";
import RatingProvider from "../domain/ratingprovider/ratingprovider";
import getContestScreenName from "../parse/contestScreenName";
import hasOwnProperty from "../util/hasOwnProperty";
import StandingsTableView from "../view/standingstable";

type RatingProviderInfo = { provider: RatingProvider, lazy: false } | { providerGenerator: () => Promise<RatingProvider>, lazy: true }

export default class StandingsPageController {
  contestDetails?: ContestDetails;

  performanceProvider?: PerformanceProvider;
  ratingProviders: { [userScreenName: string]: RatingProviderInfo } = {};
  oldRatings: { [userScreenName: string]: number } = {}; 
  isRatedMaps: { [userScreenName: string]: boolean } = {};

  standingsTableView?: StandingsTableView;

  public async register() {
    const loaded = () => !!document.getElementById("standings-tbody");
    if (loaded()) {
      this.initialize();
      return;
    }
    const loadingElem = document.querySelector("#vue-standings .loading-show");
    if (!loadingElem) {
      throw new Error("loading elem not found");
    }
    new MutationObserver(() => {
      if (loaded()) this.initialize();
    }).observe(loadingElem, { attributes: true });
  }

  private async initialize() {
    const contestScreenName = getContestScreenName();

    const contestDetailsList = await getContestDetailsList();    
    const contestDetails = contestDetailsList.find(details => details.contestScreenName == contestScreenName);
    if (contestDetails === undefined) {
      throw new Error("contest details not found");
    }
    this.contestDetails = contestDetails;

    this.standingsTableView = StandingsTableView.Get(userScreenName => {
      if (!this.ratingProviders) return { "type": "error", "message": "ratingProviders missing" };
      if (!this.performanceProvider) return { "type": "error", "message": "performanceProvider missing" };
      if (!this.isRatedMaps) return { "type": "error", "message": "isRatedMapping missing" };
      if (!this.oldRatings) return { "type": "error", "message": "oldRatings missing" };
      if (!hasOwnProperty(this.oldRatings, userScreenName)) return { "type": "error", "message": `oldRating not found for ${userScreenName}` };

      const oldRating = this.oldRatings[userScreenName];

      if (!this.performanceProvider.availableFor(userScreenName)) return { "type": "error", "message": "performance not available" };

      const originalPerformance = this.performanceProvider.getPerformance(userScreenName);
      const positivizedPerformance = Math.round(positivizeRating(originalPerformance));
      if (this.isRatedMaps[userScreenName]) {
        if (!hasOwnProperty(this.ratingProviders, userScreenName)) return { "type": "error", "message": `ratingProvider not found for ${userScreenName}` };
        const ratingProvider = this.ratingProviders[userScreenName];
        if (ratingProvider.lazy) {
          const newRatingCalculator = async () => (await ratingProvider.providerGenerator()).getRating(originalPerformance);
          return { type: "deffered", oldRating, performance: positivizedPerformance, newRatingCalculator };
        }
        else {
          const newRating = ratingProvider.provider.getRating(originalPerformance);
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
    this.ratingProviders = {};
    if (standings.data.Fixed) {
      try {
        const results = await getResults(this.contestDetails.contestScreenName);
        basePerformanceProvider = new FixedPerformanceProvider(results.toPerformances());
        
        this.isRatedMaps = results.toIsRatedMaps();
        this.oldRatings = results.toOldRatings();

        for (const result of results.data) {
          if (result.IsRated) {
            const provider = new ConstRatingProvider(result.Performance, result.NewRating);
            this.ratingProviders[result.UserScreenName] = { provider, lazy: false };
          }
        }
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
      this.oldRatings = standings.toOldRatings();

      for (const standingsData of standings.data.StandingsData) {
        if (this.contestDetails.contestType == "algorithm") {
          const provider = new IncrementalAlgRatingProvider(unpositivizeRating(standingsData.Rating), standingsData.Competitions);
          this.ratingProviders[standingsData.UserScreenName] = { provider, lazy: false }
        }
        else {
          for (const standingsData of standings.data.StandingsData) {
            this.ratingProviders[standingsData.UserScreenName] = {
              providerGenerator: async () => {
                const histories = await getHistory(standingsData.UserScreenName);
                return new FromHistoryHeuristicRatingProvider(histories.toPerformances());
              },
              lazy: true
            }
          }
        }
      }
    }
    
    this.performanceProvider = new InterpolatePerformanceProvider(standings.toRanks(), basePerformanceProvider);
  }
}
