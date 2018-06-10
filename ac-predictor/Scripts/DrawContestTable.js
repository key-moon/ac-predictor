var contestID = getParamator()["contestid"]
var StandingsURL = `http://ac-predictor.azurewebsites.net/api/standings/${contestID}`
var APerfsURL = `http://ac-predictor.azurewebsites.net/api/aperfs/${contestID}`

console.log(contestID)

var table = document.getElementById('standings-body')

var loadDoneCount = 0

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
	console.log(Standings)
	loadDoneCount++;
	if (loadDoneCount >= 2) DrawTable()
})

$.ajax({
	type: 'GET',
	dataType: 'json',
	url: APerfsURL
})
.done(
	(data) => {
	APerfs = data
	loadDoneCount++;
	if (loadDoneCount >= 2) DrawTable()
})



function DrawTable() {
	console.log('draw')

	var activePerf = []

	Standings.forEach(function (element) {
		if (!element.IsRated || element.TotalResult.Count == 0) activePerf.push(APerfs[element.UserScreenName])
	})

	console.log(activePerf)

	var rank = 1;
	var lastRank = 0;
	var tiedList = []

	Standings.forEach(function (element) {
		if (!element.IsRated || element.TotalResult.Count == 0) return;
		tiedList.push(element)
		if (lastRank != element.Rank) {
			var fixRank = rank + (tiedList.length - 1) / 2
			var perf = getPerf(fixRank)
			var rate = getRating(element.Rating, perf, element.Competitions)
			var node = genNode(rank, element.UserScreenName, element.TotalResult.Score / 100,perf,``)
			table.appendChild(node)
			rank += tiedList.length;
			tiedList = []
		}
		lastRank = element.Rank;
	})

	function getPerf(rank) {
		var upper = 8192
		var lower = -8192

		while (upper - lower > 0.5) {
			if (rank - 0.5 > calcPerf(lower + (upper - lower) / 2)) upper -= (upper - lower) / 2
			else lower += (upper - lower) / 2
		}

		return Math.round(lower + (upper - lower) / 2)

		function calcPerf(X) {
			var res = 0;
			activePerf.forEach(function (APerf) {
				res += 1.0 / (1.0 + Math.pow(6.0, ((X - APerf) / 400.0)))
			})
			return res;
		}
	}

	function getRating(rating ,perf , count) {

	}

	function genNode(rank, name, point, perf, change) {
		var tr = document.createElement('tr')

		tr.appendChild(tdNode(rank))
		tr.appendChild(tdNode(name))
		tr.appendChild(tdNode(point))
		tr.appendChild(tdNode(perf))
		tr.appendChild(tdNode(change))

		return tr;
		function tdNode(text) {
			var td = document.createElement('td')
			td.appendChild(document.createTextNode(text))
			return td
		}
	}
}

function getParamator() {
	var arg = new Object;
	var pair = location.search.substring(1).split('&');
	for (var i = 0; pair[i]; i++) {
		var kv = pair[i].split('=');
		arg[kv[0]] = kv[1];
	}
	return arg;
}