const router = require('express').Router()
const items = require('./items')
const recipes = require('./recipes')

module.exports = (db) => router
  .use('/items', items(db))
  .use('/recipes', recipes(db))
