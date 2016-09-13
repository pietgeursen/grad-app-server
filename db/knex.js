const Knex = require('knex')

const config = require('../knexfile')
const db = Knex(config[process.env.NODE_ENV || 'development'])

module.exports = db
