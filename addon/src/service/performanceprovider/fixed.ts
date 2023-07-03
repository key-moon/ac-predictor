import hasOwnProperty from "../../util/hasOwnProperty";
import PerformanceProvider from "./performancepredictor";

type Result = { [userScreenName: string]: number };

class FixedPerformanceProvider implements PerformanceProvider {
  result: Result
  constructor(result: Result) {
    this.result = result;
  }

  getPerformance(userScreenName: string): number {
    if (!hasOwnProperty(this.result, userScreenName)){
      throw new Error(`User ${userScreenName} not found`);
    }

    const result = this.result[userScreenName];
    return result;
  }

  getPerformances(): { [userScreenName: string]: number } {
    return this.result;
  }
}

export default FixedPerformanceProvider
