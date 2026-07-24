const express = require("express");
const router = express.Router();

const {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
} = require("../controllers/favoriteController");

const protect = require('../middleware/authMiddleware')


router.get("/", protect, getMyFavorites);
router.get("/:bookId", protect, checkFavorite);
router.post("/:bookId", protect, addFavorite);
router.delete("/:bookId", protect, removeFavorite);

module.exports = router;