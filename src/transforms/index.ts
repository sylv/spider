import { transformBoolean } from "./boolean.transform";
import { transformClean } from "./clean.transform";
import { transformDate, transformDuration } from "./time.transform";
import { transformNumber } from "./number.transform";
import { transformTrim } from "./trim.transform";

export const t = {
  boolean: transformBoolean,
  clean: transformClean,
  number: transformNumber,
  trim: transformTrim,
  date: transformDate,
  duration: transformDuration
};
