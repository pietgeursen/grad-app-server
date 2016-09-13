var feathers = require('feathers/client')
var hooks = require('feathers-hooks')
var auth = require('feathers-authentication/client')
var rest = require('feathers-rest/client')
var request = require('supertest')
var superagent = require('superagent')
var test = require('tape')

var app = require('../../../src/app')
var generateUser = require('../../../generateUser')

test('can get all the grads', function (t) {
  request(app)
    .get('/grads')
    .expect(200)
    .end(function (err, res) {
      t.error(err)
      t.end()
    })
})

test('can not update a grad when not logged in', function (t) {
  request(app)
    .put('/grads')
    .end(function (err, res) {
      t.equal(res.status, 401, 'got 401, denied')
      t.end()
    })
})

test('can authenticate as admin', function (t) {
  const email = 'admin@admin.com'
  const password = 'password123'
  generateUser({
    email,
    password,
    roles: 'admin'
  },
    function (err, res) {
      t.error(err)

      var port = 3031
      var server = app.listen(port)
      var host = `http://localhost:${port}`
      var client = feathers()
        .configure(rest(host).superagent(superagent))
        .configure(hooks())
        .configure(auth())

      client.authenticate({
        type: 'local',
        email,
      password})
        .then(function () {
          t.ok(true, 'authenticated ok')
          t.end()
          server.close()
        })
    })
})

test.onFinish(function () {
  knex = app.get('db')
  knex.select().table('users').del()
    .then(function () {
      console.log('deleted all the things')
      knex.destroy()
    })
})
