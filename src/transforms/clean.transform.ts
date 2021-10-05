import { createTransformer } from "../helpers/create-transformer.helper";

export const transformClean = createTransformer({
  transform: (input: string): string => {
    return (
      input
        // remove double spaces and tabs
        .replace(/ {2,}/g, " ")
        // Fix sentences with no space in between
        // "birds are.government drones" > "birds are. government drones"
        .replace(/\.([A-Z])/g, ". $1")
        // remove spaces after new lines
        // "an example\n    test" > "an example\ntest"
        .replace(/\r?\n( +)/g, "\n")
        .trim()
    );
  },
});
