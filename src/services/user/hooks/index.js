'use strict'

const hooks = require('feathers-hooks')
const auth = require('feathers-authentication').hooks

exports.before = {
  all: [],
  find: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  get: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: 'id' })
  ],
  create: [
    auth.hashPassword()
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: 'id' })
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: 'id' })
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: 'id' })
  ]
}

exports.after = {
  all: [hooks.remove('password')],
  find: [
    hooks.populate('grad', {
      service: 'grads',
      field: 'grad_id'
    }),
  ],
  get: [],
  create: [
    (hook, cb) => {
      if(hook.data.roles == 'grad'){
        const userId = hook.result.id
        const knex = hook.app.get('db')
        return knex('grads').insert({user_id: userId}).asCallback(()=> cb(null, hook))
      }else cb(null, hook)
    } 
  ],
  update: [],
  patch: [],
  remove: []
}
