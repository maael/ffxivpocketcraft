const { LANGUAGES } = require('dotenv-extended').load()
const debug = require('debug')
const languages = LANGUAGES.split(',')

function languageHelper (lang) {
  if (!lang) return languages[0]
  return languages.includes(lang) ? lang : languages[0]
}

module.exports = {
  languages,
  languageHelper,
  debug: debug('pocketcraft')
}
