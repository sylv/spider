import { transformClean } from "./clean.transform";

it("should remove double spaces", () => {
  expect(transformClean("test  here")).toBe("test here");
});

it("should remove double new lines", () => {
  expect(transformClean("test\n\nhere")).toBe("test\nhere");
});

it("should fix sentences with no space after the period", () => {
  expect(transformClean("test.here")).toBe("test. here");
});

it("should trim whitespace", () => {
  expect(transformClean(" test ")).toBe("test");
  expect(transformClean("\ttest\n\n")).toBe("test");
});

it("should return undefined instead of an empty string", () => {
  expect(transformClean("")).toBeUndefined();
  expect(transformClean(" \n")).toBeUndefined();
});
