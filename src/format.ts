import { CheerioAPI } from "cheerio";
import { isTransformerResult } from "./helpers/is-transformer-result.helper";
import { selector } from "./selector";
import { Schema, SchemaResult } from "./types";

export const format = <SchemaType extends Schema>($: CheerioAPI, schema: SchemaType): SchemaResult<SchemaType> => {
  const parsed: Record<string, any> = {};
  for (const key in schema) {
    const value = schema[key];
    if (isTransformerResult(value)) {
      // transformers
      const result = selector(value.selector, $);
      const transformed = value.transform(result);
      parsed[key] = transformed;
    } else if (typeof value === "string") {
      // selectors
      parsed[key] = selector(value, $);
    } else {
      // nested schemas
      parsed[key] = format($, value);
    }
  }

  return parsed as SchemaResult<SchemaType>;
};
