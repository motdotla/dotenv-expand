'use strict'

var exec = require('child_process').execSync

var dotenvExpand = function (config) {
  // if ignoring process.env, use a blank object
  var environment = config.ignoreProcessEnv ? {} : process.env

  var matchCommand = function (value) {
    return /(.?)\$\(?([^)]+)?\)?/g.exec(value)
  }

  var matchExpansion = function (value) {
    return /(.?)\$(?!\(){?([a-zA-Z0-9_]+)?(?!\))}?/g.exec(value)
  }

  var commandValue = function (key) {
    try {
      const output = exec(key)

      return output.toString().trim()
    } catch (e) {
      throw e
    }
  }

  var expansionValue = function (key) {
    // process.env value 'wins' over .env file's value
    return environment.hasOwnProperty(key) ? environment[key] : (config.parsed[key] || '')
  }

  var interpolate = function (envValue) {
    var matches = envValue.match(/(.?\${(?:[a-zA-Z0-9_]+)?}|.?\$\((?:[^)]+)\)?|.?\$(?:[a-zA-Z0-9_]+)?)/g) || []

    return matches.reduce(function (newEnv, match) {
      var commandParts = matchCommand(match)
      var expansionParts = matchExpansion(match)

      var outer = expansionParts !== null ? 'expansion' : 'command'

      var getter = outer === 'expansion' ? expansionValue : commandValue
      var parts = outer === 'expansion' ? expansionParts : commandParts

      var prefix = parts[1]

      var value, replacePart

      if (prefix === '\\') {
        replacePart = parts[0]
        value = replacePart.replace('\\$', '$')
      } else {
        var key = parts[2]
        replacePart = parts[0].substring(prefix.length)

        value = getter(key)

        // Resolve recursive interpolations
        value = interpolate(value)
      }

      return newEnv.replace(replacePart, value)
    }, envValue)
  }

  for (var configKey in config.parsed) {
    var value = environment.hasOwnProperty(configKey) ? environment[configKey] : config.parsed[configKey]

    config.parsed[configKey] = interpolate(value)
  }

  for (var processKey in config.parsed) {
    environment[processKey] = config.parsed[processKey]
  }

  return config
}

module.exports = dotenvExpand
