// ==UserScript==
// @name        ac-predictor
// @namespace   http://ac-predictor.azurewebsites.net/
// @version     0.1.4
// @description コンテスト中にAtCoderのパフォーマンスを予測します
// @author      keymoon
// @license     MIT
// @homepage    https://github.com/key-moon/ac-predictor
// @supportURL  https://github.com/key-moon/ac-predictor/issues
// @match       https://beta.atcoder.jp/*
// ==/UserScript==

//NameSpace
SideMenu = {};

//共有データセット(HistoryとかStandingsとか)
SideMenu.Datas = {};
//共有データセットそれぞれをUpdateする関数を入れておく
SideMenu.Datas.Update = {}

//Datas.Update内に関数を追加
//History
SideMenu.Datas.History = null;
SideMenu.Datas.Update.History = (() => {
	var d = $.Deferred();
	try {
		$.ajax({
			url: `https://beta.atcoder.jp/users/${userScreenName}/history/json`,
			type: "GET",
			dataType: "json"
		}).done(function (history) {
			SideMenu.Datas.History = history;
			d.resolve();
		})
	}
	catch {
		d.reject();
	}
	return d.promise();
});

//Standings
SideMenu.Datas.Standings = null;
SideMenu.Datas.Update.Standings = (() => {
	var d = $.Deferred();
	try {
		$.ajax({
			url: `https://beta.atcoder.jp/contests/${contestScreenName}/standings/json`,
			type: "GET",
			dataType: "json"
		}).done(function (standings) {
			SideMenu.Datas.Standings = standings;
			d.resolve();
		})
	}
	catch{
		d.reject();
	}
	return d.promise();
});

//APerfs
SideMenu.Datas.APerfs = null;
SideMenu.Datas.Update.APerfs = (() => {
	var d = $.Deferred();
	try {
		$.ajax({
			url: `https://ac-predictor.azurewebsites.net/api/aperfs/${contestScreenName}`,
			type: "GET",
			dataType: "json"
		}).done(function (aperfs) {
			SideMenu.Datas.APerfs = aperfs
			d.resolve();
		})
	}
	catch{
		d.reject();
	}
	return d.promise();
});


//ライブラリを追加するやつ
SideMenu.appendLibrary = function (source) {
	$('head').append(`<script src="${source}"></script>`);
};

SideMenu.appendLibrary("https://koba-e964.github.io/atcoder-rating-estimator/atcoder_rating.js");

//サイドメニュー追加(将来仕様変更が起きる可能性大)
SideMenu.appendToSideMenu = async function (match, title, elemFunc) {
	try {
		if (!match.test(location.href)) return;
		//アコーディオンメニュー
		var dom =
			`<div class="menu-wrapper">
	<div class="menu-header">
		<h4 class="sidemenu-txt">${title}<span class="glyphicon glyphicon-menu-up" style="float: right"></span></h4>
	</div>
	<div class="menu-box"><div class="menu-content">${await elemFunc()}</div></div>
</div>`
		$('#sidemenu').append(dom);
		var contents = $('.menu-content');
		var contentElem = contents[contents.length - 1];
		$(contentElem).parents('.menu-box').css('height', contentElem.scrollHeight)
	}
	catch (e) {
		console.error(e);
	}
};


//サイドメニューを生成
(function () {
	var menuWidth = 350
	var keyWidth = 50
	var speed = 150
	var sideMenuScript =
		`<script>//参考:http://blog.8bit.co.jp/?p=12308
(() => {
const activeClass = 'sidemenu-active'
var menuWrap = '#menu_wrap'
var sideMenu = '#sidemenu'
var sideMenuKey = '#sidemenu-key'
var menuWidth = ${menuWidth}
var keyWidth = ${keyWidth}
var speed = ${speed}

var windowHeight = $(window).height();
$(sideMenu).height(windowHeight);

//メニュー開閉
$(sideMenuKey).click(function () {
	//ボタンの文言を変更する部分をCSSTransitionでやらせたい
	$(sideMenuKey).toggleClass('glyphicon-menu-left');
	$(sideMenuKey).toggleClass('glyphicon-menu-right');
	$(menuWrap).toggleClass(activeClass);
});

//画面リサイズ時にheightを読み直し
var timer = false;
$(window).resize(function () {
	if (timer !== false) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		windowHeight = $(window).height();
		$(sideMenu).height(windowHeight);
	}, 50);
});

//アコーディオンメニューのなんか
$('#sidemenu').on('click','.menu-header',(event) => {
	//$(event.target).parents('.menu-wrapper').find('.menu-content').toggleClass('menu-content-collapse')
	$(event.target).parents('.menu-wrapper').find('.menu-box').toggleClass('menu-box-collapse')
	$(event.target).find('.glyphicon').toggleClass('glyphicon-menu-down')
	$(event.target).find('.glyphicon').toggleClass('glyphicon-menu-up')
})
/*$('.menu-content').exResize((event) => {
	$(event.target).parents('.menu-box').css('height',event.target.clientHeight)
});*/

})();
</script>`
	var sideMenuStyle =
		`<style>#menu_wrap{
	display:block;
	position:fixed;
	top:0;
	width:${keyWidth + menuWidth}px;
	right:-${menuWidth}px;
	transition: all ${speed}ms 0ms ease;
	margin-top:50px;
}

#sidemenu{
	background:#000;
	opacity:0.85;
}
#sidemenu-key{
	border-radius:5px 0px 0px 5px;
	background:#000;
	opacity:0.75;
	color:#FFF;
	padding:30px 0;
	cursor:pointer;
	margin-top:100px;
	text-align: center;
}

#sidemenu{
	display:inline-block;
	width:${menuWidth}px;
	float:right;
}

#sidemenu-key{
	display:inline-block;
	width:${keyWidth}px;
	float:right;
}

.sidemenu-active{
	transform: translateX(-${menuWidth}px);
}

.sidemenu-txt{
	color: #DDD;
}
/*アコーディオンメニュー*/
.menu-wrapper{
	border-bottom: 1px solid #FFF;
}
.menu-header h4{
	user-select: none;
	
}
.menu-header{
	margin:10px 20px 10px 20px;
}

.menu-box{
	overflow: hidden;
	transition: all 300ms 0s ease;
}
.menu-box-collapse{
	height:0px !important;/**/
}

.menu-content{
	padding: 10px 20px 10px 20px;
	transition: all 300ms 0s ease;
}
.menu-box-collapse .menu-content{
	transform: translateY(-100%);
}
</style>`
	var ratingScript =
`<script>from: https://koba-e964.github.io/atcoder-rating-estimator/atcoder_rating.js
function bigf(n) {
    var num = 1.0;
    var den = 1.0;
    for (var i = 0; i < n; ++i) {
	num *= 0.81;
	den *= 0.9;
    }
    num = (1 - num) * 0.81 / 0.19;
    den = (1 - den) * 0.9 / 0.1;
    return Math.sqrt(num) / den;
}

function f(n) {
    var finf = bigf(400);
    return (bigf(n) - finf) / (bigf(1) - finf) * 1200.0;
}

// Returns unpositivized ratings.
function calc_rating(arr) {
    var n = arr.length;
    var num = 0.0;
    var den = 0.0;
    for (var i = n - 1; i >= 0; --i) {
	num *= 0.9;
	num += 0.9 * Math.pow(2, arr[i] / 800.0);
	den *= 0.9;
	den += 0.9;
    }
    var rating = Math.log2(num / den) * 800.0;
    rating -= f(n);
    return rating;
}

// Takes and returns unpositivized ratings.
function calc_rating_from_last(last, perf, n) {
    last += f(n);
    var wei = 9 - 9 * 0.9 ** n;
    var num = wei * (2 ** (last / 800.0)) + 2 ** (perf / 800.0) ;
    var den = 1 + wei;
    var rating = Math.log2(num / den) * 800.0;
    rating -= f(n + 1);
    return rating;
}

// (-inf, inf) -> (0, inf)
function positivize_rating(r) {
    if (r >= 400.0) {
	return r;
    }
    return 400.0 * Math.exp((r - 400.0) / 400.0);
}

// (0, inf) -> (-inf, inf)
function unpositivize_rating(r) {
    if (r >= 400.0) {
	return r;
    }
    return 400.0 + 400.0 * Math.log(r / 400.0);
}</script>`;
	$('#main-div').append(`<div id="menu_wrap"><div id="sidemenu" class="container"></div><div id="sidemenu-key" class="glyphicon glyphicon-menu-left"></div>${ratingScript}${sideMenuScript}${sideMenuStyle}</div>`);
})();
//Estimator
(() => {
	SideMenu.appendToSideMenu(/beta.atcoder.jp/,'Estimator',getElem);
	async function getElem() {
		$("#estimator-input").val(localStorage.getItem("sidemenu_estimator_value"));
	if (!SideMenu.Datas.History) await SideMenu.Datas.Update.History();
	var js = 
	`(() => {
		var estimator_state = localStorage.getItem("sidemenu_estimator_state");
		updateInputs();
	
		\$("#estimator-input").keyup(updateInputs);
	
		\$("#estimator-toggle").click(function () {
			if (estimator_state === 0) {
				\$("#estimator-input-desc").text("パフォーマンス")
				\$("#estimator-res-desc").text("到達レーティング")
				estimator_state = 1;
			}
			else {
				\$("#estimator-input-desc").text("目標レーティング")
				\$("#estimator-res-desc").text("必要パフォーマンス")
				estimator_state = 0;
			}
			updateInputs();
			updateLocalStorage()
			updateTweetBtn()
		})
	
		function updateInputs () {
			var input = \$("#estimator-input").val();
			if (!isFinite(input)) {
				displayAlert("数字ではありません")
				return;
			}
			var history = SideMenu.Datas.History.filter(x => x.IsRated)
			history.sort(function (a, b) {
				if (a.EndTime < b.EndTime) return 1;
				if (a.EndTime > b.EndTime) return -1;
				return 0;
			})
			history = history.map(x => x.InnerPerformance)
			var input = parseInt(input, 10)
			var res = -1;
			if (estimator_state === 0) {
				// binary search
				var goal_rating = unpositivize_rating(input)
				var lo = -10000.0;
				var hi = 10000.0;
				for (var i = 0; i < 100; ++i) {
					var mid = (hi + lo) / 2;
					var r = calc_rating([mid].concat(history));
					if (r >= goal_rating) {
						hi = mid;
					} else {
						lo = mid;
					}
				}
				res = (hi + lo) / 2;
			}
			else {
				res = calc_rating([input].concat(history));
			}
			res = Math.round(res * 100) / 100
			\$("#estimator-res").val(res)
			updateLocalStorage()
			updateTweetBtn()
		}
	
		function updateLocalStorage() {
			localStorage.setItem("sidemenu_estimator_state", estimator_state);
			localStorage.setItem("sidemenu_estimator_value", \$("#estimator-input").val());
		}
	
		function updateTweetBtn() {
			var tweetStr =
	\`AtCoderのハンドルネーム: \${userScreenName}%0A
	\${estimator_state == 0 ? "目標レーティング" : "パフォーマンス"}: \${\$("#estimator-input").val()}%0A
	\${estimator_state == 0 ? "必要パフォーマンス" : "到達レーティング"}: \${\$("#estimator-res").val()}\`
			\$('#estimator-tweet').attr("href", \`https://twitter.com/intent/tweet?text=\${tweetStr}\`)
		}
	
		function displayAlert(message) {
			var alertDiv = document.createElement('div')
			alertDiv.setAttribute("role", "alert")
			alertDiv.setAttribute("class", "alert alert-warning alert-dismissible")
			var closeButton = document.createElement('button')
			closeButton.setAttribute("type", "button")
			closeButton.setAttribute("class", "close")
			closeButton.setAttribute("data-dismiss", "alert")
			closeButton.setAttribute("aria-label", "閉じる")
			var closeSpan = document.createElement('span')
			closeSpan.setAttribute("aria-hidden", "true")
			closeSpan.textContent = "×"
			closeButton.appendChild(closeSpan)
			var messageContent = document.createTextNode(message)
			alertDiv.appendChild(closeButton)
			alertDiv.appendChild(messageContent)
			\$("#estimator-alert").append(alertDiv)
		}
	})();`;
		var style = 
	``;
		var dom = 
	`<div id="estimator-alert"></div>
	<div class="row">
		<div class="input-group">
			<span class="input-group-addon" id="estimator-input-desc">目標レーティング</span>
			<input type="number" class="form-control" id="estimator-input">
		</div>
	</div>
	<div class="row">
		<div class="input-group">
			<span class="input-group-addon" id="estimator-res-desc">必要パフォーマンス</span>
			<input class="form-control" id="estimator-res" disabled="disabled">
			<span class="input-group-btn">
				<button class="btn btn-default" id="estimator-toggle">入替</button>
			</span>
		</div>
	</div>
	<div class="row" style="margin: 10px 0px;">
		<a class="btn btn-default col-xs-offset-8 col-xs-4" rel="nofollow" onClick="window.open(encodeURI(decodeURI(this.href)),'twwindow','width=550, height=450, personalbar=0, toolbar=0, scrollbars=1'); return false;" id='estimator-tweet'>ツイート</a>
	</div>`;
		return `${dom}
	<script>${js}</script>
	<style>${style}</style>`;
	}
})();

//Predictor
(() => {
	SideMenu.appendToSideMenu(/beta.atcoder.jp\/contests\//,'Predictor',getElem);
	async function getElem() {
		//NameSpace
	SideMenu.Predictor = {};
	SideMenu.Predictor.historyJsonURL = `https://beta.atcoder.jp/users/${userScreenName}/history/json`
	SideMenu.Predictor.standingsJsonURL = `https://beta.atcoder.jp/contests/${contestScreenName}/standings/json`
	SideMenu.Predictor.aperfsJsonURL = `https://ac-predictor.azurewebsites.net/api/aperfs/${contestScreenName}`
	
	var maxDic =
	    [
	        [/^abc\d{3}$/, 1600],
	        [/^arc\d{3}$/, 3200],
	        [/^soundhound2018-summer-qual$/, 2400],
	        [/.*/, 8192]
	    ];
	SideMenu.Predictor.maxPerf = maxDic.filter(x => x[0].exec(contestScreenName))[0][1];
	
	if (!SideMenu.Datas.History) await SideMenu.Datas.Update.History().done(() => { isDone = true });
	var js = 
	`(() => {
	    if (!startTime.isBefore()) {
	        \$("#estimator-input-rank").attr("disabled","")
	        \$("#estimator-input-perf").attr("disabled","")
	        \$("#estimator-input-rate").attr("disabled","")
	        \$("#estimator-reload").attr("disabled","")
	        \$("#estimator-current").attr("disabled","")
	        \$("#estimator-tweet").attr("disabled","")
	        \$("#predictor-alert").html("<h5 class='sidemenu-txt'>コンテストは始まっていません</h5>");
	    }
	    else {
	        LoadAPerfs()
	        if(!endTime.isBefore()) var loadTimer = setInterval(LoadAPerfs, 30000)
	    }
	    
	    \$('[data-toggle="tooltip"]').tooltip()
	    function UpdatePredictor(rank,perf,rate) {
	        \$("#estimator-input-rank").val(round(rank))
	        \$("#estimator-input-perf").val(round(perf))
	        \$("#estimator-input-rate").val(round(rate))
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
	    \$('#estimator-current').click(function () {
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
	        \$('#estimator-reload').button('reset')
	        switch(lastUpdated) {
	            case 0:
	                UpdatePredictorFromRank(\$("#estimator-input-rank").val())
	                break;
	            case 1:
	                UpdatePredictorFromPerf(\$("#estimator-input-perf").val())
	                break;
	            case 2:
	                UpdatePredictorFromRate(\$("#estimator-input-rate").val())
	                break;
	        }
	    }
	    
	    function LoadAPerfs() {
	        \$('#estimator-reload').button('loading')
			SideMenu.Datas.APerfs
			.done(() => {
				dicLength = Object.keys(SideMenu.Datas.APerfs).length;
	            LoadStandings()
	        })
	    }
	    
	    \$('#estimator-reload').click(function () {
	        LoadAPerfs()
	    })
	    function updatePredictorTweetBtn() {
	        var tweetStr = 
	    \`Rated内順位: \${\$("#estimator-input-rank").val()}位%0A
	    パフォーマンス: \${\$("#estimator-input-perf").val()}%0A
	    レート: \${\$("#estimator-input-rate").val()}\`
	        \$('#predictor-tweet').attr("href", \`https://twitter.com/intent/tweet?text=\${tweetStr}\`)
	    }
	    var lastUpdated = 0;
	    \$('#estimator-input-rank').keyup(function(event) {
	        UpdatePredictorFromRank(\$("#estimator-input-rank").val())
	    });
	    \$('#estimator-input-perf').keyup(function(event) {
	        UpdatePredictorFromPerf(\$("#estimator-input-perf").val())
	    });
	    \$('#estimator-input-rate').keyup(function(event) {
	        UpdatePredictorFromRate(\$("#estimator-input-rate").val())
	    });
	    })();`;
		var style = 
	``;
		var dom = 
	`<div id="predictor-alert"></div>
	<div id="predictor-data">
	    <div class="row">
	        <div class="input-group col-xs-offset-1 col-xs-10">
	            <span class="input-group-addon">順位<span class="glyphicon glyphicon-question-sign" aria-hidden="true" data-html="true" data-toggle="tooltip" data-placement="right" title="" data-original-title="Rated内の順位です。複数人同順位の際は人数を加味します(5位が4人居たら6.5位として計算)"></span></span>
	            <input class="form-control" id="estimator-input-rank">
	            <span class="input-group-addon">位</span>
	        </div>
	        
	        <div class="input-group col-xs-offset-1 col-xs-10">
	            <span class="input-group-addon">パフォーマンス</span>
	            <input class="form-control" id="estimator-input-perf">
	        </div>
	
	        <div class="input-group col-xs-offset-1 col-xs-10">
	            <span class="input-group-addon">レーティング</span>
	            <input class="form-control" id="estimator-input-rate">
	        </div>
	    </div>
	</div>
	<div class="btn-group">
	    <button class="btn btn-default" id="estimator-current">現在の順位</button>
	    <button type="button" class="btn btn-primary" id="estimator-reload" data-loading-text="更新中…">更新</button>
	    <a class="btn btn-default" rel="nofollow" onClick="window.open(encodeURI(decodeURI(this.href)),'twwindow','width=550, height=450, personalbar=0, toolbar=0, scrollbars=1'); return false;" id='predictor-tweet'>ツイート</a>
	    <!--<button class="btn btn-default" id="estimator-solved" disabled>現問題AC後</button>-->
	</div>
	<div id="predictor-reload">
	    <!--<h5 class="sidemenu-txt">更新設定</h5>-->
	    <div class="row">
	        <!--<div class="input-group col-xs-offset-1 col-xs-10">
	            <span class="input-group-addon" id="estimator-input-desc">自動更新</span>
	            <input type="number" class="form-control" id="estimator-input">
	            <span class="input-group-addon">秒</span>
	        </div>-->
	    </div>
	</div>`;
		return `${dom}
	<script>${js}</script>
	<style>${style}</style>`;
	}
})();

//Submit Status
(() => {
	SideMenu.appendToSideMenu(/beta.atcoder.jp/,'Submit Status',getElem);
	async function getElem() {
		
	var js = 
	``;
		var style = 
	``;
		var dom = 
	``;
		return `${dom}
	<script>${js}</script>
	<style>${style}</style>`;
	}
})();

