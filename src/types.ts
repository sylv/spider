import type { AnyNode, CheerioAPI } from "cheerio";
import { Builder } from "./builder.js";
import type { ParsedSelector } from "./selector.js";

/**
 * A custom resolver function for a schema.
 * Can be used in most places a selector can be used.
 */
export type CustomResolver<T> = (
  $: CheerioAPI,
  element: AnyNode | undefined,
  meta: { selector?: ParsedSelector; url?: string },
) => T;

export type Selector<Result> =
  | string
  | CustomResolver<Result>
  | Record<string, Builder<any>>
  | [string, Builder<any>];

// biome-ignore format: butchers this type and makes it unreadable
export type Infer<T extends Selector<any>> = 
    T extends string ? string : // plain selector, always returns the text value
    T extends CustomResolver<infer R> ? R : // custom resolver, we grab the return type
    T extends [string, Builder<infer R>] ? R[] : // [parent, childSchema], we run the childSchema on each parent
    T extends Builder<infer R> ? R : // plain builder, we grab the result
    T extends {} ? { [K in keyof T]: T[K] extends Builder<infer R> ? R : never } : // object, we run each value through the builder
    never
