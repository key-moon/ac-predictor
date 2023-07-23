import { calcAlgRatingFromLast, positivizeRating } from "../../rating";
import RatingProvider from "../ratingprovider";

class IncrementalAlgRatingProvider implements RatingProvider {
  private unpositivizedRatingMap: Map<string, number>;
  private competitionsMap: Map<string, number>;
  constructor(unpositivizedRatingMap: Map<string, number>, competitionsMap: Map<string, number>) {
    this.unpositivizedRatingMap = unpositivizedRatingMap;
    this.competitionsMap = competitionsMap;
  }

  availableFor(userScreenName: string): boolean {
    return this.unpositivizedRatingMap.has(userScreenName);
  }

  async getRating(userScreenName: string, newPerformance: number): Promise<number> {
    if (!this.availableFor(userScreenName)) {
      throw new Error(`rating not available for ${userScreenName}`);
    }
    const rating = this.unpositivizedRatingMap.get(userScreenName)!;
    const competitions = this.competitionsMap.get(userScreenName)!;
    return Math.round(positivizeRating(calcAlgRatingFromLast(rating, newPerformance, competitions)));
  }
}

export default IncrementalAlgRatingProvider;
