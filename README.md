# Prepare.ai

Prepare.ai is a full-stack interview preparation app for practicing technical MCQs, tracking quiz progress, and getting AI-assisted feedback. It includes a Next.js frontend, an Express API, MongoDB persistence, JWT authentication, admin tools, and Gemini-powered quiz generation.

## Features

- User registration and login with JWT authentication
- Subject-wise and topic-wise MCQ practice
- Mixed quizzes across multiple subject/topic selections
- Gemini-powered quiz and feedback generation
- Fallback static question bank for core subjects
- Saved quiz attempts and progress analytics
- Dashboard with score trends, subject performance, strong topics, and weak topics
- Admin panel for managing users, subjects, and questions

## Tech Stack

**Client**

- Next.js 14
- React 18
- Tailwind CSS
- Axios
- Recharts

**Server**

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs password hashing
- Google Generative AI SDK

## Project Structure

```text
prepare-ai/
  client/                 # Next.js frontend
    components/           # Shared UI components
    context/              # Auth and session state
    pages/                # Application routes
    styles/               # Global Tailwind styles
    utils/                # API helpers
  server/                 # Express backend
    controllers/          # Route handlers
    data/                 # Static fallback question banks
    middleware/           # Auth and admin middleware
    models/               # Mongoose models
    routes/               # API routes
    utils/                # Gemini helpers
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB connection string
- Gemini API key

### 1. Install Dependencies

Install server dependencies:

```bash
cd server
npm install
```

Install client dependencies:

```bash
cd ../client
npm install
```

### 2. Configure Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=your_gemini_api_key
ADMIN_EMAILS=admin@example.com
```

Optional: create `client/.env.local` if your API is not running on the default URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Do not commit real `.env` values. The project already ignores `.env` and `.env.local`.

### 3. Run the Backend

```bash
cd server
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

### 4. Run the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The app runs at:

```text
http://localhost:3000
```

## Available Scripts

### Server

```bash
npm run dev      # Start Express with nodemon
npm start        # Start Express with node
```

### Client

```bash
npm run dev      # Start Next.js in development
npm run build    # Build the production app
npm start        # Start the production build
```

## API Overview

Base URL:

```text
http://localhost:5000
```

### Auth

- `POST /api/auth/register` - create a new account
- `POST /api/auth/login` - log in and receive a JWT
- `GET /api/auth/me` - get the logged-in user

### Quiz

- `POST /api/quiz/generate` - generate a subject/topic quiz
- `POST /api/quiz/generate-mixed` - generate a mixed quiz
- `POST /api/quiz/feedback` - generate AI feedback for quiz results

### Analytics

- `GET /api/analytics/ping` - health check
- `GET /api/analytics/attempts` - get saved attempts for the logged-in user
- `POST /api/analytics/attempts` - save a quiz attempt

### Admin

Admin routes require a valid JWT and an admin user.

- `GET /api/admin/summary` - dashboard summary
- `GET /api/admin/users` - list users
- `PATCH /api/admin/users/:id` - update user role or permissions
- `GET /api/admin/subjects` - list built-in and custom subjects
- `POST /api/admin/subjects` - create a custom subject
- `PATCH /api/admin/subjects/:id` - update a custom subject
- `GET /api/admin/questions` - list questions
- `POST /api/admin/questions` - create a question
- `PATCH /api/admin/questions/:id` - update a question
- `DELETE /api/admin/questions/:id` - delete a question

## Admin Access

Emails listed in `ADMIN_EMAILS` are automatically treated as admin accounts when registering or logging in. Use a comma-separated list for multiple admins:

```env
ADMIN_EMAILS=admin@example.com,owner@example.com
```

## Notes

- Static fallback questions are available for DBMS, OOPS, OS, CN, and Java.
- Custom questions and subjects are stored in MongoDB.
- If Gemini generation fails, quiz generation falls back to the local/static question pool when possible.
- Authentication tokens and user data are stored in browser local storage.
