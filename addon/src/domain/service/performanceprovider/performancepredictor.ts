interface PerformanceProvider {
  getPerformance(userScreenName: string): number;
  getPerformances(): { [userScreenName: string]: number };
}

export default PerformanceProvider
