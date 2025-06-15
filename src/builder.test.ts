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
