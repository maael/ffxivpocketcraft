const router = require('express').Router()
const JSONStream = require('JSONStream')

module.exports = (db) => {
  const collection = db.collection('items')
  router.get('/', (req, res) => {
    const { q } = req.query
    let query = {}
    if (q) Object.assign(query, { name: new RegExp(q, 'i') })
    collection.find(query, { projection: { name: 1, id: 1, category_name: 1 } }).stream().pipe(JSONStream.stringify()).pipe(res.type('json'))
  })

  return router
}
