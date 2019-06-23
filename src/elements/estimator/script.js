import * as $ from "jquery";
import document from "./dom.html";
import { SideMenuElement } from "atcoder-sidemenu";
import { CalcPerfModel } from "./model/CalcPerfModel";
import { CalcRatingModel } from "./model/CalcRatingModel";
import { GetEmbedTweetLink } from "../../libs/utils/twitter";
import { roundValue } from "../../libs/utils/roundValue";
import {
    getLS,
    setLS,
    userScreenName
} from "atcoder-userscript-libs/src/libs/global";
import {
    getMyHistoryData,
    getPerformanceHistories
} from "atcoder-userscript-libs/src/libs/data";

export let estimator = new SideMenuElement(
    "estimator",
    "Estimator",
    /atcoder.jp/,
    document,
    afterAppend
);

async function afterAppend() {
    const estimatorInputSelector = $("#estimator-input");
    const estimatorResultSelector = $("#estimator-res");
    let model = GetModelFromStateCode(
        getLS("sidemenu_estimator_state"),
        getLS("sidemenu_estimator_value"),
        getPerformanceHistories(await getMyHistoryData())
    );
    updateView();

    $("#estimator-toggle").click(function() {
        model = model.toggle();
        updateLocalStorage();
        updateView();
    });
    estimatorInputSelector.keyup(() => {
        updateModel();
        updateLocalStorage();
        updateView();
    });

    /** modelをinputの値に応じて更新 */
    function updateModel() {
        const inputString = estimatorInputSelector.val();
        if (!isFinite(inputString)) return;
        const inputNumber = parseInt(inputString);
        model.updateInput(inputNumber);
    }

    /** modelの状態をLSに保存 */
    function updateLocalStorage() {
        setLS("sidemenu_estimator_value", model.inputValue);
        setLS("sidemenu_estimator_state", model.constructor.name);
    }

    /** modelを元にviewを更新 */
    function updateView() {
        const roundedInput = roundValue(model.inputValue, 2);
        const roundedResult = roundValue(model.resultValue, 2);

        $("#estimator-input-desc").text(model.inputDesc);
        $("#estimator-res-desc").text(model.resultDesc);
        estimatorInputSelector.val(roundedInput);
        estimatorResultSelector.val(roundedResult);

        const tweetStr = `AtCoderのハンドルネーム: ${userScreenName}\n${model.inputDesc}: ${roundedInput}\n${model.resultDesc}: ${roundedResult}\n`;
        $("#estimator-tweet").attr(
            "href",
            GetEmbedTweetLink(
                tweetStr,
                "https://greasyfork.org/ja/scripts/369954-ac-predictor"
            )
        );
    }
}

const models = [CalcPerfModel, CalcRatingModel];

/**
 * LocalStorageに保存されたステートコードから状態を復元します
 * @param {string} [state] ステートを示す文字列(型名)
 * @param {number} [value] 最初に入る値
 * @param {number[]} [history] パフォーマンス履歴(時間降順)
 * @return {EstimatorModel} 構築されたモデル
 */
function GetModelFromStateCode(state, value, history) {
    let model = models.find(model => model.name === state);
    if (!model) model = CalcPerfModel;
    return new model(value, history);
}
