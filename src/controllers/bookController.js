const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const cloudinary = require("../config/cloudinary");

// @route GET /api/books?search=&categoryId=&page=&limit=
const getBooks = asyncHandler(async (req, res) => {
  const { search, categoryId, page = 1, limit = 10 } = req.query;
  const where = {
    AND: [
      search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { author: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      categoryId ? { categoryId } : {},
    ],
  };

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { category: true },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.book.count({ where }),
  ]);

  res.json({
    books,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

// @route GET /api/books/:id
const getBookById = asyncHandler(async (req, res) => {
  const book = await prisma.book.findUnique({
    where: { id: req.params.id },
    include: { category: true },
  });
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

// @route POST /api/books  (admin only)
const createBook = asyncHandler(async (req, res) => {
  const { title, author, description, categoryId, totalCopies } = req.body;
  let coverUrl;
  if (req.file) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "booknest/covers" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });
    coverUrl = uploadResult.secure_url;
  }

  const book = await prisma.book.create({
    data: {
      title,
      author,
      description,
      categoryId,
      coverUrl,
      totalCopies: Number(totalCopies),
      availableCopies: Number(totalCopies),
    },
  });
  res.status(201).json(book);
});

// @route PATCH /api/books/:id  (admin only)
const updateBook = asyncHandler(async (req, res) => {
  const book = await prisma.book.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(book);
});

// @route DELETE /api/books/:id  (admin only)
const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.borrowRequest.deleteMany({
    where: {
      bookId: id,
    },
  });

  await prisma.book.delete({
    where: {
      id,
    },
  });

  res.json({
    message: "Book deleted successfully",
  });
});

// @route GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
};
