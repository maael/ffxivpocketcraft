const router = require('express').Router()
const xivapi = require('../lib/xivapi')

router.get('/servers', (_, res) => {
  xivapi.getServerList().then((servers) => {
    res.send(servers)
  }, (e) => {
    res.status(500).send({ e: e.message });
  })
})

module.exports = router
