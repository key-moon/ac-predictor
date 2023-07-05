interface PerformanceProvider {
  availableFor(userScreenName: string): boolean;
  getPerformance(userScreenName: string): number;
  getPerformances(): { [userScreenName: string]: number };
}

export default PerformanceProvider
