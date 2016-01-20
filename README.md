# dotenv-expand

Dotenv-expand adds variable expansion on top of 
[dotenv](http://github.com/motdotla/dotenv). If you find yourself needing to
expand environment variables already existing on your machine, then
dotenv-expand is your tool.

## Install

```bash
npm install dotenv --save
npm install dotenv-expand --save
```

## Usage

As early as possible in your application, require dotenv and dotenv-expand, and
wrap dotenv-expand around dotenv.

```js
var dotenv = require('dotenv')
var dotenvExpand = require('dotenv-expand')

var myEnv = dotenv.config()
dotenvExpand(myEnv)
```

See [test/.env](./test/.env) for examples of variable expansion in your `.env`
file. 

