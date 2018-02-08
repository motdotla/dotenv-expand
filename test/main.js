/* eslint-disable no-template-curly-in-string */
'use strict'

require('should')
var Lab = require('lab')
var lab = exports.lab = Lab.script()
var it = lab.test
var describe = lab.experiment
var beforeEach = lab.beforeEach

var dotenvExpand = require('../lib/main')

describe('dotenv-expand', function () {
  describe('unit tests', function () {
    it('returns object', function (done) {
      var dotenv = { parsed: {} }
      var obj = dotenvExpand(dotenv).parsed

      obj.should.be.an.instanceOf(Object)
      done()
    })

    it('expands environment variables', function (done) {
      var dotenv = {
        parsed: {
          'BASIC': 'basic',
          'BASIC_EXPAND': '${BASIC}',
          'BASIC_EXPAND_SIMPLE': '$BASIC'
        }
      }
      var obj = dotenvExpand(dotenv).parsed

      obj['BASIC_EXPAND'].should.eql('basic')
      obj['BASIC_EXPAND_SIMPLE'].should.eql('basic')
      done()
    })

    it('expands environment variables existing already on the machine', function (done) {
      process.env.MACHINE = 'machine'
      var dotenv = {
        parsed: {
          'MACHINE_EXPAND': '${MACHINE}',
          'MACHINE_EXPAND_SIMPLE': '$MACHINE'
        }
      }
      var obj = dotenvExpand(dotenv).parsed

      obj['MACHINE_EXPAND'].should.eql('machine')
      obj['MACHINE_EXPAND_SIMPLE'].should.eql('machine')
      done()
    })

    it('expands missing environment variables to an empty string', function (done) {
      var dotenv = {
        parsed: {
          'UNDEFINED_EXPAND': '$UNDEFINED_ENV_KEY'
        }
      }
      var obj = dotenvExpand(dotenv).parsed

      obj['UNDEFINED_EXPAND'].should.eql('')
      done()
    })

    it('prioritizes machine key expansion over .env', function (done) {
      process.env.MACHINE = 'machine'
      var dotenv = {
        parsed: {
          'MACHINE': 'machine_env',
          'MACHINE_EXPAND': '$MACHINE'
        }
      }
      var obj = dotenvExpand(dotenv).parsed

      obj['MACHINE_EXPAND'].should.eql('machine')
      done()
    })

    it('does not expand escaped variables', function (done) {
      var dotenv = {
        parsed: {
          'ESCAPED_EXPAND': '\\$ESCAPED'
        }
      }
      var obj = dotenvExpand(dotenv).parsed

      obj['ESCAPED_EXPAND'].should.eql('$ESCAPED')
      done()
    })

    it('does not expand inline escaped dollar sign', function (done) {
      var dotenv = {
        parsed: {
          'INLINE_ESCAPED_EXPAND': 'pa\\$\\$word'
        }
      }
      var obj = dotenvExpand(dotenv).parsed

      obj['INLINE_ESCAPED_EXPAND'].should.eql('pa$$word')
      done()
    })

    it('does not overwrite preset variables', function (done) {
      process.env.SOME_ENV = 'production'
      var dotenv = {
        parsed: {
          'SOME_ENV': 'development'
        }
      }
      var obj = dotenvExpand(dotenv).parsed

      obj['SOME_ENV'].should.eql('production')
      done()
    })
  })

  describe('integration', function () {
    var dotenv

    beforeEach(function (done) {
      dotenv = require('dotenv').config({ path: './test/.env' })
      done()
    })

    it('expands environment variables', function (done) {
      dotenvExpand(dotenv)

      process.env['BASIC_EXPAND'].should.eql('basic')
      done()
    })

    it('expands environment variables existing already on the machine', function (done) {
      process.env.MACHINE = 'machine'
      dotenvExpand(dotenv)

      process.env['MACHINE_EXPAND'].should.eql('machine')
      done()
    })

    it('expands missing environment variables to an empty string', function (done) {
      var obj = dotenvExpand(dotenv).parsed

      obj['UNDEFINED_EXPAND'].should.eql('')
      done()
    })

    it('prioritizes machine key expansion over .env', function (done) {
      process.env.MACHINE = 'machine'
      var obj = dotenvExpand(dotenv).parsed

      obj['MACHINE_EXPAND'].should.eql('machine')
      done()
    })

    it('multiple expand', function (done) {
      var obj = dotenvExpand(dotenv).parsed

      obj['MONGOLAB_URI'].should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
      done()
    })

    it('should expand recursively', function (done) {
      var obj = dotenvExpand(dotenv).parsed

      obj['MONGOLAB_URI_RECURSIVELY'].should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
      done()
    })

    it('multiple expand', function (done) {
      var obj = dotenvExpand(dotenv).parsed

      obj['WITHOUT_CURLY_BRACES_URI'].should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
      done()
    })

    it('should expand recursively', function (done) {
      var obj = dotenvExpand(dotenv).parsed

      obj['WITHOUT_CURLY_BRACES_URI_RECURSIVELY'].should.eql('mongodb://username:password@abcd1234.mongolab.com:12345/heroku_db')
      done()
    })
  })
})
