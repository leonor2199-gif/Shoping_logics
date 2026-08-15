const assert = require('node:assert/strict');
const test = require('node:test');
const BankConfig = require('../src/models/BankConfig');

test('bank configuration requires recipient account details', async () => {
  const bank = new BankConfig({ bankName: 'Example Bank' });
  await assert.rejects(bank.validate());
  bank.accountNumber = '1234567890';
  bank.holderName = 'Example Holder';
  await bank.validate();
  assert.equal(bank.isActive, true);
});
