import type { Filter } from "src/schema.js";
import nlp from "compromise";

const EXPAND_SUFFIXES = new Map<string, string>([
  ["k", "thousand"],
  ["m", "million"],
  ["mil", "million"],
  ["b", "billion"],
  ["bil", "billion"],
]);

const EXPAND_REGEX = new RegExp(`(${[...EXPAND_SUFFIXES.keys()].join("|")})$`, "i");

/** Expand "123k" to "123 thousand" */
// compromise for some reason no longer works with "123k" but doesn with "123 thousand" so we just replace k with thousand
const expand = (input: string) => {
  const match = input.match(EXPAND_REGEX);
  if (!match) return input;
  const suffix = match[1];
  const number = input.slice(0, -suffix.length);
  return `${number} ${EXPAND_SUFFIXES.get(suffix.toLowerCase())}`;
};

const NUMBER_REGEX = /^-?\d+$/u;
export const numberFilter: Filter<number> = (input) => {
  if (NUMBER_REGEX.test(input)) {
    return Number(input);
  }

  const document = nlp(expand(input));
  const value = document.numbers().get(0)[0];
  if (!value && value !== 0) {
    throw new Error(`Expected number-like string, got "${input}"`);
  }

  return value;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should parse regular numbers", () => {
    expect(numberFilter("123")).toBe(123);
    expect(numberFilter("123.456")).toBe(123.456);
    expect(numberFilter("-123.456")).toBe(123.456);
  });

  it("should parse numbers with suffixes", () => {
    expect(numberFilter("123k")).toBe(123000);
    expect(numberFilter("123m")).toBe(123000000);
    expect(numberFilter("123b")).toBe(123000000000);
  });
}
