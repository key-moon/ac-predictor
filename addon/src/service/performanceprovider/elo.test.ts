import EloPerformanceProvider from "./elo";

let provider: EloPerformanceProvider;

beforeEach(() => {
  provider = new EloPerformanceProvider({ "user1": 1, "user2": 2, "user3": 3.5, "user4": 3.5, "user5": 5 }, [2000, 1000, 1000, 0, -1000]);
});

test("getPerformance should return proper values", () => {
  expect(provider.getPerformance("user1")).toBe(2019);
  expect(provider.getPerformance("user2")).toBe(1230);
  expect(provider.getPerformance("user3")).toBe(415);
  expect(provider.getPerformance("user4")).toBe(415);
  expect(provider.getPerformance("user5")).toBe(-1010);
})

test("getPerformances should return proper value", () => {
  expect(provider.getPerformances()).toStrictEqual({ "user1": 2019, "user2": 1230, "user3": 415, "user4": 415, "user5": -1010 });
})
