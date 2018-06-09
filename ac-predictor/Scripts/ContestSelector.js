var selector = document.getElementById("contestselector")

var ContestJson = 
$.ajax({
	type: 'GET',
	dataType: 'json',
	url: 'http://ac-predictor.azurewebsites.net/api/aperfs',
	async: false
	}).responseText

console.log(ContestJson)

JSON.parse(ContestJson)
	.forEach(
	function (element) {
		selector.appendChild(`<option>${element}</option>`);
	}
)