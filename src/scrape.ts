import { load } from "cheerio";
import { format } from "./format";
import { fetchHTML } from "./helpers/fetch-html.helper";
import { Schema, SchemaResult } from "./types";

export async function scrape<SchemaInstance extends Schema>(
  url: string,
  schema: SchemaInstance
): Promise<SchemaResult<SchemaInstance>> {
  const html = url.startsWith("http") ? await fetchHTML(url) : url;
  const $ = load(html);
  return format($, schema);
}
