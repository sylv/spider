import { Filter } from "../schema.js";
import{NodeHtmlMarkdown} from 'node-html-markdown'

export const markdownFilter: Filter<string> = (input) => {
    return NodeHtmlMarkdown.translate(input)
}