const test = require('node:test');
const assert = require('node:assert/strict');
const { isValidListingInput } = require('../utils/tiffinValidation');

const validListing = {
  title: 'Healthy Veg Lunch',
  description: 'Freshly prepared vegetarian meals delivered daily.',
  price: { daily: 120, weekly: 750, monthly: 2800 },
  category: 'Veg',
};

test('accepts a complete listing with positive numeric plan prices', () => {
  assert.equal(isValidListingInput(validListing), true);
});

test('rejects missing or malformed prices', () => {
  assert.equal(isValidListingInput({ ...validListing, price: undefined }), false);
  assert.equal(isValidListingInput({ ...validListing, price: { ...validListing.price, daily: 0 } }), false);
  assert.equal(isValidListingInput({ ...validListing, price: { ...validListing.price, weekly: -1 } }), false);
  assert.equal(isValidListingInput({ ...validListing, price: { ...validListing.price, monthly: '2800' } }), false);
  assert.equal(isValidListingInput({ ...validListing, price: { ...validListing.price, monthly: Infinity } }), false);
});

test('rejects invalid text lengths and unsupported categories', () => {
  assert.equal(isValidListingInput({ ...validListing, title: 'x' }), false);
  assert.equal(isValidListingInput({ ...validListing, description: 'short' }), false);
  assert.equal(isValidListingInput({ ...validListing, category: 'Other' }), false);
});

test('rejects oversized or non-string image values', () => {
  assert.equal(isValidListingInput({ ...validListing, image: 42 }), false);
  assert.equal(isValidListingInput({ ...validListing, image: 'x'.repeat(2049) }), false);
});
