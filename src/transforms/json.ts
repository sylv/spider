import type { Transformer } from "../transformer.js";

export const json: Transformer<string, unknown> = (input: string) => {
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
    expect(json(json1)).toEqual({ a: 1, b: "c" });

    const json2 = JSON.stringify([1, 2, 3], null, 2);
    expect(json(json2)).toEqual([1, 2, 3]);
  });

  it("should throw an error if input is not a valid json string", () => {
    expect(() => json("not json")).toThrow();
  });
}
