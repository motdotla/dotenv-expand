'use strict'

const assert = require('assert')

let beforeEachHandler = () => {}
let assertions = 0
let tests = 0

function beforeEach (handler) {
  beforeEachHandler = handler
}

function equal (actual, expected, message) {
  assertions += 1
  assert.strictEqual(actual, expected, message)
}

function ok (value, message) {
  assertions += 1
  assert.ok(value, message)
}

function test (name, handler) {
  beforeEachHandler({ end () {} })
  handler({ end () {}, equal })
  tests += 1
  console.log(`ok ${tests} - ${name}`)
}

process.on('beforeExit', () => {
  console.log(`\n1..${tests}`)
  console.log(`# ${tests} tests, ${assertions} assertions`)
})

module.exports = {
  beforeEach,
  ok,
  test
}
