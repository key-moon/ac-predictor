import { getTranslation } from "../i18n/i18n";
import isDebugMode from "../util/isdebugmode";
import toSignedString from "../util/toSignedString";
import addStyle from "./addstyle";
import getRatingSpan from "./components/ratingspan";
import getSpan from "./components/span";
import style from "./standingstable.scss"

addStyle(style);

type RatedResultData = { type: "rated", performance: number, oldRating: number, newRating: number };
type ErrorResultData = { type: "error", message: string };
type PerfOnlyResultData = { type: "perfonly", performance: number };
type UnratedResultData = { type: "unrated", performance: number, oldRating: number };
type DefferedResultData = { type: "deffered", performance: number, oldRating: number, newRatingCalculator: () => Promise<number> };

type NonErrorResultData = RatedResultData | UnratedResultData | DefferedResultData | PerfOnlyResultData;
type ResultData = NonErrorResultData | ErrorResultData;

type ResultDataProvider = (userScreenName: string) => Promise<ResultData>;

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
    " → ",
    getSpan(["???"], ["bold"]),
    document.createElement("br"),
    getFadedSpan([`(${getTranslation("standings_click_to_compute_label")})`])
  );
  
  async function listener() {
    elem.removeEventListener("click", listener);
    elem.replaceChildren(getFadedSpan(["loading..."]));
    let newRating;
    try {
      newRating = await result.newRatingCalculator();
    }
    catch(e) {
      elem.append(getSpan(["error on load"], []), document.createElement("br"), getSpan(["(hover to see details)"], ["grey", "small"]), getSpan([e!.toString()], ["my-tooltiptext"]));
      elem.classList.add("my-tooltip");
      return;
    }
    const newElem = getRatedRatingElem({ type: "rated", performance: result.performance, oldRating: result.oldRating, newRating: newRating });
    elem.replaceChildren(newElem);
  }

  elem.addEventListener("click", listener);
  return elem;
}

function getPerfOnlyRatingElem(result: PerfOnlyResultData): HTMLElement {
  const elem = document.createElement("div");
  elem.append(
    getFadedSpan([`(${getTranslation("standings_not_provided_label")})`])
  );
  return elem;
}

function getErrorRatingElem(result: ErrorResultData): HTMLElement {
  const elem = document.createElement("div");
  elem.append(getSpan(["error on load"], []), document.createElement("br"), getSpan(["(hover to see details)"], ["grey", "small"]), getSpan([result.message], ["my-tooltiptext"]));
  elem.classList.add("my-tooltip");
  return elem;
}

function getRatingElem(result: ResultData) {
  if (result.type == "rated") return getRatedRatingElem(result);
  if (result.type == "unrated") return getUnratedRatingElem(result);
  if (result.type == "deffered") return getDefferedRatingElem(result);
  if (result.type == "perfonly") return getPerfOnlyRatingElem(result);
  if (result.type == "error") return getErrorRatingElem(result);
  throw new Error("unreachable");
}

function getPerfElem(result: ResultData) {
  if (result.type == "error") return getSpan(["-"], []);
  return getRatingSpan(result.performance);
}

const headerHtml = `<th class="ac-predictor-standings-elem" style="width:84px;min-width:84px;">${getTranslation("standings_performance_column_label")}</th><th class="ac-predictor-standings-elem" style="width:168px;min-width:168px;">${getTranslation("standings_rate_change_column_label")}</th>`;
function modifyHeader(header: HTMLElement) {
  header.insertAdjacentHTML(
    "beforeend",
    headerHtml
  );
}
function isFooter(row: HTMLElement) {
  return row.firstElementChild?.classList.contains("colspan");
}
async function modifyStandingsRow(row: HTMLElement, results: ResultDataProvider) {
  let userScreenName: string | null = row.querySelector(".standings-username .username span")?.textContent ?? null;
  if (userScreenName !== null && row.querySelector(".standings-username .username img[src='//img.atcoder.jp/assets/icon/ghost.svg']")) {
    userScreenName = `ghost:${userScreenName}`;
  }

  const perfCell = document.createElement("td"); 
  perfCell.classList.add("ac-predictor-standings-elem", "standings-result");
  const ratingCell = document.createElement("td"); 
  ratingCell.classList.add("ac-predictor-standings-elem", "standings-result");

  
  if (userScreenName === null) {
    perfCell.append("-");
    ratingCell.append("-");    
  }
  else {
    const result = await results(userScreenName);
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
  private refreshHooks: (() => void)[] = [];
  constructor(element: HTMLTableElement, resultDataProvider: ResultDataProvider) {
    this.element = element;
    this.provider = resultDataProvider;
    this.initHandler();
  }
  onRefreshed(hook: () => void): void {
    this.refreshHooks.push(hook);
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
    new MutationObserver(() => this.update()).observe(this.element.tBodies[0], {
      childList: true,
    });

    const statsRow = this.element.querySelector(".standings-statistics");
    if (statsRow === null) {
      throw new Error("statsRow not found");
    }

    const acElems = statsRow.querySelectorAll(".standings-ac")

    const refreshObserver = new MutationObserver((records) => {
      if (isDebugMode()) console.log("fire refreshHooks", records);
      this.refreshHooks.forEach(f => f());
    });

    acElems.forEach(elem => refreshObserver.observe(elem, { childList: true }));
  }

  static Get(resultDataProvider: ResultDataProvider) {
    const tableElem = document.querySelector(".table-responsive table") as HTMLTableElement;
    return new StandingsTableView(tableElem, resultDataProvider);
  }
}

export default StandingsTableView;
