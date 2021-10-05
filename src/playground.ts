import { t } from ".";
import { scrape } from "./scrape";

async function main(): Promise<any> {
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

  console.dir(result, { depth: null });
}

main();
