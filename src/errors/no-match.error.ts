export class NoSelectorMatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoSelectorMatchError";
  }
}
