import type { Filter } from "src/schema.js";
import { camelCase } from "camel-case";
import { titleCase } from "title-case";

export const lowerCaseFilter: Filter<string> = (input) => {
  return input.toLowerCase();
};

export const upperCaseFilter: Filter<string> = (input) => {
  return input.toUpperCase();
};

export const camelCaseFilter: Filter<string> = (input) => {
  return camelCase(input);
};

export const titleCaseFilter: Filter<string> = (input) => {
  return titleCase(input);
};
