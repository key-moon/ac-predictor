// ==UserScript==
// @name        ac-predictor
// @namespace   http://ac-predictor.azurewebsites.net/
// @version     0.1.0
// @description �R���e�X�g����AtCoder�̃p�t�H�[�}���X��\�����܂�
// @author      keymoon
// @license     MIT
// @homepage    https://github.com/key-moon/ac-predictor
// @supportURL  https://github.com/key-moon/ac-predictor/issues
// @match       https://beta.atcoder.jp/contests/*
// ==/UserScript==
embedData();
genSideMenu();
appendToSideMenu(getPredictorElem())
appendToSideMenu(getEstimatorElem())

function embedData() {
	historyJsonURL = `https://beta.atcoder.jp/users/${userScreenName}/history/json`
	standingsJsonURL = `https://beta.atcoder.jp/contests/${contestScreenName}/standings/json`
	aperfsJsonURL = `https://ac-predictor.azurewebsites.net/api/aperfs/${contestScreenName}`
	$.when(
		$.ajax({
			url: historyJsonURL,
			type: "GET",
			dataType: "json"
		}),
		$.ajax({
			url: standingsJsonURL,
			type: "GET",
			dataType: "text"
		})
	).done(function (history,standings, aperfs) {
		historyObj = history[0]
		standingsObj = standings[0]
	});
	function appendScriptToHead(script) {
		var head = document.getElementsByTagName('head')[0];
		var sideMenuScript = script;
		var s = document.createElement("script");
		s.innerHTML = script;
		head.appendChild(s)
	}
}

//�T�C�h���j���[�𐶐�
function genSideMenu() {
	var menuWidth = 350
	var keyWidth = 50
	var speed = 150
	var sideMenuScript =
`<script>//�Q�l:http://blog.8bit.co.jp/?p=12308
const activeClass = 'sidemenu-active'
var menuWrap = '#menu_wrap'
var sideMenu = '#sidemenu'
var sideMenuKey = '#sidemenu-key'
var menuWidth = ${menuWidth}
var keyWidth = ${keyWidth}
var speed = ${speed}

var windowHeight = $(window).height();
$(sideMenu).height(windowHeight);

//���j���[�J��
$(sideMenuKey).click(function () {
	if ($(menuWrap).hasClass(activeClass)) {
		//active���폜
		$(menuWrap).removeClass(activeClass);
		//�{�^���̕�����ύX
		$(sideMenuKey).removeClass('glyphicon-menu-right');
		$(sideMenuKey).addClass('glyphicon-menu-left');
	}
	else {
		//active��t�^
		$(menuWrap).addClass(activeClass);
		//�{�^���̕�����ύX
		$(sideMenuKey).removeClass('glyphicon-menu-left');
		$(sideMenuKey).addClass('glyphicon-menu-right');
	};
});

//��ʃ��T�C�Y����height��ǂݒ���
var timer = false;
$(window).resize(function () {
	if (timer !== false) {
		clearTimeout(timer);
	}
	timer = setTimeout(function () {
		windowHeight = $(window).height();
		$(sideMenu).height(windowHeight);
	}, 50);
});</script>`
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

.sidemenu-container{
	padding: 10px 20px 10px 20px;
	border-bottom: 1px solid #FFF;
}

.sidemenu-txt{
	color: #DDD;
}
</style>`
	var tweetScript =
`<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>`
	var ratingScript = 
`<script src="https://koba-e964.github.io/atcoder-rating-estimator/atcoder_rating.js"></script>`
	$('#main-div').append(`<div id="menu_wrap"><div id="sidemenu" class="container"></div><div id="sidemenu-key" class="glyphicon glyphicon-menu-left"></div>${tweetScript}${ratingScript}${sideMenuScript}${sideMenuStyle}</div>`)
}
function appendToSideMenu(elem) {
	$('#sidemenu').append(elem)
}

function getPredictorElem() {

	//���݂̏���,�p�t�H,���[�g
	//���̖���ʂ����ꍇ�̏���,�p�t�H,���[�g
	//�����X�V�̎��Ԑݒ�
	//�����X�V�{�^��
	//�c�C�[�g�{�^����?
	var predictorScript =
` LoadAPerfs()
function UpdatePredictor(rank,perf,rate) {
	$("#estimator-input-rank").val(rank)
	$("#estimator-input-perf").val(perf)
	$("#estimator-input-perf").val(rate)
}
function UpdatePredictorFromRank(rank) {
	var perf = getPerf(rank)
	var newRate = Math.min(maxPerf, positivize_rating(calc_rating_from_last(oldRate, perf, matches)))
	UpdatePredictor(rank,perf,rate)
}
//���Ƃł��
/*function UpdatePredictorFromPerfomance(perf) {
	
}
function UpdatePredictorFromRating(perf) {
	
}*/
function getPerf(rank) {
	var upper = 8192
	var lower = -8192

	while (upper - lower > 0.5) {
		if (rank - 0.5 > calcPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
		else lower += (upper - lower) / 2
	}

	var innerPerf = Math.round(lower + (upper - lower) / 2)

	return Math.min(innerPerf, maxPerf)

	function calcPerf(X) {
		var res = 0;
		activePerf.forEach(function (APerf) {
			res += 1.0 / (1.0 + Math.pow(6.0, ((X - APerf) / 400.0)))
		})
		return res;
	}
}
$('#estimator-current').click(function () {
	//�����̏��ʂ��m�F
	var myRank = 0;
	var tiedList = []

	//�S����
	standingsObj.forEach(function (element) {
		if (!element.IsRated || element.TotalResult.Count === 0) return;
		if (lastRank !== element.Rank) {
			rank += tiedList.length;
			tiedList = []
		}
		tiedList.push(element)
		lastRank = element.Rank;
	})

	//���݂��Ȃ��������
	if(myRank === 0) {
		UpdatePredictor("","","")
	}
	else {
		UpdatePredictorFromRank(myRank)
	}
})
function ReloadStandings() {
	$.ajax({
		url: standingsJsonURL,
		type: "GET",
		dataType: "json"
	}).done(function (standings) {
		standingsObj = standings[0]	
		//Perf�v�Z���Ɏg���p�t�H(Rated�I�����[)
		activePerf = []
		standingsObj.forEach(function (element) {
			if (element.IsRated && element.TotalResult.Count !== 0) {
				if (!(aperfsObj[element.UserScreenName])) {
					console.log(element.UserScreenName)
				}
				activePerf.push(aperfsObj[element.UserScreenName])
			}
		})
	}
}
function LoadAPerfs() {
	$.ajax({
		url: aperfsJsonURL,
		type: "GET",
		dataType: "json"
	}).done(function (aperfs) {
		aperfsObj = aperfs[0]
	}
	dicLength = Object.keys(aperfsObj).length;
	if (dicLength == 0) {
		setTimeout(LoadAPerfs, 30000)
	}
}
$('#estimator-reload').click(function () {
	ReloadStandings()
})
$('#estimator-input-rank').on('change', function(event) {
    UpdatePredictorFromRank($("#estimator-input-rank").val())
});


`
	var dom =
`<div id="predictor" class="sidemenu-container">
	<h3 class="sidemenu-txt">Rating Predictor</h3>
	<div id="predictor-alert"></div>
	<div id="predictor-data">
		<div class="row">
			<div class="input-group col-xs-offset-1 col-xs-10">
				<span class="input-group-addon">����</span>
				<input type="number" class="form-control" id="estimator-input-rank">
				<span class="input-group-addon">��</span>
			</div>
			
			<div class="input-group col-xs-offset-1 col-xs-10">
				<span class="input-group-addon">�p�t�H�[�}���X</span>
				<input type="number" class="form-control" id="estimator-input-perf" disabled>
			</div>

			<div class="input-group col-xs-offset-1 col-xs-10">
				<span class="input-group-addon">���[�e�B���O</span>
				<input type="number" class="form-control" id="estimator-input-rate" disabled>
			</div>
		</div>
	</div>
	<div class="btn-group">
		<button class="btn btn-default" id="estimator-current">���݂̏���</button>
		<button class="btn btn-default" id="estimator-solved" disabled>�����AC��</button>
	</div>
	<div id="predictor-reload">
		<h5 class="sidemenu-txt">�X�V�ݒ�</h5>
		<div class="row">
			<!--<div class="input-group col-xs-offset-1 col-xs-10">
				<span class="input-group-addon" id="estimator-input-desc">�����X�V</span>
				<input type="number" class="form-control" id="estimator-input">
				<span class="input-group-addon">�b</span>
			</div>-->
			<button class="btn btn-primary col-xs-offset-6 col-xs-5" id="estimator-reload">�������X�V</button>
		</div>
	</div>
	<script>${predictorScript}</script>
</div>`
	return dom;
}

function getEstimatorElem() {
	var estimatorScript =
		`var estimator_state = 0;
$("#estimator-calc").click(function () {
	var input = $("#estimator-input").val();
	if (!isFinite(input)) {
		displayAlert("�����ł͂���܂���")
		console.log("NaN")
		return;
	}
	var history = historyObj.filter(x => x.IsRated)
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
			console.log(r)
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
	$("#estimator-res").val(res)
	updateTweetBtn()
});

$("#estimator-toggle").click(function () {
	if (estimator_state === 0) {
		$("#estimator-input-desc").text("�p�t�H�[�}���X")
		$("#estimator-res-desc").text("���B���[�e�B���O")
		estimator_state = 1;
	}
	else {
		$("#estimator-input-desc").text("�ڕW���[�e�B���O")
		$("#estimator-res-desc").text("�K�v�p�t�H�[�}���X")
		estimator_state = 0;
	}
	var val = $("#estimator-res").val();
	$("#estimator-res").val($("#estimator-input").val())
	$("#estimator-input").val(val)
	updateTweetBtn()
});

function updateTweetBtn() {
	var tweetStr = 
\`AtCoder�̃n���h���l�[��: \${userScreenName}%0A
\${estimator_state == 0 ? "�ڕW���[�e�B���O" : "�p�t�H�[�}���X"}: \${$("#estimator-input").val()}%0A
\${estimator_state == 0 ? "�K�v�p�t�H�[�}���X" : "���B���[�e�B���O"}: \${$("#estimator-res").val()}\`
	$('#estimator-tweet').attr("href", \`https://twitter.com/intent/tweet?text=\${tweetStr}\`)
}

function displayAlert (message) {
	var alertDiv =  document.createElement('div')
	alertDiv.setAttribute("role", "alert")
	alertDiv.setAttribute("class", "alert alert-warning alert-dismissible")
		var closeButton = document.createElement('button')
		closeButton.setAttribute("type", "button")
		closeButton.setAttribute("class", "close")
		closeButton.setAttribute("data-dismiss", "alert")
		closeButton.setAttribute("aria-label", "����")
			var closeSpan = document.createElement('span')
			closeSpan.setAttribute("aria-hidden", "true")
			closeSpan.textContent = "�~"
		closeButton.appendChild(closeSpan)
		var	messageContent = document.createTextNode(message)
	alertDiv.appendChild(closeButton)
	alertDiv.appendChild(messageContent)
	$("#estimator-alert").append(alertDiv)
}`
	var dom =
`<div id="estimator" class="sidemenu-container">
	<h3 class="sidemenu-txt">Rating Estimator</h3>
	<div id="estimator-alert"></div>
	<div class="row">
		<div class="input-group">
			<span class="input-group-addon" id="estimator-input-desc">�ڕW���[�g</span>
			<input type="number" class="form-control" id="estimator-input">
			<span class="input-group-btn">
				<button class="btn btn-primary" id="estimator-calc">�v�Z</button>
			</span>
		</div>
	</div>
	<div class="row">
		<div class="input-group">
			<span class="input-group-addon" id="estimator-res-desc">�K�v�p�t�H�[�}���X</span>
			<input class="form-control" id="estimator-res" disabled="disabled">
			<span class="input-group-btn">
				<button class="btn btn-default" id="estimator-toggle">����</button>
			</span>
		</div>
	</div>
	<div class="row" style="margin: 10px 0px;">
		<a class="btn btn-default col-xs-offset-8 col-xs-4" rel="nofollow" onClick="window.open(encodeURI(decodeURI(this.href)),'twwindow','width=550, height=450, personalbar=0, toolbar=0, scrollbars=1'); return false;" id='estimator-tweet'>�c�C�[�g</a>
	</div>
	<script>${estimatorScript}</script>
</div>`
	return dom;
}