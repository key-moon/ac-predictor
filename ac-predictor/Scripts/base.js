const colors = ["unrated", "gray", "brown", "green", "cyan", "blue", "yellow", "orange", "red"]
function getColor(rating) {
	var colorIndex = 0
	if (rating > 0) {
		colorIndex = Math.min(Math.floor(rating / 400) + 1, 8)
	}
	return colors[colorIndex]
}