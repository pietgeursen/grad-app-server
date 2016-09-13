'use strict'
const users = require('./user')
const grads = require('./grads')
const authentication = require('./authentication')
module.exports = function () {
  const app = this

  app.configure(authentication)
  app.configure(grads)
  app.configure(users)
}
