'use strict'

function expandValue (obj, value) {
  var possible = value.substring(1)
  // process.env value 'wins' over .env file's value
  value = process.env[possible] || obj[possible] || ''

  return value
}

var expand = function (obj) {
  Object.keys(obj).forEach(function (key) {
    var value = obj[key]

    if (value.charAt(0) === '$') {
      value = expandValue(obj, value)
    }

    if (value.substring(0, 2) === '\\$') {
      value = value.substring(1)
    }

    obj[key] = value
  })

  Object.keys(obj).forEach(function (key) {
    process.env[key] = obj[key]
  })

  return obj
}

module.exports = expand
