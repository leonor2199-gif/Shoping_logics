process.env.JWT_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '1h';

const assert = require('node:assert/strict');
const test = require('node:test');
const { signToken, verifyToken } = require('../src/utils/jwt');
const { validatePassword } = require('../src/utils/password');
const User = require('../src/models/User');

test('JWTs are signed with the expected role and subject', () => {
  const token = signToken('507f1f77bcf86cd799439011', 'user');
  const payload = verifyToken(token);

  assert.equal(payload.sub, '507f1f77bcf86cd799439011');
  assert.equal(payload.role, 'user');
});

test('password validation rejects weak passwords', () => {
  assert.match(validatePassword('short'), /at least 12 characters/);
  assert.match(validatePassword('longpasswordonly'), /uppercase/);
  assert.equal(validatePassword('Str0ngPassword'), null);
});

test('the User schema rejects invalid phone numbers and hides password fields', async () => {
  const user = new User({
    phone: 'invalid-phone',
    loginPassword: 'Str0ngPassword',
    withdrawalPassword: 'OtherStr0ngPass',
  });

  await assert.rejects(user.validate());
  user.phone = '+15551234567';
  user.loginPassword = 'hashed-login-password';
  user.withdrawalPassword = 'hashed-withdrawal-password';
  await user.validate();
  assert.equal(Object.hasOwn(user.toJSON(), 'loginPassword'), false);
  assert.equal(Object.hasOwn(user.toJSON(), 'withdrawalPassword'), false);
});
