export interface ConfigScheme {
  port: string;
  // database
  db: {
    host: string;
    port: string;
    name: string;
  };
}
