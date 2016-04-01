'use strict'

var dotenvExpand = function (config, regex) {
  regex = regex || /\$\{([A-Za-z0-9_]+)\}|\$([A-Za-z0-9_]+)/g

  var interpolate = function (env) {
    var matches = env.match(regex) || []

    matches.forEach(function (match) {
      var key = match.replace(/\$|\{|\}/g, '')

      // process.env value 'wins' over .env file's value
      var variable = process.env[key] || config[key] || ''

      // Resolve recursive interpolations
      variable = interpolate(variable)

      env = env.replace(match, variable)
    })

    return env
  }

  for (var configKey in config) {
    config[configKey] = interpolate(config[configKey])
  }

  for (var processKey in config) {
    process.env[processKey] = config[processKey]
  }

  return config
}

module.exports = dotenvExpand
