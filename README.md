# BookNest — Backend

Express + Prisma + PostgreSQL REST API for the BookNest library management system.

## Setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, Firebase, Cloudinary keys
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Server runs on `http://localhost:5000` by default; health check at `GET /api/health`.

## Auth flow

1. Email/password: `POST /api/auth/register` and `POST /api/auth/login` return `{ user, token }`.
2. Google login: frontend gets a Firebase ID token, sends it to `POST /api/auth/social-login`; the server verifies it with Firebase Admin (needs `FIREBASE_*` env vars) and returns a BookNest JWT.
3. All protected routes expect `Authorization: Bearer <token>`.

## Folder structure

```
src/
├── app.js              # express app, middleware, route mounting
├── server.js           # entry point
├── config/             # db (Prisma), cloudinary, firebase admin
├── middleware/         # auth (JWT), role guard, error handler, multer upload
├── controllers/        # auth, book, category, borrow, user, dashboard
├── routes/             # one file per resource
├── validations/        # express-validator rule sets
└── utils/               # asyncHandler, generateToken
prisma/
└── schema.prisma       # User, Book, Category, BorrowRequest, Favorite, Notification
```

## Roles

- `STUDENT`: browse/search books, request borrow, return book, view own history/favorites/profile.
- `ADMIN`: manage books/categories/users, approve/reject borrow requests, view dashboard stats.

## Notes

- Borrow due date defaults to 14 days from approval (`DUE_DAYS` in `borrowController.js`) — adjust as needed.
- Book cover images are uploaded to Cloudinary via `multer` memory storage in `createBook`.
- `validations/*` rule sets are ready to drop into routes with `express-validator`'s `validationResult` if you want request-level validation errors (not wired into routes yet, to keep the scaffold minimal).
