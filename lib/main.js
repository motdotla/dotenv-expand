'use strict'

function expandValue (obj, value) {
  // process.env value 'wins' over .env file's value
  return process.env[value] || obj[value] || ''
}

function expandDollarValue (obj, value) {
  var possible = value.substring(1)
  return expandValue(obj, possible)
}

function replaceAll (string, substring, replacement) {
  return string.split(substring).join(replacement)
}

var expand = function (obj) {
  Object.keys(obj).forEach(function (key) {
    var value = obj[key]

    var curliesRegExp = /(\$\{([^}]+)\})/
    var matches = curliesRegExp.exec(value)

    while (matches != null) {
      value = replaceAll(value, matches[1], expandValue(obj, matches[2]))
      matches = curliesRegExp.exec(value)
    }

    if (value.charAt(0) === '$') {
      value = expandDollarValue(obj, value)
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
