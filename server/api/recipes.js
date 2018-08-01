const qs = require('querystring')
const router = require('express').Router()
const JSONStream = require('JSONStream')

const filterTypeMap = {
  ilvl: Number,
  clvl: Number,
  quickSynth: (v) => v === 'true' ? 1 : 0,
  canHQ: (v) => v === 'true' ? 1 : 0
}

function handleRecipeFilter (query, filter) {
  if (filter.ilvl) Object.assign(query, { 'item.level_item': { $lte: filter.ilvl } })
  if (filter.clvl) Object.assign(query, { level: { $lte: filter.clvl } })
  if (filter.quickSynth) Object.assign(query, { 'can_quick_synth': filter.quickSynth })
  if (filter.canHQ) Object.assign(query, { 'can_hq': filter.canHQ })
}

module.exports = (db) => {
  const collection = db.collection('recipes')
  router.get('/', (req, res) => {
    const { q, locale = 'en', items, classes, filter } = req.query
    const recipeFilter = Object.entries(qs.parse(decodeURIComponent(filter))).reduce((ob, [ k, v ]) => (
      Object.assign(ob, { [k]: filterTypeMap[k] ? filterTypeMap[k](v) : v })
    ), {})
    let query = {}
    if (q) Object.assign(query, { [`name_${locale}`]: new RegExp(q, 'i') })
    if (items) Object.assign(query, { 'tree.id': { $in: items.split(',').map(Number) } })
    if (classes) Object.assign(query, { class_name: { $in: classes.split(',') } })
    handleRecipeFilter(query, recipeFilter)
    collection.find(query, { projection: { name: 1, id: 1, class_name: 1, tree: 1 } }).stream().pipe(JSONStream.stringify()).pipe(res.type('json'))
  })

  return router
}
