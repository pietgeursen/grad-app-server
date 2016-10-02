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

function resetDb() {
  return pull(
    promise.source(knex.migrate.rollback()), 
    promise.through(_ => knex.migrate.latest())
  ) 
}


test('can get all the grads without being logged in', function (t) {
  var app = App({knex})
  const {server, client} = createClientAndServer(app, 3031)
  var grads = client.service('grads')

  pull(
    resetDb(),
    promise.through(_ => grads.find()),
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
    resetDb(),
    asyncMap((_, cb) => {
      grads.update(1, {name: 'derp'})
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
    resetDb(),
    asyncMap((_, cb) => {
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
    resetDb(),
    asyncMap((_, cb) => {
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

test('when an admin creates a grad user, their grad profile is created too', function(t) {

  var app = App({knex})
  const email = 'admin@admin.com'
  const password = 'password123'
  const newAdmin = {email, password, roles: 'admin'}
  const newGrad = {email:'piet@derp.com', password: 'password', roles: 'grad'}

  const {server, client} = createClientAndServer(app, 3031)

  pull(
    resetDb(),
    asyncMap((_, cb) => {
      generateUser(newAdmin, {knex}, cb)
    }),
    promise.through(_ =>
      client.authenticate({type: 'local', email, password})
    ),
    promise.through((admin) => {
      t.ok(true, 'authenitcated admin')
      return client.service('users').create(newGrad)
    }),
    promise.through((newGrad) => {
      t.ok(newGrad, 'got new grad record')
      return client.service('grads').find({query:{user_id: newGrad.id}}) 
    }),
    pull.collect((err, res) => {
      t.error(err)
      t.equal(res.length, 1, 'has one grad')
      t.end()  
      server.close() 
    })
  )
})

test('grads can update their profiles', function(t) {

  var app = App({knex})
  const email = 'newgrad@grad.com'
  const password = 'password123'
  const newUser = {email, password, roles: 'grad'}

  const {server, client} = createClientAndServer(app, 3031)

  pull(
    resetDb(),
    asyncMap((_, cb) => {
      generateUser(newUser, {knex}, cb)
    }),
    promise.through(() => {
      t.ok(true, 'generate new user')
      return client.authenticate({type: 'local', email, password})
    }),
    asyncMap((result, cb)=> {
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
      server.close()
    })
  )
})

test.onFinish(function () {
  knex.select().table('users').del()
    .then(function() {
      return knex.select().table('grads').del()
    })
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
