const assert = require('node:assert/strict');
const test = require('node:test');

const enabled = process.env.RUN_INTEGRATION_TESTS === 'true';

test('MongoDB connection supports a rollback transaction', { skip: !enabled }, async () => {
  const { connectDatabase, disconnectDatabase } = require('../../src/config/db');
  const mongoose = require('mongoose');
  await connectDatabase();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const result = await mongoose.connection.db.collection('_integration_checks').insertOne({ checkedAt: new Date() }, { session });
      assert.ok(result.acknowledged);
      throw new Error('__intentional_rollback__');
    });
  } catch (error) {
    assert.equal(error.message, '__intentional_rollback__');
  } finally {
    await session.endSession();
    await disconnectDatabase();
  }
});
