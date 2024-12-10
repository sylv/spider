import type { Transformer } from "../transformer.js";

const SPLIT_REGEX = /(\/|=|: )/g;

// "rating: sfw" becomes "sfw"
// "value=2.4" becomes "2.4"
// "2.4/10" becomes "2.4"
export const value: Transformer<string, string> = (input) => {
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
    expect(value("rating: sfw")).toEqual("sfw");
  });

  it("should return the value if the input is of the format 'value=2.4'", () => {
    expect(value("value=2.4")).toEqual("2.4");
  });

  it("should return the value if the input is of the format '2.4/10'", () => {
    expect(value("2.4/10")).toEqual("2.4");
  });

  it("should throw an error if the input does not match the expected format", () => {
    expect(() => value("not a value")).toThrowErrorMatchingSnapshot();
  });
}
