const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function signToken(subject, role) {
  return jwt.sign({ role }, env.jwtSecret, {
    subject: subject.toString(),
    expiresIn: env.jwtExpiresIn,
    issuer: 'product-ordering-api',
    audience: 'product-ordering-client',
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret, {
    issuer: 'product-ordering-api',
    audience: 'product-ordering-client',
  });
}

module.exports = { signToken, verifyToken };
