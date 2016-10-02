var bcrypt = require('bcrypt')

module.exports = function generateUser (user, opts, cb) {
  const _opts = opts || {}
  const knex = _opts.knex || require('./db/knex')()

  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return (cb(err))
    user.password = hash
    knex('users').insert(user, 'id')  
      .then((newRecord) => {
        if(user.roles == 'grad'){
          return knex('grads').insert({user_id: newRecord[0]}, 'user_id')  
        }else return Promise.resolve(newRecord)
      })
      .then((arr) => (
        cb(null, {ids: arr}) 
      ))
      .catch(cb)
  })
}
