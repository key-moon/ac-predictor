import { calcAlgRatingFromLast, positivizeRating } from "../../rating";
import RatingProvider from "../ratingprovider";

class IncrementalAlgRatingProvider implements RatingProvider {
  private rating: number;
  private competitions: number;
  constructor(unpositivizedRating: number, competitions: number) {
    this.rating = unpositivizedRating;
    this.competitions = competitions;
  }

  getRating(newPerformance: number): number {
    return Math.round(positivizeRating(calcAlgRatingFromLast(this.rating, newPerformance, this.competitions)));
  }
}

export default IncrementalAlgRatingProvider;
