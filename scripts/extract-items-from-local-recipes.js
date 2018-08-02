const { MONGO_URI, MONGO_DB } = require('dotenv-extended').load()
const MongoClient = require('mongodb').MongoClient

MongoClient.connect(MONGO_URI, function (err, client) {
  if (err) throw err
  console.log('Connected successfully to server')
  const db = client.db(MONGO_DB)
  const recipes = db.collection('recipes')
  const items = db.collection('items')

  recipes.aggregate([ { $unwind: '$tree' }, { $project: { tree: 1 } } ], (err, cursor) => {
    if (err) console.error(err)
    cursor.toArray().then((recipeItems) => {
      const replaces = recipeItems.map(({ tree }) => (items.replaceOne({ id: tree.id }, tree, { upsert: true })))
      return Promise.all(replaces).then(() => {
        console.log('done')
      })
    })
  })
})
