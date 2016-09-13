var bcrypt = require('bcrypt')

var knex = require('./db/knex')()

const myPass = 'password'
const email = 'admin@grads.co.nz'
bcrypt.hash(myPass, 10, function (err, hash) {
  knex('users').insert({
    password: hash,
    email: email,
    roles: 'admin'
  }).asCallback(function (err, res) {
    console.log(err, res)
    knex.destroy()
  })
})
