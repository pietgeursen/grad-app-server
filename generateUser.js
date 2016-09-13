var bcrypt = require('bcrypt')

module.exports = function generateUser (user, opts, cb) {
  const _opts = opts || {}
  const knex = _opts.knex || require('./db/knex')()

  bcrypt.hash(user.password, 10, function (err, hash) {
    user.password = hash
    knex('users').insert(user).asCallback(function (err, res) {
      cb(err, res)
    })
  })
}
