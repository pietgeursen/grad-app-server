const Knex = require('knex')
const config = require('../knexfile')

module.exports = function () {
  return Knex(config[process.env.NODE_ENV || 'development'])
}
