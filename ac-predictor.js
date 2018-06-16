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
var APerfs;
var Standings;

function ReDraw(contestID, userName,callback) {
	var StandingsURL = `http://ac-predictor.azurewebsites.net/api/standings/${contestID}`
	var APerfsURL = `http://ac-predictor.azurewebsites.net/api/aperfs/${contestID}`

	var loadDoneCount = 0

	var isFixed;
	
	$.ajax({
		type: 'GET',
		dataType: 'json',
		url: StandingsURL
	})
	.done(
		(data) => {
			Standings = data.StandingsData
			isFixed = data.Fixed
			loadDone()
	})

	$.ajax({
		type: 'GET',
		dataType: 'json',
		url: APerfsURL
	})
	.done(
		(data) => {
			APerfs = data
			loadDone()
	})

	function loadDone() {
		loadDoneCount++;
		if (loadDoneCount >= 2) {
			draw()
			callback()
		}
	}

	function draw() {
		//Perf�v�Z���Ɏg���p�t�H(Rated�I�����[)
		var activePerf = []
		Standings.forEach(function (element) {
			if (!element.IsRated || element.TotalResult.Count == 0) activePerf.push(APerfs[element.UserScreenName])
		})

		//������Standing�v�f
		var myStanding = null;
		//�����Ɠ����ʂ̃J�E���g
		var tiedCount;
		//Rated������
		var ratedRank;
		//���E�p�t�H
		var maxPerf = (contestID.substr(0, 3) == "abc" ? 1600 : (contestID.substr(0, 3) == "arc" ? 3200 : 8192))


		//�`�悷��v�f





		function AnalyseData() {

		}

		
	}

	//���ʂ���p�t�H�擾
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

	//���[�g���v�Z
	//https://koba-e964.github.io/atcoder-rating-estimator/test-last.html ����p�N���Ă��܂��� ���߂�Ȃ���
	function getRating(rating, perf, count) {
		if (count == 0) {
			rating = perf - 1200;
		}
		else {
			rating += f(count);
			var wei = 9 - 9 * 0.9 ** count;
			var num = wei * (2 ** (rating / 800.0)) + 2 ** (perf / 800.0);
			var den = 1 + wei;
			var rating = Math.log2(num / den) * 800.0;
			rating -= f(count + 1);
		}
		return Math.round(Math.max(1, rating));

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
	}
}