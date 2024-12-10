import { Builder } from "./builder.js";
import type { Infer, Selector } from "./types.js";

export const s = <T extends Selector<any>>(selector: T) => new Builder<Infer<T>>(selector);

export * from "./errors/index.js";
