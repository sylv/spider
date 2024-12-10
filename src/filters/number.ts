import type { Filter } from "src/schema.js";
import { parseNumber } from '@atlasbot/parsers'

export const numberFilter: Filter<number> = (input) => {
  const result = parseNumber(input);
  if (result == null) {
    throw new Error(`Expected a number, got "${input}"`);
  }

  return result;
};
