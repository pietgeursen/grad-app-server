'use strict'

const service = (process.env.NODE_ENV === 'test') ? require('feathers-memory') : require('feathers-knex')  
const hooks = require('./hooks')

module.exports = function () {
  const app = this

  // Initialize our service with any options it requires
  app.use('/users', service({
    Model: app.get('db'),
    name: 'users',
    startId: 1
  }))

  // Get our initialize service to that we can bind hooks
  const userService = app.service('/users')

  // Set up our before hooks
  userService.before(hooks.before)

  // Set up our after hooks
  userService.after(hooks.after)
}
