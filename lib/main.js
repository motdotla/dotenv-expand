// 'use strict'
//
// // * /
// // *   (\\)?            # is it escaped with a backslash?
// // *   (\$)             # literal $
// // *   (?!\()           # shouldnt be followed by parenthesis
// // *   (\{?)            # first brace wrap opening
// // *   ([\w.]+)         # key
// // *   (?::-((?:\$\{(?:\$\{(?:\$\{[^}]*\}|[^}])*}|[^}])*}|[^}])+))? # optional default nested 3 times
// // *   (\}?)            # last brace warp closing
// // * /xi
//
// const DOTENV_SUBSTITUTION_REGEX = /(\\)?(\$)(?!\()(\{?)([\w.]+)(?::?-((?:\$\{(?:\$\{(?:\$\{[^}]*\}|[^}])*}|[^}])*}|[^}])+))?(\}?)/gi
//
// function _resolveEscapeSequences (value) {
//   return value.replace(/\\\$/g, '$')
// }
//
// function interpolate (value, processEnv, parsed) {
//   return value.replace(DOTENV_SUBSTITUTION_REGEX, (match, escaped, dollarSign, openBrace, key, defaultValue, closeBrace) => {
//     if (escaped === '\\') {
//       return match.slice(1)
//     } else {
//       if (processEnv[key]) {
//         if (processEnv[key] === parsed[key]) {
//           return processEnv[key]
//         } else {
//           // scenario: PASSWORD_EXPAND_NESTED=${PASSWORD_EXPAND}
//           return interpolate(processEnv[key], processEnv, parsed)
//         }
//       }
//
//       if (parsed[key]) {
//         // avoid recursion from EXPAND_SELF=$EXPAND_SELF
//         if (parsed[key] !== value) {
//           return interpolate(parsed[key], processEnv, parsed)
//         }
//       }
//
//       if (defaultValue) {
//         if (defaultValue.startsWith('$')) {
//           return interpolate(defaultValue, processEnv, parsed)
//         } else {
//           return defaultValue
//         }
//       }
//
//       return ''
//     }
//   })
// }
//
// function expand (options) {
//   let processEnv = process.env
//   if (options && options.processEnv != null) {
//     processEnv = options.processEnv
//   }
//
//   for (const key in options.parsed) {
//     let value = options.parsed[key]
//
//     const inProcessEnv = Object.prototype.hasOwnProperty.call(processEnv, key)
//     if (inProcessEnv) {
//       if (processEnv[key] === options.parsed[key]) {
//         // assume was set to processEnv from the .env file if the values match and therefore interpolate
//         value = interpolate(value, processEnv, options.parsed)
//       } else {
//         // do not interpolate - assume processEnv had the intended value even if containing a $.
//         value = processEnv[key]
//       }
//     } else {
//       // not inProcessEnv so assume interpolation for this .env key
//       value = interpolate(value, processEnv, options.parsed)
//     }
//
//     options.parsed[key] = _resolveEscapeSequences(value)
//   }
//
//   for (const processKey in options.parsed) {
//     processEnv[processKey] = options.parsed[processKey]
//   }
//
//   return {
//     parsed: options.parsed,
//     processEnv
//   }
//   return options
// }
//
// module.exports.expand = expand

function _resolveEscapeSequences (value) {
  return value.replace(/\\\$/g, '$')
}

function interpolate (value, env) {
  const regex = /(?<!\\)\${([^{}]+)}|(?<!\\)\$([A-Za-z_][A-Za-z0-9_]*)/g

  let result = value
  let match
  const seen = new Set() // self-referential checker

  while ((match = regex.exec(result)) !== null) {
    seen.add(result)

    const [template, bracedExpression, unbracedExpression] = match
    const expression = bracedExpression || unbracedExpression
    const r = expression.split(/:-|-/)
    const key = r.shift()
    const defaultValue = r.join('-')
    const value = env[key]

    if (value) {
      // self-referential check
      if (seen.has(value)) {
        result = result.replace(template, defaultValue)
      } else {
        result = result.replace(template, value)
      }
    } else {
      result = result.replace(template, defaultValue)
    }

    regex.lastIndex = 0 // reset regex search position to re-evaluate after each replacement
  }

  return result
}

function expand (options) {
  let processEnv = process.env
  if (options && options.processEnv != null) {
    processEnv = options.processEnv
  }
  const parsed = options.parsed || {}

  const combined = { ...processEnv, ...parsed }
  const combinedReversed = { ...parsed, ...processEnv }

  for (const key in parsed) {
    const value = parsed[key]

    // interpolate using both file and processEnv (file interpolation wins. used for --overload later)
    const fileValue = _resolveEscapeSequences(interpolate(value, combined))
    console.log('value', value)
    parsed[key] = fileValue

    if (fileValue === _resolveEscapeSequences(value)) {
      continue // no change means no expansion, move on
    }

    if (processEnv[key]) {
      continue // already has a value in processEnv, move on
    }

    const processEnvValue = interpolate(value, combinedReversed) // could be empty string ''
    if (processEnvValue) {
      processEnv[key] = _resolveEscapeSequences(processEnvValue) // set it
    }
  }

  return {
    parsed,
    processEnv
  }
}

module.exports.expand = expand
