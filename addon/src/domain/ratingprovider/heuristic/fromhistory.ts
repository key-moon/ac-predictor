import { calcHeuristicRatingFromHistory } from "../../rating";
import RatingProvider from "../ratingprovider";

class FromHistoryHeuristicRatingProvider implements RatingProvider {
  private performances: number[];
  constructor(results: number[]) {
    this.performances = results;
  }

  getRating(newPerformance: number): number {
    const performances = [...this.performances, newPerformance];
    return Math.round(calcHeuristicRatingFromHistory(performances));
  }
}

export default FromHistoryHeuristicRatingProvider;
