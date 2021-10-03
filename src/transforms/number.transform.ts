import compromise from "compromise";
import compromiseNumbers from "compromise-numbers";
import { createTransformer } from "../helpers/create-transformer.helper";

const NUMBER_SHORTCUT_REGEX = /^[\d.]+$/;
const NUMBER_EXTRACTION_REGEX = /[\d ,.]+/;
const STRIP_REGEX = /[ ,]+/g;

const nlp = compromise.extend(compromiseNumbers);

export const transformNumber = createTransformer({
  transform: (input: string): number | undefined => {
    input = input.trim();
    if (NUMBER_SHORTCUT_REGEX.test(input)) {
      // this should be faster and handle most cases
      return +input;
    }

    // handle human strings like "ten thousand"
    // we have to do this before the extraction below because otherwise it
    // swallows "10k" as "10" as its far more aggressive
    const document = nlp(input);
    const value = document.numbers().get(0);
    if (value) {
      if (Array.isArray(value)) return value[0];
      return value;
    }

    // turn things like "(10)" or " 10\t " into "10"
    const number = NUMBER_EXTRACTION_REGEX.exec(input);
    if (number) {
      const stripped = number[0].replace(STRIP_REGEX, "").trim();
      if (stripped) {
        const converted = Number(stripped);
        if (!Number.isNaN(converted)) {
          return converted;
        }
      }
    }
  },
});
