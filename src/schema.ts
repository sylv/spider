import { CheerioAPI, load } from "cheerio";
import PQueue from "p-queue";
import UserAgent from "user-agents";
import { QueueFullError } from "./errors/queue-full.error.js";
import type { SchemaLike, ToSchemaResult } from "./types.js";
import { getSelectorValue, parseSchema, parseSelector } from "./selector.js";
import { MissingValueError } from "./index.js";

export type Filter<T = unknown> = (input: string) => T;
export type PaginationFunc<T extends SchemaLike> = ($: CheerioAPI, result: ToSchemaResult<T>, url?: string) => string;

export interface SchemaOptions {
  getHeaders?: () => Record<string, string>;
  getHTML?: (url: string) => Promise<string>;
}

export class Schema<T extends SchemaLike> {
  private paginationLimit?: number;
  private paginationSelector?: string | PaginationFunc<T>;
  public queueMaxSize?: number;
  public queue?: PQueue;

  constructor(private schema: T, readonly options: SchemaOptions = {}) {}

  /**
   * Set the concurrency limit for fetching pages.
   * This is across all methods of the schema, so .stream() and .fetch() will all be limited to the same amount.
   * Multiple instances of the same schema will not share the same queue.
   */
  queueOptions(options: ConstructorParameters<typeof PQueue>[0] & { maxQueuedItems?: number }) {
    if (this.queue) throw new Error("Cannot set concurrency after queue has been created");
    this.queue = new PQueue(options);
    if (options.maxQueuedItems !== undefined) {
      this.queueMaxSize = options.maxQueuedItems;
    }

    return this;
  }

  paginate(selector: string | PaginationFunc<T>) {
    this.paginationSelector = selector;
    return this;
  }

  /**
   * Set a pagination limit to stop fetching pages after a certain number of pages.
   * This is per-iterator, so if you have multiple iterators, they will each stop at the limit.
   */
  limit(value: number) {
    this.paginationLimit = value;
    return this;
  }

  async fetch(url: string) {
    if (!url.startsWith("http")) throw new Error("Expected a URL");
    const html = await this.getUrlText(url);
    const $ = load(html);
    return parseSchema($, this.schema, url);
  }

  async *stream(urlOrHTML: string): AsyncGenerator<ToSchemaResult<T>> {
    if (!this.paginationSelector) {
      throw new Error("Cannot stream without a pagination selector");
    }

    let url = urlOrHTML;
    let page = 0;
    while (url) {
      const html = await this.getUrlText(url);
      const $ = load(html);
      const result = parseSchema($, this.schema, url);
      yield result;

      if (this.paginationLimit && ++page >= this.paginationLimit) {
        break;
      }

      if (typeof this.paginationSelector === "string") {
        for (const selector of parseSelector(this.paginationSelector)) {
          try {
            const selectedUrl = getSelectorValue($, selector, url);
            if (!selectedUrl) continue;
            if (typeof selectedUrl !== "string") throw new Error("Expected a string");
            url = selectedUrl;
            break;
          } catch (error) {
            if (error instanceof MissingValueError) continue;
            throw error;
          }
        }
      } else {
        url = this.paginationSelector($, result, url);
      }
    }
  }

  parse(html: string, url?: string) {
    const $ = load(html);
    return parseSchema($, this.schema, url);
  }

  private async getUrlText(url: string) {
    const ua = new UserAgent().toString();
    const referer = new URL(url).origin;
    const init = {
      headers: {
        Referer: referer,
        "User-Agent": ua,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/jxl,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
    };

    if (this.options.getHeaders) {
      Object.assign(init.headers, this.options.getHeaders());
    }

    let response: Response;
    if (this.queue) {
      if (this.queueMaxSize !== undefined && this.queue.size >= this.queueMaxSize) {
        throw new QueueFullError("Queue is full");
      }

      if (this.options.getHTML) {
        const getHTML = this.options.getHTML;
        return this.queue.add(() => getHTML(url), { throwOnTimeout: true });
      }

      response = await this.queue.add(() => fetch(url, init), { throwOnTimeout: true });
    } else {
      if (this.options.getHTML) {
        return this.options.getHTML(url);
      }

      response = await fetch(url, init);
    }

    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("text/html")) {
      throw new Error(`Expected text/html, got ${contentType}`);
    }

    return response.text();
  }
}
