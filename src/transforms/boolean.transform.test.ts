import { transformBoolean } from "./boolean.transform";

it('should convert truthy values to "true"', () => {
  expect(transformBoolean("true")).toBe(true);
  expect(transformBoolean("(true)")).toBe(true);
  expect(transformBoolean(" yes ")).toBe(true);
  expect(transformBoolean("yes")).toBe(true);
  expect(transformBoolean("y")).toBe(true);
});

it('should convert falsy values to "false"', () => {
  expect(transformBoolean("false")).toBe(false);
  expect(transformBoolean(" false\t")).toBe(false);
  expect(transformBoolean(", false, ")).toBe(false);
  expect(transformBoolean("no")).toBe(false);
  expect(transformBoolean("n")).toBe(false);
});

it("should return undefined for ambiguous inputs", () => {
  expect(transformBoolean("maybe")).toBe(undefined);
  expect(transformBoolean("")).toBe(undefined);
  expect(transformBoolean("10")).toBe(undefined);
  expect(transformBoolean("10")).toBe(undefined);
  expect(transformBoolean("something true something")).toBe(undefined);
});
