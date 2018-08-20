(() => {
    //各参加者の結果
    var eachParticipationResults = {};
    var isAlreadyAppendRowToStandings = false;

    const specialContest = ['practice', 'APG4b', 'abs'];

    const predictorElements = ['predictor-input-rank', 'predictor-input-perf', 'predictor-input-rate', 'predictor-current', 'predictor-reload', 'predictor-tweet'];
    const firstContestDate = moment("2016-07-16 21:00");
    const Interval = 30000;

    const ratedLimit = contestScreenName === "SoundHound Inc. Programming Contest 2018 -Masters Tournament-"
        ? 2000 : (/abc\d{3}/.test(contestScreenName) ? 1200 : (/arc\d{3}/.test(contestScreenName) ? 2800 : Infinity));
    const defaultAPerf = /abc\d{3}/.test(contestScreenName) ? 800 : 1600;

    const isStandingsPage = /standings(\/.*)?$/.test(document.location);

    $('[data-toggle="tooltip"]').tooltip();
    $('#predictor-reload').click(function () {
        UpdatePredictorsData();
    });
    $('#predictor-current').click(function () {
        //自分の順位を確認
        var myRank = 0;

        var tiedList = []
        var lastRank = 0;
        var rank = 1;
        var isContainedMe = false;
        //全員回して自分が出てきたら順位更新フラグを立てる
        SideMenu.Datas.Standings.StandingsData.forEach(function (element) {
            if (!element.IsRated || element.TotalResult.Count === 0) return;
            if (lastRank !== element.Rank) {
                if (isContainedMe) {
                    myRank = rank + (tiedList.length - 1) / 2;
                    isContainedMe = false;
                }
                rank += tiedList.length;
                tiedList = [];
            }

            if (isContainedMe) {
                myRank = rank + (tiedList.length - 1) / 2;
                isContainedMe = false;
            }

            if (userScreenName === element.UserScreenName) isContainedMe = true;
            tiedList.push(element)
            lastRank = element.Rank;
        })
        //存在しなかったら空欄
        if (myRank === 0) {
            disabled();
        }
        else {
            lastUpdated = 0;
            drawPredictor();
        }
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

    var lastUpdated = 0;

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
        SideMenu.DataBase.GetData("APerfs", contestScreenName),
        SideMenu.DataBase.GetData("Standings", contestScreenName)
    ).done((aperfs, standings) => {
        SideMenu.Datas.APerfs = aperfs;
        SideMenu.Datas.Standings = standings;
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
    })

    //再描画をの期間を再更新する
    function SetUpdateInterval() {
        UpdatePredictorsData();
        if (!endTime.isBefore()) setTimeout(SetUpdateInterval, Interval);
    }

    //自分のレートをパフォから求める
    function getRate(perf) {
        return positivize_rating(calc_rating(SideMenu.Datas.History.filter(x => x.IsRated).map(x => x.Performance).concat(perf).reverse()));
    }

    //パフォを順位から求める()
    function getPerf(rank) {
        var upper = 8192
        var lower = -8192
    
        while (upper - lower > 0.5) {
            if (rank - 0.5 > calcRankVal(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
            else lower += (upper - lower) / 2
        }
    
        var innerPerf = Math.round(lower + (upper - lower) / 2)
    
        return Math.min(innerPerf, SideMenu.Predictor.maxPerf);
    }

    //パフォを求める際に出てくるパフォごとの順位を求める
    function calcRankVal(X) {
        var res = 0;
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
        SideMenu.Datas.Update.APerfs().then(SideMenu.Datas.Update.Standings).then(() => {
            if (Object.keys(SideMenu.Datas.APerfs).length === 0) {
                disabled();
                AddAlert('APerfのデータが提供されていません');
                return;
            }
            if (SideMenu.Datas.Standings.Fixed) {
                SideMenu.DataBase.SetData('APerfs', contestScreenName, SideMenu.Datas.APerfs);
                SideMenu.DataBase.SetData('Standings', contestScreenName, SideMenu.Datas.Standings);
            }
            CalcActivePerf();
            if (isStandingsPage) {
                updateResultsData();
                addPerfToStandings();
            }
            drawPredictor();
            enabled();
            AddAlert(`最終更新 : ${moment().format('HH:mm:ss')}`);
        }).fail(() => {
            disabled();
            AddAlert('データの読み込みに失敗しました');
        });
    }

    //ActivePerfの再計算
    function CalcActivePerf() {
        activePerf = [];
        var isSomebodyRated = false;
        //Perf計算時に使うパフォ(Ratedオンリー)
        SideMenu.Datas.Standings.StandingsData.forEach(function (element) {
            if (element.IsRated && element.TotalResult.Count !== 0) {
                if (!(SideMenu.Datas.APerfs[element.UserScreenName])) {
                    activePerf.push(defaultAPerf);
                }
                else {
                    isSomebodyRated = true;
                    activePerf.push(SideMenu.Datas.APerfs[element.UserScreenName])
                }
            }
        });

        if (!isSomebodyRated) {
            SideMenu.Datas.Standings.Fixed = false;
            //元はRatedだったと推測できる場合、通常のRatedと同じような扱い
            activePerf = [];
            for (var i = 0; i < SideMenu.Datas.Standings.length; i++) {
                var element = SideMenu.Datas.Standings[i];
                if (element.OldRating >= ratedLimit || element.TotalResult.Count === 0) continue;
                SideMenu.Datas.Standings[i].IsRated = true;
                if (!(SideMenu.Datas.APerfs[element.UserScreenName])) {
                    activePerf.push(defaultAPerf);
                    return;
                }
                activePerf.push(APerfs[element.UserScreenName]);
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
            var rank = $("#predictor-input-rank").val();
            var perf = getPerf(rank);
            var rate = getRate(perf);
            lastUpdated = 0;
            UpdatePredictor(rank, perf, rate);
        }
        function UpdatePredictorFromPerf() {
            var perf = $("#predictor-input-perf").val();
            var upper = 16384
            var lower = 0
            while (upper - lower > 0.125) {
                if (perf > getPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
                else lower += (upper - lower) / 2
            }
            lastUpdated = 1
            var rank = lower + (upper - lower) / 2;
            var rate = getRate(perf)
            UpdatePredictor(rank, perf, rate)
        }
        function UpdatePredictorFromRate() {
            var rate = $("#predictor-input-rate").val();
            var upper = 16384
            var lower = 0
            while (upper - lower > 0.125) {
                if (rate < getRate(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
                else lower += (upper - lower) / 2
            }
            lastUpdated = 2
            var perf = lower + (upper - lower) / 2;
            upper = 16384
            lower = 0
            while (upper - lower > 0.125) {
                if (perf > getPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
                else lower += (upper - lower) / 2
            }
            var rank = lower + (upper - lower) / 2;
            UpdatePredictor(rank, perf, rate)
        }
        function UpdatePredictor(rank, perf, rate) {
            $("#predictor-input-rank").val(round(rank))
            $("#predictor-input-perf").val(round(perf))
            $("#predictor-input-rate").val(round(rate))
            updatePredictorTweetBtn()
            function round(val) {
                return Math.round(val * 100) / 100;
            }
        }
        
        //ツイートボタンを更新する
        function updatePredictorTweetBtn() {
            var tweetStr =
                `Rated内順位: ${$("#predictor-input-rank").val()}位%0A
パフォーマンス: ${$("#predictor-input-perf").val()}%0A
レート: ${$("#predictor-input-rate").val()}`
            $('#predictor-tweet').attr("href", `https://twitter.com/intent/tweet?text=${tweetStr}`)
        }
    }

    //最終更新などの要素を追加する
    function AddAlert(content) {
        $("#predictor-alert").html(`<h5 class='sidemenu-txt'>${content}</h5>`);
    }

    //要素のDisableadを外す
    function enabled() {
        $('#predictor-reload').button('reset');
        predictorElements.forEach(element => {
            $(`#${element}`).removeAttr("disabled");
        });
    }

    //要素にDisableadをつける
    function disabled() {
        $('#predictor-reload').button('reset');
        predictorElements.forEach(element => {
            $(`#${element}`).attr("disabled", true);
        });
    }

    //全員の結果データを更新する
    function updateResultsData() {

        eachParticipationResults = {};

        const IsFixed = SideMenu.Datas.Standings.Fixed;
        //タイの人を入れる(順位が変わったら描画→リストを空に)
        var tiedList = [];
        var rank = 1;
        var lastRank = 0;
        var ratedCount = 0;
        var maxPerf = ratedLimit === Infinity ? getPerf(1) : ratedLimit + 400;
        var currentPerf = maxPerf - 0.5;
        var rankVal = calcRankVal(currentPerf);
        //全員回す
        SideMenu.Datas.Standings.StandingsData.forEach(function (element) {
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
            var fixRank = rank + Math.max(0, ratedCount - 1) / 2;
            while (rankVal < fixRank - 0.5 && currentPerf >= -8192) {
                currentPerf--;
                rankVal = calcRankVal(currentPerf);
            }
            tiedList.forEach(e => {
                var isRated = e.IsRated && e.TotalResult.Count !== 0;
                var matches = e.Competitions - (IsFixed && isRated ? 1 : 0);
                var perf = currentPerf + 0.5;
                var oldRate = (IsFixed ? e.OldRating : e.Rating);
                var newRate = (IsFixed ? e.Rating : Math.floor(positivize_rating(matches !== 0 ? calc_rating_from_last(oldRate, perf, matches) : perf - 1200)));
                eachParticipationResults[e.UserScreenName] = { perf: perf, oldRate: oldRate, newRate: newRate, isRated: isRated, isSubmitted: e.TotalResult.Count !== 0 };
            });
        }
    }

    //結果データを順位表に追加する
    function addPerfToStandings() {
        if (!isStandingsPage) return;
        if (!isAlreadyAppendRowToStandings) {
            (new MutationObserver(() => { console.log('a'); addPerfToStandings(); })).observe(document.getElementById('standings-tbody'), { childList: true });
            $('thead > tr').append('<th class="standings-result-th" style="width:84px;min-width:84px;">perf</th><th class="standings-result-th" style="width:168px;min-width:168px;">レート変化</th>');
            isAlreadyAppendRowToStandings = true;
        }
        $('#standings-tbody > tr').each((index, elem) => {
            var userName = $('.standings-username .username', elem).text();
            var perfArr = eachParticipationResults[userName];
            if (!perfArr) {
                $(elem).append(`<td class="standings-result">-</td>`);
                $(elem).append(`<td class="standings-result">-</td>`);
                return;
            }
            var perf = perfArr.isSubmitted ? ratingSpan(perfArr.perf) : '<span class="user-unrated">-</span>';
            var oldRate = perfArr.oldRate;
            var newRate = perfArr.newRate;
            var IsRated = perfArr.isRated;
            $(elem).append(`<td class="standings-result">${ratingSpan(perf)}</td>`);
            $(elem).append(`<td class="standings-result">${getRatingChangeStr(oldRate,newRate)}</td>`);
            function getRatingChangeStr(oldRate, newRate) {
                return IsRated ? `${ratingSpan(oldRate)} -> ${ratingSpan(newRate)}(${(newRate >= oldRate ? '+' : '')}${newRate - oldRate})` : `${ratingSpan(oldRate)}(unrated)`;
            }
            function ratingSpan(rate) {
                return `<span class="user-${SideMenu.GetColor(rate)}">${rate}</span>`;
            }
        });
    }
    
})();