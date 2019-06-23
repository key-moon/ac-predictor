export function roundValue(value, digit) {
    return Math.round(value * 10 ** digit) / 10 ** digit;
}
