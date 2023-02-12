# @ryanke/spider

A simple toolkit to scrape websites. Inspired by [x-ray](https://github.com/matthewmueller/x-ray#readme) with modern internals, typescript support with schema type inference, and more flexibility.

## example

```ts
// lets scrape https://news.ycombinator.com/
const schema = createSchema({
  posts: [
    // include the "tr" immediately after the ".athing" element using ~
    "tr.athing ~ tr.athing+tr",
    {
      title: ".titleline > a",
      // parse as number
      // most parsers are fairly lenient and will try to parse just about anything
      // the number parser can take values such as "one million", "1.5k", "1000", "10,000 dollars", etc
      posiition: "td span.rank | number",
      // the "optional" filter will return undefined if the selector doesn't match anything
      // without this, a MissingValue error will be thrown if the selector matches nothing
      points: "td span.score | number | optional",
      comments: "a:contains(comment) | number | optional",
      // "@href" will be picked up as a url and relative urls
      // will be converted to absolute urls automatically
      url: ".titleline a@href",
      // parse a date
      createdAt: "span.age@title | date",
      // a comma-separated list of selectors, the first one that matches will be used
      commentsUrl: "a:contains(comment)@href | optional, a:contains(discuss)@href | optional",
      // nested objects where all fields are empty will be replaced with "null",
      // so for posts with no author this will simply be "author: null"
      author: {
        name: "a.hnuser | trim | optional", // trim whitespace
        url: "a.hnuser@href | optional",
      },
    },
  ],
})
  // paginate by following the "More" link
  // this could also be a ($, result, url) => string function to get the next page
  .paginate("a.morelink@href")
  .queueOptions({
    concurrency: 1, // only do one request at a time
    interval: 5000, // wait 5 seconds between requests
    intervalCap: 1, // only allow 1 request per interval
  });

// this ignores pagination and only scrapes the first page
// it will respect the queue options if they are set
const result = await schema.fetch("https://news.ycombinator.com/");

// the return type will be inferred based on the schema, including the types of the fields when using | number.
// createSchema() is a generic, so you can pass in the schema type if the inferred type is insufficient.
result.posts[0].comments; // "number" type

// schema.stream() respects pagination and returns a stream of results
// for a quick script this is convenient, but for a larger setup
// you probably want to just use schema.fetch and wrap it in your own
// code to handle everything how you want.
for await (const page of schema.stream("https://news.ycombinator.com/")) {
  for (const post of page.posts) {
    console.log(post.title);
  }
}
```

## features

- Throws errors when selectors are invalid
- Relative URLs are automatically converted to absolute URLs

### arrays

Arrays can be created by using the `[selector]` or `[selector, schema]` syntax.

- For arrays with a schema, the selector is used to find the container element, then the schema is executed on each child element of the container.
- For an array without a schema, the selector is used to find all elements that match the selector.

If required items in the schema are missing, the result will be omitted from the array instead of throwing an error. This may cause confusion if your selectors are invalid, you should keep this in mind if you get an empty array when you expect results. You can set `SPIDER_THROW_MISSING_VALUE` to `true` to throw an error instead.

### filters

Filters are used to transform the value of a field. Filters are separated from the selector by a pipe (`|`) character. You can chain multiple filters by separating them with a pipe (`|`). Filters are executed in the order they are specified.

You can register your own filters using the `registerFilter(name, (input: string) => unknown)` method.

### queueing

To limit the number of concurrent requests, use the `concurrency(limit, maxQueuedItems?)` method. This will queue up requests once the given amount of requests are in flight. You can also specify `maxQueuedItems`, which will cause the queue to throw a `QueueFullError` if the queue is over the given limit, which can be useful if you want to reject requests if the queue is too large or prevent memory usage growing too large.

The queue is in memory and is not persistent. You should implement your own queue if you want to persist the queue between restarts or share it between multiple processes.

### pagination

You can paginate by using the `paginate(selector)` and `stream(url)` methods. `paginate(selector)` can be used to extract the next page url from the current page, and `stream(url)` will return an AsyncGenerator that will yield the results of each page. The generator will stop when there are no more pages to scrape. You can use `limit(value)` to limit the maximum number of pages that can be scraped in a single call to `stream()`.

### multiple selectors

Sometimes, you need to check multiple selectors to find the correct value. You can do this by separating the selectors with a comma. The first selector that matches will be used. For example, `.title | trim, .titleline a` will use the first selector that matches, either `.title` or `.titleline a`. Filters must be applied to each selector individually, so `.title | trim, .titleline a | trim` will trim both selectors.

### headless browsers

There is no built-in support for headless browsers, but you can use [puppeteer](https://github.com/puppeteer/puppeteer) or [playwright](https://playwright.dev/) to scrape pages that require javascript. Wait for the page to be ready, grab the html and use `schema.parse(html)`.

### custom extraction

Sometimes sites are stubborn and have data in a format you can't easily parse using just selectors. For this, in place of selectors you can use a function which is passed the cheerio object and, for arrays, the element that is being processed. This function can return any value, and can do whatever necessary to grab data.

```ts
const mySchema = createSchema({
  title: ($) => {
    // this could easily be done with a selector, but this is just an example
    // we can do basically whatever we want here
    return $("title").text();
  },
  tags: [
    "#tag-list div",
    ($, el) => {
      // "el" is available because this is an array, so "el" corresponds
      // to the current element and this function will be called on each.
      return $(el).text();
    },
  ],
});
```

## todo

- Allow loading preloaded cheerio objects, may be useful in combination with [crawlee](https://crawlee.dev/api/cheerio-crawler).
- Create a schema automatically based on the structure of the page. For example, on startup provide two URLs with known values like the title, then generate selectors and reuse them for unknown pages. This would work on sites that change classes often.
