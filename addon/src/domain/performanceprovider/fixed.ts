import hasOwnProperty from "../../util/hasOwnProperty";
import PerformanceProvider from "./performanceprovider";

type Result = { [userScreenName: string]: number };

class FixedPerformanceProvider implements PerformanceProvider {
  result: Result
  constructor(result: Result) {
    this.result = result;
  }
  
  availableFor(userScreenName: string): boolean {
    return hasOwnProperty(this.result, userScreenName);
  }

  getPerformance(userScreenName: string): number {
    if (!this.availableFor(userScreenName)){
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
