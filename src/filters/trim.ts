import type { Filter } from "src/schema.js";

export const trimFilter: Filter<string> = (input) => {
  return input.trim();
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should remove the leading and trailing whitespaces", () => {
    expect(trimFilter("   a   ")).toBe("a");
  });

  it("should return the input if it doesn't have leading or trailing whitespaces", () => {
    expect(trimFilter("a")).toBe("a");
  });
}
