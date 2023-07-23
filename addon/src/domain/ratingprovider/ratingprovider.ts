interface RatingProvider {
  availableFor(userScreenName: string): boolean;
 getRating(userScreenName: string, newPerformance: number): Promise<number>;
}

export default RatingProvider;
