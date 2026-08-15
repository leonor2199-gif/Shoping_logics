const assert = require('node:assert/strict');
const test = require('node:test');
const Product = require('../src/models/Product');
const VipLevel = require('../src/models/VipLevel');

test('products validate price and stock as non-negative whole minor units', async () => {
  const product = new Product({
    name: 'Sample product',
    description: 'A test product',
    basePrice: 1999,
    cashbackBonus: 100,
    stockQuantity: 5,
  });
  await product.validate();

  product.basePrice = 19.99;
  await assert.rejects(product.validate());
});

test('VIP levels require a positive level number', async () => {
  const vipLevel = new VipLevel({ level: 0, name: 'Invalid' });
  await assert.rejects(vipLevel.validate());
});
