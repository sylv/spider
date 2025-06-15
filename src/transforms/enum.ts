import { $enum } from "ts-enum-util";
import type { StringKeyOf } from "ts-enum-util/dist/types/types.js";
import type { Transformer } from "../transformer.js";

const STRIP_PATTERN = /( |_)+/gu;

export const nativeEnum = <T extends Record<StringKeyOf<T>, number | string>>(
  enumValues: T,
): Transformer<string, T[keyof T]> => {
  const wrapper = $enum(enumValues);
  const lookupMap = new Map<string, T[keyof T]>();
  for (const [key, value] of wrapper.entries()) {
    lookupMap.set(key.replaceAll(STRIP_PATTERN, "").toLowerCase(), value);
    lookupMap.set(value.toString().replaceAll(STRIP_PATTERN, "").toLowerCase(), value);
  }

  return (value: string): T[keyof T] => {
    const strippedValue = value.replaceAll(STRIP_PATTERN, "").toLowerCase();
    const resolvedValue = lookupMap.get(strippedValue);
    if (resolvedValue != undefined) {
      return resolvedValue;
    }

    const keys = Array.from(lookupMap.keys())
      .map((key) => `"${key}"`)
      .join(", ");

    throw new Error(`Value "${value}" does not match any enum value. Available values: ${keys}`);
  };
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse normal snake case correctly", () => {
    enum TestEnum {
      FirstValue = "first_value",
      SecondValue = "second_value",
    }

    const transformer = nativeEnum(TestEnum);
    expect(transformer("first_value")).toEqual(TestEnum.FirstValue);
    expect(transformer("FIRSTVALUE")).toEqual(TestEnum.FirstValue);
    expect(transformer("first value")).toEqual(TestEnum.FirstValue);
    expect(transformer("second_value")).toEqual(TestEnum.SecondValue);
    expect(transformer("SECONDVALUE")).toEqual(TestEnum.SecondValue);
  });

  it("should parse number values correctly", () => {
    enum NumberEnum {
      One = 1,
      Two = 2,
      Three = 3,
    }

    const transformer = nativeEnum(NumberEnum);
    expect(transformer("1")).toEqual(NumberEnum.One);
    expect(transformer("2")).toEqual(NumberEnum.Two);
    expect(transformer("3")).toEqual(NumberEnum.Three);
    expect(transformer("ONE")).toEqual(NumberEnum.One);
    expect(transformer("two")).toEqual(NumberEnum.Two);
    expect(transformer("THREE")).toEqual(NumberEnum.Three);
  });

  it("should parse snake case with spaces correctly", () => {
    enum SpaceEnum {
      FIRST_VALUE = 1,
      SECOND_VALUE = 2,
    }

    const transformer = nativeEnum(SpaceEnum);
    expect(transformer("1")).toEqual(SpaceEnum.FIRST_VALUE);
    expect(transformer("first value")).toEqual(SpaceEnum.FIRST_VALUE);
    expect(transformer("SECOND VALUE")).toEqual(SpaceEnum.SECOND_VALUE);
    expect(transformer("SECONDVALUE")).toEqual(SpaceEnum.SECOND_VALUE);
    expect(transformer("SECOND_VALUE")).toEqual(SpaceEnum.SECOND_VALUE);
  });
}
