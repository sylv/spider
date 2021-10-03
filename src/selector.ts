import { CheerioAPI } from "cheerio";

export const selector = (filter: string, $: CheerioAPI): string | undefined => {
  const [selector, attribute] = filter.split("@");
  const result = $(selector);
  if (result.length === 0) return;
  if (attribute) return result.attr(attribute);
  return result.text();
};
