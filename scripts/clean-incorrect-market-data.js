const { MONGO_URI, MONGO_DB } = require('dotenv-extended').load()
const MongoClient = require('mongodb').MongoClient

const languages = [ 'en', 'de', 'fr', 'ja' ]

MongoClient.connect(MONGO_URI, function (err, client) {
  if (err) throw err
  console.log('Connected successfully to server')
  handleLanguage(client).then(() => {
    console.log('Finished all languages')
    client.close()
  }).catch((e) => {
    console.log(e)
    client.close()
  })
})

function handleLanguage (client) {
  if (languages.length > 0) {
    const lang = languages.shift()
    const db = client.db(`${MONGO_DB}_${lang}`)

    return cleanItems(db, lang)
      .then(() => {
        console.log(`[${lang}]`, 'Finished')
      })
      .then(() => handleLanguage(client))
      .catch((e) => {
        console.log(`[${lang}]`, 'Error', e.message)
      })
  } else {
    return Promise.resolve()
  }
}

function cleanItems (db, lang) {
  return new Promise((resolve, reject) => {
    console.log(`[${lang}]`, 'Cleaning items')
    const recipes = db.collection('recipes')
    recipes.updateMany({}, { $unset: { markets: 1 } })
      .then(resolve, reject).catch(reject)
  })
}
