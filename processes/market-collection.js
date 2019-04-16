// const { MONGO_URI, MONGO_DB } = require('dotenv-extended').load()
// const MongoClient = require('mongodb').MongoClient
// const { languages } = require('../server/lib/helpers')
// const marketJob = require('../server/jobs/market');

// MongoClient.connect(MONGO_URI, { useNewUrlParser: true }, async function (err, client) {
//   if (err) throw err
//   if (!client) throw new Error(`Could not connect to mongodb ${MONGO_URI}`)
//   const dbs = languages.reduce((ob, lang) => Object.assign(ob, { [lang]: client.db(`${MONGO_DB}_${lang}`) }), {})
//   await marketJob(dbs);
// });

console.info('Skip market collection')
