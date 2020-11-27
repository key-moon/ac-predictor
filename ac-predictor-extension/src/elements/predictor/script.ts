import dom from "./dom.html";
import { Contest } from "../../libs/contest/contest";
import { OnDemandResults } from "../../libs/contest/results/standingsResults";
import { FixedResults } from "../../libs/contest/results/fIxedResults";
import { Result } from "../../libs/contest/results/result";
import { PredictorModel } from "./model/PredictorModel";
import { CalcFromRankModel } from "./model/calcFromRankModel";
import { CalcFromPerfModel } from "./model/calcFromPerfModel";
import { CalcFromRateModel } from "./model/calcFromRateModel";
import { roundValue } from "../../libs/utils/roundValue";
import {
    getAPerfsDataAsync,
    getMyHistoryData,
    getPerformanceHistories,
    getResultsDataAsync,
    getStandingsDataAsync,
    getContestInformationAsync
} from "../../libs/utils/data";
import { getColor, positivizeRating } from "../../libs/utils/rating";
import { Results } from "../../libs/contest/results/results";
import { SideMenuElement } from "../../libs/sidemenu/element";
import { contestScreenName, startTime, userScreenName } from "../../libs/utils/global";

export const predictor = new SideMenuElement("predictor", "Predictor", /atcoder.jp\/contests\/.+/, dom, afterAppend);

const firstContestDate = new Date(2016, 6, 16, 21);
const predictorElements = [
    "predictor-input-rank",
    "predictor-input-perf",
    "predictor-input-rate",
    "predictor-current",
    "predictor-reload"
];

async function afterAppend(): Promise<void> {
    const isStandingsPage = /standings([^/]*)?$/.test(document.location.href);
    const contestInformation = await getContestInformationAsync(contestScreenName);

    let results: Results;

    let contest: Contest;

    let model: PredictorModel = new PredictorModel({
        rankValue: 0,
        perfValue: 0,
        rateValue: 0,
        enabled: false,
        history: getPerformanceHistories(await getMyHistoryData())
    } as PredictorModel);

    if (!shouldEnabledPredictor().verdict) {
        model.updateInformation(shouldEnabledPredictor().message);
        updateView();
        return;
    }

    try {
        await initPredictor();
    } catch (e) {
        model.updateInformation(e.message);
        model.setEnable(false);
        updateView();
    }

    subscribeEvents();

    function subscribeEvents(): void {
        const reloadButton = document.getElementById("predictor-reload") as HTMLButtonElement;
        reloadButton.addEventListener("click", () => {
            (async (): Promise<void> => {
                model.updateInformation("読み込み中…");
                reloadButton.disabled = true;
                updateView();
                await updateStandingsFromAPI();
                reloadButton.disabled = false;
                updateView();
            })();
        });
        document.getElementById("predictor-current").addEventListener("click", function() {
            const myResult = contest.templateResults[userScreenName];
            if (!myResult) return;
            model = new CalcFromRankModel(model);
            model.updateData(myResult.RatedRank, model.perfValue, model.rateValue);
            updateView();
        });
        document.getElementById("predictor-input-rank").addEventListener("keyup", function() {
            const inputString = (document.getElementById("predictor-input-rank") as HTMLInputElement).value;
            const inputNumber = parseInt(inputString);
            if (!isFinite(inputNumber)) return;
            model = new CalcFromRankModel(model);
            model.updateData(inputNumber, 0, 0);
            updateView();
        });
        document.getElementById("predictor-input-perf").addEventListener("keyup", function() {
            const inputString = (document.getElementById("predictor-input-perf") as HTMLInputElement).value;
            const inputNumber = parseInt(inputString);
            if (!isFinite(inputNumber)) return;
            model = new CalcFromPerfModel(model);
            model.updateData(0, inputNumber, 0);
            updateView();
        });
        document.getElementById("predictor-input-rate").addEventListener("keyup", function() {
            const inputString = (document.getElementById("predictor-input-rate") as HTMLInputElement).value;
            const inputNumber = parseInt(inputString);
            if (!isFinite(inputNumber)) return;
            model = new CalcFromRateModel(model);
            model.updateData(0, 0, inputNumber);
            updateView();
        });
    }

    async function initPredictor(): Promise<void> {
        let aPerfs;
        let standings;

        try {
            standings = await getStandingsDataAsync(contestScreenName);
        } catch (e) {
            throw new Error("順位表の取得に失敗しました。");
        }

        try {
            aPerfs = await getAPerfsFromAPI();
        } catch (e) {
            throw new Error("APerfの取得に失敗しました。");
        }

        async function getAPerfsFromAPI(): Promise<{ [key: string]: number }> {
            return await getAPerfsDataAsync(contestScreenName);
        }

        await updateData(aPerfs, standings);
        model.setEnable(true);
        model.updateInformation(`最終更新 : ${new Date().toTimeString().split(" ")[0]}`);

        if (isStandingsPage) {
            document
                .querySelector("thead > tr")
                .insertAdjacentHTML(
                    "beforeend",
                    '<th class="standings-result-th" style="width:84px;min-width:84px;">perf</th><th class="standings-result-th" style="width:168px;min-width:168px;">レート変化</th>'
                );
            new MutationObserver(addPerfToStandings).observe(document.getElementById("standings-tbody"), {
                childList: true
            });
            const refreshElem = document.getElementById("refresh");
            if (refreshElem)
                new MutationObserver(mutationRecord => {
                    const disabled = (mutationRecord[0].target as HTMLButtonElement).disabled;
                    if (disabled) {
                        (async (): Promise<void> => {
                            await updateStandingsFromAPI();
                            updateView();
                        })();
                    }
                }).observe(refreshElem, {
                    attributes: true,
                    attributeFilter: ["class"]
                });
        }
        updateView();
    }

    async function updateStandingsFromAPI(): Promise<void> {
        try {
            const shouldEnabled = shouldEnabledPredictor();
            if (!shouldEnabled.verdict) throw new Error(shouldEnabled.message);
            const standings = await getStandingsDataAsync(contestScreenName);
            await updateData(contest.aPerfs, standings);
            model.updateInformation(`最終更新 : ${new Date().toTimeString().split(" ")[0]}`);
            model.setEnable(true);
        } catch (e) {
            model.updateInformation(e.message);
            model.setEnable(false);
        }
    }

    async function updateData(aperfs: number[], standings: Standings): Promise<void> {
        contest = new Contest(contestScreenName, contestInformation, standings, aperfs);
        model.contest = contest;
        await updateResultsData();
    }

    function updateView(): void {
        const roundedRankValue = isFinite(model.rankValue) ? roundValue(model.rankValue, 2).toString() : "";
        const roundedPerfValue = isFinite(model.perfValue) ? roundValue(model.perfValue, 2).toString() : "";
        const roundedRateValue = isFinite(model.rateValue) ? roundValue(model.rateValue, 2).toString() : "";
        (document.getElementById("predictor-input-rank") as HTMLInputElement).value = roundedRankValue;
        (document.getElementById("predictor-input-perf") as HTMLInputElement).value = roundedPerfValue;
        (document.getElementById("predictor-input-rate") as HTMLInputElement).value = roundedRateValue;

        document.getElementById("predictor-alert").innerHTML = `<h5 class='sidemenu-txt'>${model.information}</h5>`;

        if (model.enabled) enabled();
        else disabled();

        if (isStandingsPage) {
            addPerfToStandings();
        }
        function enabled(): void {
            predictorElements.forEach(element => {
                (document.getElementById(element) as HTMLButtonElement).disabled = false;
            });
        }
        function disabled(): void {
            predictorElements.forEach(element => {
                (document.getElementById(element) as HTMLButtonElement).disabled = false;
            });
        }
    }

    function shouldEnabledPredictor(): { verdict: boolean; message: string } {
        if (new Date() < startTime) return { verdict: false, message: "コンテストは始まっていません" };
        if (startTime < firstContestDate)
            return {
                verdict: false,
                message: "現行レートシステム以前のコンテストです"
            };
        if (contestInformation.RatedRange[0] > contestInformation.RatedRange[1])
            return {
                verdict: false,
                message: "ratedなコンテストではありません"
            };
        return { verdict: true, message: "" };
    }

    //全員の結果データを更新する
    async function updateResultsData(): Promise<void> {
        if (contest.standings.Fixed && contest.IsRated) {
            const rawResult = await getResultsDataAsync(contestScreenName);
            rawResult.sort((a, b) => (a.Place !== b.Place ? a.Place - b.Place : b.OldRating - a.OldRating));
            const sortedStandingsData = Array.from(contest.standings.StandingsData).filter(
                x => x.TotalResult.Count !== 0
            );
            sortedStandingsData.sort((a, b) => {
                if (a.TotalResult.Count === 0 && b.TotalResult.Count === 0) return 0;
                if (a.TotalResult.Count === 0) return 1;
                if (b.TotalResult.Count === 0) return -1;
                if (a.Rank !== b.Rank) return a.Rank - b.Rank;
                if (b.OldRating !== a.OldRating) return b.OldRating - a.OldRating;
                if (a.UserIsDeleted) return -1;
                if (b.UserIsDeleted) return 1;
                return 0;
            });

            let lastPerformance = contest.perfLimit;
            let deletedCount = 0;
            results = new FixedResults(
                sortedStandingsData.map((data, index) => {
                    let result = rawResult[index - deletedCount];
                    if (!result || data.OldRating !== result.OldRating) {
                        deletedCount++;
                        result = null;
                    }
                    return new Result(
                        result ? result.IsRated : false,
                        data.TotalResult.Count !== 0,
                        data.UserScreenName,
                        data.Rank,
                        -1,
                        data.OldRating,
                        result ? result.NewRating : 0,
                        0,
                        result && result.IsRated ? (lastPerformance = result.Performance) : lastPerformance,
                        result ? result.InnerPerformance : 0
                    );
                })
            );
        } else {
            results = new OnDemandResults(contest, contest.templateResults);
        }
    }

    //結果データを順位表に追加する
    function addPerfToStandings(): void {
        document.querySelectorAll(".standings-perf, .standings-rate").forEach(elem => elem.remove());

        document.querySelectorAll("#standings-tbody > tr").forEach(elem => {
            if (elem.firstElementChild.textContent === "-") {
                const longCell = elem.getElementsByClassName("standings-result")[0];
                longCell.setAttribute("colspan", (parseInt(longCell.getAttribute("colspan")) + 2).toString());
                return;
            }
            if (
                elem.firstElementChild.hasAttribute("colspan") &&
                elem.firstElementChild.getAttribute("colspan") == "3"
            ) {
                elem.insertAdjacentHTML(
                    "beforeend",
                    '<td class="standings-result standings-perf standings-rate" colspan="2">-</td>'
                );
                return;
            }
            const result = results
                ? results.getUserResult(elem.querySelector(".standings-username .username span").textContent)
                : null;
            const perfElem =
                !result || !result.IsSubmitted ? "-" : getRatingSpan(Math.round(positivizeRating(result.Performance)));
            const rateElem = !result ? "-" : getRatingChangeElem(result);
            elem.insertAdjacentHTML("beforeend", `<td class="standings-result standings-perf">${perfElem}</td>`);
            elem.insertAdjacentHTML("beforeend", `<td class="standings-result standings-rate">${rateElem}</td>`);
            function getRatingChangeElem(result): string {
                return result.IsRated && contest.IsRated
                    ? getChangedRatingElem(result.OldRating, result.NewRating)
                    : getUnratedElem(result.OldRating);
            }
            function getChangedRatingElem(oldRate, newRate): string {
                return `<span class="bold">${getRatingSpan(oldRate)}</span> → <span class="bold">${getRatingSpan(
                    newRate
                )}</span> <span class="grey">(${newRate >= oldRate ? "+" : ""}${newRate - oldRate})</span>`;
            }
            function getUnratedElem(rate): string {
                return `<span class="bold">${getRatingSpan(rate)}</span> <span class="grey">(unrated)</span>`;
            }
            function getRatingSpan(rate): string {
                return `<span class="user-${getColor(rate)}">${rate}</span>`;
            }
        });
    }
}
