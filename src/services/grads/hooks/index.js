'use strict'

const globalHooks = require('../../../hooks')
const hooks = require('feathers-hooks')
const auth = require('feathers-authentication').hooks

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: 'user_id' })
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: 'user_id' })
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()
  ]
}

exports.after = {
  all: [],
  find: [
    hooks.populate('user', {
      service: 'users',
      field: 'user_id'
    }),
    hooks.remove('password_hash')
  ],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}
