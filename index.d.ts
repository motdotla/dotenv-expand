export = dotenv_expand;

interface DotenvResult {
  error?: Error;
  parsed?: {
    [name: string]: string;
  };
}

declare function dotenv_expand(config: DotenvResult, override?: boolean): DotenvResult;

declare namespace dotenv_expand {
  const prototype: {
  };
}
