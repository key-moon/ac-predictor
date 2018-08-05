(() => {
	if (!startTime.isBefore()) {
		$("#predictor-input-rank").attr("disabled", "")
		$("#predictor-input-perf").attr("disabled", "")
		$("#predictor-input-rate").attr("disabled", "")
		$("#predictor-reload").attr("disabled", "")
		$("#predictor-current").attr("disabled", "")
		$("#predictor-tweet").attr("disabled", "")
		$("#predictor-alert").html("<h5 class='sidemenu-txt'>コンテストは始まっていません</h5>");
	}
    else {
        LoadAPerfs()
        if(!endTime.isBefore()) var loadTimer = setInterval(LoadAPerfs, 30000)
    }
    
    $('[data-toggle="tooltip"]').tooltip()
    function UpdatePredictor(rank,perf,rate) {
		$("#predictor-input-rank").val(round(rank))
		$("#predictor-input-perf").val(round(perf))
		$("#predictor-input-rate").val(round(rate))
        updatePredictorTweetBtn()
        function round(val) {
            return Math.round(val * 100) / 100;
        }
    }
    
    function UpdatePredictorFromRank(rank) {
        var perf = getPerf(rank)
        var rate = getRate(perf)
        lastUpdated = 0
        UpdatePredictor(rank,perf,rate)
    }
    
    function UpdatePredictorFromPerf(perf) {
        var upper = 16384
        var lower = 0
        while(upper - lower > 0.125) {
            if (perf > getPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
            else lower += (upper - lower) / 2
        }
        lastUpdated = 1
        var rank = lower + (upper - lower) / 2;
        var rate = getRate(perf)
        UpdatePredictor(rank,perf,rate)
    }
    function UpdatePredictorFromRate(rate) {
        var upper = 16384
        var lower = 0
        while(upper - lower > 0.125) {
            if (rate < getRate(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
            else lower += (upper - lower) / 2
        }
        lastUpdated = 2
        var perf = lower + (upper - lower) / 2;
        upper = 16384
        lower = 0
        while(upper - lower > 0.125) {
            if (perf > getPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
            else lower += (upper - lower) / 2
        }
        var rank = lower + (upper - lower) / 2;
        UpdatePredictor(rank,perf,rate)
    }
    
    function getRate(perf) {
        return positivize_rating(calc_rating(SideMenu.Datas.History.filter(x => x.IsRated).map(x => x.Performance).concat(perf).reverse()));
    }
    
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
    
            if(userScreenName == element.UserScreenName) isContainedMe = true;
            tiedList.push(element)
            lastRank = element.Rank;
        })
        //存在しなかったら空欄
        if(myRank === 0) {
            UpdatePredictor("","","")
        }
        else {
            UpdatePredictorFromRank(myRank)
        }
    })
    function LoadStandings() {
		SideMenu.Datas.Update.Standings()
		.done(() => {
            CalcActivePerf()
        })
    }
    
    function CalcActivePerf() {
        activePerf = []
        //Perf計算時に使うパフォ(Ratedオンリー)
		SideMenu.Datas.Standings.StandingsData.forEach(function (element) {
            if (element.IsRated && element.TotalResult.Count !== 0) {
				if (!(SideMenu.Datas.APerfs[element.UserScreenName])) {
                    console.log(element.UserScreenName)
                }
                else {
					activePerf.push(SideMenu.Datas.APerfs[element.UserScreenName])
                }
            }
        })
        $('#predictor-reload').button('reset')
        switch(lastUpdated) {
            case 0:
				UpdatePredictorFromRank($("#predictor-input-rank").val())
                break;
            case 1:
				UpdatePredictorFromPerf($("#predictor-input-perf").val())
                break;
            case 2:
				UpdatePredictorFromRate($("#predictor-input-rate").val())
                break;
        }
    }
    
    function LoadAPerfs() {
        $('#predictor-reload').button('loading')
		SideMenu.Datas.Update.APerfs()
		.done(() => {
			dicLength = Object.keys(SideMenu.Datas.APerfs).length;
			$("#predictor-alert").html(`<h5 class='sidemenu-txt'>最終更新 : ${moment().format('HH:mm:ss')}</h5>`);
            LoadStandings()
		})
		.fail(() => {
			$('#predictor-reload').button('reset')
			$("#predictor-input-rank").attr("disabled", "")
			$("#predictor-input-perf").attr("disabled", "")
			$("#predictor-input-rate").attr("disabled", "")
			$("#predictor-reload").attr("disabled", "")
			$("#predictor-current").attr("disabled", "")
			$("#predictor-tweet").attr("disabled", "")
			$("#predictor-alert").html("<h5 class='sidemenu-txt'>データの読み込みに失敗しました。</h5>");
		})
    }
    
    $('#predictor-reload').click(function () {
        LoadAPerfs()
    })
    function updatePredictorTweetBtn() {
        var tweetStr = 
	`Rated内順位: ${$("#predictor-input-rank").val()}位%0A
    パフォーマンス: ${$("#predictor-input-perf").val()}%0A
    レート: ${$("#predictor-input-rate").val()}`
        $('#predictor-tweet').attr("href", `https://twitter.com/intent/tweet?text=${tweetStr}`)
    }
    var lastUpdated = 0;
	$('#predictor-input-rank').keyup(function(event) {
		UpdatePredictorFromRank($("#predictor-input-rank").val())
    });
	$('#predictor-input-perf').keyup(function(event) {
		UpdatePredictorFromPerf($("#predictor-input-perf").val())
    });
	$('#predictor-input-rate').keyup(function(event) {
		UpdatePredictorFromRate($("#predictor-input-rate").val())
    });
})();