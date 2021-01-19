import * as fs from "fs";
import { dataDir } from "./data";
import { Result } from "../../src/libs/contest/results/result";
import { ContestInformation } from "../../src/libs/utils/data";

export const standingsPath = dataDir + "/wtf19_standings.json";
export const resultsPath = dataDir + "/wtf19_results.json";
export const aperfsPath = dataDir + "/wtf19_aperfs.json";
export const infoPath = dataDir + "/wtf19_info.html";

const standingsJson = fs.readFileSync(standingsPath).toString();
const resultsJson = fs.readFileSync(resultsPath).toString();
const aperfsJson = fs.readFileSync(aperfsPath).toString();

export const standings = JSON.parse(standingsJson) as Standings;
export const results = JSON.parse(resultsJson) as Result[];
export const aperfs = JSON.parse(aperfsJson) as { [key: string]: number };
export const contestInformation = new ContestInformation([0, -1], [0, Infinity], 5 * 60 * 1000);
