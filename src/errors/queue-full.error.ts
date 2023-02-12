export class QueueFullError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueueFullError";
  }
}
