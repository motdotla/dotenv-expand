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
      var dotenv = {}
      var obj = dotenvExpand(dotenv)

      obj.should.be.an.instanceOf(Object)
      done()
    })

    it('expands environment variables', function (done) {
      var dotenv = {
        'BASIC': 'basic',
        'BASIC_EXPAND': '$BASIC'
      }
      var obj = dotenvExpand(dotenv)

      obj['BASIC_EXPAND'].should.eql('basic')
      done()
    })

    it('expands environment variables existing already on the machine', function (done) {
      process.env.MACHINE = 'machine'
      var dotenv = {
        'MACHINE_EXPAND': '$MACHINE'
      }
      var obj = dotenvExpand(dotenv)

      obj['MACHINE_EXPAND'].should.eql('machine')
      done()
    })

    it('expands missing environment variables to an empty string', function (done) {
      var dotenv = {
        'UNDEFINED_EXPAND': '$UNDEFINED_ENV_KEY'
      }
      var obj = dotenvExpand(dotenv)

      obj['UNDEFINED_EXPAND'].should.eql('')
      done()
    })

    it('prioritizes machine key expansion over .env', function (done) {
      process.env.MACHINE = 'machine'
      var dotenv = {
        'MACHINE': 'machine_env',
        'MACHINE_EXPAND': '$MACHINE'
      }
      var obj = dotenvExpand(dotenv)

      obj['MACHINE_EXPAND'].should.eql('machine')
      done()
    })

    it('does not expand escaped variables', function (done) {
      var dotenv = {
        'ESCAPED_EXPAND': '\\$ESCAPED'
      }
      var obj = dotenvExpand(dotenv)

      obj['ESCAPED_EXPAND'].should.eql('$ESCAPED')
      done()
    })

    it('handles if there are variable and space', function (done) {
      var dotenv = {
        'NAME': 'dotenv',
        'NAME_WITH_TEXT': '$NAME is the module\'s name'
      }

      var obj = dotenvExpand(dotenv)

      obj['NAME_WITH_TEXT'].should.eql('dotenv is the module\'s name')
      done()
    })

    it('handles if there are variable and backspace', function (done) {
      var dotenv = {
        'BASE_URL': 'http://localhost',
        'URL': '$BASE_URL/profile'
      }

      var obj = dotenvExpand(dotenv)

      obj['URL'].should.eql('http://localhost/profile')
      done()
    })
  })

  describe('integration', function () {
    var dotenv

    beforeEach(function (done) {
      dotenv = require('dotenv').load({path: './test/.env'})
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
      var obj = dotenvExpand(dotenv)

      obj['UNDEFINED_EXPAND'].should.eql('')
      done()
    })

    it('prioritizes machine key expansion over .env', function (done) {
      process.env.MACHINE = 'machine'
      var obj = dotenvExpand(dotenv)

      obj['MACHINE_EXPAND'].should.eql('machine')
      done()
    })

    it('does not expand escaped variables', function (done) {
      var obj = dotenvExpand(dotenv)

      obj['ESCAPED_EXPAND'].should.eql('$ESCAPED')
      done()
    })

    it('does not YET expand es6 template strings (pull request welcomed)', function (done) {
      var obj = dotenvExpand(dotenv)

      obj['MONGOLAB_URI'].should.eql('mongodb://${MONGOLAB_USER}:${MONGOLAB_PASSWORD}@${MONGOLAB_DOMAIN}:${MONGOLAB_PORT}/${MONGOLAB_DATABASE}')
      done()
    })
  })
})
