const router = require('express').Router()
const items = require('./items')
const recipes = require('./recipes')
const xivapi = require('./xivapi')
const proxy = require('./proxy')

module.exports = (dbs) => router
  .use('/items', items(dbs))
  .use('/recipes', recipes(dbs))
  .use('/xivapi', xivapi(dbs))
  .use('/proxy', proxy())
