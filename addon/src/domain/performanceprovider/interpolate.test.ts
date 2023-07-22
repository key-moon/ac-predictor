import InterpolatePerformanceProvider from "./interpolate";
import PerformanceProvider from "./performancepredictor";

let provider: InterpolatePerformanceProvider;
let basePerformanceProviderMock: PerformanceProvider

beforeEach(() => {
  basePerformanceProviderMock = {
    availableFor: jest.fn((val) => val == "user3" || val == "user5"),
    getPerformance: jest.fn((val) => { if (val == "user3") return 2; if (val == "user5") return 1; throw new Error(); }),
    getPerformances: jest.fn()
  };
  provider = new InterpolatePerformanceProvider({ "user1": 1, "user2": 2, "user3": 2, "user4": 4, "user5": 5, "user6": 6 }, basePerformanceProviderMock);
});

test("availableFor should return proper values", () => {
  expect(provider.availableFor("user1")).toBe(true);
  expect(provider.availableFor("user2")).toBe(true);
  expect(provider.availableFor("user3")).toBe(true);
  expect(provider.availableFor("user4")).toBe(true);
  expect(provider.availableFor("user5")).toBe(true);
  expect(provider.availableFor("user6")).toBe(true);
  expect(provider.availableFor("toString")).toBe(false);
  expect(provider.availableFor("__proto__")).toBe(false);
});

test("getPerformance should return proper values", () => {
  expect(provider.getPerformance("user1")).toBe(2);
  expect(provider.getPerformance("user2")).toBe(2);
  expect(provider.getPerformance("user3")).toBe(2);
  expect(provider.getPerformance("user4")).toBe(1);
  expect(provider.getPerformance("user5")).toBe(1);
  expect(provider.getPerformance("user6")).toBe(-Infinity);
})

test("getPerformance should raise error when unknown key specified", () => {
  expect(() => provider.getPerformance("toString")).toThrowError("User toString not found");
  expect(() => provider.getPerformance("__proto__")).toThrowError("User __proto__ not found");
});

test("getPerformances should return proper value", () => {
  expect(provider.getPerformances()).toStrictEqual({ "user1": 2, "user2": 2, "user3": 2, "user4": 1, "user5": 1, "user6": -Infinity });
});
