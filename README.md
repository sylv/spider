# @ryanke/spider

A simple toolkit to scrape websites quickly and easily with full type safety.
Inspired by [x-ray](https://github.com/matthewmueller/x-ray#readme).

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
      // "@" can be used to get attributes, like "href", "innerHTML", etc
      url: s(".titleline a@href"),
      // parse a date. this could be something like "3 hours ago", "2021-01-01", "yesterday", etc.
      createdAt: s("span.age@title").date(),
      // a comma-separated list of selectors, the first one that matches will be used
      commentsUrl: s("a:contains(comment)@href, a:contains(discuss)@href").optional(),
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

// if you want, s() could also be used outside an object.
const title = s("h1.title").parseHTML(html);
```

## transformers

Transformers are used to convert plain text into more useful types. 
They have full type safety, the return type is inferred based on the transformer used.
Generally, built in transformers will try to be lenient and correct to avoid surprises.

```js
// this will parse things like "1200" and "1.2k" into 1200
const number = s("span").number(); 

// this parses dates from formats like "3pm", "2021-01-01", "yesterday", "3 years ago", etc to a date.
// for relative dates, it uses the current time as a reference point. this can make it inaccurate for
// a time like "a decade ago" but... ¯\_(ツ)_/¯
const date = s("span").date();

// converts "yes", "no", "true", "false", etc to true or false.
const bool = s("span").boolean();

// converts HTML elements to markdown, which might be a more convenient format.
// "@innerHTML" is important or else it will run on the text content and not the HTML itself.
const markdown = s("div@innerHTML").markdown();

// converts "Key: value", "key=value" or "2.5/10" into just the "value" and "2.5" parts respectively
const value = s("li").value();

// converts a value to an enum with lax matching.
enum MyEnum {
  // "1", "one", "One", "one with a long name", "One With A Long Name", "OneWithALongName" will all match this value
  OneWithALongName = 1,
  // "2", "two", "Two" will match this value
  Two = 2,
}

const enumValue = s("span").enum(MyEnum);

// splits a string, stripping quotes around the values.
// - "'one', 'two', 'three'" becomes ["one", "two", "three"].
// "one | two | three" becomes ["one", "two", "three"].
// "a OR b" becomes ["a", "b"].
const split = s("span").split();

// casing utils
const camelCase = s("span").camelcase(); // "hello world" -> "helloWorld"
const upperCase = s("span").uppercase(); // "hello world" -> "HELLO WORLD"
const lowerCase = s("span").lowercase(); // "Hello World" -> "hello world"
const titleCase = s("span").titlecase(); // "hello world" -> "Hello World"

// replacing values in the target
const replace = s("span").replace("world", "universe"); // "hello world" -> "hello universe"

// there are more built-in transformers, look in src/transforms for a full list.
// you can also register your own. types are inferred based on the return type of the transformer.
const custom = s("span").transform((input: string) => Number(input)); // parseHTML() return type is "number"

// this may be incomplete. see src/transformers and src/builder.ts for a full list of built-in transformers.
// .. or just use intellisense.
```

## custom selectors

Sometimes sites are stubborn and have data in a format you can't easily parse using just selectors and transformers. For this, in place of selectors you can use a function which is passed the cheerio object and, for arrays, the element that is being processed. This function can return any value, and can do whatever necessary to grab data

If a custom extraction function returns an array, all results from each iteration will be flattened into a single array.

```ts
const mySchema = s({
  title: s(($) => {
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
