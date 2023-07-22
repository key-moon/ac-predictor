import { calcAlgRatingFromLast } from "../../rating";
import RatingProvider from "../ratingprovider";

class IncrementalAlgRatingProvider implements RatingProvider {
  private rating: number;
  private competitions: number;
  constructor(rating: number, competitions: number) {
    this.rating = rating;
    this.competitions = competitions;
  }

  getRating(newPerformance: number): number {
    return calcAlgRatingFromLast(this.rating, newPerformance, this.competitions);    
  }
}

export default IncrementalAlgRatingProvider;
