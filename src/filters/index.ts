import type { ParsedSelector } from "src/selector.js";
import type { Filter } from "../schema.js";
import { boolFilter } from "./bool.js";
import { camelCaseFilter, lowerCaseFilter, titleCaseFilter, upperCaseFilter } from "./case.js";
import { dateFilter } from "./date.js";
import { jsonFilter } from "./json.js";
import { numberFilter } from "./number.js";
import { splitFilter } from "./split.js";
import { trimFilter } from "./trim.js";
import { valueFilter } from "./value.js";
import { markdownFilter } from "./markdown.js";

export {
  boolFilter,
  camelCaseFilter,
  dateFilter,
  jsonFilter,
  lowerCaseFilter,
  numberFilter,
  splitFilter,
  titleCaseFilter,
  trimFilter,
  upperCaseFilter,
  valueFilter,
};

const filters = new Map<string, Filter>([
  ["number", numberFilter],
  ["bool", boolFilter],
  ["boolean", boolFilter],
  ["date", dateFilter],
  ["trim", trimFilter],
  ["markdown", markdownFilter],

  ["split", splitFilter],
  ["array", splitFilter],

  ["lower", lowerCaseFilter],
  ["lowercase", lowerCaseFilter],

  ["upper", upperCaseFilter],
  ["uppercase", upperCaseFilter],

  ["camel", camelCaseFilter],
  ["camelcase", camelCaseFilter],

  ["title", titleCaseFilter],
  ["titlecase", titleCaseFilter],

  ["json", jsonFilter],
  ["value", valueFilter],

]);

export const registerFilter = (name: string, filter: Filter) => {
  filters.set(name, filter);
};

export const runFilters = (input: string, selector: ParsedSelector) => {
  let output: unknown = input;
  for (const filterName of selector.filters) {
    if (filterName === "optional") {
      if (!output && output !== 0) return null;
      return output;
    }

    const filter = filters.get(filterName);
    if (!filter) throw new Error(`Filter "${filterName}" not found`);
    if (typeof output !== "string") {
      if (Array.isArray(output)) {
        // allow ".selector | split | number" to work
        output = output.map((item) => filter(item));
        continue;
      }

      throw new TypeError(`Filter "${filterName}" expected string, got ${typeof output}`);
    }

    output = filter(output);
  }

  if (input && !output && output !== 0) {
    throw new Error(`Filter "${selector.filters.join(" | ")}" on "${selector.name}" returned empty string`);
  }

  return output;
};
