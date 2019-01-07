const qs = require('querystring')
const router = require('express').Router()
const JSONStream = require('JSONStream')
const { languageHelper } = require('../lib/helpers')

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

function handleClassLevels (query, classLevels) {
  query['$or'] = Object.entries(classLevels).map(([ doh, level ]) => ({
    'class_name': doh,
    level: { $lte: level }
  }))
}

module.exports = (dbs) => {
  router.get('/', (req, res) => {
    const { q, locale = 'en', items, classes, filter, classLevels, lang, server } = req.query
    const language = languageHelper(lang)
    const collection = dbs[language].collection('recipes')
    const recipeFilter = Object.entries(qs.parse(decodeURIComponent(filter))).reduce((ob, [ k, v ]) => (
      Object.assign(ob, { [k]: filterTypeMap[k] ? filterTypeMap[k](v) : v })
    ), {})
    let query = {}
    if (q) Object.assign(query, { [`name_${locale}`]: new RegExp(q, 'i') })
    if (items) Object.assign(query, { 'tree.id': { $in: items.split(',').map(Number) } })
    if (classes) Object.assign(query, { class_name: { $in: classes.split(',') } })
    handleRecipeFilter(query, recipeFilter)
    if (classLevels) {
      const parsedClassLevels = Object.entries(qs.parse(decodeURIComponent(classLevels))).reduce((ob, [ k, v ]) => (
        Object.assign(ob, { [k]: Number(v) })
      ), {})
      handleClassLevels(query, parsedClassLevels)
    }
    const projection = { projection: { name: 1, id: 1, class_name: 1, tree: 1, 'item.id': 1 } };
    if (server) {
      projection.projection[`markets.${server}.lowest`] = 1;
      projection.projection[`markets.${server}.lastUpdated`] = 1;
    }
    collection.find(query, projection).stream().pipe(JSONStream.stringify()).pipe(res.type('json'))
  })

  return router
}
