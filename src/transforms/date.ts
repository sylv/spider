import type { Transformer } from "../transformer.js";
import { parseAbsoluteDate } from "@atlasbot/parsers";

export const date: Transformer<string, Date> = (input) => {
  const result = parseAbsoluteDate(input);
  if (!result) {
    throw new Error(`Expected a date string, got "${input}"`);
  }

  return result;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should parse valid date strings", () => {
    expect(date("2022-01-01")).toMatchSnapshot();
    expect(date("2022-02-01T00:00:00.000Z")).toMatchSnapshot();
    expect(date("21st dec 2021")).toMatchSnapshot();
    expect(date("dec 21 2023")).toMatchSnapshot();
  });

  it("should throw an error if input is not a valid date string", () => {
    expect(() => date("not a date")).toThrow();
  });
}
