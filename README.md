<p align="center">
<strong>Announcement 📣</strong><br/>From the makers that brought you Dotenv, introducing <a href="https://sync.dotenv.org">Dotenv Sync</a>.<br/>Sync your .env files between machines, environments, and team members.<br/><a href="https://sync.dotenv.org">Join the early access list.💛</a>
</p>

# dotenv-expand

<img src="https://raw.githubusercontent.com/motdotla/dotenv-expand/master/dotenv-expand.png" alt="dotenv-expand" align="right" />

Dotenv-expand adds variable expansion on top of 
[dotenv](http://github.com/motdotla/dotenv). If you find yourself needing to
expand environment variables already existing on your machine, then
dotenv-expand is your tool.

[![BuildStatus](https://img.shields.io/travis/motdotla/dotenv-expand/master.svg?style=flat-square)](https://travis-ci.org/motdotla/dotenv-expand)
[![NPM version](https://img.shields.io/npm/v/dotenv-expand.svg?style=flat-square)](https://www.npmjs.com/package/dotenv-expand)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

## Install

```bash
# Install locally (recommended)
npm install dotenv --save
npm install dotenv-expand --save
```

Or installing with yarn? `yarn add dotenv-expand`

## Usage

Usage is a cinch!

### 1. Create a .env file with variable expansions in the root directory of your project

```dosini
# .env file
#
# Add environment-specific variables on new lines in the form of NAME=VALUE
#
PASSWORD=s1mpl3
DB_HOST=localhost
DB_USER=root
DB_PASS=$PASSWORD
```

### 2. As early as possible in your application, import dotenv and expand with dotenv-expand

```js
var dotenv = require('dotenv')
var dotenvExpand = require('dotenv-expand')

var myEnv = dotenv.config()
dotenvExpand.expand(myEnv)

console.log(process.env)
```

### 3. That's it! 👏

`process.env` now has the expanded keys and values you defined in your `.env` file.

## Examples

See [test/.env](https://github.com/motdotla/dotenv-expand/blob/master/test/.env) for simple and complex examples of variable expansion in your `.env`
file.

## Documentation

DotenvExpand exposes one function:

* expand

### Expand

`expand` will expand your environment variables.

```js
const dotenv = {
  parsed: {
    BASIC: 'basic',
    BASIC_EXPAND: '${BASIC}',
    BASIC_EXPAND_SIMPLE: '$BASIC'
  }
}

const obj = dotenvExpand.expand(dotenv)

console.log(obj)
```

#### Options

##### ignoreProcessEnv

Default: `false`

Turn off writing to `process.env`.

```js
const dotenv = {
  ignoreProcessEnv: true,
  parsed: {
    SHOULD_NOT_EXIST: 'testing'
  }
}
const obj = dotenvExpand.expand(dotenv).parsed

console.log(obj.SHOULD_NOT_EXIST) // testing
console.log(process.env.SHOULD_NOT_EXIST) // undefined
```

## FAQ

### What rules does the expansion engine follow?

The expansion engine roughly has the following rules:

* `$KEY` will expand any env with the name `KEY`
* `${KEY}` will expand any env with the name `KEY` 
* `\$KEY` will escape the `$KEY` rather than expand
* `${KEY:-default}` will first attempt to expand any env with the name `KEY`. If not one, then it will return `default`

You can see a full list of examples [here](https://github.com/motdotla/dotenv-expand/blob/master/test/.env).

## Contributing Guide

See [CONTRIBUTING.md](CONTRIBUTING.md)

## CHANGELOG

See [CHANGELOG.md](CHANGELOG.md)

## Who's using dotenv-expand?

[These npm modules depend on it.](https://www.npmjs.com/browse/depended/dotenv-expand)
