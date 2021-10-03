import { TransformerResult, TRANSFORMER_RESULT } from "./create-transformer.helper";

export const isTransformerResult = (value: unknown): value is TransformerResult => {
  return typeof value === "object" && TRANSFORMER_RESULT in (value as any);
};
