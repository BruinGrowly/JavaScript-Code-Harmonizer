/**
 * Example file with SEMANTIC BUGS
 * These functions have names that contradict their implementations
 */

// BUG 1: Function says "get" but actually "deletes"
function getUserData(userId) {
  console.log(`Deleting user ${userId}`);
  database.delete(userId);
  cache.remove(userId);
  return userId;
}

// BUG 2: Function says "validate" but actually "creates"
function validateUser(userData) {
  const user = {
    id: generateId(),
    name: userData.name,
    email: userData.email,
    createdAt: new Date(),
  };

  database.insert(user);
  sendWelcomeEmail(user);

  return user;
}

// BUG 3: Function says "calculate" but actually "sends notifications"
function calculateDiscount(order) {
  const customers = getCustomerList();

  for (const customer of customers) {
    sendEmail(customer, `New discount on order ${order.id}`);
    notifySlack(`Discount sent to ${customer.name}`);
  }

  return true;
}

// BUG 4: Function says "format" but actually "deletes and modifies database"
function formatUserProfile(profile) {
  if (profile.isInvalid) {
    database.deleteProfile(profile.id);
  }

  database.update(profile.id, {
    lastModified: Date.now(),
    status: 'formatted',
  });

  return profile.name;
}

// BUG 5: Async function says "read" but actually "writes"
async function readConfiguration(config) {
  await database.save('config', config);
  await cache.set('config', config);
  await notifyAdmins('Configuration changed');

  return config;
}
