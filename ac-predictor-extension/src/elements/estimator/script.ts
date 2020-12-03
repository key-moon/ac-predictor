import dom from "./dom.html";
import { CalcPerfModel } from "./model/CalcPerfModel";
import { CalcRatingModel } from "./model/CalcRatingModel";
import { GetEmbedTweetLink } from "../../libs/utils/twitter";
import { roundValue } from "../../libs/utils/roundValue";
import { SideMenuElement } from "../../libs/sidemenu/element";
import { getHistoryDataAsync, getPerformanceHistories } from "../../libs/utils/data";
import { EstimatorModel } from "./model/EstimatorModel";
import { userScreenName } from "../../libs/utils/global";

export const estimator = new SideMenuElement("estimator", "Estimator", /atcoder.jp/, dom, afterAppend);

function getLS<T>(key: string): T {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : val;
}

function setLS<T>(key: string, val: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch (error) {
        console.log(error);
    }
}

async function afterAppend(): Promise<void> {
    const estimatorInputSelector = document.getElementById("estimator-input") as HTMLInputElement;
    const estimatorResultSelector = document.getElementById("estimator-res") as HTMLInputElement;
    let model = GetModelFromStateCode(
        getLS<string>("sidemenu_estimator_state"),
        getLS<number>("sidemenu_estimator_value"),
        getPerformanceHistories(await getHistoryDataAsync(userScreenName))
    );
    updateView();

    document.getElementById("estimator-toggle").addEventListener("click", () => {
        model = model.toggle();
        updateLocalStorage();
        updateView();
    });
    estimatorInputSelector.addEventListener("keyup", () => {
        updateModel();
        updateLocalStorage();
        updateView();
    });

    /** modelをinputの値に応じて更新 */
    function updateModel(): void {
        const inputNumber = estimatorInputSelector.valueAsNumber;
        if (!isFinite(inputNumber)) return;
        model.updateInput(inputNumber);
    }

    /** modelの状態をLSに保存 */
    function updateLocalStorage(): void {
        setLS<number>("sidemenu_estimator_value", model.inputValue);
        setLS<string>("sidemenu_estimator_state", model.constructor.name);
    }

    /** modelを元にviewを更新 */
    function updateView(): void {
        const roundedInput = roundValue(model.inputValue, 2);
        const roundedResult = roundValue(model.resultValue, 2);

        document.getElementById("estimator-input-desc").innerText = model.inputDesc;
        document.getElementById("estimator-res-desc").innerText = model.resultDesc;
        estimatorInputSelector.value = String(roundedInput);
        estimatorResultSelector.value = String(roundedResult);

        const tweetStr = `AtCoderのハンドルネーム: ${userScreenName}\n${model.inputDesc}: ${roundedInput}\n${model.resultDesc}: ${roundedResult}\n`;
        (document.getElementById("estimator-tweet") as HTMLAnchorElement).href = GetEmbedTweetLink(
            tweetStr,
            "https://greasyfork.org/ja/scripts/369954-ac-predictor"
        );
    }
}

const models = [CalcPerfModel, CalcRatingModel];

function GetModelFromStateCode(state: string, value: number, history: number[]): EstimatorModel {
    let model = models.find(model => model.name === state);
    if (!model) model = CalcPerfModel;
    return new model(value, history);
}
