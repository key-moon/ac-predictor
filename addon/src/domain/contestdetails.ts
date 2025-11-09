import Range from "../util/range";

export default class ContestDetails {
  contestName: string
  contestScreenName: string
  contestType: "algorithm" | "heuristic"
  startTime: Date
  duration: number
  ratedrange: Range
  
  constructor(contestName: string, contestScreenName: string, contestType: "algorithm" | "heuristic", startTime: Date, duration: number, ratedRange: Range) {
    this.contestName = contestName;
    this.contestScreenName = contestScreenName;
    this.contestType = contestType;
    this.startTime = startTime;
    this.duration = duration;
    this.ratedrange = ratedRange;
  }

  public get endTime(): Date {
    return new Date(this.startTime.getTime() + this.duration * 1000);
  }
  
  public get defaultAPerf(): number {
    if (this.contestType == "heuristic") {
      return 1000;
    }
    else { // algo
      if (!this.ratedrange.hasValue()) {
        throw new Error("unrated contest");
      }
      if (!this.ratedrange.contains(0)) {
        return 0; // value is not relevant as it is never used
      }

      // ref: https://atcoder.jp/posts/1591
      const DEFAULT_CHANGED_TO_1200 = new Date("2025-11-01");
      if (DEFAULT_CHANGED_TO_1200 < this.startTime) {
        return 1200;
      }
      // TODO: find default value; it should have changed when the new ABC was introduced
      // const FIRST_DEFAULT_CHANGES = new Date("2019-05-25");
      // if (FIRST_DEFAULT_CHANGES < this.startTime) { ... }

      // ref: AtCoder Rating System ver. 1.00
      // APerf of newcomers are set to Center, where Center = 1200 for AGC,
      // Center = 1000 for ARC and Center = 800 for ABC
      // old ABC
      if (this.ratedrange.end == 1199) {
        return 800;
      }
      // new ABC
      if (this.ratedrange.end == 1999) {
        return 800;
      }
      // ARC
      if (this.ratedrange.end == 2799) {
        return 1000;
      }
      // AGC
      return 1200;
    }
    throw new Error("unknown contest type");
  }

  public get performanceCap(): number {
    if (this.contestType == "heuristic") return Infinity;

    if (!this.ratedrange.hasValue()) {
      throw new Error("unrated contest");
    }
    
    if (4000 <= this.ratedrange.end) return Infinity;
    return this.ratedrange.end + 1 + 400;
  }

  public beforeContest(dateTime: Date) {
    return dateTime < this.startTime;
  }

  public duringContest(dateTime: Date) {
    return this.startTime < dateTime && dateTime < this.endTime;
  }

  public isOver(dateTime: Date) {
    return this.endTime < dateTime;
  }
}
