const { EXCLUDED_SERVERS, MONGO_URI, MONGO_DB, LANGUAGES, NO_JOB } = require('dotenv-extended').load()
const Agenda = require('agenda')
const Queue = require('p-queue')
const xivapi = require('../lib/xivapi')
const { debug } = require('../lib/helpers')
const queue = new Queue({ intervalCap: 10, interval: 6 * 1000 })
const agenda = new Agenda({ db: {address: `${MONGO_URI}/${MONGO_DB}`} })
const EXCLUSIONS = EXCLUDED_SERVERS.split(',')
const marketDebug = debug.extend('job:market')
const marketLogDebug = debug.extend('job:market*')
const marketErrorDebug = marketDebug.extend('error')

module.exports = async function start (dbs) {
  agenda.define('update market data', runTask(dbs))
  await agenda.start()
  await agenda.every('1 day', 'update market data', {skipImmediate: true})
  if (!NO_JOB) {
    marketLogDebug('starting initial run through')
    await runTask(dbs)({ touch: () => {
      marketLogDebug('touching job')
    } }, () => {
      marketLogDebug('finished initial run through')
    })
  }
}

function runTask(dbs) {
  return (job, done) => {
    (async (job, done) => {
      marketLogDebug('starting market job')
      const serversByDC = await xivapi.getServerList()
      const servers = Object.values(serversByDC)
        .reduce((r, ar) => r.concat(ar), [])
        .filter((server) => !EXCLUSIONS.includes(server))
      marketDebug('collecting for servers', servers)
      marketDebug('excluding', EXCLUSIONS)
      const collection = dbs.en.collection('recipes')
      const stream = collection.find({}, { projection: { 'item.id': 1, 'item.name': 1 } }).stream()
      stream.on('data', (data) => {
        servers.forEach((server) => {
          queue.add(async () => {
            await job.touch()
            marketDebug('adding', data.item.id, 'for', server)
            let pricing
            try {
              pricing = await xivapi.getItemPriceForServer(server, data.item.id)
            } catch (e) {
              marketErrorDebug('Failed to get market information for', data.item.id, server, e.message)
            }
            if (pricing && pricing.Prices) {
              await Promise.all(LANGUAGES.split(',').filter(Boolean).map(async (lang) => {
                const collect = dbs[lang].collection('recipes')
                marketDebug('updating', lang, data.item.id, data.item.name)
                await collect.updateMany(
                  { id: data.item.id },
                  { $set: { [
                    `markets.${server}`]: {
                      prices: {
                        normal: pricing.Prices.filter(({IsHQ}) => !IsHQ).slice(0, 3),
                        hq: pricing.Prices.filter(({IsHQ}) => IsHQ).slice(0, 3),
                      },
                      lowest: {
                        normal: pricing.Prices
                          .filter(({IsHQ}) => !IsHQ)
                          .map(({PricePerUnit}) => PricePerUnit)
                          .sort((a, b) => a.PricePerUnit - b.PricePerUnit)
                          .splice(0, 1)
                          .reduce((_, i) => i, 0),
                        hq: pricing.Prices
                          .filter(({IsHQ}) => IsHQ)
                          .map(({PricePerUnit}) => PricePerUnit)
                          .sort((a, b) => a - b)
                          .splice(0, 1)
                          .reduce((_, i) => i, 0),
                      },
                      lastUpdated: (new Date()).toISOString()
                    }
                  } }
                )
              }))
            }
          })
        })
      })

      stream.on('error', done)
      stream.on('end', () => {
        queue.onIdle(() => {
          console.log('done')
          done()
        })
      })
    })(job, done)
  }
}
