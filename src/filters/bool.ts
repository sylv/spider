import type { Filter } from "src/schema.js";

const TRUTHY = new Set(["y", "yes", "true", "confirm", "enable", "on", "positive"]);
const FALSY = new Set(["n", "no", "false", "deny", "stop", "cancel", "disable", "off", "negative"]);

export const boolFilter: Filter<boolean> = (input) => {
  const query = input.toLowerCase().trim();
  if (TRUTHY.has(query)) return true;
  if (FALSY.has(query)) return false;
  throw new Error(`Expected a boolean, got "${input}"`);
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse truthy values", () => {
    expect(boolFilter("y")).toBe(true);
    expect(boolFilter("yes")).toBe(true);
    expect(boolFilter("true")).toBe(true);
    expect(boolFilter("confirm")).toBe(true);
    expect(boolFilter("enable")).toBe(true);
    expect(boolFilter("on")).toBe(true);
    expect(boolFilter("positive")).toBe(true);
  });

  it("should parse falsy values", () => {
    expect(boolFilter("n")).toBe(false);
    expect(boolFilter("no")).toBe(false);
    expect(boolFilter("false")).toBe(false);
    expect(boolFilter("deny")).toBe(false);
    expect(boolFilter("stop")).toBe(false);
    expect(boolFilter("cancel")).toBe(false);
    expect(boolFilter("disable")).toBe(false);
    expect(boolFilter("off")).toBe(false);
    expect(boolFilter("negative")).toBe(false);
  });

  it("should throw an error if input is not a valid boolean", () => {
    expect(() => boolFilter("maybe")).toThrow();
  });
}
