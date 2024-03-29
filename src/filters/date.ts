import type { Filter } from "src/schema.js";
import * as chrono from "chrono-node";

export const dateFilter: Filter<Date> = (input) => {
  const date = chrono.parseDate(input, undefined);
  if (isNaN(date.getTime())) {
    throw new Error(`Expected date-like string, got "${input}"`);
  }

  return date;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should parse valid date strings", () => {
    expect(dateFilter("2022-01-01")).toMatchSnapshot();
    expect(dateFilter("2022-02-01T00:00:00.000Z")).toMatchSnapshot();
    expect(dateFilter("21st dec 2021")).toMatchSnapshot();
    expect(dateFilter("dec 21 2023")).toMatchSnapshot();
  });

  it("should throw an error if input is not a valid date string", () => {
    expect(() => dateFilter("not a date")).toThrow();
  });
}
