import type { AnyNode, Cheerio, CheerioAPI } from "cheerio";
import { Schema } from "./schema.js";
import type { ParsedSelector } from "./selector.js";

export interface TypeMapping {
  number: number;
  number_human: number;
  date: Date;
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
export type SelectorType<T> = T extends `${infer Before}, ${infer After}`
  ? SelectorType<Before> | SelectorType<After>
  : T extends `${infer BeforeOptional} | optional`
  ? SelectorType<BeforeOptional> | null
  : T extends `${string} | ${infer X extends keyof TypeMapping}`
  ? TypeMapping[X]
  : T extends `${infer K} | ${infer X}`
  ? SelectorType<K> | X
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
