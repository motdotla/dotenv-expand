import { expand } from "dotenv-expand";

const myEnv = {
  parsed: {
    "KEY": "value"
  }
}

expand(myEnv);
