'use strict'

const service = require('feathers-knex')
const Knex = require('knex')

const hooks = require('./hooks')

module.exports = function () {
  const app = this

  // Initialize our service with any options it requires
  app.use('/grads', service({
    Model: app.get('db'),
    name: 'grads'
  }))

  // Get our initialize service to that we can bind hooks
  const gradsService = app.service('/grads')

  // Set up our before hooks
  gradsService.before(hooks.before)

  // Set up our after hooks
  gradsService.after(hooks.after)
}
