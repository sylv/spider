import chrono, { ParsedResult } from "chrono-node";
import { createTransformer } from "../helpers/create-transformer.helper";

/**
 * Returns true if the date is essentially invalid
 * Checks for actual invalid dates, dates too close to the
 * timestamp epoch and dates in the far away future.
 */
const isGarbageDate = (date: Date): boolean => {
  if (!Number.isFinite(date.getFullYear())) return true;
  if (date.getFullYear() <= 1980) return true;
  if (date.getFullYear() >= 2100) return true;
  return false;
};

const parse = (input: string): { match: ParsedResult; date: Date; ref: Date } | undefined => {
  const ref = new Date();
  const matches = chrono.parse(input);
  const match = matches.shift();
  if (!match) return;
  const date = match.date();
  if (isGarbageDate(date)) return;
  return { match, date, ref };
};

export const transformDate = createTransformer({
  transform: (input: string): Date | undefined => {
    const result = parse(input);
    if (result) return result.date;
  },
});

export const transformDuration = createTransformer({
  transform: (input: string): number | undefined => {
    const result = parse(input);
    if (result) {
      const duration = result.date.getTime() - result.ref.getTime();
      return duration;
    }
  },
});
