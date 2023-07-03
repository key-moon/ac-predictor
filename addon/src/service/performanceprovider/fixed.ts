import PerformanceProvider from "./performancepredictor";

type Result = { [userScreenName: string]: number };

class FixedPerformanceProvider implements PerformanceProvider {
  result: Result
  constructor(result: Result) {
    this.result = result;
  }

  getPerformance(userScreenName: string): number {
    const result = this.result[userScreenName];

    if (result === undefined) {
      throw new Error(`User ${userScreenName} not found`);
    }

    return result;
  }

  getPerformances(): { [userScreenName: string]: number } {
    return this.result;
  }
}

export default FixedPerformanceProvider
