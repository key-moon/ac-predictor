interface PerformanceProvider {
  availableFor(userScreenName: string): boolean;
  getPerformance(userScreenName: string): number;
  getPerformances(): Map<string, number>;
}

export default PerformanceProvider
