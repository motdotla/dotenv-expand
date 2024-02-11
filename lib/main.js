'use strict'

// * /
// *   (\\)?            # is it escaped with a backslash?
// *   (\$)             # literal $
// *   (?!\()           # shouldnt be followed by parenthesis
// *   (\{?)            # first brace wrap opening
// *   ([\w.]+)         # key
// *   (?::-((?:\$\{(?:\$\{(?:\$\{[^}]*\}|[^}])*}|[^}])*}|[^}])+))? # optional default nested 3 times
// *   (\}?)            # last brace warp closing
// * /xi

const DOTENV_SUBSTITUTION_REGEX = /(\\)?(\$)(?!\()(\{?)([\w.]+)(?::?-((?:\$\{(?:\$\{(?:\$\{[^}]*\}|[^}])*}|[^}])*}|[^}])+))?(\}?)/gi

function _resolveEscapeSequences (value) {
  return value.replace(/\\\$/g, '$')
}

function interpolate (value, processEnv, parsed) {
  return value.replace(DOTENV_SUBSTITUTION_REGEX, (match, escaped, dollarSign, openBrace, key, defaultValue, closeBrace) => {
    if (escaped === '\\') {
      return match.slice(1)
    } else {
      if (processEnv[key]) {
        return processEnv[key]
      }

      if (parsed[key]) {
        return parsed[key]
      }

      if (defaultValue) {
        if (defaultValue.startsWith('$')) {
          return interpolate(defaultValue, processEnv, parsed)
        } else {
          return defaultValue
        }
      }

      return ''
    }
  })
}

function expand (options) {
  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  for (const key in options.parsed) {
    let value = options.parsed[key]

    const inProcessEnv = Object.prototype.hasOwnProperty.call(processEnv, key)
    const inParsed = Object.prototype.hasOwnProperty.call(options.parsed, key)

    if (inProcessEnv) {
      if (inParsed) {
        // if the values are the same, assume the processEnv value came from the .env file and attempt interpolation
        if (processEnv[key] === options.parsed[key]) {
          value = interpolate(value, processEnv, options.parsed)
        } else {
          value = processEnv[key]
        }
      } else {
        // pre-existed in processEnv so do not attempt interpolation. example: 'pas$word'
        value = processEnv[key]
      }
    } else {
      // not inProcessEnv so assume interpolation for this .env key
      value = interpolate(value, processEnv, options.parsed)
    }

    options.parsed[key] = _resolveEscapeSequences(value)
  }

  for (const processKey in options.parsed) {
    processEnv[processKey] = options.parsed[processKey]
  }

  return options
}

module.exports.expand = expand
