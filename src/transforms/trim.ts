import type { Transformer } from "../transformer.js";

export const trim: Transformer<string, string> = (input) => {
  return input.trim();
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should remove the leading and trailing whitespaces", () => {
    expect(trim("   a   ")).toBe("a");
  });

  it("should return the input if it doesn't have leading or trailing whitespaces", () => {
    expect(trim("a")).toBe("a");
  });
}
