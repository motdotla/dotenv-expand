/* eslint-disable no-template-curly-in-string */
'use strict'

const t = require('tap')
const dotenvExpand = require('../lib/main')

t.beforeEach((ct) => {
  // important, clear process.env before each test
  process.env = {}
})

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

t.test('expands self without a recursive call stack error', ct => {
  const dotenv = {
    parsed: {
      EXPAND_SELF: '$EXPAND_SELF'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.EXPAND_SELF, '') // because it ends up accessing parsed[key].

  ct.end()
})

t.test('expands self with undefined variable and default value', ct => {
  const dotenv = {
    parsed: {
      EXPAND_SELF: '${EXPAND_SELF:-default}'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.EXPAND_SELF, 'default')

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

t.test('expands missing environment variables to an empty string', ct => {
  const dotenv = {
    parsed: {
      UNDEFINED_EXPAND: '$UNDEFINED'
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

t.test('expands environment variables (process.env)', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.BASIC_EXPAND, 'basic')

  ct.end()
})

t.test('expands environment variables (process.env)', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
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

t.test('expands environment variables existing already on the machine (process.env)', ct => {
  process.env.MACHINE = 'machine'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
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

t.test('expands missing environment variables to an empty string (process.env)', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND, '')

  ct.end()
})

t.test('expands environment variables existing already on the machine even with a default', ct => {
  process.env.MACHINE = 'machine'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.EXPAND_DEFAULT, 'machine')

  ct.end()
})

t.test('expands environment variables existing already on the machine even with a default when nested', ct => {
  process.env.MACHINE = 'machine'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.EXPAND_DEFAULT_NESTED, 'machine')
  ct.equal(process.env.EXPAND_DEFAULT_NESTED2, 'machine')

  ct.end()
})

t.test('expands environment variables undefined with one already on the machine even with a default when nested', ct => {
  process.env.MACHINE = 'machine'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.UNDEFINED_EXPAND_NESTED, 'machine')

  ct.end()
})

t.test('expands missing environment variables to an empty string but replaces with default', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT, 'default')
  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT2, 'default')

  ct.end()
})

t.test('expands environent variables and concats with default nested', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.EXPAND_DEFAULT_NESTED_TWICE, 'machine_envdefault')
  ct.equal(parsed.EXPAND_DEFAULT_NESTED_TWICE2, 'machine_envdefault')

  ct.end()
})

t.test('expands environent variables and concats with default nested', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.EXPAND_DEFAULT_NESTED_TWICE, 'machine_envdefault')
  ct.equal(parsed.EXPAND_DEFAULT_NESTED_TWICE2, 'machine_envdefault')

  ct.end()
})

t.test('expands missing environment variables to an empty string but replaces with default nested', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT_NESTED, 'default')
  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT_NESTED2, 'default')

  ct.end()
})

t.test('expands missing environment variables to an empty string but replaces with default nested twice', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT_NESTED_TWICE, 'default')
  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT_NESTED_TWICE2, 'default')

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

  ct.equal(parsed.NO_CURLY_BRACES_URI, 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')

  ct.end()
})

t.test('should expand recursively', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.NO_CURLY_BRACES_URI_RECURSIVELY, 'mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')

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

  ct.equal(parsed.EXPAND_DEFAULT_SPECIAL_CHARACTERS, 'machine_env')
  ct.equal(parsed.EXPAND_DEFAULT_SPECIAL_CHARACTERS2, 'machine_env')

  ct.end()
})

t.test('expands environment variables existing already on the machine even with a default with special characters (process.env)', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.EXPAND_DEFAULT_SPECIAL_CHARACTERS, 'machine_env')
  ct.equal(parsed.EXPAND_DEFAULT_SPECIAL_CHARACTERS2, 'machine_env')

  ct.end()
})

t.test('should expand with default value correctly', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT_SPECIAL_CHARACTERS, '/default/path:with/colon')
  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT_SPECIAL_CHARACTERS2, '/default/path:with/colon')
  ct.equal(parsed.NO_CURLY_BRACES_UNDEFINED_EXPAND_DEFAULT_SPECIAL_CHARACTERS, ':-/default/path:with/colon')
  ct.equal(parsed.NO_CURLY_BRACES_UNDEFINED_EXPAND_DEFAULT_SPECIAL_CHARACTERS2, '-/default/path:with/colon')

  ct.end()
})

t.test('should expand with default nested value correctly', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT_SPECIAL_CHARACTERS_NESTED, '/default/path:with/colon')
  ct.equal(parsed.UNDEFINED_EXPAND_DEFAULT_SPECIAL_CHARACTERS_NESTED2, '/default/path:with/colon')

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

t.test('handles two dollar signs', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.TWO_DOLLAR_SIGNS, 'abcd$$1234')

  ct.end()
})

t.test('does not choke', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.DONT_CHOKE1, '.kZh`>4[,[DDU-*Jt+[;8-,@K=,9%;F9KsoXqOE)gpG^X!{)Q+/9Fc(QF}i[NEi!')
  ct.equal(parsed.DONT_CHOKE2, '=;+=CNy3)-D=zI6gRP2w$B@0K;Y]e^EFnCmx$Dx?;.9wf-rgk1BcTR0]JtY<S:b_')
  ct.equal(parsed.DONT_CHOKE3, 'MUcKSGSY@HCON<1S_siWTP`DgS*Ug],mu]SkqI|7V2eOk9:>&fw;>HEwms`D8E2H')
  ct.equal(parsed.DONT_CHOKE4, 'm]zjzfRItw2gs[2:{p{ugENyFw9m)tH6_VCQzer`*noVaI<vqa3?FZ9+6U;K#Bfd')
  ct.equal(parsed.DONT_CHOKE5, '#la__nK?IxNlQ%`5q&DpcZ>Munx=[1-AMgAcwmPkToxTaB?kgdF5y`A8m=Oa-B!)')
  ct.equal(parsed.DONT_CHOKE6, 'xlC&*<j4J<d._<JKH0RBJV!4(ZQEN-+&!0p137<g*hdY2H4xk?/;KO1$(W{:Wc}Q')
  ct.equal(parsed.DONT_CHOKE7, '?$6)m*xhTVewc#NVVgxX%eBhJjoHYzpXFg=gzn[rWXPLj5UWj@z$/UDm8o79n/p%')
  ct.equal(parsed.DONT_CHOKE8, '@}:[4#g%[R-CFR});bY(Z[KcDQDsVn2_y4cSdU<Mjy!c^F`G<!Ks7]kbS]N1:bP:')

  ct.end()
})

t.test('expands self without a recursive call stack error (process.env)', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.EXPAND_SELF, '') // because it ends up accessing parsed[key].

  ct.end()
})

t.test('expands DOMAIN with ${HOST}', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.HOST, 'something')
  ct.equal(parsed.DOMAIN, 'https://something')

  ct.end()
})

t.test('does not attempt to expand password if already existed in processEnv', ct => {
  process.env.PASSWORD = 'pas$word'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.PASSWORD, 'pas$word')

  ct.end()
})

t.test('does not expand dollar sign that are not variables', ct => {
  const dotenv = {
    parsed: {
      NO_VARIABLES: '\\$.$+$-$$'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.NO_VARIABLES, '$.$+$-$$')

  ct.end()
})

t.test('expands recursively', ct => {
  const dotenv = {
    parsed: {
      MOCK_SERVER_PORT: '8090',
      MOCK_SERVER_HOST: 'http://localhost:${MOCK_SERVER_PORT}',
      BACKEND_API_HEALTH_CHECK_URL: '${MOCK_SERVER_HOST}/ci-health-check'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.MOCK_SERVER_PORT, '8090')
  ct.equal(parsed.MOCK_SERVER_HOST, 'http://localhost:8090')
  ct.equal(parsed.BACKEND_API_HEALTH_CHECK_URL, 'http://localhost:8090/ci-health-check')

  ct.end()
})

t.test('CANNOT expand recursively reverse order (ORDER YOUR .env file for least surprise)', ct => {
  const dotenv = {
    parsed: {
      BACKEND_API_HEALTH_CHECK_URL: '${MOCK_SERVER_HOST}/ci-health-check',
      MOCK_SERVER_HOST: 'http://localhost:${MOCK_SERVER_PORT}',
      MOCK_SERVER_PORT: '8090'
    }
  }
  const parsed = dotenvExpand.expand(dotenv).parsed

  ct.equal(parsed.MOCK_SERVER_PORT, '8090')
  ct.equal(parsed.MOCK_SERVER_HOST, 'http://localhost:')
  ct.equal(parsed.BACKEND_API_HEALTH_CHECK_URL, '/ci-health-check')

  ct.end()
})

t.test('expands recursively', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.PASSWORD_EXPAND, 'password')
  ct.equal(process.env.PASSWORD_EXPAND_SIMPLE, 'password')
  ct.equal(process.env.PASSWORD, 'password')
  ct.equal(process.env.PASSWORD_EXPAND_NESTED, 'password')
  ct.equal(process.env.PASSWORD_EXPAND_NESTED, 'password')

  ct.end()
})

t.test('expands recursively but is smart enough to not attempt expansion of a pre-set env in process.env', ct => {
  process.env.PASSWORD = 'pas$word'

  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.PASSWORD, 'pas$word')
  ct.equal(process.env.PASSWORD_EXPAND, 'pas$word')
  ct.equal(process.env.PASSWORD_EXPAND_SIMPLE, 'pas$word')
  ct.equal(process.env.PASSWORD_EXPAND_NESTED, 'pas$word')
  ct.equal(process.env.PASSWORD_EXPAND_NESTED_NESTED, 'pas$word')

  ct.end()
})

t.test('expands alternate logic', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.ALTERNATE, 'alternate')

  ct.end()
})

t.test('expands alternate logic when not set', ct => {
  process.env.USE_IF_SET = ''
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.ALTERNATE, '')

  ct.end()
})

// WARNING: this is a side effect of dotenv.config prior loading to process.env. THIS IS NOT ACCURATE behavior and is removed in [dotenvx](https://github.com/dotenvx/dotenvx) to match bash expectations.
// DO NOT RELY ON this, instead order your KEYS appropriately
t.test('expansion for https://github.com/motdotla/dotenv-expand/issues/123', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.FIRST_PAGE_URL, 'http://localhost:8090/first-page')
  ct.equal(process.env.MOCK_SERVER_HOST, 'http://localhost:8090')
  ct.equal(process.env.MOCK_SERVER_PORT, '8090')
  ct.equal(process.env.PROJECT_PUBLIC_HOST, 'http://localhost:8090')

  ct.end()
})

t.test('expansion for https://github.com/motdotla/dotenv-expand/issues/124', ct => {
  const dotenv = require('dotenv').config({ path: 'tests/.env.test' })
  dotenvExpand.expand(dotenv)

  ct.equal(process.env.SOURCE, '12345')
  ct.equal(process.env.EXPANDED, 'ab-12345-cd-ef-gh')

  ct.end()
})
