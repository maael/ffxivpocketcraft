const router = require('express').Router()
const JSONStream = require('JSONStream')

module.exports = (db) => {
  const collection = db.collection('items')
  router.get('/', (req, res) => {
    const { q } = req.query
    let query = {}
    if (q) Object.assign(query, { name: new RegExp(q, 'i') })
    collection.find(query).stream().pipe(JSONStream.stringify()).pipe(res.type('json'))
  })

  return router
}
