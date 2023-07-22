import toSignedString from "../util/toSignedString";
import getRatingSpan from "./components/ratingspan";
import getSpan from "./components/span";

type RatedResultData = { type: "rated", performance: number, oldRating: number, newRating: number };
type ErrorResultData = { type: "error", message: string };
type UnratedResultData = { type: "unrated", performance: number, oldRating: number };
type DefferedResultData = { type: "deffered", performance: number, oldRating: number, newRatingCalculator: () => Promise<number> };

type NonErrorResultData = RatedResultData | UnratedResultData | DefferedResultData;
type ResultData = NonErrorResultData | ErrorResultData;

type ResultDataProvider = (userScreenName: string) => ResultData;

function getFadedSpan(innerElements: (string | HTMLElement)[]) {
  return getSpan(innerElements, ["grey"]);
}

function getRatedRatingElem(result: RatedResultData): HTMLElement {
  const elem = document.createElement("div");
  elem.append(
    getRatingSpan(result.oldRating),
    " → ",
    getRatingSpan(result.newRating),
    " ",
    getFadedSpan([`(${toSignedString(result.newRating - result.oldRating)})`])
  );
  return elem;
}

function getUnratedRatingElem(result: UnratedResultData): HTMLElement {
  const elem = document.createElement("div");
  elem.append(
    getRatingSpan(result.oldRating),
    " ",
    getFadedSpan(["(unrated)"])
  );
  return elem;
}

function getDefferedRatingElem(result: DefferedResultData): HTMLElement {
  const elem = document.createElement("div");
  elem.append(
    getRatingSpan(result.oldRating),
    " ",
    getFadedSpan(["(click to calculate)"])
  );
  
  async function listener() {
    elem.removeEventListener("click", listener);
    elem.replaceChildren(getFadedSpan(["loading..."]));
    let newRating;
    try {
      newRating = await result.newRatingCalculator();
    }
    catch(e) {
      elem.replaceChildren(getSpan(["error on load"], []), " ", getSpan(["(hover to see details)"], []), getSpan([Object.prototype.toString.call(e)], ["tooltiptext"]));
      elem.classList.add("tooltip");
      return;
    }
    const newElem = getRatedRatingElem({ type: "rated", performance: result.performance, oldRating: result.oldRating, newRating: newRating });
    elem.replaceChildren(newElem);
  }

  elem.addEventListener("click", listener);
  return elem;
}

function getErrorRatingElem(result: ErrorResultData): HTMLElement {
  const elem = document.createElement("div");
  elem.append(getSpan(["error on load"], []), " ", getSpan(["(hover to see details)"], []), getSpan([result.message], ["tooltiptext"]));
  elem.classList.add("tooltip");
  return elem;
}

function getRatingElem(result: ResultData) {
  if (result.type == "rated") return getRatedRatingElem(result);
  if (result.type == "unrated") return getUnratedRatingElem(result);
  if (result.type == "deffered") return getDefferedRatingElem(result);
  if (result.type == "error") return getErrorRatingElem(result);
  throw new Error("unreachable");
}

function getPerfElem(result: ResultData) {
  if (result.type == "error") return getSpan(["-"], []);
  return getRatingSpan(result.performance);
}

function modifyHeader(header: HTMLElement) {
  header.insertAdjacentHTML(
    "beforeend",
    '<th class="ac-predictor-standings-elem" style="width:84px;min-width:84px;">perf</th><th class="ac-predictor-standings-elem" style="width:168px;min-width:168px;">レート変化</th>'
  );
}
function isFooter(row: HTMLElement) {
  return row.firstElementChild?.classList.contains("colspan");
}
function modifyStandingsRow(row: HTMLElement, results: ResultDataProvider) {
  const userScreenName = row.querySelector(".standings-username .username span")?.textContent;

  const perfCell = document.createElement("td"); 
  perfCell.classList.add("ac-predictor-standings-elem");
  const ratingCell = document.createElement("td"); 
  ratingCell.classList.add("ac-predictor-standings-elem");

  
  if (userScreenName === null || userScreenName === undefined) {
    console.warn(`user ${userScreenName} not found`);
    perfCell.append("-");
    ratingCell.append("-");    
  }
  else {
    const result = results(userScreenName);
    perfCell.append(getPerfElem(result));
    ratingCell.append(getRatingElem(result));
  }  

  row.insertAdjacentElement("beforeend", perfCell);
  row.insertAdjacentElement("beforeend", ratingCell);
}
function modifyFooter(footer: HTMLElement) {
  footer.insertAdjacentHTML(
    "beforeend",
    '<td class="ac-predictor-standings-elem" colspan="2">-</td>'
  );
}

class StandingsTableView {
  private element: HTMLTableElement;
  private provider: ResultDataProvider;
  constructor(element: HTMLTableElement, resultDataProvider: ResultDataProvider) {
    this.element = element;
    this.provider = resultDataProvider;
    this.initHandler();
  }
  update(): void {
    this.removeOldElement();
    
    const header = this.element.querySelector<HTMLElement>("thead tr");
    if (!header) console.warn("header element not found", this.element);
    else modifyHeader(header);
  
    this.element.querySelectorAll<HTMLElement>("tbody tr").forEach((row) => {
      if (isFooter(row)) modifyFooter(row);
      else modifyStandingsRow(row, this.provider);
    });
  }
  private removeOldElement(): void {
    this.element.querySelectorAll(".ac-predictor-standings-elem").forEach((elem) => elem.remove());
  }
  private initHandler() {
    new MutationObserver(this.update).observe(this.element.tBodies[0], {
      childList: true,
    });
  }

  static Get(resultDataProvider: ResultDataProvider) {
    const tableElem = document.querySelector(".table-responsive table") as HTMLTableElement;
    return new StandingsTableView(tableElem, resultDataProvider);
  }
}

export default StandingsTableView;
