'use strict'

const {
  decrypt,
  encrypted,
  evaluate,
  expand: expandValue
} = require('@dotenvx/primitives')

function _resolveEscapeSequences (value) {
  return value.replace(/\\\$/g, '$')
}

function expand (options) {
  // for use with progressive expansion
  const runningParsed = {}
  const literals = { ...options.parsed }

  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }

  // dotenv.config() ran before this so the assumption is process.env has already been set
  for (const key in options.parsed) {
    let value = options.parsed[key]

    // short-circuit scenario: process.env was already set prior to the file value
    if (processEnv[key] && processEnv[key] !== value) {
      value = processEnv[key]
    } else {
      const expansionProcessEnv = { ...processEnv }

      // dotenv.config() may have copied literal, unexpanded values into processEnv.
      // Prefer already-expanded values from earlier entries in that case.
      for (const runningKey in runningParsed) {
        if (expansionProcessEnv[runningKey] === literals[runningKey]) {
          delete expansionProcessEnv[runningKey]
        }
      }

      const privateKey = expansionProcessEnv.DOTENV_PRIVATE_KEY || runningParsed.DOTENV_PRIVATE_KEY
      if (privateKey && encrypted(value)) {
        value = decrypt(privateKey, value)
      }

      value = expandValue(value, { processEnv: expansionProcessEnv, runningParsed })
      value = evaluate(value, { processEnv: expansionProcessEnv, runningParsed })
    }

    options.parsed[key] = _resolveEscapeSequences(value)

    // for use with progressive expansion
    runningParsed[key] = _resolveEscapeSequences(value)
  }

  for (const processKey in options.parsed) {
    processEnv[processKey] = options.parsed[processKey]
  }

  return options
}

module.exports.expand = expand
