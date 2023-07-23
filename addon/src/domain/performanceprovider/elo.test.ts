import EloPerformanceProvider from "./elo";

let provider: EloPerformanceProvider;

beforeEach(() => {
  provider = new EloPerformanceProvider(new Map<string, number>([["user1", 1], ["user2", 2], ["user3", 3.5], ["user4", 3.5], ["user5", 5]]), [2000, 1000, 1000, 0, -1000], 2000);
});

test("availableFor should return proper values", () => {
  expect(provider.availableFor("user1")).toBe(true);
  expect(provider.availableFor("user2")).toBe(true);
  expect(provider.availableFor("user3")).toBe(true);
  expect(provider.availableFor("user4")).toBe(true);
  expect(provider.availableFor("user5")).toBe(true);
  expect(provider.availableFor("toString")).toBe(false);
  expect(provider.availableFor("__proto__")).toBe(false);
});

test("getPerformance should return proper values", () => {
  expect(provider.getPerformance("user1")).toBe(2000);
  expect(provider.getPerformance("user2")).toBe(1230);
  expect(provider.getPerformance("user3")).toBe(415);
  expect(provider.getPerformance("user4")).toBe(415);
  expect(provider.getPerformance("user5")).toBe(-1010);
})

test("getPerformance should raise error when unknown key specified", () => {
  expect(() => provider.getPerformance("toString")).toThrowError("User toString not found");
  expect(() => provider.getPerformance("__proto__")).toThrowError("User __proto__ not found");
});

test("getPerformances should return proper value", () => {
  expect(provider.getPerformances()).toStrictEqual(new Map<string, number>([["user1", 2000], ["user2", 1230], ["user3", 415], ["user4", 415], ["user5", -1010]]));
})
