import type { Transformer } from "../transformer.js";
import { camelCase as toCamelCase } from "camel-case";
import { titleCase as toTitleCase } from "title-case";

export const lowerCase: Transformer<string, string> = (input) => {
  return input.toLowerCase();
};

export const upperCase: Transformer<string, string> = (input) => {
  return input.toUpperCase();
};

export const camelCase: Transformer<string, string> = (input) => {
  return toCamelCase(input);
};

export const titleCase: Transformer<string, string> = (input) => {
  return toTitleCase(input);
};
