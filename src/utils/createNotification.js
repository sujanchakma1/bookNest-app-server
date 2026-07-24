const prisma = require("../config/db");

async function createNotification(userId, message) {
  return prisma.notification.create({
    data: {
      userId,
      message,
    },
  });
}

module.exports = createNotification;