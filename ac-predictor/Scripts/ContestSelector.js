var state = 0

var selector = document.getElementById("contestselector")
console.log(selector)
var ContestJson = 
$.ajax({
	type: 'GET',
	dataType: 'json',
	url: 'http://ac-predictor.azurewebsites.net/api/aperfs',
	async: false
}).responseText

JSON.parse(ContestJson)
	.forEach(
	function (element) {
		var innerNode = document.createElement('option')
		innerNode.appendChild(document.createTextNode(element))
		console.log(innerNode)
		selector.appendChild(innerNode)
	}
)

function toggleLoadingState() {
	if (state == 0) {
		state = 1
		$('#confirmbtn').button('loading')
	}
	else {
		state = 0
		$('#confirmbtn').button('reset')
	}
}

$('.btn').on('click', function () {
	var $this = $(this)
	var contestID = $("#contestselector").val()
	toggleLoadingState()
	DrawTable(contestID, toggleLoadingState)
});