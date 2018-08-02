const { MONGO_URI, MONGO_DB, PORT } = require('dotenv-extended').load()
const MongoClient = require('mongodb').MongoClient
const express = require('express')
const compression = require('compression')
const morgan = require('morgan')
const next = require('next')({ dev: process.env.NODE_ENV !== 'production' })
const api = require('./api')
const fakePublic = require('./fake-public')

MongoClient.connect(MONGO_URI, function (err, client) {
  if (err) throw err
  if (!client) throw new Error(`Could not connect to mongodb ${MONGO_URI}`)
  const db = client.db(MONGO_DB)
  next.prepare().then(() => {
    const server = express()
    const handleNextRequest = next.getRequestHandler()

    server
      .use(compression())
      .use(morgan('combined'))
      .use('/api', api(db))
      .use('/public', fakePublic)
      .get('*', handleNextRequest)

    server.listen(PORT, (err) => {
      if (err) throw err
      console.log(`server running on localhost:${PORT}`)
    })
  })
})
