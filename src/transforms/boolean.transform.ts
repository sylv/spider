// "0" and "1" aren't included because they could be ambiguous and I imagine websites

import { createTransformer } from "../helpers/create-transformer.helper";

// aren't likely to use them as boolean values.
const POSITIVE = new Set(["yes", "y", "true", "on", "enable", "enabled", "active", "positive"]);
const NEGATIVE = new Set(["no", "n", "false", "off", "disable", "disabled", "inactive", "negative"]);

const STRIP_REGEX = /[^a-z]+/gi;

export const transformBoolean = createTransformer({
  transform: (value: string): boolean | undefined => {
    const stripped = value.replace(STRIP_REGEX, "").trim().toLowerCase();
    if (POSITIVE.has(stripped)) return true;
    if (NEGATIVE.has(stripped)) return false;
  },
});
