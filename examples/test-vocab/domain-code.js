/**
 * Test file with domain-specific verbs
 */

// This should work with custom vocabulary
function shipOrder(orderId) {
  // Power (modifying) - matches "ship": "power" in vocab
  database.update(orderId, { status: 'shipped' });
  notifyCustomer(orderId);
}

// This should detect mismatch
function generateReport(reportId) {
  // Name says generate (wisdom) but code deletes (power)
  database.delete(reportId);
  return { deleted: true };
}

// This should work with custom vocabulary
function activateAccount(userId) {
  // Power (modifying) - matches "activate": "power" in vocab
  database.update(userId, { active: true });
  sendWelcomeEmail(userId);
}

// This should work with custom vocabulary
function verifyPayment(paymentId) {
  // Justice (validating) - matches "verify": "justice" in vocab
  const payment = database.find(paymentId);
  if (!payment) return false;
  return payment.amount > 0 && payment.status === 'completed';
}

// This should detect mismatch
function computeTotal(cartId) {
  // Name says compute (wisdom) but code modifies (power)
  const cart = database.find(cartId);
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);
  database.save(cart);
  return cart.total;
}
