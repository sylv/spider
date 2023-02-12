import type { Filter } from "src/schema.js";

const SPLIT_REGEX = /(\/|=|: )/g;

// "rating: sfw" becomes "sfw"
// "value=2.4" becomes "2.4"
// "2.4/10" becomes "2.4"
export const valueFilter: Filter<string> = (input) => {
  const parts = input.split(SPLIT_REGEX);
  if (parts.length !== 3) {
    throw new Error(`Expected value-like string, got "${input}"`);
  }

  if (parts[1] === "/") return parts[0];
  return parts[2];
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should return the value if the input is of the format 'rating: sfw'", () => {
    expect(valueFilter("rating: sfw")).toEqual("sfw");
  });

  it("should return the value if the input is of the format 'value=2.4'", () => {
    expect(valueFilter("value=2.4")).toEqual("2.4");
  });

  it("should return the value if the input is of the format '2.4/10'", () => {
    expect(valueFilter("2.4/10")).toEqual("2.4");
  });

  it("should throw an error if the input does not match the expected format", () => {
    expect(() => valueFilter("not a value")).toThrowErrorMatchingSnapshot();
  });
}
