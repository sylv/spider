import type { Transformer } from "../transformer.js";
import { NodeHtmlMarkdown } from "node-html-markdown";

export const markdown: Transformer<string, string> = (input) => {
  return NodeHtmlMarkdown.translate(input.trim());
};
