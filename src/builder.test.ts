import { expect, it } from "vitest";
import { s } from "./index.js";

it("should parse enums reliably", () => {
  enum TestEnumOne {
    One = 1,
    Two = 2,
    Three = 3,
  }

  const html = "<div>3</div>";
  const schema = s("div").enum(TestEnumOne);

  const result = schema.parseHTML(html);
  expect(result).toEqual(TestEnumOne.Three);
});

it("should handle optional values properly", () => {
  const html = "<div></div>";
  const schema = s("div").optional();
  const result = schema.parseHTML(html);
  expect(result).toBeNull();
});

it("should read an attribute from a parent element using bare @attr syntax", () => {
  const html = `
    <section class="grid gap-4">
      <a href="https://example.com/1">One</a>
      <a href="https://example.com/2">Two</a>
      <a href="https://example.com/3">Three</a>
    </section>
  `;
  const schema = s([
    'section.grid.gap-4 a',
    s({ url: s('@href') }),
  ]);
  const result = schema.parseHTML(html);
  expect(result).toEqual([
    { url: 'https://example.com/1' },
    { url: 'https://example.com/2' },
    { url: 'https://example.com/3' },
  ]);
});

it("should collect a flat string array using the [selector] shortcut", () => {
  const html = `
    <section class="grid gap-4">
      <a href="https://example.com/1">One</a>
      <a href="https://example.com/2">Two</a>
      <a href="https://example.com/3">Three</a>
    </section>
  `;
  const schema = s(['section.grid.gap-4 a@href']);
  const result = schema.parseHTML(html);
  expect(result).toEqual([
    'https://example.com/1',
    'https://example.com/2',
    'https://example.com/3',
  ]);
});
