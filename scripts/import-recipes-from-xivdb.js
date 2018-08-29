const { MONGO_URI, MONGO_DB } = require('dotenv-extended').load()
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient

const languages = [ 'en', 'de', 'fr', 'ja' ]

function chunk (array, length) {
  return array.reduce((all, one, i) => {
    const ch = Math.floor(i / length)
    all[ch] = [].concat((all[ch] || []), one)
    return all
  }, [])
}

function batchUpsert (collection, batch, lang) {
  return Promise.all(batch.map((item) => {
    console.log(`[${lang}]`, 'persisting', item.id)
    return collection.replaceOne({ id: item.id }, item, { upsert: true })
  }))
}

function fetchAndStore (db, lang) {
  console.log(`[${lang}]`, 'Starting fetch and store')
  const collection = db.collection('recipes')

  return new Promise((resolve) => {
    collection.find({}, { projection: { id: 1 } }).toArray().then((existingItems) => {
      const existing = existingItems.map(({ id }) => id)
      console.log(`[${lang}]`, 'Skipping', existing.length, 'existing items')
      axios(`http://api.xivdb.com/recipe?columns=id&language=${lang}`).then(({ data }) => {
        const toFetch = data.filter(({ id }) => !existing.includes(id))
        const details = toFetch.map(({ id }) => `http://api.xivdb.com/recipe/${id}?language=${lang}`)
        const chunked = chunk(details, 15)
        let processed = []
        function processChunks () {
          console.log(`[${lang}]`, 'Processed', processed.length, 'left ~', chunked.length * 15)
          if (chunked.length === 0) return resolve(processed)
          return axios.all(chunked.shift().map(axios)).then((items) => {
            const dataItems = items.map(({ data }) => data)
            processed = processed.concat(dataItems)
            batchUpsert(collection, dataItems, lang).then(() => {
              processChunks()
            })
          }).catch((e) => {
            console.error(e)
            console.log('Caught network error')
          })
        }

        processChunks()
      })
    })
  })
}

MongoClient.connect(MONGO_URI, function (err, client) {
  if (err) throw err
  console.log('Connected successfully to server')

  handle()

  process.on('unhandledRejection', error => {
    console.log('Error', error)
    console.log('Waiting')
    setTimeout(() => handle(), 10000)
  })

  function handle () {
    handleLanguage(client).then(() => {
      console.log('Finished all languages')
      client.close()
    }).catch((e) => {
      console.log(e)
      client.close()
    })
  }
})

function handleLanguage (client) {
  if (languages.length > 0) {
    const lang = languages.shift()
    const db = client.db(`${MONGO_DB}_${lang}`)
    return fetchAndStore(db, lang)
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
