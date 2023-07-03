import FixedPerformanceProvider from "./fixed";

let provider: FixedPerformanceProvider;

beforeEach(() => {
  provider = new FixedPerformanceProvider({ "user1": 0, "user2": 100, "user3": -0.01, "constructor": 1 })
});

test("getPerformance should return proper values", () => {
  expect(provider.getPerformance("user1")).toBe(0);
  expect(provider.getPerformance("user2")).toBe(100);
  expect(provider.getPerformance("user3")).toBe(-0.01);
  expect(provider.getPerformance("constructor")).toBe(1);
})

test("getPerformances should return proper value", () => {
  expect(provider.getPerformances()).toStrictEqual({ "user1": 0, "user2": 100, "user3": -0.01, "constructor": 1 });
})
