const router = require('express').Router()
const JSONStream = require('JSONStream')
const { languageHelper } = require('../lib/helpers')

module.exports = (dbs) => {
  router.get('/', (req, res) => {
    const { q, lang } = req.query
    const language = languageHelper(lang)
    const collection = dbs[language].collection('items')
    let query = {}
    if (q) Object.assign(query, { name: new RegExp(q, 'i') })
    collection.find(query, { projection: { name: 1, id: 1, category_name: 1 } }).stream().pipe(JSONStream.stringify()).pipe(res.type('json'))
  })

  return router
}
