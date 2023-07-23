import RatingProvider from "./ratingprovider";

class ConstRatingProvider implements RatingProvider {
  private ratings: Map<string, number>;
  constructor(ratings: Map<string, number>) {
    this.ratings = ratings;
  }
  availableFor(userScreenName: string): boolean {
    return this.ratings.has(userScreenName);
  }
  async getRating(userScreenName: string, newPerformance: number): Promise<number> {
    if (!this.availableFor(userScreenName)) {
      throw new Error(`rating not available for ${userScreenName}`);
    }
    return this.ratings.get(userScreenName)!;
  }
}

export default ConstRatingProvider;
