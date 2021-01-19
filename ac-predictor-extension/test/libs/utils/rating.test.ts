import {
    calcRatingFromHistory,
    calcRatingFromLast,
    calcRequiredPerformance,
    getColor,
    positivizeRating,
    unpositivizeRating
} from "../../../src/libs/utils/rating";

const perfs = [3920, 3200, 4310, 4391, 4356, 4017, 3687, 4152, 4395, 4415, 4427, 4440, 4174, 4439, 4078, 4437, 3940, 4470, 3402, 3902, 4465, 3442, 3755, 4434, 4414, 4183, 3337, 3388, 3872, 4414, 3830, 4426, 3614, 3767, 4438, 4064, 4413, 4455, 4487, 3842, 4495, 4473, 4179];
const rates = [2720, 2851, 3368, 3647, 3802, 3834, 3806, 3860, 3949, 4021, 4081, 4131, 4135, 4175, 4163, 4198, 4171, 4208, 4142, 4118, 4161, 4102, 4069, 4114, 4149, 4153, 4090, 4034, 4018, 4066, 4044, 4089, 4049, 4023, 4073, 4072, 4111, 4151, 4190, 4159, 4198, 4229, 4224];

test("calc rating from perf history", () => {
    for (let i = 0; i < perfs.length; i++) {
        expect(Math.round(calcRatingFromHistory(perfs.slice(0, i + 1)))).toBe(rates[i]);
    }
});

test("calc rating from previous rate and perf", () => {
    for (let i = 0; i < perfs.length; i++) {
        expect(calcRatingFromLast(i == 0 ? 0 : rates[i - 1], perfs[i], i)).toBeCloseTo(rates[i], -1);
    }
});

test("check inverseness", () => {
    for (let i = -1000; i < 4000; i += 100) {
        expect(unpositivizeRating(positivizeRating(i))).toBeCloseTo(i);
    }
});

test("check necessaries and sufficiency of calcRequiredPerformance", () => {
    for (let i = 1; i < perfs.length; i++) {
        const requiredPerformance = calcRequiredPerformance(rates[i], perfs.slice(0, i));
        const positiveHistory = perfs.slice(0, i);
        positiveHistory.push(requiredPerformance);
        expect(Math.round(calcRatingFromHistory(positiveHistory))).toBe(rates[i]);
        const negativeHistory = perfs.slice(0, i);
        negativeHistory.push(requiredPerformance - 0.001);
        expect(Math.round(calcRatingFromHistory(negativeHistory))).toBeLessThan(rates[i]);
    }
});

test("check border of colors", () => {
    expect(getColor(0)).toBe("unrated");
    expect(getColor(1)).toBe("gray");
    expect(getColor(399)).toBe("gray");
    expect(getColor(400)).toBe("brown");
    expect(getColor(799)).toBe("brown");
    expect(getColor(800)).toBe("green");
    expect(getColor(1199)).toBe("green");
    expect(getColor(1200)).toBe("cyan");
    expect(getColor(1599)).toBe("cyan");
    expect(getColor(1600)).toBe("blue");
    expect(getColor(1999)).toBe("blue");
    expect(getColor(2000)).toBe("yellow");
    expect(getColor(2399)).toBe("yellow");
    expect(getColor(2400)).toBe("orange");
    expect(getColor(2799)).toBe("orange");
    expect(getColor(2800)).toBe("red");
    expect(getColor(5000)).toBe("red");
});
