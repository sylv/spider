import { Dispatcher } from "undici";

export class HTTPError extends Error {
  constructor(message: string, readonly response: Dispatcher.ResponseData) {
    super(message);
  }
}
