import Range from "../util/range";

export default class ContestDetails {
  contestName: string
  contestScreenName: string
  contestType: "algorithm" | "heuristic"
  startTime: Date
  duration: number
  ratedRange: Range
  
  constructor(contestName: string, contestScreenName: string, contestType: "algorithm" | "heuristic", startTime: Date, duration: number, ratedRange: Range) {
    this.contestName = contestName;
    this.contestScreenName = contestScreenName;
    this.contestType = contestType;
    this.startTime = startTime;
    this.duration = duration;
    this.ratedRange = ratedRange;
  }

  public get endTime(): Date {
    return new Date(this.startTime.getTime() + this.duration * 1000);
  }
  
  public get defaultAPerf(): number {
    if (this.contestType == "heuristic") return 1000;

    if (!this.ratedRange.hasValue()) {
      throw new Error("unrated contest");
    }

    if (this.ratedRange.end == 2000) return 800;
    if (this.ratedRange.end == 2800) return 1000;
    if (4000 <= this.ratedRange.end) return 1200;

    throw new Error("unknown contest type");
  }

  public isOver(dateTime: Date) {
    return this.endTime < dateTime;
  }
}
