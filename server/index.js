const { MONGO_URI, MONGO_DB, PORT } = require('dotenv-extended').load()
const MongoClient = require('mongodb').MongoClient
const express = require('express')
const compression = require('compression')
const morgan = require('morgan')
const next = require('next')({ dev: process.env.NODE_ENV !== 'production' })
const api = require('./api')
const fakePublic = require('./fake-public')

MongoClient.connect(MONGO_URI, function(err, client) {
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
      console.log(`server running on localhost:${PORT}`)
    })
  })
})
