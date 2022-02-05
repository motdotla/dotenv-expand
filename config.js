(function () {
  const { expand: dotenvExpand } = require('./lib/main')

  const env = require('dotenv').config()

  return dotenvExpand(env)
})()
