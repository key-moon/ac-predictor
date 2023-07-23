import { calcHeuristicRatingFromHistory, positivizeRating } from "../../rating";
import RatingProvider from "../ratingprovider";

class FromHistoryHeuristicRatingProvider implements RatingProvider {
  private performancesProvider: (userScreenName: string) => Promise<number[]>;
  constructor(performancesProvider: (userScreenName: string) => Promise<number[]>) {
    this.performancesProvider = performancesProvider;
  }
  availableFor(userScreenName: string): boolean {
    return true;
  }
  async getRating(userScreenName: string, newPerformance: number): Promise<number> {
    const performances = await this.performancesProvider(userScreenName);
    performances.push(newPerformance);
    return Math.round(positivizeRating(calcHeuristicRatingFromHistory(performances)));
  }
}

export default FromHistoryHeuristicRatingProvider;
