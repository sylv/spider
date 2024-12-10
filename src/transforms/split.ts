import type { Transformer } from "../transformer.js";

const TRIM_REGEX = /^('|"|“|”)|('|"|“|”)$/gu;
function trim(input: string) {
  return input.trim().replace(TRIM_REGEX, "").trim();
}

// ordered by priority
const SPLIT_CHARS = ["|", " OR ", ","];

export const split: Transformer<string, string[]> = (input) => {
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
    expect(split("a|b|c")).toEqual(["a", "b", "c"]);
  });

  it("should split input by OR", () => {
    expect(split("a OR b OR c")).toEqual(["a", "b", "c"]);
  });

  it("should split input by ,", () => {
    expect(split("a, b, c")).toEqual(["a", "b", "c"]);
  });

  it("should remove quotes and trim the result", () => {
    expect(split("'a',' b',c")).toEqual(["a", "b", "c"]);
  });

  it("should return the input as an array if no split char is found", () => {
    expect(split("a")).toEqual(["a"]);
  });
}
