﻿function DrawTable(contestID,callback) {
	var StandingsURL = `http://ac-predictor.azurewebsites.net/api/standings/${contestID}`
	var APerfsURL = `http://ac-predictor.azurewebsites.net/api/aperfs/${contestID}`
	
	var table = document.getElementById('standings-body')

	var loadDoneCount = 0

	var isFixed;

	var APerfs;
	var Standings;

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
		//テーブルをクリア
		table.textContent = null

		//Perf計算時に使うパフォ(Ratedオンリー)
		var activePerf = []
		Standings.forEach(function (element) {
			if (element.IsRated && element.TotalResult.Count !== 0) {
				if (!(APerfs[element.UserScreenName])) {
					console.log(element.UserScreenName)
				}
				else {
					activePerf.push(APerfs[element.UserScreenName])
				}
			}
		})

		var rank = 1
		var maxPerf = (contestID.substr(0, 3) === "abc" ? 1600 : (contestID.substr(0, 3) === "arc" ? 3200 : 8192))
		var lastRank = 0

		//タイの人を入れる(順位が変わったら描画→リストを空に)
		var tiedList = []

		//全員回す
		Standings.forEach(function (element) {
			if (!element.IsRated || element.TotalResult.Count === 0) return;
			if (lastRank !== element.Rank) {
				addRow()
				rank += tiedList.length;
				tiedList = []
			}
			tiedList.push(element)
			lastRank = element.Rank;
		})
		//最後に更新してあげる
		addRow()

		//タイリストの人全員分行追加
		function addRow() {
			tiedList.forEach(function (element) {
				var oldRate = (isFixed ? element.OldRating : element.Rating)
				var matches = element.Competitions - (isFixed ? 1 : 0)

				var fixRank = rank + (tiedList.length - 1) / 2
				var perf = getPerf(fixRank)
				var newRate = Math.min(maxPerf, math.floor(positivize_rating(calc_rating_from_last(oldRate, perf, matches))))
				var node = genNode(rank, element.UserScreenName, element.TotalResult.Score / 100, perf,oldRate, newRate)
				table.appendChild(node)

				//追加する一行分のノードを取得
				function genNode(rank, name, point, perf, oldrate, newrate) {
					var tr = document.createElement('tr')

					var rankNode = tdNode(rank)
					tr.appendChild(rankNode)

					var nameNode = tdNode(name)
					nameNode.setAttribute("class", `user-${getColor(oldrate)}`)
					tr.appendChild(nameNode)

					var pointNode = tdNode(point)
					tr.appendChild(pointNode)

					var perfNode = tdNode(perf)
					perfNode.setAttribute("class",`user-${getColor(perf)}`)
					tr.appendChild(perfNode)

					var changeNode = getChangeNode(oldrate,newrate);
					tr.appendChild(changeNode)

					return tr;
					function tdNode(text) {
						var td = document.createElement('td')
						td.appendChild(document.createTextNode(text))
						return td
					}

					function getChangeNode(oldRate, newRate) {
						var td = document.createElement('td')
						
						td.appendChild(ratingSpan(oldRate))
						td.appendChild(document.createTextNode(" -> "))
						td.appendChild(ratingSpan(newRate))
						td.appendChild(document.createTextNode(`(${(newRate >= oldRate ? '+' : '')}${newRate - oldRate})`))
						return td

						function ratingSpan(rating) {
							var span = document.createElement('span')
							span.textContent = rating
							span.setAttribute("class", `user-${getColor(rating)}`)
							return span;
						}
					}
				}
			})
		}
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
	}
}