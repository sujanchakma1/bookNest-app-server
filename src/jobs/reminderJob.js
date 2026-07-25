const cron = require("node-cron");
const prisma = require("../config/db");
const createNotification = require("../utils/createNotification");

// Every minute (development)
// Production: "0 9 * * *"
cron.schedule("* * * * *", async () => {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const borrows = await prisma.borrowRequest.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      book: true,
    },
  });

  for (const borrow of borrows) {
    const dueDate = new Date(borrow.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diff = Math.floor(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    // 2 days left
    if (diff === 2) {
      await createNotification(
        borrow.userId,
        `📚 Reminder: "${borrow.book.title}" must be returned in 2 days.`,
      );
    }

    // Tomorrow
    else if (diff === 1) {
      await createNotification(
        borrow.userId,
        `⏰ Reminder: Return "${borrow.book.title}" tomorrow.`,
      );
    }

    // Today (last day)
    else if (diff === 0) {
      await createNotification(
        borrow.userId,
        `📅 Today is the last day to return "${borrow.book.title}".`,
      );
    }

    // Overdue (starts the NEXT day)
    else if (diff < 0) {
      const overdueDays = Math.abs(diff);

      const fine = overdueDays * 10;

      await prisma.borrowRequest.update({
        where: {
          id: borrow.id,
        },
        data: {
          fine,
        },
      });

      await createNotification(
        borrow.userId,
        `❌ "${borrow.book.title}" is overdue by ${overdueDays} day${overdueDays > 1 ? "s" : ""}. Fine: ৳${fine}.`,
      );
    }
  }
});
