import type { Filter } from "src/schema.js";

export const jsonFilter: Filter<unknown> = (input: string) => {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error(`Expected valid JSON, got "${input}"`);
  }
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should parse valid json strings", () => {
    const json1 = JSON.stringify({ a: 1, b: "c" });
    expect(jsonFilter(json1)).toEqual({ a: 1, b: "c" });

    const json2 = JSON.stringify([1, 2, 3]);
    expect(jsonFilter(json2)).toEqual([1, 2, 3]);
  });

  it("should throw an error if input is not a valid json string", () => {
    expect(() => jsonFilter("not json")).toThrow();
  });
}
