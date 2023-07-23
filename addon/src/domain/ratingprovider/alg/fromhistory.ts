import { calcAlgRatingFromHistory, positivizeRating } from "../../rating";
import RatingProvider from "../ratingprovider";

type Result = { performance: number, date: Date };

class FromHistoryAlgRatingProvider implements RatingProvider {
  private resultProvider: (userScreenName: string) => Result[];
  constructor(resultProvider: (userScreenName: string) => Result[]) {
    this.resultProvider = resultProvider;
  }
  availableFor(userScreenName: string): boolean {
    return true;
  }
  async getRating(userScreenName: string, newPerformance: number): Promise<number> {
    const results = this.resultProvider(userScreenName);
    const sortedPerformances = results.sort((a, b) => a.date.getTime() - b.date.getTime()).map((x) => x.performance);
    sortedPerformances.push(newPerformance)
    return Math.round(positivizeRating(calcAlgRatingFromHistory(sortedPerformances)));
  }
}

export default FromHistoryAlgRatingProvider;
