'use strict'

const hooks = require('feathers-hooks-common')
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
    auth.hashPassword()//think this needs to be locked down more?
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
    (hook, cb) => {
      const userId = hook.result[0].id
      const grads = hook.app.service('grads')
      grads.find({query:{user_id: userId}}, (err, grads) => {
          hook.result.grad = Object.assign({}, grads[0]) 
          cb(err, hook)
      })
    }
  ],
  get: [
    (hook, cb) => {
      const userId = hook.result.id
      const grads = hook.app.service('grads')
      grads.find({query:{user_id: userId}}, (err, grads) => {
          hook.result.grad = grads[0] 
          cb(err, hook)
      })
    }
  ],
  create: [
    (hook, cb) => {
      if(hook.data.roles == 'grad'){
        const userId = hook.result.id
        const grads = hook.app.service('grads')
        grads.create({user_id: userId}, (err, res)=> {
          cb(err, hook)
        })
      }else cb(null, hook)
    } 
  ],
  update: [],
  patch: [],
  remove: []
}
