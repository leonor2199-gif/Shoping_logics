const assert = require('node:assert/strict');
const test = require('node:test');
const { validateAmount } = require('../src/services/financeService');

test('financial amounts must be positive whole minor-currency amounts', () => {
  assert.doesNotThrow(() => validateAmount(1));
  assert.throws(() => validateAmount(0));
  assert.throws(() => validateAmount(10.5));
  assert.throws(() => validateAmount(-1));
});
