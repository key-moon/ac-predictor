import { roundValue } from "../../../src/libs/utils/roundValue";

test("round", () => {
    expect(roundValue(31415.92, 0)).toBe(31416);
});

test("round to one decimal place", () => {
    expect(roundValue(31415.92, 1)).toBe(31415.9);
});

test("round to the 10th", () => {
    expect(roundValue(31415.92, -1)).toBe(31420);
});
