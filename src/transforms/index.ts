import { boolean } from "./boolean.js";
import { camelCase, lowerCase, titleCase, upperCase } from "./case.js";
import { date } from "./date.js";
import { nativeEnum } from "./enum.js";
import { json } from "./json.js";
import { markdown } from "./markdown.js";
import { number } from "./number.js";
import { split } from "./split.js";
import { trim } from "./trim.js";
import { value } from "./value.js";

export const transformers = {
  boolean,
  lowerCase,
  upperCase,
  camelCase,
  titleCase,
  date,
  json,
  markdown,
  number,
  split,
  trim,
  value,
  nativeEnum,
};
