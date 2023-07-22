import RatingProvider from "./ratingprovider";

class ConstRatingProvider implements RatingProvider {
  private performance: number;
  private rating: number;
  constructor(performance: number, rating: number) {
    this.performance = performance;
    this.rating = rating;
  }
  getRating(newPerformance: number): number {
    if (this.performance != newPerformance) {
      throw new Error("unexpected performance");
    }
    return this.rating;
  }
}

export default ConstRatingProvider
