// ==UserScript==
// @name        ac-predictor
// @namespace   http://ac-predictor.azurewebsites.net/
// @version     1.0.3
// @description コンテスト中にAtCoderのパフォーマンスを予測します
// @author      keymoon
// @license     MIT
// @supportURL  https://github.com/key-moon/ac-predictor.user.js/issues
// @match       https://beta.atcoder.jp/*
// @exclude     https://beta.atcoder.jp/*/json
// ==/UserScript==

//NameSpace
SideMenu = {};

SideMenu.Version = 1.0;

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
        }).done(history => {
            SideMenu.Datas.History = history;
            d.resolve();
        }).fail(() => { d.reject(); });
    }
    catch (e) {
        d.reject(e);
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
        }).done(standings => {
            SideMenu.Datas.Standings = standings;
            d.resolve();
        }).fail(() => { d.reject(); });
    }
    catch (e) {
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
        }).done(aperfs => {
            SideMenu.Datas.APerfs = aperfs
            d.resolve();
        }).fail(() => { d.reject(); });
    }
    catch (e) {
        d.reject();
    }
    return d.promise();
});

//ライブラリを追加するやつ
SideMenu.appendLibrary = function (source) {
    var defferd = $.Deferred();
    $.ajax({
        url: source
    }).done(((src) => {
        $('head').append(`<script>${src}</script>`);
        defferd.resolve();
    })(() => {
        defferd.fail();
    }));
    return defferd.promise();
};

//モーダル関連
SideMenu.Modal = {}
$('body').append('<div class="modal-standing"></div>');
SideMenu.Modal.SetContent = ((content) => {
    $('#modal-standing').html = content;
});
SideMenu.Modal.Show = (() => {
    $('#modal-standing').modal('show');
});
SideMenu.Modal.Hide = (() => {
    $('#modal-standing').modal('hide');
});
SideMenu.Modal.Toggle = (() => {
    $('#modal-standing').modal('toggle');
});

//通知関連
SideMenu.Notifications = {};
SideMenu.Notifications.CanSend = false;
(async () => {
    if (Notification.permission === 'denied') return;
    if (Notification.permission === 'default') {
        await (async () => {
            var defferd = $.Deferred();
            Notification.requestPermission((permission) => {
                SideMenu.Notifications.CanSend = permission === 'granted';
                defferd.resolve();
            })();
            return defferd.promise();
        });
        if (!Notification.permission) return;
    }
})();

SideMenu.appendLibrary("https://koba-e964.github.io/atcoder-rating-estimator/atcoder_rating.js");

//サイドメニュー追加(将来仕様変更が起きる可能性大)
SideMenu.appendToSideMenu = async function (match, title, elemFunc) {
    var defferd = $.Deferred();
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
        defferd.resolve();
    }
    catch (e) {
        console.error(e);
        defferd.reject();
    }
    return defferd.promise();
};


//サイドメニューを生成
(() => {
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


//IndexedDB
SideMenu.DataBase = {};
SideMenu.DataBase.Name = "PredictorDB";
SideMenu.DataBase.StoreNames = ["APerfs", "Standings"];
indexedDB.open(SideMenu.DataBase.Name, SideMenu.Version).onupgradeneeded = (event) => {
    var db = event.target.result;
    SideMenu.DataBase.StoreNames.forEach(store => {
        db.createObjectStore(store, { keyPath: "id" });
    });
};
SideMenu.DataBase.SetData = (store, key, value) => {
    var defferd = $.Deferred();
    try {
        indexedDB.open(SideMenu.DataBase.Name).onsuccess = (e) => {
            var db = e.target.result;
            var trans = db.transaction(store, 'readwrite');
            var objStore = trans.objectStore(store);
            var data = { id: key, data: value };
            var putReq = objStore.put(data);
            putReq.onsuccess = function () {
                defferd.resolve();
            }
        }
    }
    catch (e) {
        defferd.reject(e);
    }
    return defferd.promise();
};
SideMenu.DataBase.GetData = (store, key) => {
    var defferd = $.Deferred();
    try {
        indexedDB.open(SideMenu.DataBase.Name).onsuccess = (e) => {
            var db = e.target.result;
            var trans = db.transaction(store, 'readwrite');
            var objStore = trans.objectStore(store);
            objStore.get(key).onsuccess = function (event) {
                var result = event.target.result;
                if (!result) defferd.reject("key was not found");
                else defferd.resolve(result.data);
            };
        }
    }
    catch (e) {
        defferd.reject(e);
    }
    return defferd.promise();
};

SideMenu.Files = {};
SideMenu.Files.Save = (value, name) => {
    var blob = new Blob([value], { type: 'text/plain' })
    window.navigator.msSaveBlob(blob, name);
};
SideMenu.Files.Load = (async () => {
    //todo
})


//サイドメニュー要素の入れ物
SideMenu.Elements = {};
SideMenu.ViewOrder = ["Predictor", "Estimator"];

SideMenu.Colors = ["unrated", "gray", "brown", "green", "cyan", "blue", "yellow", "orange", "red"];
SideMenu.GetColor = (rating) => {
    var colorIndex = 0
    if (rating > 0) {
        colorIndex = Math.min(Math.floor(rating / 400) + 1, 8)
    }
    return SideMenu.Colors[colorIndex]
};

//Estimator
SideMenu.Elements.Estimator = (async () => {
	await SideMenu.appendToSideMenu(/beta.atcoder.jp/,'Estimator',getElem);
	async function getElem() {
	$("#estimator-input").val(localStorage.getItem("sidemenu_estimator_value"));
	if (!SideMenu.Datas.History) await SideMenu.Datas.Update.History();
	
	var js = 
	`(() => {
	    var estimator_state = parseInt(localStorage.getItem("sidemenu_estimator_state"));
	    \$("#estimator-input").val(localStorage.getItem("sidemenu_estimator_value"));
	    updateInputs();
	
		\$("#estimator-input").keyup(updateInputs);
	
	    \$("#estimator-toggle").click(function () {
	        \$("#estimator-input").val(\$("#estimator-res").val());
	        estimator_state = (estimator_state + 1) % 2;
			updateInputs();
	    })
	
	    function updateInputs() {
			var input = \$("#estimator-input").val();
			if (!isFinite(input)) {
				displayAlert("数字ではありません")
				return;
			}
	        var history = SideMenu.Datas.History.filter(x => x.IsRated);
			history.sort(function (a, b) {
				if (a.EndTime < b.EndTime) return 1;
				if (a.EndTime > b.EndTime) return -1;
				return 0;
			})
			history = history.map(x => x.InnerPerformance)
			var input = parseInt(input)
			var res = -1;
			if (estimator_state === 0) {
				\/\/ binary search
				var goal_rating = unpositivize_rating(input)
				var lo = -10000.0;
				var hi = 10000.0;
				for (var i = 0; i < 100; ++i) {
					var mid = (hi + lo) \/ 2;
					var r = calc_rating([mid].concat(history));
					if (r >= goal_rating) {
						hi = mid;
					} else {
						lo = mid;
					}
				}
	            res = (hi + lo) \/ 2;
	            \$("#estimator-input-desc").text("目標レーティング");
	            \$("#estimator-res-desc").text("必要パフォーマンス");
			}
			else {
	            res = calc_rating([input].concat(history));
	            \$("#estimator-input-desc").text("パフォーマンス");
	            \$("#estimator-res-desc").text("到達レーティング");
	        }
	        res = Math.round(res * 100) \/ 100
	        if (!isNaN(res)) \$("#estimator-res").val(res);
	        updateLocalStorage();
	        updateTweetBtn();
		}
	
		function updateLocalStorage() {
			localStorage.setItem("sidemenu_estimator_state", estimator_state);
			localStorage.setItem("sidemenu_estimator_value", \$("#estimator-input").val());
		}
	
		function updateTweetBtn() {
	        var tweetStr =
	            \`AtCoderのハンドルネーム: \${userScreenName}%0A
	\${estimator_state == 0 ? "目標レーティング" : "パフォーマンス"}: \${\$("#estimator-input").val()}%0A
	\${estimator_state == 0 ? "必要パフォーマンス" : "到達レーティング"}: \${\$("#estimator-res").val()}%0A\`;
	        \$('#estimator-tweet').attr("href", \`https:\/\/twitter.com\/share?text=\${tweetStr}&url=https:\/\/greasyfork.org\/ja\/scripts\/369954-ac-predictor\`);
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
	`<div id="estimator-alert"><\/div>
	<div class="row">
		<div class="input-group">
			<span class="input-group-addon" id="estimator-input-desc">目標レーティング<\/span>
			<input type="number" class="form-control" id="estimator-input">
		<\/div>
	<\/div>
	<div class="row">
		<div class="input-group">
			<span class="input-group-addon" id="estimator-res-desc">必要パフォーマンス<\/span>
			<input class="form-control" id="estimator-res" disabled="disabled">
			<span class="input-group-btn">
				<button class="btn btn-default" id="estimator-toggle">入替<\/button>
			<\/span>
		<\/div>
	<\/div>
	<div class="row" style="margin: 10px 0px;">
		<a class="btn btn-default col-xs-offset-8 col-xs-4" rel="nofollow" onClick="window.open(encodeURI(decodeURI(this.href)),'twwindow','width=550, height=450, personalbar=0, toolbar=0, scrollbars=1'); return false;" id='estimator-tweet'>ツイート<\/a>
	<\/div>`;
	
	return `${dom}
	<script>${js}</script>
	<style>${style}</style>`;
	}
});

//Predictor
SideMenu.Elements.Predictor = (async () => {
	await SideMenu.appendToSideMenu(/beta.atcoder.jp\/contests\/.+/,'Predictor',getElem);
	async function getElem() {
	//NameSpace
	SideMenu.Predictor = {};
	var maxDic =
	    [
	        [/^abc\d{3}$/, 1600],
	        [/^arc\d{3}$/, 3200],
	        [/^agc\d{3}$/, 8192],
	        [/^apc\d{3}$/, 8192],
			[/^cf\d{2}-final-open$/, 8192],
	        [/^soundhound2018-summer-qual$/, 2400],
	        [/^dwacon5th-prelims$/, 2800],
	        [/.*/, 8192]
	    ];
	SideMenu.Predictor.maxPerf = maxDic.filter(x => x[0].exec(contestScreenName))[0][1];
	
	if (!SideMenu.Datas.History) await SideMenu.Datas.Update.History().done(() => { isDone = true });
	
	var js = 
	`(() => {
	    \/\/各参加者の結果
	    var eachParticipationResults = {};
	    var isAlreadyAppendRowToStandings = false;
	
	    const specialContest = ['practice', 'APG4b', 'abs'];
	
	    const predictorElements = ['predictor-input-rank', 'predictor-input-perf', 'predictor-input-rate', 'predictor-current', 'predictor-reload', 'predictor-tweet'];
	    const firstContestDate = moment("2016-07-16 21:00");
	    const Interval = 30000;
	
	    const ratedLimit = contestScreenName === "SoundHound Inc. Programming Contest 2018 -Masters Tournament-"
	        ? 2000 : (\/abc\\d{3}\/.test(contestScreenName) ? 1200 : (\/arc\\d{3}\/.test(contestScreenName) ? 2800 : Infinity));
	    const defaultAPerf = \/abc\\d{3}\/.test(contestScreenName) ? 800 : 1600;
	
	    const isStandingsPage = \/standings(\\?.*)?\$\/.test(document.location);
	
	    \$('[data-toggle="tooltip"]').tooltip();
	    \$('#predictor-reload').click(function () {
	        UpdatePredictorsData();
	    });
	    \$('#predictor-current').click(function () {
	        \/\/自分の順位を確認
	        var myRank = 0;
	        
	        var ratedCount = 0;
	        var lastRank = 0;
	        var rank = 1;
	        var isContainedMe = false;
	        \/\/全員回して自分が出てきたら順位更新フラグを立てる
	        SideMenu.Datas.Standings.StandingsData.forEach(function (element) {
	            if (lastRank !== element.Rank) {
	                if (isContainedMe) {
	                    myRank = rank + Math.max(0, ratedCount - 1) \/ 2;
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
	            myRank = rank + ratedCount \/ 2;
	        }
	
	        if (myRank === 0) return;
	        \$('#predictor-input-rank').val(myRank);
	        lastUpdated = 0;
	        drawPredictor();
	    });
	    \$('#predictor-input-rank').keyup(function (event) {
	        lastUpdated = 0;
	        drawPredictor();
	    });
	    \$('#predictor-input-perf').keyup(function (event) {
	        lastUpdated = 1;
	        drawPredictor();
	    });
	    \$('#predictor-input-rate').keyup(function (event) {
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
	
	    \$.when(
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
	
	    \/\/再描画をの期間を再更新する
	    function SetUpdateInterval() {
	        UpdatePredictorsData();
	        if (!endTime.isBefore()) setTimeout(SetUpdateInterval, Interval);
	    }
	
	    \/\/自分のレートをパフォから求める
	    function getRate(perf) {
	        return positivize_rating(calc_rating(SideMenu.Datas.History.filter(x => x.IsRated).map(x => x.Performance).concat(perf).reverse()));
	    }
	
	    \/\/パフォを順位から求める()
	    function getPerf(rank) {
	        var upper = 8192
	        var lower = -8192
	    
	        while (upper - lower > 0.5) {
	            if (rank - 0.5 > calcRankVal(lower + (upper - lower) \/ 2)) upper -= (upper - lower) \/ 2
	            else lower += (upper - lower) \/ 2
	        }
	    
	        var innerPerf = Math.round(lower + (upper - lower) \/ 2)
	    
	        return Math.min(innerPerf, SideMenu.Predictor.maxPerf);
	    }
	
	    \/\/パフォを求める際に出てくるパフォごとの順位を求める
	    function calcRankVal(X) {
	        var res = 0;
	        activePerf.forEach(function (APerf) {
	            res += 1.0 \/ (1.0 + Math.pow(6.0, ((X - APerf) \/ 400.0)))
	        })
	        return res;
	    }
	
	    \/\/データを更新して描画する
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
	        \$('#predictor-reload').button('loading');
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
	            AddAlert(\`最終更新 : \${moment().format('HH:mm:ss')}\`);
	        }).fail(() => {
	            disabled();
	            AddAlert('データの読み込みに失敗しました');
	        });
	    }
	
	    \/\/ActivePerfの再計算
	    function CalcActivePerf() {
	        activePerf = [];
	        var isSomebodyRated = false;
	        \/\/Perf計算時に使うパフォ(Ratedオンリー)
	        SideMenu.Datas.Standings.StandingsData.forEach(function (element) {
	            if (element.IsRated && element.TotalResult.Count !== 0) {
	                isSomebodyRated = true;
	                if (!(SideMenu.Datas.APerfs[element.UserScreenName])) {
	                    activePerf.push(defaultAPerf);
	                }
	                else {
	                    activePerf.push(SideMenu.Datas.APerfs[element.UserScreenName])
	                }
	            }
	        });
	        if (!isSomebodyRated) {
	            SideMenu.Datas.Standings.Fixed = false;
	            \/\/元はRatedだったと推測できる場合、通常のRatedと同じような扱い
	            activePerf = [];
	            for (var i = 0; i < SideMenu.Datas.Standings.StandingsData.length; i++) {
	                var element = SideMenu.Datas.Standings.StandingsData[i];
	                if (element.OldRating >= ratedLimit || element.TotalResult.Count === 0) continue;
	                SideMenu.Datas.Standings.StandingsData[i].IsRated = true;
	                if (!(SideMenu.Datas.APerfs[element.UserScreenName])) {
	                    activePerf.push(defaultAPerf);
	                    continue;
	                }
	                activePerf.push(SideMenu.Datas.APerfs[element.UserScreenName]);
	            }
	        }
	    }
	
	    \/\/フォームを更新
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
	            var rank = \$("#predictor-input-rank").val();
	            var perf = getPerf(rank);
	            var rate = getRate(perf);
	            lastUpdated = 0;
	            UpdatePredictor(rank, perf, rate);
	        }
	        function UpdatePredictorFromPerf() {
	            var perf = \$("#predictor-input-perf").val();
	            var upper = 16384
	            var lower = 0
	            while (upper - lower > 0.125) {
	                if (perf > getPerf(lower + (upper - lower) \/ 2)) upper -= (upper - lower) \/ 2
	                else lower += (upper - lower) \/ 2
	            }
	            lastUpdated = 1
	            var rank = lower + (upper - lower) \/ 2;
	            var rate = getRate(perf)
	            UpdatePredictor(rank, perf, rate)
	        }
	        function UpdatePredictorFromRate() {
	            var rate = \$("#predictor-input-rate").val();
	            var upper = 16384
	            var lower = 0
	            while (upper - lower > 0.125) {
	                if (rate < getRate(lower + (upper - lower) \/ 2)) upper -= (upper - lower) \/ 2
	                else lower += (upper - lower) \/ 2
	            }
	            lastUpdated = 2
	            var perf = lower + (upper - lower) \/ 2;
	            upper = 16384
	            lower = 0
	            while (upper - lower > 0.125) {
	                if (perf > getPerf(lower + (upper - lower) \/ 2)) upper -= (upper - lower) \/ 2
	                else lower += (upper - lower) \/ 2
	            }
	            var rank = lower + (upper - lower) \/ 2;
	            UpdatePredictor(rank, perf, rate)
	        }
	        function UpdatePredictor(rank, perf, rate) {
	            \$("#predictor-input-rank").val(round(rank))
	            \$("#predictor-input-perf").val(round(perf))
	            \$("#predictor-input-rate").val(round(rate))
	            updatePredictorTweetBtn()
	            function round(val) {
	                return Math.round(val * 100) \/ 100;
	            }
	        }
	        
	        \/\/ツイートボタンを更新する
	        function updatePredictorTweetBtn() {
	            var tweetStr =
	                \`Rated内順位: \${\$("#predictor-input-rank").val()}位%0A
	パフォーマンス: \${\$("#predictor-input-perf").val()}%0A
	レート: \${\$("#predictor-input-rate").val()}%0A
	\`
	            \$('#predictor-tweet').attr("href", \`https:\/\/twitter.com\/share?text=\${tweetStr}&url=https:\/\/greasyfork.org\/ja\/scripts\/369954-ac-predictor\`)
	        }
	    }
	
	    \/\/最終更新などの要素を追加する
	    function AddAlert(content) {
	        \$("#predictor-alert").html(\`<h5 class='sidemenu-txt'>\${content}<\/h5>\`);
	    }
	
	    \/\/要素のDisableadを外す
	    function enabled() {
	        \$('#predictor-reload').button('reset');
	        predictorElements.forEach(element => {
	            \$(\`#\${element}\`).removeAttr("disabled");
	        });
	    }
	
	    \/\/要素にDisableadをつける
	    function disabled() {
	        \$('#predictor-reload').button('reset');
	        predictorElements.forEach(element => {
	            \$(\`#\${element}\`).attr("disabled", true);
	        });
	    }
	
	    \/\/全員の結果データを更新する
	    function updateResultsData() {
	
	        eachParticipationResults = {};
	
	        const IsFixed = SideMenu.Datas.Standings.Fixed;
	        \/\/タイの人を入れる(順位が変わったら描画→リストを空に)
	        var tiedList = [];
	        var rank = 1;
	        var lastRank = 0;
	        var ratedCount = 0;
	        var maxPerf = ratedLimit === Infinity ? getPerf(1) : ratedLimit + 400;
	        var currentPerf = maxPerf - 0.5;
	        var rankVal = calcRankVal(currentPerf);
	        \/\/全員回す
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
	        \/\/最後に更新してあげる
	        addRow();
	
	        \/\/タイリストの人全員行追加
	        function addRow() {
	            var fixRank = rank + Math.max(0, ratedCount - 1) \/ 2;
	            while (rankVal < fixRank - 0.5 && currentPerf >= -8192) {
	                currentPerf--;
	                rankVal = calcRankVal(currentPerf);
	            }
	            tiedList.forEach(e => {
	                var isRated = e.IsRated && e.TotalResult.Count !== 0;
	                var isSubmitted = e.TotalResult.Count !== 0;
	                var matches = e.Competitions - (IsFixed && isRated ? 1 : 0);
	                var perf = currentPerf + 0.5;
	                var oldRate = (IsFixed && isSubmitted ? e.OldRating : e.Rating);
	                var newRate = (IsFixed ? e.Rating : Math.floor(positivize_rating(matches !== 0 ? calc_rating_from_last(oldRate, perf, matches) : perf - 1200)));
	                eachParticipationResults[e.UserScreenName] = { perf: perf, oldRate: oldRate, newRate: newRate, isRated: isRated, isSubmitted: isSubmitted };
	            });
	        }
	    }
	
	    \/\/結果データを順位表に追加する
	    function addPerfToStandings() {
	        if (!isStandingsPage) return;
	        \$('.standings-perf , .standings-rate').remove();
	        if (!isAlreadyAppendRowToStandings) {
	            (new MutationObserver(() => { addPerfToStandings(); })).observe(document.getElementById('standings-tbody'), { childList: true });
	            \$('thead > tr').append('<th class="standings-result-th" style="width:84px;min-width:84px;">perf<\/th><th class="standings-result-th" style="width:168px;min-width:168px;">レート変化<\/th>');
	            isAlreadyAppendRowToStandings = true;
	        }
	        \$('#standings-tbody > tr').each((index, elem) => {
	            var userName = \$('.standings-username .username', elem).text();
	            var perfArr = eachParticipationResults[userName];
	            if (!perfArr) {
	                \$(elem).append(\`<td class="standings-result standings-perf">-<\/td>\`);
	                \$(elem).append(\`<td class="standings-result standings-rate">-<\/td>\`);
	                return;
	            }
	            var perf = perfArr.isSubmitted ? ratingSpan(perfArr.perf) : '<span class="user-unrated">-<\/span>';
	            var oldRate = perfArr.oldRate;
	            var newRate = perfArr.newRate;
	            var IsRated = perfArr.isRated;
	            \$(elem).append(\`<td class="standings-result standings-perf">\${ratingSpan(perf)}<\/td>\`);
	            \$(elem).append(\`<td class="standings-result standings-rate">\${getRatingChangeStr(oldRate,newRate)}<\/td>\`);
	            function getRatingChangeStr(oldRate, newRate) {
	                return IsRated ? \`\${ratingSpan(oldRate)} -> \${ratingSpan(newRate)} (\${(newRate >= oldRate ? '+' : '')}\${newRate - oldRate})\` : \`\${ratingSpan(oldRate)}(unrated)\`;
	            }
	            function ratingSpan(rate) {
	                return \`<span class="user-\${SideMenu.GetColor(rate)}">\${rate}<\/span>\`;
	            }
	        });
	    }
	    
	})();`;
	var style = 
	``;
	var dom = 
	`<div id="predictor-alert" class="row"><h5 class='sidemenu-txt'>順位表読み込み中…<\/h5><\/div>
	<div id="predictor-data" class="row">
	    <div class="input-group col-xs-offset-1 col-xs-10">
	        <span class="input-group-addon">順位<span class="glyphicon glyphicon-question-sign" aria-hidden="true" data-html="true" data-toggle="tooltip" data-placement="right" title="" data-original-title="Rated内の順位です。複数人同順位の際は人数を加味します(5位が4人居たら6.5位として計算)"><\/span><\/span>
	        <input class="form-control" id="predictor-input-rank">
	        <span class="input-group-addon">位<\/span>
	    <\/div>
	        
	    <div class="input-group col-xs-offset-1 col-xs-10">
	        <span class="input-group-addon">パフォーマンス<\/span>
	        <input class="form-control" id="predictor-input-perf">
	    <\/div>
	
	    <div class="input-group col-xs-offset-1 col-xs-10">
	        <span class="input-group-addon">レーティング<\/span>
	        <input class="form-control" id="predictor-input-rate">
	    <\/div>
	<\/div>
	<div class="row">
	    <div class="btn-group col-xs-offset-1">
	        <button class="btn btn-default" id="predictor-current">現在の順位<\/button>
	        <button type="button" class="btn btn-primary" id="predictor-reload" data-loading-text="更新中…">更新<\/button>
	        <a class="btn btn-default" rel="nofollow" onClick="window.open(encodeURI(decodeURI(this.href)),'twwindow','width=550, height=450, personalbar=0, toolbar=0, scrollbars=1'); return false;" id='predictor-tweet'>ツイート<\/a>
	        <!--<button class="btn btn-default" id="predictor-solved" disabled>現問題AC後<\/button>-->
	    <\/div>
	<\/div>`;
	
	return `${dom}
	<script>${js}</script>
	<style>${style}</style>`;
	}
});



SideMenu.ViewOrder.forEach(async (elem) => {
    await SideMenu.Elements[elem]();
});
