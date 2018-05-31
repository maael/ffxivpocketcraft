const { MONGO_URI, MONGO_DB } = require('dotenv-extended').load()
const axios = require('axios')
const MongoClient = require('mongodb').MongoClient

function chunk (array, length) {
  return array.reduce((all,one,i) => {
     const ch = Math.floor(i/length);
     all[ch] = [].concat((all[ch]||[]),one);
     return all
  }, [])
}

function batchUpsert (collection, batch) {
  return Promise.all(batch.map((item) => {
    console.log('persisting', item.id)
    return collection.replaceOne({ id: item.id }, item, { upsert: true })
  }))
}

function fetchAndStore (db) {
  const collection = db.collection('recipes')

  return new Promise((resolve) => {
    collection.find({}, { projection: { id: 1 } }).toArray().then((existingItems) => {
        const existing = existingItems.map(({ id }) => id)
        console.log('Skipping', existing.length, 'existing items')
        axios('http://api.xivdb.com/recipe?columns=id').then(({ data }) => {
          const toFetch = data.filter(({ id }) => !existing.includes(id))
          const details = toFetch.map(({ id }) => `http://api.xivdb.com/recipe/${id}`)
          const chunked = chunk(details, 15)
          let processed = []
          function processChunks () {
            console.log('processed', processed.length, 'left ~', chunked.length * 15)
            if (chunked.length === 0) return resolve(processed)
            return axios.all(chunked.shift().map(axios)).then((items) => {
              const dataItems = items.map(({ data }) => data)
              processed = processed.concat(dataItems)
              batchUpsert(collection, dataItems).then(() => {
                processChunks()
              })
            })
          }

          processChunks()
        })
    })
  })
}

MongoClient.connect(MONGO_URI, function(err, client) {
  console.log("Connected successfully to server");
  const db = client.db(MONGO_DB)

  fetchAndStore(db)
    .then(() => {
      console.log('closed')
      client.close()
    })
    .catch((e) => {
      console.log('error', e.message)
      client.close()
    })
})
