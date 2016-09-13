var feathers = require('feathers/client')
var hooks = require('feathers-hooks')
var auth = require('feathers-authentication/client')
var rest = require('feathers-rest/client')
var request = require('supertest')
var superagent = require('superagent')
var test = require('tape')

var app = require('../../../src/app')

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
  var port = 3031
  var server = app.listen(port)
  var host = `http://localhost:${port}`
  var client = feathers()
    .configure(rest(host).superagent(superagent))
    .configure(hooks())
    .configure(auth())

  client.authenticate({
    type: 'local',
    email: 'admin@grads.co.nz',
    password: 'password'
  })
    .then(function () {
      t.ok(true, 'authenticated ok')
      t.end()
      server.close()
    })
})

test.onFinish(function () {
  app.get('db').destroy()
})
