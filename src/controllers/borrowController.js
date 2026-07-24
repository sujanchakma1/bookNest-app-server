const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const createNotification = require("../utils/createNotification");

const DUE_DAYS = 14;

// @route POST /api/borrow  (student)
const requestBorrow = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (book.availableCopies < 1)
    return res.status(400).json({ message: "No copies available" });

  const request = await prisma.borrowRequest.create({
    data: { userId: req.user.id, bookId, status: "PENDING" },
  });
  await createNotification(
    req.user.id,
    `You requested to borrow "${book.title}".`,
  );

  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (admin) {
    await createNotification(
      admin.id,
      `${req.user.name} requested to borrow "${book.title}".`,
    );
  }
  res.status(201).json(request);
});

// @route GET /api/borrow/my  (student)
const getMyBorrows = asyncHandler(async (req, res) => {
  const requests = await prisma.borrowRequest.findMany({
    where: { userId: req.user.id },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(requests);
});

// @route GET /api/borrow  (admin) — pending requests
const getAllBorrowRequests = asyncHandler(async (req, res) => {
  const requests = await prisma.borrowRequest.findMany({
    where: {
      status: "PENDING",
    },

    include: {
      book: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(requests);
});

// @route PATCH /api/borrow/:id/approve  (admin)
const approveBorrowRequest = asyncHandler(async (req, res) => {
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + DUE_DAYS);

  const request = await prisma.borrowRequest.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      book: true,
    },
  });
  if (!request) return res.status(404).json({ message: "Request not found" });
  if (request.status !== "PENDING")
    return res.status(400).json({ message: "Request already processed" });

  const [updated] = await prisma.$transaction([
    prisma.borrowRequest.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", borrowDate, dueDate },
    }),
    prisma.book.update({
      where: { id: request.bookId },
      data: { availableCopies: { decrement: 1 } },
    }),
  ]);
  await createNotification(
    request.userId,
    `Your borrow request for "${request.book.title}" has been approved.`,
  );
  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (admin) {
    await createNotification(
      admin.id,
      `${req.user.name} requested to borrow "${request.book.title} you has been approved".`,
    );
  }

  res.json(updated);
});

// @route PATCH /api/borrow/:id/reject  (admin)
const rejectBorrowRequest = asyncHandler(async (req, res) => {
  const request = await prisma.borrowRequest.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      book: true,
    },
  });

  if (!request) {
    return res.status(404).json({
      message: "Request not found",
    });
  }

  const updated = await prisma.borrowRequest.update({
    where: {
      id: req.params.id,
    },
    data: {
      status: "REJECTED",
    },
  });

  await createNotification(
    request.userId,
    `Your borrow request for "${request.book.title}" has been rejected.`,
  );
  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (admin) {
    await createNotification(
      admin.id,
      `${req.user.name} requested to borrow "${request.book.title} you has been rejected".`,
    );
  }

  res.json(updated);
});

// @route PATCH /api/borrow/:id/return  (student or admin)
const returnBook = asyncHandler(async (req, res) => {
  const request = await prisma.borrowRequest.findUnique({
    where: {
      id: req.params.id,
    },
    include: {
      book: true,
    },
  });

  if (!request) {
    return res.status(404).json({
      message: "Request not found",
    });
  }

  const [updated] = await prisma.$transaction([
    prisma.borrowRequest.update({
      where: { id: req.params.id },
      data: { status: "RETURNED", returnDate: new Date() },
    }),
    prisma.book.update({
      where: { id: request.bookId },
      data: { availableCopies: { increment: 1 } },
    }),
  ]);
  await createNotification(
    request.userId,
    `You returned "${request.book.title}". Thank you! 📚`,
  );
  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (admin) {
    await createNotification(
      admin.id,
      `${req.user.name} returned "${request.book.title}".`,
    );
  }

  res.json(updated);
});

module.exports = {
  requestBorrow,
  getMyBorrows,
  getAllBorrowRequests,
  approveBorrowRequest,
  rejectBorrowRequest,
  returnBook,
};
