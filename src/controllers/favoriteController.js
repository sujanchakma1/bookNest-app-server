const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const createNotification = require("../utils/createNotification");

// GET My Favorites
const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId: req.user.id,
    },
    include: {
      book: true,
    },
    orderBy: {
      id: "desc",
    },
  });

  res.json(favorites);
});

// Add Favorite
const addFavorite = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const book = await prisma.book.findUnique({
    where: {
      id: bookId,
    },
  });

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  const exist = await prisma.favorite.findUnique({
    where: {
      userId_bookId: {
        userId: req.user.id,
        bookId,
      },
    },
  });

  if (exist) {
    return res.status(400).json({
      message: "Already added to favorites",
    });
  }

  const favorite = await prisma.favorite.create({
    data: {
      userId: req.user.id,
      bookId,
    },
  });

  await createNotification(
    req.user.id,
    `Added "${book.title}" to favorites ❤️`,
  );

  res.status(201).json(favorite);
});

// Remove Favorite
const removeFavorite = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const book = await prisma.book.findUnique({
    where: {
      id: bookId,
    },
  });

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  await prisma.favorite.delete({
    where: {
      userId_bookId: {
        userId: req.user.id,
        bookId,
      },
    },
  });

  await createNotification(
    req.user.id,
    `Removed "${book.title}" from favorites 💔`,
  );

  res.json({
    message: "Removed from favorites",
  });
});

// Check Favorite
const checkFavorite = asyncHandler(async (req, res) => {
  const { bookId } = req.params;

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_bookId: {
        userId: req.user.id,
        bookId,
      },
    },
  });

  res.json({
    favorite: !!favorite,
  });
});

module.exports = {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
};
