# @ryanke/spider

> This entire project is a work in progress and is not yet ready for use. In the meantime you should use [x-ray](https://www.npmjs.com/package/x-ray) which is basically the same thing with no included transformers and worse type safety.

A toolkit for scraping websites, inspired by [x-ray](https://www.npmjs.com/package/x-ray).

## example

```ts
import { scrape, t } from "@ryanke/spider";

const url = "https://news.ycombinator.com/item?id=28730908";

// the syntax is basically the same as jquery
// "@href" = return "href" attribute
const result = await scrape("https://blog.ycombinator.com/", {
  posts: [
    ".post",
    {
      title: "h1 a",
      url: "h1 a@href",
      summary: ".loop-post-text p",
      categories: [
        ".post-categories li a",
        {
          name: "",
          url: "@href",
        },
      ],
      authors: [
        ".loop-meta-author a",
        {
          name: "",
          link: "@href",
        },
      ],
      createdAt: t.date(".post-date"),
    },
  ],
});

console.log(result);

// the return type is based on the schema
console.log(result[0].title); // string | undefined
console.log(result[0].createdAt); // Date | undefined
```

### html input

```ts
const html = '<h1 class="title">Panda</h1>';
const result = await scrape(html, { title: ".title" });
console.log(result.title);
```

### custom transformers

```ts
const html = '<h1 class="title">Hello</h1>';
const transformer = createTransformer({
  // adding types here is important as they are used
  // in determining output types.
  transform(input: string): string | undefined {
    return input.replace("Hello", "World")
  },
});

const result = await scrape(html, { title: transformer('.title') );
console.log(result.content); // "World", string | undefined
```

## ideas

- [ ] Extracting arrays of items (`['.parent', { child: '.nested' }]`)
- [ ] Drivers (`phantomjs`, `puppeteer`, etc) to support running client-side JavaScript
- [ ] `t.required` to require a field and throw or return null if it is missing
- [ ] `t.chain` that can combine multiple transformers, `t.chain('selector', t.number, t.required)`
- [ ] A `Scraper` class that can be used to crawl websites. You define some seeds, a schema and a way to extract the next page to scrape and it emits errors/results as it goes.
  - A way to provide a custom queue implementation so you could use redis to queue URLs.
  - Support for cluster environments where multiple processes are scraping the same website
  - A configurable `shouldSkipPage(url)` method returns `true` if a URL should be skipped, to be used to skip jobs that have already been scraped and stored in a database.
  - Return an `AsyncIterable` as an alternative to events
