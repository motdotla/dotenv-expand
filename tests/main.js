/* eslint-disable no-template-curly-in-string */
'use strict'

require('should')
const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const it = lab.test
const describe = lab.experiment
const dotenvExpand = require('../lib/main')

describe('dotenv-expand', function () {
  describe('unit tests', function () {
    it('returns object', function () {
      const dotenv = { parsed: {} }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.should.be.an.instanceOf(Object)
    })

    it('expands environment variables', function () {
      const dotenv = {
        parsed: {
          BASIC: 'basic',
          BASIC_EXPAND: '${BASIC}',
          BASIC_EXPAND_SIMPLE: '$BASIC'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.BASIC_EXPAND.should.eql('basic')
      obj.BASIC_EXPAND_SIMPLE.should.eql('basic')
    })

    it('uses environment variables existing already on the machine for expansion', function () {
      process.env.MACHINE = 'machine'
      const dotenv = {
        parsed: {
          MACHINE_EXPAND: '${MACHINE}',
          MACHINE_EXPAND_SIMPLE: '$MACHINE'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MACHINE_EXPAND.should.eql('machine')
      obj.MACHINE_EXPAND_SIMPLE.should.eql('machine')
    })

    it('does not expand environment variables existing already on the machine that look like they could expand', function () {
      process.env.PASSWORD = 'pas$word'
      const dotenv = {
        parsed: {
          PASSWORD: 'dude',
          PASSWORD_EXPAND: '${PASSWORD}',
          PASSWORD_EXPAND_SIMPLE: '$PASSWORD'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.PASSWORD_EXPAND.should.eql('pas$word')
      obj.PASSWORD_EXPAND_SIMPLE.should.eql('pas$word')
      obj.PASSWORD.should.eql('pas$word')
    })

    it('expands missing environment variables to an empty string', function () {
      const dotenv = {
        parsed: {
          UNDEFINED_EXPAND: '$UNDEFINED_ENV_KEY'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND.should.eql('')
    })

    it('prioritizes machine key expansion over .env', function () {
      process.env.MACHINE = 'machine'
      const dotenv = {
        parsed: {
          MACHINE: 'machine_env',
          MACHINE_EXPAND: '$MACHINE'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MACHINE_EXPAND.should.eql('machine')
    })

    it('does not expand escaped variables', function () {
      const dotenv = {
        parsed: {
          ESCAPED_EXPAND: '\\$ESCAPED'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.ESCAPED_EXPAND.should.eql('$ESCAPED')
    })

    it('does not expand inline escaped dollar sign', function () {
      const dotenv = {
        parsed: {
          INLINE_ESCAPED_EXPAND: 'pa\\$\\$word'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.INLINE_ESCAPED_EXPAND.should.eql('pa$$word')
    })

    it('does not overwrite preset variables', function () {
      process.env.SOME_ENV = 'production'
      const dotenv = {
        parsed: {
          SOME_ENV: 'development'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.SOME_ENV.should.eql('production')
    })

    it('does not expand inline escaped dollar sign', function () {
      const dotenv = {
        parsed: {
          INLINE_ESCAPED_EXPAND_BCRYPT: '\\$2b\\$10\\$OMZ69gxxsmRgwAt945WHSujpr/u8ZMx.xwtxWOCMkeMW7p3XqKYca'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.INLINE_ESCAPED_EXPAND_BCRYPT.should.eql('$2b$10$OMZ69gxxsmRgwAt945WHSujpr/u8ZMx.xwtxWOCMkeMW7p3XqKYca')
    })

    it('handle mixed values', function () {
      const dotenv = {
        parsed: {
          PARAM1: '42',
          MIXED_VALUES: '\\$this$PARAM1\\$is${PARAM1}'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MIXED_VALUES.should.eql('$this42$is42')
    })
  })

  describe('integration', function () {
    it('expands environment variables', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      dotenvExpand.expand(dotenv)

      process.env.BASIC_EXPAND.should.eql('basic')
    })

    it('expands environment variables existing already on the machine', function () {
      process.env.MACHINE = 'machine'

      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      dotenvExpand.expand(dotenv)

      process.env.MACHINE_EXPAND.should.eql('machine')
    })

    it('expands missing environment variables to an empty string', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND.should.eql('')
    })

    it('expands environment variables existing already on the machine even with a default', function () {
      process.env.MACHINE = 'machine'

      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      dotenvExpand.expand(dotenv)

      process.env.DEFINED_EXPAND_WITH_DEFAULT.should.eql('machine')
    })

    it('expands environment variables existing already on the machine even with a default when nested', function () {
      process.env.MACHINE = 'machine'

      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      dotenvExpand.expand(dotenv)

      process.env.DEFINED_EXPAND_WITH_DEFAULT_NESTED.should.eql('machine')
    })

    it('expands environment variables undefined with one already on the machine even with a default when nested', function () {
      process.env.MACHINE = 'machine'

      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      dotenvExpand.expand(dotenv)

      process.env.UNDEFINED_EXPAND_WITH_DEFINED_NESTED.should.eql('machine')
    })

    it('expands missing environment variables to an empty string but replaces with default', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND_WITH_DEFAULT.should.eql('default')
    })

    it('expands environent variables and concats with default nested', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.DEFINED_EXPAND_WITH_DEFAULT_NESTED_TWICE.should.eql('machinedefault')
    })

    it('expands missing environment variables to an empty string but replaces with default nested', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND_WITH_DEFAULT_NESTED.should.eql('default')
    })

    it('expands missing environment variables to an empty string but replaces with default nested twice', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND_WITH_DEFAULT_NESTED_TWICE.should.eql('default')
    })

    it('prioritizes machine key expansion over .env', function () {
      process.env.MACHINE = 'machine'

      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MACHINE_EXPAND.should.eql('machine')
    })

    it('multiple expand', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MONGOLAB_URI.should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
    })

    it('should expand recursively', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MONGOLAB_URI_RECURSIVELY.should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
    })

    it('multiple expand', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.WITHOUT_CURLY_BRACES_URI.should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
    })

    it('should expand recursively', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.WITHOUT_CURLY_BRACES_URI_RECURSIVELY.should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
    })

    it('can write to an object rather than process.env if user provides it', function () {
      const myObject = {}
      const dotenv = {
        processEnv: myObject,
        parsed: {
          SHOULD_NOT_EXIST: 'testing'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      const evaluation = typeof process.env.SHOULD_NOT_EXIST
      obj.SHOULD_NOT_EXIST.should.eql('testing')
      myObject.SHOULD_NOT_EXIST.should.eql('testing')
      evaluation.should.eql('undefined')
    })

    it('expands environment variables existing already on the machine even with a default with special characters', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.DEFINED_EXPAND_WITH_DEFAULT_WITH_SPECIAL_CHARACTERS.should.eql('machine')
    })

    it('should expand with default value correctly', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND_WITH_DEFAULT_WITH_SPECIAL_CHARACTERS.should.eql(
        '/default/path:with/colon'
      )
      obj.WITHOUT_CURLY_BRACES_UNDEFINED_EXPAND_WITH_DEFAULT_WITH_SPECIAL_CHARACTERS.should.eql(
        '/default/path:with/colon'
      )
    })

    it('should expand with default nested value correctly', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND_WITH_DEFAULT_WITH_SPECIAL_CHARACTERS_NESTED.should.eql(
        '/default/path:with/colon'
      )
    })

    it('should expand variables with "." in names correctly', function () {
      const dotenv = require('dotenv').config({ path: 'tests/.env.test', processEnv: {} })
      const obj = dotenvExpand.expand(dotenv).parsed

      obj['POSTGRESQL.MAIN.USER'].should.eql(obj['POSTGRESQL.BASE.USER'])
    })
  })
})
