import type { Filter } from "src/schema.js";
import { parseBoolean } from "@atlasbot/parsers";


export const boolFilter: Filter<boolean> = (input) => {
 const parsed = parseBoolean(input)
 if (parsed == null) {
   throw new Error(`Expected a boolean, got "${input}"`)
 }

  return parsed
};
