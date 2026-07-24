const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(notifications);
});

const markAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.update({
    where: {
      id: req.params.id,
    },
    data: {
      read: true,
    },
  });

  res.json({
    message: "Notification marked as read",
  });
});

const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user.id,
      read: false,
    },
    data: {
      read: true,
    },
  });

  res.json({
    message: "All notifications marked as read",
  });
});

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllRead,
};