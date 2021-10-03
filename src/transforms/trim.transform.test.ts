import { transformTrim } from "./trim.transform";

it("should trim whitespace", () => {
  expect(transformTrim(" test ")).toBe("test");
  expect(transformTrim("\ttest\n\n")).toBe("test");
});

it("should return undefined instead of an empty string", () => {
  expect(transformTrim("")).toBeUndefined();
  expect(transformTrim(" ")).toBeUndefined();
});
