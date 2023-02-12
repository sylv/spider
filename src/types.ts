import type { AnyNode, Cheerio, CheerioAPI } from "cheerio";
import { Schema } from "./schema.js";
import type { ParsedSelector } from "./selector.js";

export interface FilterTypeMap {
  number: number;
  bool: boolean;
  boolean: boolean;
  date: Date;
  json: any;
}

/**
 * A custom resolver function for a schema.
 * Can be used in most places a selector can be used.
 */
export type SchemaResolverFunc = (
  $: CheerioAPI,
  element: Cheerio<AnyNode>,
  meta: { selector?: ParsedSelector; url?: string }
) => unknown;

/**
 * Get the return type of a selector
 * @example "number | null" from ".selector | number | optional"
 */
export type SelectorType<Selector> =
  // parse multiple selectors "one, two"
  Selector extends `${infer Before}, ${infer After}`
    ? SelectorType<Before> | SelectorType<After>
    : // parse optional selector "selector | optional"
    Selector extends `${infer BeforeOptional} | optional`
    ? SelectorType<BeforeOptional> | null
    : // parse filter "selector | filter"
    Selector extends `${string} | ${infer FilterName}`
    ? RecursiveFilterType<FilterName>
    : // and thats all folks
      string;

type RecursiveFilterType<FilterName> = FilterName extends keyof FilterTypeMap
  ? FilterTypeMap[FilterName]
  : FilterName extends `${string} | ${infer FilterName}`
  ? RecursiveFilterType<FilterName>
  : string;

export type SchemaLike = {
  readonly [key: string]:
    | SchemaLike
    | SchemaResolverFunc
    | (readonly [string] | readonly [string, SchemaLike | SchemaResolverFunc])
    | string;
};

/**
 * Get the return type of a schema
 */
export type ToSchemaResult<T extends SchemaLike> = {
  [K in keyof T]: T[K] extends readonly [string, infer U extends SchemaLike]
    ? ToSchemaResult<U>[]
    : T[K] extends readonly [string, infer U extends SchemaResolverFunc]
    ? ReturnType<U>
    : T[K] extends readonly [string]
    ? SelectorType<T[K][0]>
    : T[K] extends SchemaLike
    ? ToSchemaResult<T[K]>
    : T[K] extends SchemaResolverFunc
    ? ReturnType<T[K]>
    : SelectorType<T[K]>;
};

export const createSchema = <T extends SchemaLike>(schema: T) => new Schema(schema);
