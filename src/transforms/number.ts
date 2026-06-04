import { parseNumber } from "@atlasbot/parsers";
import type { Transformer } from "../transformer.js";

const LAX_NUMBER_PATTERN = /\d+(,\d{3})*(\.\d+)?/g;
const LAX_NUMBER_REPLACE_PATTERN = /,/g;

export const number: Transformer<string, number> = (input) => {
  const result = parseNumber(input);
  if (result == null) {
    // fallback parsing for some weirder cases that the parser can't handle by default
    // mostly things like "123 comments", we grab all matches to try reduce the chance of users grabbing the wrong number
    // worse case scenario they can add a custom transformer
    // this also works around parseNumber() not handling very large numbers
    const laxMatch = input.matchAll(LAX_NUMBER_PATTERN);
    const laxMatches = Array.from(laxMatch);
    if (laxMatches[0]) {
      if (laxMatches[1]) {
        throw new Error(`Expected a single number, but parsed multiple from "${input}"`);
      }

      const replaced = laxMatches[0][0].replace(LAX_NUMBER_REPLACE_PATTERN, "");
      const int = +replaced;
      if (int > Number.MAX_SAFE_INTEGER) {
        throw new Error(`Parsed number "${int}" from "${input}" is too large to be represented safely in JavaScript`);
      }

      return int;
    }

    throw new Error(`Expected a number, got "${input}"`);
  }

  if (result > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Parsed number "${result}" from "${input}" is too large to be represented safely in JavaScript`);
  }

  return result;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should parse regular numbers", () => {
    expect(number("123")).toBe(123);
    expect(number("123.456")).toBe(123.456);
    expect(number(" 5. ")).toBe(5);
    expect(number("-123.456")).toBe(-123.456);
  });

  it("should parse numbers with suffixes", () => {
    expect(number("123k")).toBe(123000);
    expect(number("123m")).toBe(123000000);
    expect(number("123 comments")).toBe(123);
  });

  it("should parse numbers with prefixes", () => {
    expect(number("x0.32")).toBe(0.32);
  });

  it('should parse very large numbers', () => {
    expect(number("1,234,567")).toBe(1234567);
    expect(number("895717237857")).toBe(895717237857);
  })

  it('should fail for numbers larger than MAX_SAFE_INTEGER', () => {
    expect(() => number("9007199254740992")).toThrow();
  });
}
