var feathers = require('feathers/client')
var hooks = require('feathers-hooks')
var auth = require('feathers-authentication/client')
var rest = require('feathers-rest/client')
var socketio = require('feathers-socketio/client');
var io = require('socket.io-client')
var superagent = require('superagent')
var test = require('tape')
var pull = require('pull-stream')
var async = require('pull-async')
var promise = require('pull-promise')
var {asyncMap, drain} = require('pull-stream')

var App = require('../../../src/app')
var generateUser = require('../../../generateUser')

test('can get all the grads without being logged in', function (t) {
  const app = App({knex: {}})
  const {close, client} = createClientAndServer(app, 3031)
  const grads = client.service('grads')
  pull(
    promise.source(grads.find()),
    drain((res) => {
      close()
      t.ok(true)
      t.end()
    })
  )
})

test('can not update a grad when not logged in', function (t) {
  const app = App({knex: {}})
  const {close, client} = createClientAndServer(app, 3031)
  const grads = client.service('grads')

  pull(
    async((cb) => {
      grads.update(1, {name: 'derp'})
        .then(cb)
        .catch((err) => cb(null, err))
    }),
    drain((err) => {
      close()
      t.ok(err)
      t.end()
    })
  )
})

test('can authenticate as admin and create a grad', function (t) {
  const app = App({knex: {}})
  const email = 'admin@admin.com'
  const password = 'password123'
  const newAdmin = {email, password, roles: 'admin'}

  const {close, client} = createClientAndServer(app, 3031)

  pull(
    async((cb) => {
      app.service('users').create(newAdmin, {}, cb)
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
      close()
    })
  )
})

test('grads cannot create more grads', function (t) {
  const app = App({knex: {}})
  const email = 'grad@grad.com'
  const password = 'password123'
  const newGrad = {email, password, roles: 'grad'}

  const {close, client} = createClientAndServer(app, 3031)

  pull(
    async((cb) => {
      app.service('users').create(newGrad, {}, cb)
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
      close()
    })
  )
})

test('an authenticated user has the grad object attached too', function(t) {
  var app = App({knex: {}})
  const email = 'grad@grad.com'
  const password = 'password123'
  const newGrad = {email, password, roles: 'grad'}

  const {close, client} = createClientAndServer(app, 3031)

  pull(
    async((cb) => {
      app.service('users').create(newGrad, {}, cb)
    }),
    promise.through((user) => {
      t.ok(true, 'generate new user')
      return client.authenticate({type: 'local', email, password})
    }),
    pull.collect(function (err, res) {
      t.error(err)
      t.ok(res[0].data.grad)
      t.end()
      close()
    })
  )
})

test('when an admin creates a grad user, their grad profile is created too', function(t) {

  var app = App({knex: {}})
  const email = 'admin@admin.com'
  const password = 'password123'
  const newAdmin = {email, password, roles: 'admin'}
  const newGrad = {email:'piet@derp.com', password: 'password', roles: 'grad'}

  const {close, client} = createClientAndServer(app, 3031)

  pull(
    async((cb) => {
      app.service('users').create(newAdmin, {}, cb)
    }),
    promise.through((newUser) => {
      return client.authenticate({type: 'local', email, password})
    }),
    asyncMap((admin, cb) => {
      t.ok(true, 'authenitcated admin')
      client.service('users').create(newGrad,{}, cb)
    }),
    asyncMap((newUser, cb) => {
      t.ok(newUser, 'got new grad record')
      client.service('grads').find({query:{user_id: newUser.id}}, cb) 
    }),
    pull.collect((err, res) => {
      t.error(err)
      t.equal(res.length, 1, 'has one grad')
      t.end()
      close() 
    })
  )
})

test('grads can update their profiles', function(t) {

  const app = App({knex: {}})
  const email = 'newgrad@grad.com'
  const password = 'password123'
  const newUser = {email, password, roles: 'grad'}

  const {close, client} = createClientAndServer(app, 3031)

  pull(
    async((cb) => {
      app.service('users').create(newUser, {}, cb)
    }),
    promise.through(() => {
      t.ok(true, 'generate new user')
      return client.authenticate({type: 'local', email, password})
    }),
    asyncMap((result, cb)=> {
      t.ok(result, 'autheniticated')
      var grads = client.service('grads')
      grads.find({user_id: result.data.id}, cb) 
    }),
    pull.flatten(),
    asyncMap((grad, cb) => {
      t.ok(true, 'authenticate as new user')
      var grads = client.service('grads')
      grads.update(grad.id, {name: 'new'})
        .then(res => cb(null,res))
        .catch(cb)
    }),
    pull.collect(function (err, res) {
      t.error(err)
      t.equal(res[0].name, 'new')
      t.end()
      close()
    })
  )
})


function createClientAndServer (app, port) {
  var host = `http://localhost:${port}`
  var socket = io(host) 
  var server = app.listen(port)

  var client = feathers()
    .configure(socketio(socket))
    .configure(hooks())
    .configure(auth())

  function close() {
    server.close()
    socket.close()
  }
  return {client, close}
}
