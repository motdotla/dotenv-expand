'use strict'

var dotenvExpand = function (config) {
  // if ignoring process.env, use a blank object
  var environment = config.ignoreProcessEnv ? {} : process.env

  var interpolate = function (envValue) {
    var matches = envValue.match(/(.?\${?(?:[\w(:\-)]*)?}*)/g) || []

    return matches.reduce(function (newEnv, match, index) {
      var parts = /(.?)\${?([\w(:\-)]*)?}*/g.exec(match)
      if(!parts || parts.length === 0) {
        return newEnv;
      }
      var prefix = parts[1]

      var value, replacePart

      if (prefix === '\\') {
        replacePart = parts[0]
        value = replacePart.replace('\\$', '$')
      } else {
        var keyParts = parts[2].split(':-')
        var key = keyParts[0]
        replacePart = parts[0].substring(prefix.length)
        // process.env value 'wins' over .env file's value
        value = environment.hasOwnProperty(key)
          ? environment[key]
          : (config.parsed[key] || keyParts[1] || '')

        // If the value is found, remove nested expansions.
        if(keyParts.length > 1 && value) {
          var replaceNested = matches[index+1]
          matches[index + 1] = ''

          newEnv = newEnv.replace(replaceNested, '')
        }
        console.log('what', matches)
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
