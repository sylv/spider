export const TRANSFORMER_RESULT = Symbol("TRANSFORMER_RESULT");

export interface TransformerOptions<Input, Output> {
  transform: (input: Input) => Output;
}

export interface TransformerResult<Input = unknown, Output = unknown> extends TransformerOptions<Input, Output> {
  [TRANSFORMER_RESULT]: true;
  selector: string;
}

export const createTransformer = <Input, Output>(
  options: TransformerOptions<Input, Output>
): ((selector: string) => TransformerResult<Input, Output>) => {
  return (selector: string) => {
    return {
      [TRANSFORMER_RESULT]: true,
      selector: selector,
      transform: options.transform,
    };
  };
};
