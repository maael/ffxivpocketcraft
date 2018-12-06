const { MONGO_URI, MONGO_DB, XIVAPI_KEY, EXCLUDED_SERVERS } = require('dotenv-extended').load()
const MongoClient = require('mongodb').MongoClient
const xivapi = require('../server/lib/xivapi')

const languages = [ 'en', 'de', 'fr', 'ja' ]
const exlcusions = EXCLUDED_SERVERS.split(',').filter(Boolean).map((s) => s.trim())

MongoClient.connect(MONGO_URI, { useNewUrlParser: true }, function (err, client) {
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

async function handleLanguage (client) {
  if (languages.length > 0) {
    const lang = languages.shift()
    const db = client.db(`${MONGO_DB}_${lang}`)

    console.log('Importing servers')
    const serversList = await xivapi.getServerList()
    console.log('Importing servers', serversList)
    const mapping = Object.entries(serversList).reduce((pre, [key, value]) => {
      return pre.concat(value.map((s) => ({
        server: s,
        dc: key,
        enabled: !exlcusions.includes(s),
        updatedAt: (new Date()).toISOString()
      })))
    }, [])
    console.log('Using mapping', mapping)

    return importServers(db, lang, mapping)
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

function importServers (db, lang, mapping) {
  return new Promise(async (resolve, reject) => {
    console.log(`[${lang}]`, 'Importing server records', mapping)
    const recipes = db.collection('servers')
    recipes.insertMany(mapping)
      .then(resolve, reject).catch(reject)
  })
}
