const router = require('express').Router()
const items = require('./items')
const recipes = require('./recipes')
const proxy = require('./proxy')

module.exports = (db) => router
  .use('/items', items(db))
  .use('/recipes', recipes(db))
  .use('/proxy', proxy())
