import document from "./dom.html"
import {SideMenuElement} from "../../libs/sidemenu/element";
import {HistoryData} from "../../libs/datas/history";
import {StandingsData} from "../../libs/datas/standings";
import {APerfsData} from "../../libs/datas/aperfs";
import {colorBounds, getColor} from "../../libs/utils/ratingColor";
import {calcRatingFromHistory, calcRatingFromLast, positivizeRating} from "../../libs/utils/atcoderRating";

export let predictor = new SideMenuElement('predictor','Predictor',/atcoder.jp\/contests\/.+/, document, afterAppend);

async function afterAppend() {
    const historyData = new HistoryData(userScreenName,() => {});
    const standingsData = new StandingsData(contestScreenName,() => {});
    const aperfsData = new APerfsData(contestScreenName,() => {});
    //await standingsData.update();
    //await aperfsData.update();
    //await historyData.update();
    const maxDic =
        [
            [/^abc\d{3}$/, colorBounds.cyan],
            [/^arc\d{3}$/, colorBounds.red],
            [/^agc\d{3}$/, Infinity],
            [/^apc\d{3}$/, Infinity],
            [/^cf\d{2}-final-open$/, Infinity],
            [/^soundhound2018-summer-qual$/, colorBounds.yellow],
            [/^caddi2018$/, colorBounds.red],
            [/^caddi2018b$/, colorBounds.cyan],
            [/^aising2019$/, colorBounds.yellow],
            [/^keyence2019$/, colorBounds.red],
            [/^nikkei2019-qual$/, colorBounds.red],
            [/^exawizards2019$/, colorBounds.red],
            [/^tenka1-2019$/, colorBounds.red],
            [/^tenka1-2019-beginner$/, colorBounds.cyan],
            [/.*/, Infinity]
        ];

    const maxPerf = maxDic.filter(x => x[0].exec(contestScreenName))[0][1] + 400;

    let activePerf = [];

    let eachParticipationResults = {};
    let isAlreadyAppendRowToStandings = false;

    const specialContest = ['practice', 'APG4b', 'abs'];

    const predictorElements = ['predictor-input-rank', 'predictor-input-perf', 'predictor-input-rate', 'predictor-current', 'predictor-reload', 'predictor-tweet'];
    const firstContestDate = moment("2016-07-16 21:00");
    const Interval = 30000;

    const ratedLimit = contestScreenName === "SoundHound Inc. Programming Contest 2018 -Masters Tournament-"
        ? 2000 : (/abc\d{3}/.test(contestScreenName) ? 1200 : (/arc\d{3}/.test(contestScreenName) ? 2800 : Infinity));
    const defaultAPerf = /abc\d{3}/.test(contestScreenName) ? 800 : 1600;

    const isStandingsPage = /standings(\?.*)?$/.test(document.location);

    $('[data-toggle="tooltip"]').tooltip();
    $('#predictor-reload').click(function () {
        UpdatePredictorsData();
    });
    $('#predictor-current').click(function () {
        //自分の順位を確認
        let myRank = 0;

        let ratedCount = 0;
        let lastRank = 0;
        let rank = 1;
        let isContainedMe = false;
        //全員回して自分が出てきたら順位更新フラグを立てる
        standingsData.data.StandingsData.forEach(function (element) {
            if (lastRank !== element.Rank) {
                if (isContainedMe) {
                    myRank = rank + Math.max(0, ratedCount - 1) / 2;
                    isContainedMe = false;
                }
                rank += ratedCount;
                ratedCount = 0;
            }
            if (userScreenName === element.UserScreenName) isContainedMe = true;
            if (element.IsRated && element.TotalResult.Count !== 0) ratedCount++;
            lastRank = element.Rank;
        })
        if (isContainedMe) {
            myRank = rank + ratedCount / 2;
        }

        if (myRank === 0) return;
        $('#predictor-input-rank').val(myRank);
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

    let lastUpdated = 0;

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
    if (specialContest.indexOf(contestScreenName) >= 0) {
        disabled();
        AddAlert('コンテストではありません');
        return;
    }
    if (!endTime.isBefore()) {
        SetUpdateInterval();
        return;
    }

    $.when(
        aperfsData.update(),
        standingsData.update()
    ).done(() => {
        CalcActivePerf();
        drawPredictor();
        enabled();
        AddAlert('ローカルストレージから取得されました。');
        if (isStandingsPage) {
            updateResultsData();
            addPerfToStandings();
        }
    }).fail(() => {
        UpdatePredictorsData();
    });

    //再描画をの期間を再更新する
    function SetUpdateInterval() {
        UpdatePredictorsData();
        if (!endTime.isBefore()) setTimeout(SetUpdateInterval, Interval);
    }

    //自分のレートをパフォから求める
    function getRate(perf) {
        return positivizeRating(calcRatingFromHistory(historyData.data.filter(x => x.IsRated).map(x => x.Performance).concat(perf).reverse()));
    }

    //パフォを順位から求める()
    function getPerf(rank) {
        let upper = 8192;
        let lower = -8192;

        while (upper - lower > 0.5) {
            if (rank - 0.5 > calcRankVal(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
            else lower += (upper - lower) / 2
        }

        let innerPerf = Math.round(lower + (upper - lower) / 2)

        return Math.min(innerPerf, maxPerf);
    }

    //パフォを求める際に出てくるパフォごとの順位を求める
    function calcRankVal(X) {
        let res = 0;
        activePerf.forEach(function (APerf) {
            res += 1.0 / (1.0 + Math.pow(6.0, ((X - APerf) / 400.0)))
        })
        return res;
    }

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
        if (specialContest.indexOf(contestScreenName) >= 0) {
            disabled();
            AddAlert('コンテストではありません');
            return;
        }
        $('#predictor-reload').button('loading');
        AddAlert('順位表読み込み中…');
        $.when(
            aperfsData.update(),
            standingsData.update()
        ).then(() => {
            if (Object.keys(aperfsData.data).length === 0) {
                disabled();
                AddAlert('APerfのデータが提供されていません');
                return;
            }
            /*if (standingsData.data.Fixed) {
                SideMenu.DataBase.SetData('APerfs', contestScreenName, SideMenu.Datas.APerfs);
                SideMenu.DataBase.SetData('Standings', contestScreenName, SideMenu.Datas.Standings);
            }*/
            CalcActivePerf();
            if (isStandingsPage) {
                updateResultsData();
                addPerfToStandings();
            }
            drawPredictor();
            enabled();
            AddAlert(`最終更新 : ${moment().format('HH:mm:ss')}`);
        }).fail(() => {
            AddAlert('データの読み込みに失敗しました。');
        });
    }

    //ActivePerfの再計算
    function CalcActivePerf() {
        activePerf = [];
        let isSomebodyRated = false;
        //Perf計算時に使うパフォ(Ratedオンリー)
        standingsData.data.StandingsData.forEach(function (element) {
            if (element.IsRated && element.TotalResult.Count !== 0) {
                isSomebodyRated = true;
                if (!(aperfsData.data[element.UserScreenName])) {
                    activePerf.push(defaultAPerf);
                }
                else {
                    activePerf.push(aperfsData.data[element.UserScreenName])
                }
            }
        });
        if (!isSomebodyRated) {
            standingsData.data.Fixed = false;
            //元はRatedだったと推測できる場合、通常のRatedと同じような扱い
            activePerf = [];
            for (let i = 0; i < standingsData.data.StandingsData.length; i++) {
                let element = standingsData.data.StandingsData[i];
                if (element.OldRating >= ratedLimit || element.TotalResult.Count === 0) continue;
                standingsData.data.StandingsData[i].IsRated = true;
                if (!(aperfsData[element.UserScreenName])) {
                    activePerf.push(defaultAPerf);
                    continue;
                }
                activePerf.push(aperfsData[element.UserScreenName]);
            }
        }
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
            let perf = getPerf(rank);
            let rate = getRate(perf);
            lastUpdated = 0;
            UpdatePredictor(rank, perf, rate);
        }
        function UpdatePredictorFromPerf() {
            let perf = $("#predictor-input-perf").val();
            let upper = 16384
            let lower = 0
            while (upper - lower > 0.125) {
                if (perf > getPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2;
                else lower += (upper - lower) / 2
            }
            lastUpdated = 1
            let rank = lower + (upper - lower) / 2;
            let rate = getRate(perf)
            UpdatePredictor(rank, perf, rate)
        }
        function UpdatePredictorFromRate() {
            let rate = $("#predictor-input-rate").val();
            let upper = 16384;
            let lower = 0;
            while (upper - lower > 0.125) {
                if (rate < getRate(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2;
                else lower += (upper - lower) / 2
            }
            lastUpdated = 2;
            let perf = lower + (upper - lower) / 2;
            upper = 16384;
            lower = 0;
            while (upper - lower > 0.125) {
                if (perf > getPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2;
                else lower += (upper - lower) / 2;
            }
            let rank = lower + (upper - lower) / 2;
            UpdatePredictor(rank, perf, rate)
        }
        function UpdatePredictor(rank, perf, rate) {
            $("#predictor-input-rank").val(round(rank));
            $("#predictor-input-perf").val(round(perf));
            $("#predictor-input-rate").val(round(rate));
            updatePredictorTweetBtn()
            function round(val) {
                return Math.round(val * 100) / 100;
            }
        }

        //ツイートボタンを更新する
        function updatePredictorTweetBtn() {
            let tweetStr =
                `Rated内順位: ${$("#predictor-input-rank").val()}位%0A
パフォーマンス: ${$("#predictor-input-perf").val()}%0A
レート: ${$("#predictor-input-rate").val()}%0A
`
            $('#predictor-tweet').attr("href", `https://twitter.com/share?text=${tweetStr}&url=https://greasyfork.org/ja/scripts/369954-ac-predictor`)
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
    function updateResultsData() {

        eachParticipationResults = {};

        const IsFixed = standingsData.data.Fixed;
        //タイの人を入れる(順位が変わったら描画→リストを空に)
        let tiedList = [];
        let rank = 1;
        let lastRank = 0;
        let ratedCount = 0;
        let maxPerf = ratedLimit === Infinity ? getPerf(1) : ratedLimit + 400;
        let currentPerf = maxPerf - 0.5;
        let rankVal = calcRankVal(currentPerf);
        //全員回す
        standingsData.data.StandingsData.forEach(function (element) {
            if (lastRank !== element.Rank) {
                addRow();
                rank += ratedCount;
                ratedCount = 0;
                tiedList = [];
            }
            tiedList.push(element);
            lastRank = element.Rank;
            if (element.IsRated && element.TotalResult.Count !== 0) ratedCount++;
        });
        //最後に更新してあげる
        addRow();

        //タイリストの人全員行追加
        function addRow() {
            let fixRank = rank + Math.max(0, ratedCount - 1) / 2;
            while (rankVal < fixRank - 0.5 && currentPerf >= -8192) {
                currentPerf--;
                rankVal = calcRankVal(currentPerf);
            }
            tiedList.forEach(e => {
                let isRated = e.IsRated && e.TotalResult.Count !== 0;
                let isSubmitted = e.TotalResult.Count !== 0;
                let matches = e.Competitions - (IsFixed && isRated ? 1 : 0);
                let perf = currentPerf + 0.5;
                let oldRate = (IsFixed && isSubmitted ? e.OldRating : e.Rating);
                let newRate = Math.floor(matches !== 0 ? calcRatingFromLast(oldRate, perf, matches) : perf - 1200);
                eachParticipationResults[e.UserScreenName] = { perf: perf, oldRate: oldRate, newRate: newRate, isRated: isRated, isSubmitted: isSubmitted };
            });
        }
    }

    //結果データを順位表に追加する
    function addPerfToStandings() {
        if (!isStandingsPage) return;
        $('.standings-perf , .standings-rate').remove();
        if (!isAlreadyAppendRowToStandings) {
            (new MutationObserver(() => { addPerfToStandings(); })).observe(document.getElementById('standings-tbody'), { childList: true });
            $('thead > tr').append('<th class="standings-result-th" style="width:84px;min-width:84px;">perf</th><th class="standings-result-th" style="width:168px;min-width:168px;">レート変化</th>');
            isAlreadyAppendRowToStandings = true;
        }
        $('#standings-tbody > tr').each((index, elem) => {
            let userName = $('.standings-username .username', elem).text();
            let perfArr = eachParticipationResults[userName];
            if (!perfArr) {
                $(elem).append(`<td class="standings-result standings-perf">-</td>`);
                $(elem).append(`<td class="standings-result standings-rate">-</td>`);
                return;
            }
            let perf = perfArr.isSubmitted ? ratingSpan(perfArr.perf) : '<span class="user-unrated">-</span>';
            let oldRate = perfArr.oldRate;
            let newRate = perfArr.newRate;
            let IsRated = perfArr.isRated;
            $(elem).append(`<td class="standings-result standings-perf">${ratingSpan(perf)}</td>`);
            $(elem).append(`<td class="standings-result standings-rate">${getRatingChangeStr(oldRate,newRate)}</td>`);
            function getRatingChangeStr(oldRate, newRate) {
                return IsRated ? `${ratingSpan(oldRate)} -> ${ratingSpan(newRate)} (${(newRate >= oldRate ? '+' : '')}${newRate - oldRate})` : `${ratingSpan(oldRate)}(unrated)`;
            }
            function ratingSpan(rate) {
                return `<span class="user-${getColor(rate)}">${rate}</span>`;
            }
        });
    }
}
