export = dotenv_expand;

interface DotenvResult {
  ignoreProcessEnv?: boolean;
  error?: Error;
  parsed?: {
    [name: string]: string;
  };
}

interface DotenvExpandOptions {
  ignoreProcessEnv?: boolean;
}

declare function dotenv_expand(
  config: DotenvResult & DotenvExpandOptions
): DotenvResult;

declare namespace dotenv_expand {
  const prototype: {};
}
