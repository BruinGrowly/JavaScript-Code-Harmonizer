/**
 * Example file with HARMONIOUS code
 * These functions have names that match their implementations
 */

// GOOD: Says "get" and actually retrieves data
function getUserData(userId) {
  const user = database.findById(userId);
  const profile = cache.get(`user:${userId}`);

  return {
    ...user,
    profile,
  };
}

// GOOD: Says "validate" and actually validates
function validateUser(userData) {
  if (!userData.email || !userData.email.includes('@')) {
    return false;
  }

  if (!userData.name || userData.name.length < 2) {
    return false;
  }

  if (!userData.age || userData.age < 18) {
    return false;
  }

  return true;
}

// GOOD: Says "calculate" and actually computes
function calculateDiscount(order) {
  const basePrice = order.items.reduce((sum, item) => sum + item.price, 0);
  const membershipDiscount = order.user.isPremium ? 0.2 : 0;
  const seasonalDiscount = isHolidaySeason() ? 0.1 : 0;

  const totalDiscount = membershipDiscount + seasonalDiscount;
  const finalPrice = basePrice * (1 - totalDiscount);

  return finalPrice;
}

// GOOD: Says "format" and actually formats
function formatUserProfile(profile) {
  const formatted = {
    name: profile.name.trim().toUpperCase(),
    email: profile.email.toLowerCase(),
    phone: profile.phone.replace(/\D/g, ''),
    joinDate: new Date(profile.joinDate).toISOString(),
  };

  return formatted;
}

// GOOD: Says "create" and actually creates
async function createUser(userData) {
  const user = {
    id: generateId(),
    name: userData.name,
    email: userData.email,
    createdAt: new Date(),
  };

  await database.insert(user);
  await cache.set(`user:${user.id}`, user);

  return user;
}

// GOOD: Says "delete" and actually deletes
async function deleteUser(userId) {
  await database.delete(userId);
  await cache.remove(`user:${userId}`);
  await sessions.removeAllForUser(userId);

  return true;
}

// GOOD: Says "send" and actually sends
async function sendNotification(userId, message) {
  const user = await getUserData(userId);

  await emailService.send(user.email, message);
  await pushService.notify(user.deviceId, message);

  console.log(`Notification sent to ${user.name}`);

  return true;
}
