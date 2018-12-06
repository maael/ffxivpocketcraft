const router = require('express').Router()
const JSONStream = require('JSONStream')
const { languageHelper } = require('../lib/helpers')

module.exports = (dbs) => {
  router.get('/servers', async (req, res) => {
    const { lang } = req.query
    const language = languageHelper(lang)
    const collection = dbs[language].collection('servers')
    try {
      await collection.find().stream().pipe(JSONStream.stringify()).pipe(res.type('json'))
    } catch (e) {
      console.error('ERROR', e)
      res.status(500).send({ e: e.message })
    }
  })

  return router
}
