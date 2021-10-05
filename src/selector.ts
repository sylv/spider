/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { Cheerio, CheerioAPI } from "cheerio";

const value = (item: Cheerio<any>, attribute?: string): string | undefined => {
  if (attribute) {
    switch (attribute) {
      case "html":
        return item.html() || undefined;
      default:
        return item.attr(attribute);
    }
  }

  return item.text();
};

export const selector = ($: CheerioAPI, filter: string, context?: Cheerio<any>): string | undefined => {
  const [selector, attribute] = filter.split("@");
  if (!selector) {
    // allows for empty selectors for things like arrays where its ".title a" then
    // you want to get the href of each title, you can do "@href"
    if (context) return value(context, attribute);
    return;
  }

  const result = $(selector, context);
  if (result.length === 0) return;
  const first = result.first();
  if (attribute) {
    switch (attribute) {
      case "html":
        return first.html() || undefined;
      default:
        return first.attr(attribute);
    }
  }

  return first.text();
};
