/* eslint-disable no-template-curly-in-string */
'use strict'

require('should')
const Lab = require('lab')
const lab = exports.lab = Lab.script()
const it = lab.test
const describe = lab.experiment
const beforeEach = lab.beforeEach

const dotenvExpand = require('../lib/main')

describe('dotenv-expand', function () {
  describe('unit tests', function () {
    it('returns object', function (done) {
      const dotenv = { parsed: {} }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.should.be.an.instanceOf(Object)
      done()
    })

    it('expands environment variables', function (done) {
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
      done()
    })

    it('expands environment variables existing already on the machine', function (done) {
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
      done()
    })

    it('expands missing environment variables to an empty string', function (done) {
      const dotenv = {
        parsed: {
          UNDEFINED_EXPAND: '$UNDEFINED_ENV_KEY'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND.should.eql('')
      done()
    })

    it('prioritizes machine key expansion over .env', function (done) {
      process.env.MACHINE = 'machine'
      const dotenv = {
        parsed: {
          MACHINE: 'machine_env',
          MACHINE_EXPAND: '$MACHINE'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MACHINE_EXPAND.should.eql('machine')
      done()
    })

    it('does not expand escaped variables', function (done) {
      const dotenv = {
        parsed: {
          ESCAPED_EXPAND: '\\$ESCAPED'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.ESCAPED_EXPAND.should.eql('$ESCAPED')
      done()
    })

    it('does not expand inline escaped dollar sign', function (done) {
      const dotenv = {
        parsed: {
          INLINE_ESCAPED_EXPAND: 'pa\\$\\$word'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.INLINE_ESCAPED_EXPAND.should.eql('pa$$word')
      done()
    })

    it('does not overwrite preset variables', function (done) {
      process.env.SOME_ENV = 'production'
      const dotenv = {
        parsed: {
          SOME_ENV: 'development'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.SOME_ENV.should.eql('production')
      done()
    })

    it('does not expand inline escaped dollar sign', function (done) {
      const dotenv = {
        parsed: {
          INLINE_ESCAPED_EXPAND_BCRYPT: '\\$2b\\$10\\$OMZ69gxxsmRgwAt945WHSujpr/u8ZMx.xwtxWOCMkeMW7p3XqKYca'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.INLINE_ESCAPED_EXPAND_BCRYPT.should.eql('$2b$10$OMZ69gxxsmRgwAt945WHSujpr/u8ZMx.xwtxWOCMkeMW7p3XqKYca')
      done()
    })

    it('handle mixed values', function (done) {
      const dotenv = {
        parsed: {
          PARAM1: '42',
          MIXED_VALUES: '\\$this$PARAM1\\$is${PARAM1}'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MIXED_VALUES.should.eql('$this42$is42')
      done()
    })
  })

  describe('integration', function () {
    let dotenv

    beforeEach(function (done) {
      dotenv = require('dotenv').config({ path: './tests/.env', debug: false })

      done()
    })

    it('expands environment variables', function (done) {
      dotenvExpand.expand(dotenv)

      process.env.BASIC_EXPAND.should.eql('basic')
      done()
    })

    it('expands environment variables existing already on the machine', function (done) {
      process.env.MACHINE = 'machine'
      dotenvExpand.expand(dotenv)

      process.env.MACHINE_EXPAND.should.eql('machine')
      done()
    })

    it('expands missing environment variables to an empty string', function (done) {
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND.should.eql('')
      done()
    })

    it('expands environment variables existing already on the machine even with a default', function (done) {
      process.env.MACHINE = 'machine'
      dotenvExpand.expand(dotenv)

      process.env.DEFINED_EXPAND_WITH_DEFAULT.should.eql('machine')
      done()
    })

    it('expands environment variables existing already on the machine even with a default when nested', function (done) {
      process.env.MACHINE = 'machine'
      dotenvExpand.expand(dotenv)

      process.env.DEFINED_EXPAND_WITH_DEFAULT_NESTED.should.eql('machine')
      done()
    })

    it('expands environment variables undefined with one already on the machine even with a default when nested', function (done) {
      process.env.MACHINE = 'machine'
      dotenvExpand.expand(dotenv)

      process.env.UNDEFINED_EXPAND_WITH_DEFINED_NESTED.should.eql('machine')
      done()
    })

    it('expands missing environment variables to an empty string but replaces with default', function (done) {
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND_WITH_DEFAULT.should.eql('default')
      done()
    })

    it('expands missing environment variables to an empty string but replaces with default nested', function (done) {
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND_WITH_DEFAULT_NESTED.should.eql('default')
      done()
    })

    it('expands missing environment variables to an empty string but replaces with default nested twice', function (done) {
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.UNDEFINED_EXPAND_WITH_DEFAULT_NESTED_TWICE.should.eql('default')
      done()
    })

    it('prioritizes machine key expansion over .env', function (done) {
      process.env.MACHINE = 'machine'
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MACHINE_EXPAND.should.eql('machine')
      done()
    })

    it('multiple expand', function (done) {
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MONGOLAB_URI.should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
      done()
    })

    it('should expand recursively', function (done) {
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.MONGOLAB_URI_RECURSIVELY.should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
      done()
    })

    it('multiple expand', function (done) {
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.WITHOUT_CURLY_BRACES_URI.should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
      done()
    })

    it('should expand recursively', function (done) {
      const obj = dotenvExpand.expand(dotenv).parsed

      obj.WITHOUT_CURLY_BRACES_URI_RECURSIVELY.should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
      done()
    })

    it('should not write to process.env if ignoreProcessEnv is set', function (done) {
      const dotenv = {
        ignoreProcessEnv: true,
        parsed: {
          SHOULD_NOT_EXIST: 'testing'
        }
      }
      const obj = dotenvExpand.expand(dotenv).parsed

      const evaluation = typeof process.env.SHOULD_NOT_EXIST
      obj.SHOULD_NOT_EXIST.should.eql('testing')
      evaluation.should.eql('undefined')
      done()
    })
  })
})
