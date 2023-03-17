'use strict'

// Works in safari as well.
function _interpolate (envValue, environment, config) {
  let dollarIndex = envValue.lastIndexOf('$')
  while (dollarIndex !== -1) {
    // Check if the dollar sign is escaped.
    if (dollarIndex > 0 && envValue[dollarIndex - 1] === '\\') {
      // Escape character found, skip this dollar sign.
      dollarIndex = envValue.lastIndexOf('$', dollarIndex - 1)
      continue
    }

    // Find the closing bracket of the variable.
    const bracketIndex = envValue.indexOf('}', dollarIndex)
    if (bracketIndex === -1) {
      // No closing bracket found, skip this dollar sign.
      dollarIndex = envValue.lastIndexOf('$', dollarIndex - 1)
      continue
    }

    // Extract the variable name and default value (if any).
    const variable = envValue.substring(dollarIndex + 1, bracketIndex)
    const [variableName, defaultValue] = variable.split(':-')

    // Replace the variable with its value or default value (if any).
    const value = environment[variableName] || defaultValue || config.parsed[variableName] || ''
    envValue = envValue.substring(0, dollarIndex) + value + envValue.substring(bracketIndex + 1)

    // Look for the next dollar sign.
    dollarIndex = envValue.lastIndexOf('$', dollarIndex - 1)
  }

  return envValue
}

function _resolveEscapeSequences (value) {
  return value.replace(/\\\$/g, '$')
}

function expand (config) {
  // if ignoring process.env, use a blank object
  const environment = config.ignoreProcessEnv ? {} : process.env

  for (const configKey in config.parsed) {
    const value = Object.prototype.hasOwnProperty.call(environment, configKey)
      ? environment[configKey]
      : config.parsed[configKey]

    config.parsed[configKey] = _resolveEscapeSequences(
      _interpolate(value, environment, config)
    )
  }

  for (const processKey in config.parsed) {
    environment[processKey] = config.parsed[processKey]
  }

  return config
}

module.exports.expand = expand
