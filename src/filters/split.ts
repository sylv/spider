import type { Filter } from "src/schema.js";

const TRIM_REGEX = /^('|"|“|”)|('|"|“|”)$/gu;
function trim(input: string) {
  return input.trim().replace(TRIM_REGEX, "").trim();
}

// ordered by priority
const SPLIT_CHARS = ["|", " OR ", ","];

export const splitFilter: Filter<string[]> = (input) => {
  for (const splitChar of SPLIT_CHARS) {
    if (input.includes(splitChar)) {
      return input.split(splitChar).map((part) => trim(part));
    }
  }

  return [trim(input)];
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should split input by |", () => {
    expect(splitFilter("a|b|c")).toEqual(["a", "b", "c"]);
  });

  it("should split input by OR", () => {
    expect(splitFilter("a OR b OR c")).toEqual(["a", "b", "c"]);
  });

  it("should split input by ,", () => {
    expect(splitFilter("a, b, c")).toEqual(["a", "b", "c"]);
  });

  it("should remove quotes and trim the result", () => {
    expect(splitFilter("'a',' b',c")).toEqual(["a", "b", "c"]);
  });

  it("should return the input as an array if no split char is found", () => {
    expect(splitFilter("a")).toEqual(["a"]);
  });
}
