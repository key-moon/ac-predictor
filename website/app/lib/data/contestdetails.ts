import Range from "../range";

export class ContestDetails {
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

    if (4000 <= this.ratedrange.end) return Infinity;

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

  public toSerializable() {
    return {
      contestName: this.contestName,
      contestScreenName: this.contestScreenName,
      contestType: this.contestType,
      startTime: this.startTime.getTime() / 1000,
      duration: this.duration,
      ratedrange: [this.ratedrange.start, this.ratedrange.end],
    };
  }

  public static fromSerialiable(data: any) {
    if (typeof data !== "object") throw new Error("invalid object returned");
    if (typeof data.contestName !== "string") throw new Error("invalid object returned");
    const contestName: string = data.contestName;
    if (typeof data.contestScreenName !== "string") throw new Error("invalid object returned");
    const contestScreenName: string = data.contestScreenName;
    if (data.contestType !== "algorithm" && data.contestType !== "heuristic") throw new Error("invalid object returned");
    const contestType: "algorithm" | "heuristic" = data.contestType;
    if (typeof data.startTime !== "number") throw new Error("invalid object returned");
    const startTime: Date = new Date(data.startTime * 1000);
    if (typeof data.duration !== "number") throw new Error("invalid object returned");
    const duration: number = data.duration;
    if (typeof data.ratedrange !== "object" || typeof data.ratedrange[0] !== "number" || typeof data.ratedrange[1] !== "number") throw new Error("invalid object returned");
    const ratedRange: Range = new Range(data.ratedrange[0], data.ratedrange[1]);
    return new ContestDetails(contestName, contestScreenName, contestType, startTime, duration, ratedRange);
  }
}

export async function getContestDetails(): Promise<ContestDetails[]> {
  const result = await fetch(`https://data.ac-predictor.com/contest-details.json`);
  if (!result.ok) {
    throw new Error(`Failed to fetch contest details: ${result.status}`);
  }
  const parsed = await result.json();

  if (!Array.isArray(parsed)) throw new Error("invalid object returned");
  return parsed.map(data => ContestDetails.fromSerialiable(data));
}
