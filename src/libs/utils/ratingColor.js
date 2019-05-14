export const colorBounds = {
    "gray": 0,
    "brown": 400,
    "green": 800,
    "cyan": 1200,
    "blue": 1600,
    "yellow": 2000,
    "orange": 2400,
    "red": 2800
};

export const colorNames = ["unrated", "gray", "brown", "green", "cyan", "blue", "yellow", "orange", "red"];

export function getColor(rating) {
    let colorIndex = rating > 0 ? Math.min(Math.floor(rating / 400) + 1, 8) : 0;
    return colorNames[colorIndex];
}