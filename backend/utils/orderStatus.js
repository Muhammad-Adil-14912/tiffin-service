const allowedTransitions = Object.freeze({
  Pending: ['Cooking', 'Cancelled'],
  Cooking: ['Dispatched', 'Cancelled'],
  Dispatched: ['Delivered'],
  Delivered: [],
  Cancelled: [],
});

function canTransitionOrderStatus(currentStatus, nextStatus) {
  return Array.isArray(allowedTransitions[currentStatus]) &&
    allowedTransitions[currentStatus].includes(nextStatus);
}

module.exports = { canTransitionOrderStatus };
