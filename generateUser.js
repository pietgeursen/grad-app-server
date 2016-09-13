var bcrypt = require('bcrypt')

var knex = require('./db/knex')()

module.exports = function generateUser (user, cb) {
  bcrypt.hash(user.password, 10, function (err, hash) {
    user.password = hash
    knex('users').insert(user).asCallback(function (err, res) {
      knex.destroy()
      cb(err, res)
    })
  })
}
