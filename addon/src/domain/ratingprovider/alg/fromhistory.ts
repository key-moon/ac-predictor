import { calcAlgRatingFromHistory } from "../../rating";
import RatingProvider from "../ratingprovider";

type Result = { performance: number, date: Date };

class FromHistoryAlgRatingProvider implements RatingProvider {
  private results: Result[];
  constructor(results: Result[]) {
    this.results = results;
  }

  getRating(newPerformance: number): number {
    const sortedPerformances = this.results.sort((a, b) => a.date.getTime() - b.date.getTime()).map((x) => x.performance);
    sortedPerformances.push(newPerformance)
    return Math.round(calcAlgRatingFromHistory(sortedPerformances));
  }
}

export default FromHistoryAlgRatingProvider;
