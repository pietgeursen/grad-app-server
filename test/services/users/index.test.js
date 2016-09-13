'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('users service', function() {
  it('registered the users service', () => {
    assert.ok(app.service('users'));
  });
});
