export const API_URL: string = 'http://localhost:3000';

export let sleep = (ms: number): Promise<unknown> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export let sanitizeURL = (url: string): string => {
  let httpsProtocol = "https://";
  if (!url.startsWith(httpsProtocol))
    return httpsProtocol.concat(url);
  else
    return url;
};
