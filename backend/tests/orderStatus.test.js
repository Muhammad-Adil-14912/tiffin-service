const test = require('node:test');
const assert = require('node:assert/strict');
const { canTransitionOrderStatus } = require('../utils/orderStatus');

test('allows the normal fulfillment sequence', () => {
  assert.equal(canTransitionOrderStatus('Pending', 'Cooking'), true);
  assert.equal(canTransitionOrderStatus('Cooking', 'Dispatched'), true);
  assert.equal(canTransitionOrderStatus('Dispatched', 'Delivered'), true);
});

test('allows cancellation before dispatch only', () => {
  assert.equal(canTransitionOrderStatus('Pending', 'Cancelled'), true);
  assert.equal(canTransitionOrderStatus('Cooking', 'Cancelled'), true);
  assert.equal(canTransitionOrderStatus('Dispatched', 'Cancelled'), false);
});

test('rejects skipped, repeated, and unknown transitions', () => {
  assert.equal(canTransitionOrderStatus('Pending', 'Delivered'), false);
  assert.equal(canTransitionOrderStatus('Cooking', 'Delivered'), false);
  assert.equal(canTransitionOrderStatus('Delivered', 'Cooking'), false);
  assert.equal(canTransitionOrderStatus('Pending', 'Pending'), false);
  assert.equal(canTransitionOrderStatus('Unknown', 'Cooking'), false);
});

test('terminal states cannot be reopened or changed', () => {
  for (const nextStatus of ['Pending', 'Cooking', 'Dispatched', 'Delivered', 'Cancelled']) {
    assert.equal(canTransitionOrderStatus('Delivered', nextStatus), false);
    assert.equal(canTransitionOrderStatus('Cancelled', nextStatus), false);
  }
});
