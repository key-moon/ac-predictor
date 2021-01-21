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
    getPerformanceHistories,
    getResultsDataAsync,
    getStandingsDataAsync,
    getContestInformationAsync,
    getHistoryDataAsync,
} from "../../libs/utils/data";
import { Results } from "../../libs/contest/results/results";
import { SideMenuElement } from "../../libs/sidemenu/element";
import { contestScreenName, startTime, userScreenName } from "../../libs/utils/global";
import { AllRowUpdater } from "./view/standingsTableUpdater/allRowUpdater";
import { PerfAndRateChangeAppender } from "./view/standingsRowModifier/perfAndRateChangeAppender";

class PredictorElement extends SideMenuElement {
    id = "predictor";
    title = "Predictor";
    match = /atcoder.jp\/contests\/.+/;
    document = dom;

    historyData: number[] = [];

    _contest: Contest;
    contestOnUpdated: ((Contest) => void)[] = [];
    set contest(val: Contest) {
        this._contest = val;
        this.resultsOnUpdated.forEach((func) => func(val));
    }
    get contest(): Contest {
        return this._contest;
    }

    _results: Results;
    resultsOnUpdated: ((Results) => void)[] = [];
    set results(val: Results) {
        this._results = val;
        this.resultsOnUpdated.forEach((func) => func(val));
    }
    get results(): Results {
        return this._results;
    }

    async afterAppend(): Promise<void> {
        const firstContestDate = new Date(2016, 6, 16, 21);
        const predictorElements = [
            "predictor-input-rank",
            "predictor-input-perf",
            "predictor-input-rate",
            "predictor-current",
            "predictor-reload",
        ];

        const isStandingsPage = /standings([^/]*)?$/.test(document.location.href);
        const contestInformation = await getContestInformationAsync(contestScreenName);
        const rowUpdater: PerfAndRateChangeAppender = new PerfAndRateChangeAppender();
        this.resultsOnUpdated.push((val: Results) => {
            rowUpdater.results = val;
        });
        this.contestOnUpdated.push((val: Contest) => {
            rowUpdater.isRated = val.IsRated;
        });
        const tableUpdater: AllRowUpdater = new AllRowUpdater();
        tableUpdater.rowModifier = rowUpdater;

        const tableElement = document.getElementById("standings-tbody").parentElement as HTMLTableElement;

        let model: PredictorModel = new PredictorModel({
            rankValue: 0,
            perfValue: 0,
            rateValue: 0,
            enabled: false,
            history: this.historyData,
        } as PredictorModel);

        const updateData = async (aperfs: { [key: string]: number }, standings: Standings) => {
            this.contest = new Contest(contestScreenName, contestInformation, standings, aperfs);
            model.contest = this.contest;
            if (this.contest.standings.Fixed && this.contest.IsRated) {
                const rawResult = await getResultsDataAsync(contestScreenName);
                rawResult.sort((a, b) => (a.Place !== b.Place ? a.Place - b.Place : b.OldRating - a.OldRating));
                const sortedStandingsData = Array.from(this.contest.standings.StandingsData).filter(
                    (x) => x.TotalResult.Count !== 0
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

                let lastPerformance = this.contest.perfLimit;
                let deletedCount = 0;
                this.results = new FixedResults(
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
                this.results = new OnDemandResults(this.contest, this.contest.templateResults);
            }
        };

        if (!shouldEnabledPredictor().verdict) {
            model.updateInformation(shouldEnabledPredictor().message);
            updateView();
            return;
        }

        try {
            let aPerfs: { [key: string]: number };
            let standings: Standings;

            try {
                standings = await getStandingsDataAsync(contestScreenName);
            } catch (e) {
                throw new Error("順位表の取得に失敗しました。");
            }

            try {
                aPerfs = await getAPerfsDataAsync(contestScreenName);
            } catch (e) {
                throw new Error("APerfの取得に失敗しました。");
            }

            await updateData(aPerfs, standings);
            model.setEnable(true);
            model.updateInformation(`最終更新 : ${new Date().toTimeString().split(" ")[0]}`);

            if (isStandingsPage) {
                new MutationObserver(() => {
                    tableUpdater.update(tableElement);
                }).observe(tableElement, {
                    childList: true,
                });
                const refreshElem = document.getElementById("refresh");
                if (refreshElem)
                    new MutationObserver((mutationRecord) => {
                        const disabled = (mutationRecord[0].target as HTMLButtonElement).disabled;
                        if (disabled) {
                            void (async (): Promise<void> => {
                                await updateStandingsFromAPI();
                                updateView();
                            })();
                        }
                    }).observe(refreshElem, {
                        attributes: true,
                        attributeFilter: ["class"],
                    });
            }
        } catch (e) {
            model.updateInformation((e as Error).message);
            model.setEnable(false);
        }
        updateView();
        {
            const reloadButton = document.getElementById("predictor-reload") as HTMLButtonElement;
            reloadButton.addEventListener("click", () => {
                void (async (): Promise<void> => {
                    model.updateInformation("読み込み中…");
                    reloadButton.disabled = true;
                    updateView();
                    await updateStandingsFromAPI();
                    reloadButton.disabled = false;
                    updateView();
                })();
            });
            document.getElementById("predictor-current").addEventListener("click", () => {
                const myResult = this.contest.templateResults[userScreenName];
                if (!myResult) return;
                model = new CalcFromRankModel(model);
                model.updateData(myResult.RatedRank, model.perfValue, model.rateValue);
                updateView();
            });
            document.getElementById("predictor-input-rank").addEventListener("keyup", () => {
                const inputString = (document.getElementById("predictor-input-rank") as HTMLInputElement).value;
                const inputNumber = parseInt(inputString);
                if (!isFinite(inputNumber)) return;
                model = new CalcFromRankModel(model);
                model.updateData(inputNumber, 0, 0);
                updateView();
            });
            document.getElementById("predictor-input-perf").addEventListener("keyup", () => {
                const inputString = (document.getElementById("predictor-input-perf") as HTMLInputElement).value;
                const inputNumber = parseInt(inputString);
                if (!isFinite(inputNumber)) return;
                model = new CalcFromPerfModel(model);
                model.updateData(0, inputNumber, 0);
                updateView();
            });
            document.getElementById("predictor-input-rate").addEventListener("keyup", () => {
                const inputString = (document.getElementById("predictor-input-rate") as HTMLInputElement).value;
                const inputNumber = parseInt(inputString);
                if (!isFinite(inputNumber)) return;
                model = new CalcFromRateModel(model);
                model.updateData(0, 0, inputNumber);
                updateView();
            });
        }

        async function updateStandingsFromAPI(): Promise<void> {
            try {
                const shouldEnabled = shouldEnabledPredictor();
                if (!shouldEnabled.verdict) {
                    model.updateInformation(shouldEnabled.message);
                    model.setEnable(false);
                    return;
                }
                const standings = await getStandingsDataAsync(contestScreenName);
                const aperfs = await getAPerfsDataAsync(contestScreenName);
                await updateData(aperfs, standings);
                model.updateInformation(`最終更新 : ${new Date().toTimeString().split(" ")[0]}`);
                model.setEnable(true);
            } catch (e) {
                model.updateInformation((e as Error).message);
                model.setEnable(false);
            }
        }
        function shouldEnabledPredictor(): { verdict: boolean; message: string } {
            if (new Date() < startTime) return { verdict: false, message: "コンテストは始まっていません" };
            if (startTime < firstContestDate)
                return {
                    verdict: false,
                    message: "現行レートシステム以前のコンテストです",
                };
            if (contestInformation.RatedRange[0] > contestInformation.RatedRange[1])
                return {
                    verdict: false,
                    message: "ratedなコンテストではありません",
                };
            return { verdict: true, message: "" };
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
                tableUpdater.update(tableElement);
            }
            function enabled(): void {
                predictorElements.forEach((element) => {
                    (document.getElementById(element) as HTMLButtonElement).disabled = false;
                });
            }
            function disabled(): void {
                predictorElements.forEach((element) => {
                    (document.getElementById(element) as HTMLButtonElement).disabled = false;
                });
            }
        }
    }

    async afterOpen(): Promise<void> {
        getPerformanceHistories(await getHistoryDataAsync(userScreenName)).forEach((elem) =>
            this.historyData.push(elem)
        );
    }
}

export const predictor = new PredictorElement();
