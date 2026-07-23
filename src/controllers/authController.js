const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const admin = require("../config/firebaseAdmin");
const cloudinary = require("../config/cloudinary");

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return res.status(409).json({ message: "Email already registered" });
  let photoURL;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "booknest/users",
    });

    photoURL = result.secure_url;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  });

  const token = generateToken({ id: user.id, role: user.role });
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password)
    return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken({ id: user.id, role: user.role });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

// @route POST /api/auth/social-login
// Verifies a Firebase ID token from the client and finds/creates the matching user.
const socialLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken is required" });

  const decoded = await admin.auth().verifyIdToken(idToken);
  const { uid, email, name, picture } = decoded;

  let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: name || "BookNest User",
        email,
        firebaseUid: uid,
        photoURL: picture,
      },
    });
  }

  const token = generateToken({ id: user.id, role: user.role });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const { id, name, email, role, photoURL } = req.user;
  res.json({ id, name, email, role, photoURL });
});

module.exports = { register, login, socialLogin, getMe };
