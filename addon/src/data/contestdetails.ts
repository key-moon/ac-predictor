import Range from "../util/range";
import ContestDetails from "../domain/contestdetails";

export default async function getContestDetails(): Promise<ContestDetails[]> {
  const result = await fetch(`https://data.ac-predictor.com/contest-details.json`);
  if (!result.ok) {
    throw new Error(`Failed to fetch contest details: ${result.status}`);
  }
  const parsed = await result.json();

  const res: ContestDetails[] = [];
  for (const elem of parsed) {
    if (typeof elem !== "object") throw new Error("invalid object returned");
    if (typeof elem.contestName !== "string") throw new Error("invalid object returned");
    const contestName: string = elem.contestName;
    if (typeof elem.contestScreenName !== "string") throw new Error("invalid object returned");
    const contestScreenName: string = elem.contestScreenName;
    if (elem.contestType !== "algorithm" && elem.contestType !== "heuristic") throw new Error("invalid object returned");
    const contestType: "algorithm" | "heuristic" = elem.contestType;
    if (typeof elem.startTime !== "number") throw new Error("invalid object returned");
    const startTime: Date = new Date(elem.startTime);
    if (typeof elem.duration !== "number") throw new Error("invalid object returned");
    const duration: number = elem.duration;
    if (typeof elem.ratedrange !== "object" || typeof elem.ratedrange[0] !== "number" || typeof elem.ratedrange[1] !== "number") throw new Error("invalid object returned");
    const ratedRange: Range = new Range(elem.ratedrange[0], elem.ratedrange[1]);
    res.push(new ContestDetails(contestName, contestScreenName, contestType, startTime, duration, ratedRange));
  }
  return res;
}
