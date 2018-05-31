const path = require('path')
const express = require('express')
const router = express.Router()
const node_modules = path.join(__dirname, '..', 'node_modules')

router.use('/', express.static(path.join(__dirname, '..', 'public')))
router.use('/css', express.static(path.join(node_modules, 'bulma', 'css')))

module.exports = router
