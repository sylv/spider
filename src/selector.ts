import type { AnyNode, Cheerio, CheerioAPI } from "cheerio";
import { UnknownAttrError } from "./errors/unknown-attr.error.js";

export interface ParsedSelector {
  name: string;
  attrName?: string;
  filters: string[];
  raw: string;
}

function parseIndividualSelector(selector: string): ParsedSelector {
  const parts = selector.split("|").map((part) => part.trim());
  const nameAndAttr = parts[0].split("@");
  const name = nameAndAttr[0].trim();
  const attrName = nameAndAttr[1] ? nameAndAttr[1].trim() : undefined;
  const filters = parts.slice(1);
  return {
    name,
    attrName,
    filters,
    raw: selector,
  };
}

// .selector@href | filter1 | filter2
// .selector@href, .alternative@href
// (.selector, .alternative)@href | filter
export function* parseSelector(selector: string): Generator<ParsedSelector> {
  // for bracketed selectors, we parse it as a regular selector,
  // then check if the resulting selector name is in brackets.
  const selectors = selector.split(/, /g);
  for (const selector of selectors) {
    const result = parseIndividualSelector(selector);
    yield result;
  }
}

export const getSelectorValue = ($: CheerioAPI, selector: ParsedSelector, parent?: AnyNode) => {
  const element = parent ? $(parent).find(selector.name) : $(selector.name);
  const value = getAttribute(selector, element);
  return value;
};

export const getAttribute = (selector: ParsedSelector, el: Cheerio<AnyNode>) => {
  if (el.length === 0) return null;
  if (selector.attrName) {
    if (selector.attrName === "innerHTML") {
      const html = el.html();
      if (html) return html;
    }

    const attr = el.attr(selector.attrName);
    if (attr) return attr;

    throw new UnknownAttrError(`Attribute "${selector.attrName}" not found on element "${selector.name}"`);
  }

  const text = el.text();
  if (text === "") return null;
  return text;
};
