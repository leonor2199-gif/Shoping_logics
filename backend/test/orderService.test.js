const assert = require('node:assert/strict');
const test = require('node:test');
const { calculateOrderTotal } = require('../src/services/orderService');

test('order amount charges base price plus bonus for every item', () => {
  assert.equal(calculateOrderTotal(1999, 100, 1), 2099);
  assert.equal(calculateOrderTotal(1999, 100, 3), 6297);
});
