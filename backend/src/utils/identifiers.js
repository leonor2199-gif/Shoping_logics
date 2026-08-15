const { randomUUID } = require('node:crypto');

function createIdentifier(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

module.exports = { createIdentifier };
