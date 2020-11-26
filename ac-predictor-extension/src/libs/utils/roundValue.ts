export function roundValue(value: number, digit: number): number {
    return Math.round(value * 10 ** digit) / 10 ** digit;
}
