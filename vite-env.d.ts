// Manually declare process.env for client-side usage as vite/client types are missing
declare const process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};
