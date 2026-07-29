> If you have found dotenv-expand useful, consider checking out [dotenvx](https://github.com/dotenvx/dotenvx) for encrypting your `.env` files. Thank you for using dotenv. 🙏

# dotenv-expand [![NPM version](https://img.shields.io/npm/v/dotenv-expand.svg?style=flat-square)](https://www.npmjs.com/package/dotenv-expand) [![downloads](https://img.shields.io/npm/dw/dotenv-expand)](https://www.npmjs.com/package/dotenv-expand)

<img src="https://raw.githubusercontent.com/motdotla/dotenv/master/dotenv.svg" alt="dotenv" align="right" width="200" />

Dotenv-expand is a zero-dependency module that adds variable expansion, command substitution, and encrypted value support on top of [dotenv](https://github.com/motdotla/dotenv).

&nbsp;

## Usage

Install it alongside dotenv.

```sh
npm install dotenv dotenv-expand --save
```

Create a `.env` file in the root of your project:

```ini
# .env
USERNAME="dotenv"
DATABASE_URL="postgres://${USERNAME}@localhost/my_database"
```

As early as possible in your application, configure dotenv and expand its result:

```javascript
// index.js
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

dotenvExpand.expand(dotenv.config())

console.log(process.env.DATABASE_URL)
```

```sh
$ node index.js
postgres://dotenv@localhost/my_database
```

That's it. `process.env` now contains the expanded values from your `.env` file.

&nbsp;

## Advanced

<details><summary>Preload</summary><br>

> Consider using [dotenvx](https://github.com/dotenvx/dotenvx) instead. It includes expansion, command substitution, and encrypted `.env` support across languages and platforms:
>
> ```sh
> dotenvx run -- node your_script.js
> ```

Use Node's `--require` (`-r`) option to load and expand `.env` before your application starts:

```sh
node -r dotenv-expand/config your_script.js
```

The preload entry is self-contained; you do not need to separately install dotenv.

Configuration options can be passed as command-line arguments:

```sh
node -r dotenv-expand/config your_script.js dotenv_config_path=/custom/path/to/.env
```

Or as environment variables:

```sh
DOTENV_CONFIG_ENCODING=latin1 node -r dotenv-expand/config your_script.js
```

Command-line arguments take precedence over environment variables.

</details>

<details><summary>pnpm</summary><br>

```sh
pnpm add dotenv dotenv-expand
```

</details>

<details><summary>Command Substitution</summary><br>

Use `$(command)` to replace an expression with the command's output:

```ini
NODE_VERSION=$(node --version)
```

Only use command substitution with `.env` files you trust. Commands run with the permissions of the current process.

</details>

<details><summary>Encrypted Values</summary><br>

Use [dotenvx](https://dotenvx.com) to encrypt your `.env` file. dotenv-expand automatically decrypts `encrypted:` values when `DOTENV_PRIVATE_KEY` is set:

```sh
DOTENV_PRIVATE_KEY="<private key>" node -r dotenv-expand/config your_script.js
```

Keep the private key separate from the encrypted `.env` file—for example, in your cloud platform's secrets manager. Read the [dotenvx whitepaper](https://dotenvx.com/dotenvx.pdf?v=README) for more details.

</details>

<details><summary>Custom Process Environment</summary><br>

Use `processEnv` to write expanded values to an object other than `process.env`:

```javascript
const dotenvExpand = require('dotenv-expand')

const myEnv = {}

dotenvExpand.expand({
  processEnv: myEnv,
  parsed: {
    HELLO: 'World'
  }
})

console.log(myEnv.HELLO) // World
console.log(process.env.HELLO) // undefined
```

</details>

<details><summary>Interpolation Syntax</summary><br>

dotenv-expand supports braced and unbraced expansion, default values, and alternate values:

```ini
BASIC="basic"
BRACED=${BASIC}
UNBRACED=$BASIC
DEFAULT=${MISSING:-default}
ALTERNATE=${BASIC:+alternate}
```

See the complete [interpolation rules](https://dotenvx.com/docs/env-file#interpolation).

</details>

&nbsp;

## FAQ

<details><summary>What rules does the expansion engine follow?</summary><br>

See a full list of rules [here](https://dotenvx.com/docs/env-file#interpolation).

</details>

<details><summary>How does command substitution work?</summary><br>

Use `$(command)` in your `.env` file. dotenv-expand runs the command and replaces the expression with its output. See the Command Substitution example under Advanced.

</details>

<details><summary>How does encryption work?</summary><br>

Use [dotenvx](https://dotenvx.com) to encrypt your `.env` file. dotenv-expand automatically decrypts `encrypted:` values when `DOTENV_PRIVATE_KEY` is set.

```sh
DOTENV_PRIVATE_KEY="<private key>" node -r dotenv-expand/config your_script.js
```

Keep the private key separate from the encrypted `.env` file—for example, in your cloud platform's secrets manager. Read the [dotenvx whitepaper](https://dotenvx.com/dotenvx.pdf?v=README) for more details.

</details>

<details><summary>Is it safe to commit an encrypted `.env` file?</summary><br>

Yes, as long as the corresponding `DOTENV_PRIVATE_KEY` is stored separately and never committed with it. Use [dotenvx](https://dotenvx.com) to create and manage the encrypted file.

</details>

<details><summary>How can I avoid expanding pre-existing envs?</summary><br>

As of `v12.0.0` dotenv-expand no longer expands `process.env`.

If you need this ability, use [dotenvx](https://dotenvx.com) and ship an encrypted `.env` file with your code, allowing safe expansion at runtime.

</details>

<details><summary>How can I override an existing environment variable?</summary><br>

Use [dotenvx](https://dotenvx.com), as dotenv-expand does not support this.

dotenv-expand is a separate module (without knowledge of the loading of `process.env` and the `.env` file) and so cannot reliably know what to override.

</details>

&nbsp;

## Docs

### Expand

`expand` expands, evaluates, and decrypts values in a dotenv result:

```javascript
const dotenvExpand = require('dotenv-expand')

const result = dotenvExpand.expand({
  parsed: {
    BASIC: 'basic',
    BASIC_EXPAND: '${BASIC}',
    BASIC_EXPAND_SIMPLE: '$BASIC'
  }
})

console.log(result.parsed)
```

#### Options

##### `processEnv`

Default: `process.env`

Specify an object to read existing values from and write expanded values to.

##### `parsed`

The parsed key-value object to expand. This is normally the result of `dotenv.config()`.

&nbsp;

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md).

## Who's using dotenv-expand?

[These npm modules depend on it.](https://www.npmjs.com/browse/depended/dotenv-expand)
