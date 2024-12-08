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
    if (this.contestType == "heuristic") return 1000;

    if (!this.ratedrange.hasValue()) {
      throw new Error("unrated contest");
    }

    if (this.ratedrange.end == 1199) return 800;
    if (this.ratedrange.end == 1999) return 800;
    if (this.ratedrange.end == 2399) return 800; // value is not relevant as it is never used

    const DEFAULT_CHANGED_AT = new Date("2019-05-25"); // maybe wrong
    if (this.ratedrange.end == 2799) {
      if (this.startTime < DEFAULT_CHANGED_AT) return 1600;
      else return 1000;
    }
    if (4000 <= this.ratedrange.end) {
      if (this.startTime < DEFAULT_CHANGED_AT) return 1600;
      else return 1200;
    }

    throw new Error("unknown contest type");
  }

  public get performanceCap(): number {
    if (this.contestType == "heuristic") return Infinity;

    if (!this.ratedrange.hasValue()) {
      throw new Error("unrated contest");
    }

    if (this.ratedrange.end % 400 != 399) {
      throw new Error("unknown contest type");
    }

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
