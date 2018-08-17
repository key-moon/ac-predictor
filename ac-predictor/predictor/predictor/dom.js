(() => {
    $('[data-toggle="tooltip"]').tooltip();
    $('#predictor-reload').click(function () {
        UpdatePredictor();
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
                tiedList = []
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
            UpdatePredictorFromLast();
        }
    });
    $('#predictor-input-rank').keyup(function (event) {
        lastUpdated = 0;
        UpdatePredictorFromLast();
    });
    $('#predictor-input-perf').keyup(function (event) {
        lastUpdated = 1;
        UpdatePredictorFromLast();
    });
    $('#predictor-input-rate').keyup(function (event) {
        lastUpdated = 2;
        UpdatePredictorFromLast();
    });

    const specialContest = ['practice', 'APG4b', 'abs'];

    const predictorElements = ['predictor-input-rank', 'predictor-input-perf', 'predictor-input-rate', 'predictor-current', 'predictor-reload', 'predictor-tweet'];
    const firstContestDate = moment("2016-07-16 21:00");
    const Interval = 30000;

    var lastUpdated = 0;
    if (!startTime.isBefore()) {
        disabled();
        AddAlert('コンテストは始まっていません');
        return;
    }
    if (moment(startTime) < firstContestDate) {
        disabled();
        AddAlert('現行レートシステムが始まる前のコンテストです');
        return;
    }
    if (specialContest.indexOf(contestScreenName) >= 0) {
        disabled();
        AddAlert('順位表が存在しないコンテストです');
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
        UpdatePredictorFromLast();
        enabled();
        AddAlert('ローカルストレージから取得されました。');
    }).fail(() => {
        UpdatePredictor();
    })

    //
    function SetUpdateInterval() {
        UpdatePredictor();
        if (!endTime.isBefore()) setTimeout(SetUpdateInterval, Interval);
    }

    //
    function getRate(perf) {
        return positivize_rating(calc_rating(SideMenu.Datas.History.filter(x => x.IsRated).map(x => x.Performance).concat(perf).reverse()));
    }

    //
    function getPerf(rank) {
        var upper = 8192
        var lower = -8192
    
        while (upper - lower > 0.5) {
            if (rank - 0.5 > calcPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
            else lower += (upper - lower) / 2
        }
    
        var innerPerf = Math.round(lower + (upper - lower) / 2)
    
        return Math.min(innerPerf, SideMenu.Predictor.maxPerf)
    
        function calcPerf(X) {
            var res = 0;
            activePerf.forEach(function (APerf) {
                res += 1.0 / (1.0 + Math.pow(6.0, ((X - APerf) / 400.0)))
            })
            return res;
        }
    }

    //
    function UpdatePredictor() {
        $('#predictor-reload').button('loading');
        AddAlert('順位表読み込み中…');
        SideMenu.Datas.Update.APerfs().then(SideMenu.Datas.Update.Standings).then(() => {
            if (SideMenu.Datas.APerfs.length === 0) {
                enabled();
                AddAlert('APerfのデータが提供されていません');
                return;
            }
            if (SideMenu.Datas.Standings.Fixed) {
                SideMenu.DataBase.SetData('APerfs', contestScreenName, SideMenu.Datas.APerfs);
                SideMenu.DataBase.SetData('Standings', contestScreenName, SideMenu.Datas.Standings);
            }
            CalcActivePerf();
            UpdatePredictorFromLast();
            enabled();
            AddAlert(`最終更新 : ${moment().format('HH:mm:ss')}`);
        }).fail(() => {
            disabled();
            AddAlert('データの読み込みに失敗しました');
        });
    }

    //
    function CalcActivePerf() {
        activePerf = []
        //Perf計算時に使うパフォ(Ratedオンリー)
        SideMenu.Datas.Standings.StandingsData.forEach(function (element) {
            if (element.IsRated && element.TotalResult.Count !== 0) {
                if (!(SideMenu.Datas.APerfs[element.UserScreenName])) {
                    //console.log(element.UserScreenName)

                }
                else {
                    activePerf.push(SideMenu.Datas.APerfs[element.UserScreenName])
                }
            }
        });
    }

    //
    function UpdatePredictorFromLast() {
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
            $(`#${element}`).attr("disabled");
        });
    };

    function updatePredictorTweetBtn() {
        var tweetStr = 
`Rated内順位: ${$("#predictor-input-rank").val()}位%0A
パフォーマンス: ${$("#predictor-input-perf").val()}%0A
レート: ${$("#predictor-input-rate").val()}`
        $('#predictor-tweet').attr("href", `https://twitter.com/intent/tweet?text=${tweetStr}`)
    }
})();