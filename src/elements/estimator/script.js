import document from "./dom.html"
import moment from "moment";
import {SideMenuElement} from "../../libs/sidemenu/element";
import {HistoryData} from "../../libs/datas/history";
import {CalcPerfModel} from "./state/CalcPerfModel";
import {CalcRatingModel} from "./state/CalcRatingModel";
import {getLS, setLS} from "../../atcoder-lib/utils";
import {GetEmbedTweetLink} from "../../libs/utils/twitter";

export let estimator = new SideMenuElement('estimator','Estimator',/atcoder.jp/, document, afterAppend);

async function afterAppend() {
    const estimatorInputSelector = $("#estimator-input");
    const estimatorResultSelector = $("#estimator-res");
    let model = GetModelFromStateCode(getLS("sidemenu_estimator_state"), getLS("sidemenu_estimator_value"), await GetHistory());
    updateView();

    $("#estimator-toggle").click(function () {
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
        const roundedInput = roundVal(model.inputValue, 2);
        const roundedResult = roundVal(model.resultValue, 2);

        $("#estimator-input-desc").text(model.inputDesc);
        $("#estimator-res-desc").text(model.resultDesc);
        estimatorInputSelector.val(roundVal(roundedInput, 2));
        estimatorResultSelector.val(roundVal(roundedResult, 2));

        const tweetStr = `AtCoderのハンドルネーム: ${userScreenName}\n${model.inputDesc}: ${roundedInput}\n${model.resultDesc}: ${roundedResult}\n`;
        $('#estimator-tweet').attr("href", GetEmbedTweetLink(tweetStr, "https://greasyfork.org/ja/scripts/369954-ac-predictor"));

        function roundVal(value, digit) {
            return Math.round(value * (10 ** digit)) / (10 ** digit);
        }
    }
}

/**
 * パフォーマンス履歴を取得し、いい感じで整形して返します
 * @return {Promise<Number[]>} パフォーマンス履歴を返すpromise
 */
async function GetHistory(){
    return new Promise((resolve) => {
        new HistoryData(userScreenName,() => {}).update().then((data) => {
            resolve(data.filter(x => x.IsRated)
                .sort((a, b) => moment(b.EndTime) - moment(a.EndTime))
                .map(x => x.Performance));
        })
    });
}

/**
 * LocalStorageに保存されたステートコードから状態を復元します
 * @param {string} [state] ステートを示す文字列(型名)
 * @param {number} [value] 最初に入る値
 * @param {number[]} [history] パフォーマンス履歴(時間降順)
 * @return {EstimatorModel} 構築されたモデル
 */
function GetModelFromStateCode(state, value, history) {
    let res ={
        "CalcRatingState": CalcRatingModel,
        "CalcPerfState": CalcPerfModel
    }[state];
    if (!res) res = CalcPerfModel;
    return new res(value, history);
}