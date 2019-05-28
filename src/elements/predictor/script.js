import dom from "./dom.html"
import * as moment from "moment";
import {SideMenuElement} from "../../libs/sidemenu/element";
import {HistoryData} from "../../libs/datas/history";
import {StandingsData} from "../../libs/datas/standings";
import {APerfsData} from "../../libs/datas/aperfs";
import {getColor} from "../../libs/utils/ratingColor";
import {calcRatingFromHistory, positivizeRating} from "../../libs/utils/atcoderRating";
import {fetchContestInformation} from "../../libs/contest/fetchContestInformation";
import {Results} from "../../libs/contest/results/results";
import {GetEmbedTweetLink} from "../../libs/utils/twitter";
import {PredictorDB} from "../../libs/database/predictorDB";
import {Contest} from "../../libs/contest/contest";
import {OnDemandResults} from "../../libs/contest/results/standingsResults";
import {FixedResults} from "../../libs/contest/results/fIxedResults";
import {ResultsData} from "../../libs/datas/results";
import {Result} from "../../libs/contest/results/result";

export let predictor = new SideMenuElement('predictor','Predictor',/atcoder.jp\/contests\/.+/, dom, afterAppend);

const firstContestDate = moment("2016-07-16 21:00");
const predictorElements = ['predictor-input-rank', 'predictor-input-perf', 'predictor-input-rate', 'predictor-current', 'predictor-reload', 'predictor-tweet'];

async function afterAppend() {
    const isStandingsPage = /standings([^\/]*)?$/.test(document.location.href);
    const predictorDB = new PredictorDB();
    const historyData = new HistoryData(userScreenName);
    const standingsData = new StandingsData(contestScreenName);
    const aperfsData = new APerfsData(contestScreenName);

    await historyData.update();

    const contestInformation = await fetchContestInformation(contestScreenName);

    let hasStandingsPageNotIniitialized = true;

    let lastUpdated = 0;

    /** @type Results */
    let results;

    /** @type Contest */
    let contest;
    $('[data-toggle="tooltip"]').tooltip();
    $('#predictor-reload').click(function () {
        UpdatePredictorsData();
    });
    $('#predictor-current').click(function () {
        const myResult = contest.templateResults[userScreenName];
        if (!myResult) return;
        $('#predictor-input-rank').val(myResult.RatedRank);
        lastUpdated = 0;
        drawPredictor();
    });
    $('#predictor-input-rank').keyup(function (event) {
        lastUpdated = 0;
        drawPredictor();
    });
    $('#predictor-input-perf').keyup(function (event) {
        lastUpdated = 1;
        drawPredictor();
    });
    $('#predictor-input-rate').keyup(function (event) {
        lastUpdated = 2;
        drawPredictor();

    });

    Promise.all(
        [predictorDB.getData("APerfs", contestScreenName),
            predictorDB.getData("Standings", contestScreenName)]
    ).then(async (result) => {
        aperfsData.data = result[0].data;
        standingsData.data = result[1].data;
        CalcActivePerf();
        drawPredictor();
        enabled();
        AddAlert('ローカルストレージから取得されました。');
        if (isStandingsPage) {
            if (hasStandingsPageNotIniitialized){
                initStandings();
            }
            await updateResultsData();
            addPerfToStandings();
        }
    }).catch(() => {
        UpdatePredictorsData();
    });

    //データを更新して描画する
    function UpdatePredictorsData() {
        if (!startTime.isBefore()) {
            disabled();
            AddAlert('コンテストは始まっていません');
            return;
        }
        if (moment(startTime) < firstContestDate) {
            disabled();
            AddAlert('現行レートシステム以前のコンテストです');
            return;
        }
        if (contestInformation.RatedRange[0] > contestInformation.RatedRange[1]) {
            disabled();
            AddAlert('ratedなコンテストではありません');
            return;
        }
        $('#predictor-reload').button('loading');
        AddAlert('順位表読み込み中…');
        Promise.all(
            [aperfsData.update(),
            standingsData.update()]
        ).then(async () => {
            if (Object.keys(aperfsData.data).length === 0) {
                disabled();
                AddAlert('APerfのデータが提供されていません');
                return;
            }
            if (standingsData.data.Fixed) {
                predictorDB.setData('APerfs', contestScreenName, aperfsData.data);
                predictorDB.setData('Standings', contestScreenName, standingsData.data);
            }
            CalcActivePerf();
            if (isStandingsPage) {
                if (hasStandingsPageNotIniitialized){
                    initStandings();
                    hasStandingsPageNotIniitialized = false;
                }
                await updateResultsData();
                addPerfToStandings();
            }
            drawPredictor();
            enabled();
            AddAlert(`最終更新 : ${moment().format('HH:mm:ss')}`);
        }).catch(() => {
            disabled();
            AddAlert('データの読み込みに失敗しました。');
        });
    }

    //ActivePerfの再計算
    function CalcActivePerf() {
        contest = new Contest(contestScreenName, contestInformation, standingsData.data, aperfsData.data);
    }

    //フォームを更新
    function drawPredictor() {
        switch (lastUpdated) {
            case 0:
                UpdatePredictorFromRank();
                break;
            case 1:
                UpdatePredictorFromPerf();
                break;
            case 2:
                UpdatePredictorFromRate();
                break;
        }
        function UpdatePredictorFromRank() {
            let rank = $("#predictor-input-rank").val();
            lastUpdated = 0;
            let perf = contest.getPerf(rank);
            let rate = getRate(perf);
            UpdatePredictor(rank, perf, rate);
        }
        function UpdatePredictorFromPerf() {
            let perf = $("#predictor-input-perf").val();
            lastUpdated = 1;
            let rank = contest.getRatedRank(perf);
            let rate = getRate(perf);
            UpdatePredictor(rank, perf, rate)
        }
        function UpdatePredictorFromRate() {
            let rate = $("#predictor-input-rate").val();
            lastUpdated = 2;
            let upper = 10000;
            let lower = -10000;
            while (upper - lower > 0.125) {
                const mid = (upper + lower) / 2;
                if (rate < getRate(mid)) upper = mid;
                else lower = mid;
            }
            let perf = (upper + lower) / 2;
            let rank = contest.getRatedRank(perf);
            UpdatePredictor(rank, perf, rate);
        }
        function UpdatePredictor(rank, perf, rate) {
            $("#predictor-input-rank").val(round(rank));
            $("#predictor-input-perf").val(round(perf));
            $("#predictor-input-rate").val(round(rate));
            updatePredictorTweetBtn();
            function round(val) {
                return Math.round(val * 100) / 100;
            }
        }
        function getRate(perf) {
            return positivizeRating(calcRatingFromHistory(historyData.data.filter(x => x.IsRated).map(x => x.Performance).concat(perf).reverse()));
        }
        //ツイートボタンを更新する
        function updatePredictorTweetBtn() {
            let tweetStr = `Rated内順位: ${$("#predictor-input-rank").val()}位\nパフォーマンス: ${$("#predictor-input-perf").val()}\nレート: ${$("#predictor-input-rate").val()}\n`;
            $('#predictor-tweet').attr("href", GetEmbedTweetLink(tweetStr, "https://greasyfork.org/ja/scripts/369954-ac-predictor"));
        }
    }

    //最終更新などの要素を追加する
    function AddAlert(content) {
        $("#predictor-alert").html(`<h5 class='sidemenu-txt'>${content}</h5>`);
    }

    //要素のDisabledを外す
    function enabled() {
        $('#predictor-reload').button('reset');
        predictorElements.forEach(element => {
            $(`#${element}`).removeAttr("disabled");
        });
    }

    //要素にDisabledをつける
    function disabled() {
        $('#predictor-reload').button('reset');
        predictorElements.forEach(element => {
            $(`#${element}`).attr("disabled", true);
        });
    }

    //全員の結果データを更新する
    async function updateResultsData() {
        if (contest.standings.Fixed && contest.IsRated){
            let lastPerformance = contest.perfLimit;
            results = new FixedResults(
                (await new ResultsData(contestScreenName).update()).map((result, index) => {
                let data = contest.standings.StandingsData[index];
                return new Result(
                    result.IsRated,
                    data.TotalResult.Count !== 0,
                    data.UserScreenName,
                    result.Place,
                    -1,
                    result.OldRating,
                    result.NewRating,
                    0,
                    result.IsRated ? lastPerformance = result.Performance : lastPerformance,
                    result.InnerPerformance
                );
            }));
        }
        else{
            results = new OnDemandResults(contest, contest.templateResults);
        }
        console.log(results);
    }

    function initStandings() {
        $('thead > tr').append('<th class="standings-result-th" style="width:84px;min-width:84px;">perf</th><th class="standings-result-th" style="width:168px;min-width:168px;">レート変化</th>');
        new MutationObserver(addPerfToStandings).observe(document.getElementById('standings-tbody'), { childList: true });
        hasStandingsPageNotIniitialized = false;
    }

    //結果データを順位表に追加する
    function addPerfToStandings() {
        $('.standings-perf , .standings-rate').remove();

        $('#standings-tbody > tr').each((index, elem) => {
            if (elem.childNodes.length <= 3) {
                let unparticipatedResultCell = elem.getElementsByClassName("standings-result")[0];
                unparticipatedResultCell.setAttribute("colspan", parseInt(unparticipatedResultCell.getAttribute("colspan")) + 2);
                return;
            }
            const userName = $('.standings-username .username', elem).text();
            const result = results.getUserResult(userName);
            const perfElem = !result || !result.IsSubmitted ? '-' : getRatingSpan(result.Performance);
            const rateElem = !result ? '-' : result.IsRated && contest.IsRated ? getRatingChangeElem(result.OldRating, result.NewRating) : getUnratedElem(result.OldRating);
            $(elem).append(`<td class="standings-result standings-perf">${perfElem}</td>`);
            $(elem).append(`<td class="standings-result standings-rate">${rateElem}</td>`);
            function getRatingChangeElem(oldRate, newRate) {
                return `<span class="bold">${getRatingSpan(oldRate)}</span> → <span class="bold">${getRatingSpan(newRate)}</span> <span class="grey">(${(newRate >= oldRate ? '+' : '')}${newRate - oldRate})</span>`;
            }
            function getUnratedElem(rate) {
                return `<span class="bold">${getRatingSpan(rate)}</span> <span class="grey">(unrated)</span>`;
            }
            function getRatingSpan(rate) {
                return `<span class="user-${getColor(rate)}">${rate}</span>`;
            }
        });
    }
}
