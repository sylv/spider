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
        // remove double new lines
        // "an example\n\n\n\n\n" > "an example\n"
        .replace(/\r?\n( +)/g, "\n")
        .trim()
    );
  },
});
