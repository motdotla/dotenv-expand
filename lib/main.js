'use strict'

// // like String.prototype.search but returns the last index
// function _searchLast (str, rgx) {
//   const matches = Array.from(str.matchAll(rgx))
//   return matches.length > 0 ? matches.slice(-1)[0].index : -1
// }
//
// function _interpolate (value, processEnv, parsed) {
//   // find the last unescaped dollar sign in the value to evaluate
//   const lastUnescapedDollarSignIndex = _searchLast(value, /(?!(?<=\\))\$/g)
//
//   // return early unless unescaped dollar sign
//   if (lastUnescapedDollarSignIndex === -1) {
//     return value
//   }
//
//   // This is the right-most group of variables in the string
//   const rightMostGroup = value.slice(lastUnescapedDollarSignIndex)
//
//   console.log('rightMostGroup', rightMostGroup)
//
//   /**
//    * This finds the inner most variable/group divided
//    * by variable name and default value (if present)
//    * (
//    *   (?!(?<=\\))\$        // only match dollar signs that are not escaped
//    *   {?                   // optional opening curly brace
//    *     ([\w.]+)           // match the variable name
//    *     (?::-([^}\\]*))?   // match an optional default value
//    *   }?                   // optional closing curly brace
//    * )
//    */
//   const matchGroup = /((?!(?<=\\))\${?([\w.]+)(?::-([^}\\]*))?}?)/
//   const match = rightMostGroup.match(matchGroup)
//
//   if (match != null) {
//     const [, group, key, defaultValue] = match
//     const replacementString = processEnv[key] || defaultValue || parsed[key] || ''
//     const modifiedValue = value.replace(group, replacementString)
//
//     // return early for scenario like processEnv.PASSWORD = 'pas$word'
//     if (processEnv[key] && modifiedValue === processEnv[key]) {
//       return modifiedValue
//     }
//
//     return _interpolate(modifiedValue, processEnv, parsed)
//   }
//
//   return value
// }

function _resolveEscapeSequences (value) {
  return value.replace(/\\\$/g, '$')
}

function substitute (value, processEnv, parsed) {
  // * (
  // *   (?!(?<=\\))\$        // only match dollar signs that are not escaped
  // *   {?                   // optional opening curly brace
  // *     ([\w.]+)           // match the variable name
  // *     (?::-([^}\\]*))?   // match an optional default value
  // *   }?                   // optional closing curly brace
  // * )
  //
  // * /
  // *   (\\)?            # is it escaped with a backslash?
  // *   (\$)             # literal $
  // *   (?!\()           # shouldnt be followed by parenthesis
  // *   \{?              # allow brace wrapping
  // *   ([\w.]+)?    # optional alpha nums
  // *   (?::-([^}\\]*))? # optional default
  // *   \}?              # closing brace
  // * /xi
  const SUB_REGEX = /(\\)?(\$)(?!\()(\{?)([\w.]+)?(?::-([^}\\]*))?(\}?)/gi

  return value.replace(SUB_REGEX, (match, escaped, dollarSign, openBrace, key, defaultValue, closeBrace) => {
    if (escaped === '\\') {
      return match.slice(1)
    } else if (key) {
      return processEnv[key] || defaultValue || parsed[key] || ''
    } else {
      return match
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

    // don't interpolate the processEnv value if it exists there already
    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
      value = processEnv[key]
    } else {
      value = substitute(value, processEnv, options.parsed)
    }

    options.parsed[key] = _resolveEscapeSequences(value)
  }

  for (const processKey in options.parsed) {
    processEnv[processKey] = options.parsed[processKey]
  }

  return options
}

module.exports.expand = expand
