import { type CheerioAPI, load } from "cheerio";
import type { AnyNode } from "domhandler";
import type { StringKeyOf } from "ts-enum-util/dist/types/types.js";
import { MissingValueError } from "./errors/missing-value.error.js";
import { NoSelectorMatchError } from "./errors/no-match.error.js";
import { getSelectorValue, parseSelector } from "./selector.js";
import type { Transformer } from "./transformer.js";
import { transformers } from "./transforms/index.js";
import type { Selector } from "./types.js";

export class Builder<Result> {
  private selector?: Selector<Result>;
  private transformers: Transformer<any, any>[] = [];
  private isOptional = false;

  constructor(selector: Selector<Result>) {
    this.selector = selector;
  }

  optional(this: Builder<unknown>) {
    this.isOptional = true;
    return this as unknown as Builder<Result | null>;
  }

  transform<Output>(transformer: Transformer<Result, Output>) {
    this.transformers.push(transformer);
    return this as unknown as Builder<Output>;
  }

  min(this: Builder<string | any[]>, min: number) {
    return this.transform((value) => {
      if (value.length < min) {
        throw new Error(`Array length is less than ${min}`);
      }
      return value;
    });
  }

  max(this: Builder<string | any[]>, max: number) {
    return this.transform((value) => {
      if (value.length > max) {
        throw new Error(`Array length is greater than ${max}`);
      }

      return value;
    });
  }

  /**
   * Replace all instances of a string with another string.
   * @example
   * "hello world".replace("hello", "hi") // "hi world"
   * "hello world".replace("world", "everyone") // "hello everyone"
   */
  replace(this: Builder<string>, search: string, replacement: string) {
    return this.transform((value) => {
      return value.replace(search, replacement);
    });
  }

  enum<T extends Record<StringKeyOf<T>, number | string>>(this: Builder<string>, enumValues: T) {
    return this.transform(transformers.nativeEnum(enumValues));
  }

  boolean(this: Builder<string>) {
    return this.transform(transformers.boolean);
  }

  lowercase(this: Builder<string>) {
    return this.transform(transformers.lowerCase);
  }

  uppercase(this: Builder<string>) {
    return this.transform(transformers.upperCase);
  }

  camelcase(this: Builder<string>) {
    return this.transform(transformers.camelCase);
  }

  titlecase(this: Builder<string>) {
    return this.transform(transformers.titleCase);
  }

  date(this: Builder<string>) {
    return this.transform(transformers.date);
  }

  json<T = unknown>(this: Builder<string>): Builder<T> {
    return this.transform(transformers.json) as Builder<T>;
  }

  markdown(this: Builder<string>) {
    // todo: validate that @html is set as the attr
    // otherwise this does basically nothing
    return this.transform(transformers.markdown);
  }

  number(this: Builder<string>) {
    return this.transform(transformers.number);
  }

  split(this: Builder<string>) {
    return this.transform(transformers.split);
  }

  trim(this: Builder<string>) {
    return this.transform(transformers.trim);
  }

  value(this: Builder<string>) {
    return this.transform(transformers.value);
  }

  parseHTML(html: string) {
    const $ = load(html);
    return this.parse($);
  }

  parse($: CheerioAPI, parent?: AnyNode): Result {
    if (typeof this.selector === "string") {
      for (const selector of parseSelector(this.selector)) {
        const result = getSelectorValue($, selector, parent);
        if (result === null || result.trim() === "") {
          if (this.isOptional) return null as Result;
          throw new MissingValueError(
            `Result of "${selector.name}" is an empty string. Did you mean to use ".optional()"?`,
          );
        }

        return this.runTransformers(result);
      }

      throw new NoSelectorMatchError(`No selector matched for "${this.selector}"`);
    }

    if (typeof this.selector === "function") {
      return this.selector($, parent, {});
    }

    if (Array.isArray(this.selector)) {
      const [rawSelector, childSchema] = this.selector;
      const items = [];
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

        const result = childSchema.parse($, el);
        items.push(result);
      }

      if (items.length) {
        return this.runTransformers(items);
      }

      // womp womp, no items found
      return [] as Result;
    }

    if (typeof this.selector === "object") {
      const result: any = {};
      for (const key in this.selector) {
        const value = this.selector[key];
        result[key] = value.parse($, parent);
      }

      return this.runTransformers(result);
    }

    throw new Error("Selector type was not processed. Open an issue on GitHub!");
  }

  private runTransformers(value: any): Result {
    let result = value;
    for (const transformer of this.transformers) {
      result = transformer(result);
    }

    return result;
  }
}
