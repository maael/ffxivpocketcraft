const router = require('express').Router()
const items = require('./items')
const recipes = require('./recipes')
const proxy = require('./proxy')

module.exports = (dbs) => router
  .use('/items', items(dbs))
  .use('/recipes', recipes(dbs))
  .use('/proxy', proxy())
