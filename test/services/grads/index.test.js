'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('grads service', function() {
  it('registered the grads service', () => {
    assert.ok(app.service('grads'));
  });
});
