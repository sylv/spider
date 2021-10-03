import { transformNumber } from "./number.transform";

it("should parse number-like strings", () => {
  expect(transformNumber("10")).toBe(10);
  expect(transformNumber("10.5")).toBe(10.5);
  expect(transformNumber("10,000.10")).toBe(10_000.1);
});

it("should parse human-like number strings", () => {
  expect(transformNumber("10k")).toBe(10_000);
  expect(transformNumber("$10k")).toBe(10_000);
  expect(transformNumber("10.5k")).toBe(10_500);
  expect(transformNumber("one thousand")).toBe(1000);
});

it("should prefer the first number it finds", () => {
  expect(transformNumber("2015-2016")).toBe(2015);
});

it("should return undefined for ambiguous inputs", () => {
  expect(transformNumber("this is not a number")).toBe(undefined);
  expect(transformNumber(" ")).toBe(undefined);
  expect(transformNumber("")).toBe(undefined);
});
