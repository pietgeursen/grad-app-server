var request = require('supertest')
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

test.onFinish(function () {
  app.get('db').destroy()
})
