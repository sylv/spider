import { t } from ".";
import { scrape } from "./scrape";

async function main(): Promise<any> {
  const result = await scrape("https://news.ycombinator.com/item?id=28730908", {
    title: "a.storylink",
    url: "a.storylink@href",
    points: t.number("td.subtext span.score"),
    age: t.duration("td.subtext span.age"),
    // comments: [
    //   ".athing comtr",
    //   {
    //     user: ".comhead a.hnuser",
    //     age: t.duration(".comhead span.age"),
    //     content: ".comment",
    //   },
    // ],
  });

  console.log(result);
}

main();
