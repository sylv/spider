# @ryanke/spider

A simple toolkit to scrape websites. Inspired by [x-ray](https://github.com/matthewmueller/x-ray#readme) with modern internals, typescript support with type inference, and more flexibility.

## example

```ts
// lets scrape https://news.ycombinator.com/!
// schemas takes HTML and spits out a structured object with type information built in.
const schema = s({
  posts: s([
    // include the "tr" immediately after the ".athing" element
    "tr.athing ~ tr.athing+tr",
    s({
      title: s(".titleline > a"),
      // parse as number
      // most parsers are fairly lenient and will try to parse just about anything
      // the number parser can take values such as "one million", "1.5k", "1000", "10,000 dollars", etc
      posiition: s("td span.rank").number(),
      // the "optional" filter will return undefined if the selector doesn't match anything
      // without this, a MissingValue error will be thrown if the selector matches nothing
      points: s("td span.score").number().optional(),
      comments: s("a:contains(comment)").number().optional(),
      // "@href" will be picked up as a url and relative urls
      // will be converted to absolute urls automatically
      url: s(".titleline a@href"),
      // parse a date
      createdAt: s("span.age@title").date(),
      // a comma-separated list of selectors, the first one that matches will be used
      commentsUrl: s("a:contains(comment)@href, a:contains(discuss)@href").optional(),
      // nested objects where all fields are empty will be replaced with "null",
      // so for posts with no author this will simply be "author: null"
      author: s({
        name: s("a.hnuser").trim().optional(), // trim whitespace
        url: s("a.hnuser@href").optional(),
      }),
    }),
  ]),
});

const html = await fetch("https://news.ycombinator.com/").then((res) => res.text());
const data = schema.parseHTML(html);

// the return type will be inferred based on the schema, including the types of the fields when using transformers.
data.posts[0].comments; // "number" type

// if you want, s() can also be used outside an object.
// the return type always has a "parseHTML" method
const title = s("h1.title").parseHTML(html);

// there are multiple built-in transformers. most of them are lenient and try to parse just about anything.
// you can also register your own transformers
const number = s("span").number(); // this will parse things like "1.2k" into "1200"
const date = s("span").date(); // this parses dates from formats like "3pm", "2021-01-01", "yesterday", etc
const bool = s("span").boolean(); // this will parse things like "yes", "no", "true", "false", etc
const markdown = s("div@html").markdown(); // this converts HTML elements to markdown, which might be a more convenient format.
const value = s("li").value(); // given "key=value" or "2.5/10", this will return "value" and "2.5" respectively
// there are more transformers, look in src/transforms for a full list.
// you can also register your own. types are inferred based on the return type of the transformer.
const custom = s("span").transform((input: string) => parseInt(input, 10)); // parseHTML() return type is "number"
```

### custom selector functions

Sometimes sites are stubborn and have data in a format you can't easily parse using just selectors and transformers. For this, in place of selectors you can use a function which is passed the cheerio object and, for arrays, the element that is being processed. This function can return any value, and can do whatever necessary to grab data

If a custom extraction function returns an array, all results from each iteration will be flattened into a single array.

```ts
const mySchema = s({
  title: s(($) => {
    // this could easily be done with a selector, but this is just an example
    // we can do basically whatever we want here
    return $("title").text();
  }),
  tags: [
    "#tag-list div",
    s(($, el) => {
      // "el" is available because this is an array, so "el" corresponds
      // to the current element and this function will be called on each.
      return $(el).text();
    }),
  ],
});
```

## todo

- Zod-based validation
  - We have a lot of utilities that mimic zod types (eg, `.min()`), it would make more sense to integrate with zod directly.
  - For example, transform a value directly into an enum with `.nativeEnum(Enum)`
  - Not sure how to do this because we would have to proxy the schema object to zod? Maybe just that, proxy the schema object and maintain an internal schema that is checked.
- Generate a schema by having the user pick out some values from a page, then grabbing the HTML and generating selectors for the values.
  - Could be nice for small scripts and quickly getting started.
  - Allow multiple examples as tests to make sure the generated selectors are correct
  - Ideally, the example objects would be exactly like a schema object, arrays and all, and we could use some magic to convert it to an actual schema.
