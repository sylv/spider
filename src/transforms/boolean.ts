import { parseBoolean } from "@atlasbot/parsers";
import type { Transformer } from "../transformer.js";

export const boolean: Transformer<string, boolean> = (input) => {
  const parsed = parseBoolean(input);
  if (parsed == null) {
    throw new Error(`Expected a boolean, got "${input}"`);
  }

  return parsed;
};
