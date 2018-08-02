const router = require('express').Router()
const axios = require('axios')

const lodestoneRegex = new RegExp('^(https?:\/\/)?(na|eu|fr|de|jp)\.finalfantasyxiv\.com\/lodestone\/character\/[0-9]+\/?$')

module.exports = () => {
  router.get('/', (req, res) => {
    const { url } = req.query
    const lodestoneUrl = decodeURIComponent(url)
    if (!lodestoneRegex.test(lodestoneUrl)) {
      return res.status(400).send({ err: `Requested URL (${lodestoneUrl}) is not a valid lodestone URL` })
    }
    axios.get(lodestoneUrl).then(({ data }) => {
      res.send(data);
    }, (err) => {
      res.status(500).send({ err })
    })
  })

  return router
}
