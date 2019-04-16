const { GOOGLE_GA } = require('dotenv-extended').load()
const withCSS  = require('@zeit/next-css');

// WARNING: will need to restart/rebuild on changing this file

module.exports = withCSS({
  publicRuntimeConfig: {
    gaTrackingID: GOOGLE_GA
  }
})
