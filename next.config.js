const { GOOGLE_GA } = require('dotenv-extended').load()

// WARNING: will need to restart/rebuild on changing this file

module.exports = {
  publicRuntimeConfig: {
    gaTrackingID: GOOGLE_GA
  }
}
