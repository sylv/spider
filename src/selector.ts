import type { AnyNode, Cheerio, CheerioAPI } from "cheerio";
import { runFilters } from "./filters/index.js";
import { MissingValueError } from "./index.js";
import type { SchemaLike, SchemaResolverFunc, ToSchemaResult } from "./types.js";

const PROTOCOL_REGEX = /^https?:|file:|data:/;

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

export const getSelectorValue = ($: CheerioAPI, selector: ParsedSelector, url?: string, parent?: AnyNode) => {
  const element = parent ? $(parent).find(selector.name) : $(selector.name);
  const value = getAttribute(selector, element, url);

  if (value === null) {
    if (selector.filters.includes("optional")) return null;
    throw new MissingValueError(
      `Result of "${selector.name}" is an empty string. Did you mean to use the optional filter?`
    );
  }

  return runFilters(value, selector);
};

export const getAttribute = (selector: ParsedSelector, el: Cheerio<AnyNode>, url?: string) => {
  if (el.length === 0) return null;
  if (selector.attrName) {
    let attr = el.attr(selector.attrName);
    if (attr) {
      if (url && (selector.attrName === "href" || selector.attrName === "src") && !PROTOCOL_REGEX.test(attr)) {
        // normalize relative urls
        attr = new URL(attr, url).href;
      }

      return attr;
    }
  }

  const text = el.text();
  if (text === "") return null;
  return text;
};

export const parseSchema = <T extends SchemaLike>(
  $: CheerioAPI,
  schema: T,
  url?: string,
  parent?: AnyNode
): ToSchemaResult<T> => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (typeof value === "string") {
      for (const selector of parseSelector(value)) {
        const parsed = getSelectorValue($, selector, url, parent);
        result[key] = parsed;
        break;
      }
    } else if (Array.isArray(value)) {
      const [rawSelector, childSchema] = value as [string, SchemaLike | SchemaResolverFunc | undefined];
      for (const selector of parseSelector(rawSelector)) {
        const items = [];
        // const throwIfMissing =

        if (!childSchema) {
          for (const el of $(selector.name)) {
            const text = getAttribute(selector, $(el), url);
            if (text !== null) {
              const filtered = runFilters(text, selector);
              items.push(filtered);
            }
          }
        } else if (typeof childSchema === "function") {
          for (const el of $(rawSelector)) {
            const output = childSchema($, $(el), { selector, url });
            result[key] = output;
            break;
          }
        } else {
          const [selector, ...siblings] = rawSelector.split(/ ~ /g);
          for (let el of $(selector)) {
            if (siblings[0]) {
              // lets you iterate a zip of two selectors, e.g. "tr.thing ~ tr" which will iterate:
              // <tr class="thing" />
              // <tr />
              // as a single item using a fake parent element
              const sibling = $(el).next(siblings[0]);
              if (sibling.length) {
                // create a fake span element to wrap the two elements
                el = $("<spider_wrapper />").append(el).append(sibling).get(0)!;
              }
            }

            const result = parseSchema($, childSchema, url, el);
            items.push(result);
          }
        }

        if (items.length) {
          result[key] = items;
          break;
        }
      }

      if (!result[key]) {
        result[key] = [];
      }
    } else if (typeof value === "object") {
      const parsed = parseSchema($, value as SchemaLike, url, parent);
      result[key] = parsed;
    } else if (typeof value === "function") {
      const el = parent ?? $.root();
      result[key] = value($, el, {
        url,
      });
    }
  }

  return result as any;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it("should parse multiple selectors", async () => {
    const values = [];
    for await (const value of parseSelector(
      "a:contains(comment)@href | optional, a:contains(discuss)@href | optional"
    )) {
      values.push(value);
    }

    expect(values).toMatchSnapshot();
  });
}
