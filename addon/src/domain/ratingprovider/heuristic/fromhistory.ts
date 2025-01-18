import { RatingMaterial } from "../../../data/history";
import { calcHeuristicRatingFromHistory, positivizeRating } from "../../rating";
import RatingProvider from "../ratingprovider";

class FromHistoryHeuristicRatingProvider implements RatingProvider {
  private newWeight: number;
  private performancesProvider: (userScreenName: string) => Promise<RatingMaterial[]>;
  constructor(newWeight: number, performancesProvider: (userScreenName: string) => Promise<RatingMaterial[]>) {
    this.newWeight = newWeight;
    this.performancesProvider = performancesProvider;
  }
  availableFor(userScreenName: string): boolean {
    return true;
  }
  async getRating(userScreenName: string, newPerformance: number): Promise<number> {
    const performances = await this.performancesProvider(userScreenName);
    performances.push({
      Performance: newPerformance,
      Weight: this.newWeight,
      DaysFromLatestContest: 0,
    });
    return Math.round(positivizeRating(calcHeuristicRatingFromHistory(performances)));
  }
}

export default FromHistoryHeuristicRatingProvider;
