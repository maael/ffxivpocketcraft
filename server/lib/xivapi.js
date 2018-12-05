const { XIVAPI_URL, XIVAPI_KEY } = require('dotenv-extended').load()
const { setup } = require('axios-cache-adapter')

const api = setup({
  cache: {
    maxAge: 5 * 60 * 1000,
    exclude: {
      query: false
    }
  },
  baseURL: XIVAPI_URL,
  params: {
    key: XIVAPI_KEY
  }
})

function getServerList() {
  return new Promise((resolve, reject) => {
    api.get(`/servers/dc`)
      .then(({ data }) => {
        resolve(data)
      }, reject).catch(reject)
  })
}

function getItemPriceForServer(server, itemId) {
  return new Promise((resolve, reject) => {
    api.get(`/market/${server}/items/${itemId}`)
      .then(({ data }) => {
        resolve(data)
      }, reject).catch(reject)
  })
}

module.exports = {
  getServerList,
  getItemPriceForServer
}
