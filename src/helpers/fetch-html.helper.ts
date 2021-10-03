import { request } from "undici";
import { HTTPError } from "../errors/http-error.helper";

export const fetchHTML = async (url: string): Promise<string> => {
  const response = await request(url);
  if (response.statusCode !== 200) {
    throw new HTTPError(`Failed to load ${url}: ${response.statusCode}`, response);
  }

  return response.body.text();
};
