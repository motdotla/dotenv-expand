'use strict'

var dotenvExpand = function (config) {
  var interpolate = function (env) {
    var matches = env.match(/\$([a-zA-Z0-9_]+)|\${([a-zA-Z0-9_]+)}/g) || []

    matches.forEach(function (match) {
      var key = match.replace(/\$|{|}/g, '')

      // process.env value 'wins' over .env file's value
      var variable = process.env[key] || config[key] || ''

      // Resolve recursive interpolations
      variable = interpolate(variable)

      env = env.replace(match, variable)
    })

    return env
  }

  for (var configKey in config) {
    if (config[configKey].substring(0, 2) === '\\$') {
      config[configKey] = config[configKey].substring(1)
    } else {
      config[configKey] = interpolate(config[configKey])
    }
  }

  for (var processKey in config) {
    process.env[processKey] = config[processKey]
  }

  return config
}

module.exports = dotenvExpand
