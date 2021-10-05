/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

import { TransformerResult } from "./helpers/create-transformer.helper";

export interface Schema {
  [key: string]: Schema | [string, Schema] | TransformerResult<any, any> | string;
}

export type SchemaResult<SchemaInstance extends Schema> = {
  [key in keyof SchemaInstance]: SchemaInstance[key] extends [string, Schema]
    ? Array<SchemaResult<SchemaInstance[key][1]>>
    : SchemaInstance[key] extends Schema
    ? SchemaResult<SchemaInstance[key]>
    : SchemaInstance[key] extends TransformerResult<any, any>
    ? ReturnType<SchemaInstance[key]["transform"]>
    : SchemaInstance[key] extends string
    ? string | undefined
    : never;
};
