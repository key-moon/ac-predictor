export function roundValue(value: number, numDigits: number): number {
    return Math.round(value * 10 ** numDigits) / 10 ** numDigits;
}
