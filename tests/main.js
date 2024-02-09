/* eslint-disable no-template-curly-in-string */
'use strict'

const t = require('tap')

const dotenvExpand = require('../lib/main')

t.test('returns object', ct => {
  const dotenv = { parsed: {} }
  const parsed = dotenvExpand.expand(dotenv).parsed

  t.ok(parsed instanceof Object, 'should be an object')

  ct.end()
})

t.test('expands environment variables', ct => {
  const dotenv = {
    parsed: {
      BASIC: 'basic',
      BASIC_EXPAND: '${BASIC}',
      BASIC_EXPAND_SIMPLE: '$BASIC'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.BASIC_EXPAND, 'basic')
  ct.equal(parsed.BASIC_EXPAND_SIMPLE, 'basic')

  ct.end()
})

t.test('uses environment variables existing already on the machine for expansion', ct => {
  process.env.MACHINE = 'machine'
  const dotenv = {
    parsed: {
      MACHINE_EXPAND: '${MACHINE}',
      MACHINE_EXPAND_SIMPLE: '$MACHINE'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.MACHINE_EXPAND, 'machine')
  ct.equal(parsed.MACHINE_EXPAND_SIMPLE, 'machine')

  ct.end()
})

t.test('does not expand environment variables existing already on the machine that look like they could expand', ct => {
  process.env.PASSWORD = 'pas$word'
  const dotenv = {
    parsed: {
      PASSWORD: 'dude',
      PASSWORD_EXPAND: '${PASSWORD}',
      PASSWORD_EXPAND_SIMPLE: '$PASSWORD'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.PASSWORD_EXPAND, 'pas$word')
  ct.equal(parsed.PASSWORD_EXPAND_SIMPLE, 'pas$word')
  ct.equal(parsed.PASSWORD, 'pas$word')

  ct.end()
})

t.test('expands missing environment variables to an empty string', ct => {
  const dotenv = {
    parsed: {
      UNDEFINED_EXPAND: '$UNDEFINED_ENV_KEY'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND, '')

  ct.end()
})

t.test('prioritizes machine key expansion over .env', ct => {
  process.env.MACHINE = 'machine'
  const dotenv = {
    parsed: {
      MACHINE: 'machine_env',
      MACHINE_EXPAND: '$MACHINE'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.MACHINE_EXPAND, 'machine')

  ct.end()
})

t.test('does not expand escaped variables', ct => {
  const dotenv = {
    parsed: {
      ESCAPED_EXPAND: '\\$ESCAPED'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.ESCAPED_EXPAND, '$ESCAPED')

  ct.end()
})

t.test('does not expand inline escaped dollar sign', ct => {
  const dotenv = {
    parsed: {
      INLINE_ESCAPED_EXPAND: 'pa\\$\\$word'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.INLINE_ESCAPED_EXPAND, 'pa$$word')

  ct.end()
})

t.test('does not overwrite preset variables', ct => {
  process.env.SOME_ENV = 'production'
  const dotenv = {
    parsed: {
      SOME_ENV: 'development'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.SOME_ENV, 'production')

  ct.end()
})

t.test('does not expand inline escaped dollar sign', ct => {
  const dotenv = {
    parsed: {
      INLINE_ESCAPED_EXPAND_BCRYPT: '\\$2b\\$10\\$OMZ69gxxsmRgwAt945WHSujpr/u8ZMx.xwtxWOCMkeMW7p3XqKYca'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.INLINE_ESCAPED_EXPAND_BCRYPT, '$2b$10$OMZ69gxxsmRgwAt945WHSujpr/u8ZMx.xwtxWOCMkeMW7p3XqKYca')

  ct.end()
})

t.test('handle mixed values', ct => {
  const dotenv = {
    parsed: {
      PARAM1: '42',
      MIXED_VALUES: '\\$this$PARAM1\\$is${PARAM1}'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.MIXED_VALUES, '$this42$is42')

  ct.end()
})

t.test('expands environment variables', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.BASIC_EXPAND, 'basic')

  ct.end()
})

t.test('expands environment variables existing already on the machine', ct => {
  process.env.MACHINE = 'machine'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.MACHINE_EXPAND, 'machine')

  ct.end()
})

t.test('expands missing environment variables to an empty string', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND, '')

  ct.end()
})

t.test('expands environment variables existing already on the machine even with a default', ct => {
  process.env.MACHINE = 'machine'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.DEFINED_EXPAND_WITH_DEFAULT, 'machine')

  ct.end()
})

t.test('expands environment variables existing already on the machine even with a default when nested', ct => {
  process.env.MACHINE = 'machine'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.DEFINED_EXPAND_WITH_DEFAULT_NESTED, 'machine')

  ct.end()
})

t.test('expands environment variables undefined with one already on the machine even with a default when nested', ct => {
  process.env.MACHINE = 'machine'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.UNDEFINED_EXPAND_WITH_DEFINED_NESTED, 'machine')

  ct.end()
})

t.test('expands missing environment variables to an empty string but replaces with default', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_WITH_DEFAULT, 'default')

  ct.end()
})

t.test('expands environent variables and concats with default nested', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.DEFINED_EXPAND_WITH_DEFAULT_NESTED_TWICE, 'machinedefault')

  ct.end()
})

t.test('expands missing environment variables to an empty string but replaces with default nested', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_WITH_DEFAULT_NESTED, 'default')

  ct.end()
})

t.test('expands missing environment variables to an empty string but replaces with default nested twice', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_WITH_DEFAULT_NESTED_TWICE, 'default')

  ct.end()
})

t.test('prioritizes machine key expansion over .env', ct => {
  process.env.MACHINE = 'machine'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.MACHINE_EXPAND, 'machine')

  ct.end()
})

t.test('multiple expand', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.MONGOLAB_URI, 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')

  ct.end()
})

t.test('should expand recursively', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.MONGOLAB_URI_RECURSIVELY, 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')

  ct.end()
})

t.test('multiple expand', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.WITHOUT_CURLY_BRACES_URI, 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')

  ct.end()
})

t.test('should expand recursively', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.WITHOUT_CURLY_BRACES_URI_RECURSIVELY, 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')

  ct.end()
})

t.test('can write to an object rather than process.env if user provides it', ct => {
  const myObject = {}
  const dotenv = {
    processEnv: myObject,
    parsed: {
      SHOULD_NOT_EXIST: 'testing'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed
  const evaluation = typeof process.env.SHOULD_NOT_EXIST

  ct.equal(parsed.SHOULD_NOT_EXIST, 'testing')
  ct.equal(myObject.SHOULD_NOT_EXIST, 'testing')
  ct.equal(evaluation, 'undefined')

  ct.end()
})

t.test('expands environment variables existing already on the machine even with a default with special characters', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.DEFINED_EXPAND_WITH_DEFAULT_WITH_SPECIAL_CHARACTERS, 'machine')

  ct.end()
})

t.test('should expand with default value correctly', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_WITH_DEFAULT_WITH_SPECIAL_CHARACTERS, '/default/path:with/colon')
  ct.equal(parsed.WITHOUT_CURLY_BRACES_UNDEFINED_EXPAND_WITH_DEFAULT_WITH_SPECIAL_CHARACTERS, '/default/path:with/colon')

  ct.end()
})

t.test('should expand with default nested value correctly', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_WITH_DEFAULT_WITH_SPECIAL_CHARACTERS_NESTED, '/default/path:with/colon')

  ct.end()
})

t.test('should expand variables with "." in names correctly', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed['POSTGRESQL.MAIN.USER'], parsed['POSTGRESQL.BASE.USER'])

  ct.end()
})

t.test('handles value of only $', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.DOLLAR, '$')

  ct.end()
})

t.test('handles $one$two', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.ONETWO, 'onetwo')
  ct.equal(parsed.ONETWO_SIMPLE, 'onetwo')
  ct.equal(parsed.ONETWO_SIMPLE2, 'onetwo')
  ct.equal(parsed.ONETWO_SUPER_SIMPLE, 'onetwo')

  ct.end()
})
