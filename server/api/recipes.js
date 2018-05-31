const router = require('express').Router()
const JSONStream = require('JSONStream')

module.exports = (db) => {
  const collection = db.collection('recipes')
  router.get('/', (req, res) => {
    const { q, locale = 'en', items, classes } = req.query
    let query = {}
    if (q) Object.assign(query, { [`name_${locale}`]: new RegExp(q, 'i') })
    if (items) Object.assign(query, { 'tree.id': { $in: items.split(',').map(Number) } })
    if (classes) Object.assign(query, { class_name: { $in: classes.split(',') } })
    collection.find(query).stream().pipe(JSONStream.stringify()).pipe(res.type('json'))
  })

  return router
}
