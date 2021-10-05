import { Cheerio, CheerioAPI } from "cheerio";
import { isTransformerResult } from "./helpers/is-transformer-result.helper";
import { selector } from "./selector";
import { Schema, SchemaResult } from "./types";

export const format = <SchemaType extends Schema>(
  $: CheerioAPI,
  schema: SchemaType,
  context?: Cheerio<any>
): SchemaResult<SchemaType> => {
  const parsed: Record<string, any> = {};
  for (const key in schema) {
    const value = schema[key];
    if (isTransformerResult(value)) {
      // transformers
      const result = selector($, value.selector, context);
      if (!result) parsed[key] = undefined;
      else {
        if (result) {
          const transformed = value.transform(result);
          parsed[key] = transformed;
        }
      }
    } else if (typeof value === "string") {
      // selectors
      parsed[key] = selector($, value, context);
    } else if (Array.isArray(value)) {
      // [selector, Schema]
      const [selector, schema] = value;
      parsed[key] = [];
      $(selector, context).each(function (this: any) {
        const $this = $(this);
        const result = format($, schema, $this);
        parsed[key].push(result);
      });
    } else {
      // nested schemas
      parsed[key] = format($, value);
    }
  }

  return parsed as SchemaResult<SchemaType>;
};
