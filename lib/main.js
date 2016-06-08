'use strict'

function expandValue (obj, value) {
  var ndx = value.indexOf(' ')
  var endOfVar = ndx === -1 ? undefined : ndx
  var possible = value.substring(1, endOfVar)
  var suffix = ndx === -1 ? '' : value.substring(ndx)
  // process.env value 'wins' over .env file's value
  value = process.env[possible] || obj[possible] || ''

  return value + suffix
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
