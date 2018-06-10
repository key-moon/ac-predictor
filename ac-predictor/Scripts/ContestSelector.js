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

console.log(document.getElementById("contestselector"))