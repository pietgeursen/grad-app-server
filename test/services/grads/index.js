var feathers = require('feathers/client')
var hooks = require('feathers-hooks')
var auth = require('feathers-authentication/client')
var rest = require('feathers-rest/client')
var superagent = require('superagent')
var test = require('tape')
var pull = require('pull-stream')
var async = require('pull-async')
var promise = require('pull-promise')
var {asyncMap, drain} = require('pull-stream')

var App = require('../../../src/app')
var knex = require('../../../db/knex')()
var generateUser = require('../../../generateUser')

test('can get all the grads without being logged in', function (t) {
  var app = App({knex})
  const {server, client} = createClientAndServer(app, 3031)
  var grads = client.service('grads')

  pull(
    promise.source(grads.find()),
    drain(() => {
      server.close()
      t.ok(true)
      t.end()
    })
  )
})

test('can not update a grad when not logged in', function (t) {
  var app = App({knex})
  const {server, client} = createClientAndServer(app, 3031)
  var grads = client.service('grads')

  pull(
    async((cb) => {
      grads.find()
        .then(cb)
        .catch((err) => cb(null, err))
    }),
    drain((err) => {
      server.close()
      t.ok(err)
      t.end()
    })
  )
})

test('can authenticate as admin and create a grad', function (t) {
  var app = App({knex})
  const email = 'admin@admin.com'
  const password = 'password123'
  const newAdmin = {email, password, roles: 'admin'}

  const {server, client} = createClientAndServer(app, 3031)

  pull(
    async((cb) => {
      generateUser(newAdmin, {knex}, cb)
    }),
    promise.through((user) => {
      t.ok(true, 'generate new user')
      return client.authenticate({type: 'local', email, password})
    }),
    promise.through(() => {
      t.ok(true, 'authenitcate as new user')
      var grads = client.service('grads')
      return grads.create({name: 'coool'})
    }),
    drain(function (grad) {
      t.equal(grad.name, 'coool')
      t.end()
      server.close()
    })
  )
})

test('grads cannot create more grads', function (t) {
  var app = App({knex})
  const email = 'grad@grad.com'
  const password = 'password123'
  const newGrad = {email, password, roles: 'grad'}

  const {server, client} = createClientAndServer(app, 3031)

  pull(
    async((cb) => {
      generateUser(newGrad, {knex}, cb)
    }),
    promise.through((user) => {
      t.ok(true, 'generate new user')
      return client.authenticate({type: 'local', email, password})
    }),
    asyncMap((_, cb) => {
      t.ok(true, 'authenitcate as new user')
      var grads = client.service('grads')
      grads.create({name: 'coool'})
        .then(cb)
        .catch((err) => cb(null, err))
    }),
    drain(function (err) {
      t.ok(err)
      t.end()
      server.close()
    })
  )
})

test.onFinish(function () {
  knex.select().table('users').del()
    .then(function () {
      console.log('deleted all the things')
      return knex.destroy()
    })
    .then(function () {
      console.log('closed knex')
    })
})

function createClientAndServer (app, port) {
  var host = `http://localhost:${port}`
  var server = app.listen(port)

  var client = feathers()
    .configure(rest(host).superagent(superagent))
    .configure(hooks())
    .configure(auth())
  return {server, client}
}
