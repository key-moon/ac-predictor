import PerformanceProvider from "./performanceprovider";

class FixedPerformanceProvider implements PerformanceProvider {
  result: Map<string, number>;
  constructor(result: Map<string, number>) {
    this.result = result;
  }
  
  availableFor(userScreenName: string): boolean {
    return this.result.has(userScreenName);
  }

  getPerformance(userScreenName: string): number {
    if (!this.availableFor(userScreenName)){
      throw new Error(`User ${userScreenName} not found`);
    }

    return this.result.get(userScreenName)!;
  }

  getPerformances(): Map<string, number> {
    return this.result;
  }
}

export default FixedPerformanceProvider
