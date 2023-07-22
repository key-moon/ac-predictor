import hasOwnProperty from "../../../util/hasOwnProperty";
import RatingProvider from "../ratingprovider";

type Result = { performance: number, date: Date };

class FromHistoryHeuristicRatingProvider implements RatingProvider {
  private results: Result[];
  constructor(results: Result[]) {
    this.results = results;
  }

  getRating(newPerformance: number): number {
    // TODO: implement
    throw new Error("not implemented yet");
  }
}

export default FromHistoryHeuristicRatingProvider;
