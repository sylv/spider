import { createTransformer } from "../helpers/create-transformer.helper";

export const transformTrim = createTransformer({
  transform: (input: string) => input.trim(),
});
