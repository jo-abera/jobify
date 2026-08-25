# Jobify

Jobify is a full-stack job discovery and application tracking platform. It aggregates recent job listings, helps users manage applications on a Kanban board, and uses AI to compare resumes with job descriptions.

## Features

- Browse and search recent job listings
- Filter jobs by type and location
- Show jobs from the latest seven days, ordered newest first
- Register and sign in with email/password or Google OAuth
- Reset passwords by email
- Save jobs and track application progress
- Upload a PDF, DOCX, or TXT resume for AI matching
- Manage profile details, preferences, and avatars
- Admin dashboard for jobs, users, statistics, and manual scraping
- Telegram job scraping with hourly scheduling

## Tech Stack

**Frontend**

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- Chart.js

**Backend**

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT authentication
- Passport Google OAuth
- Nodemailer
- Groq AI
- Telegram scraping with Cheerio
- Cloudinary image storage

## Project Structure

```text
jobify/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── scraper/
│   │   ├── ai/
│   │   └── utils/
│   └── server.js
└── frontend/
	└── src/
		├── api/
		├── components/
		├── context/
		└── pages/
```

## Requirements

- Node.js 18 or newer
- npm
- PostgreSQL database
- A Telegram bot token for scraping
- A Groq API key for resume scoring

Optional integrations:

- Google OAuth
- SMTP email provider such as Brevo
- Cloudinary for avatar uploads

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd jobify

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend

Create `backend/.env`:

```env
DATABASE_URL=your_postgresql_connection_string
PORT=5000
FRONTEND_URL=http://localhost:5174

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d

TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GROQ_API_KEY=your_groq_api_key

# Optional Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Optional SMTP email
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_smtp_username
EMAIL_PASSWORD=your_smtp_password
EMAIL_FROM=no-reply@example.com

# Optional Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Never commit `.env` files or real credentials to source control.

### 3. Initialize Prisma

The repository currently contains the Prisma schema but no migration history. For an initial development database:

```bash
cd backend
npx prisma generate
npx prisma db push
```

For production, use a reviewed Prisma migration workflow after the initial schema setup.

### 4. Start the applications

In one terminal:

```bash
cd backend
npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5174` and the API runs at `http://localhost:5000`.

## Frontend Environment

The frontend uses `http://localhost:5000` by default. To point it at another backend, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Vite environment variables are embedded during the build, so rebuild after changing them.

## Scripts

### Frontend

```bash
npm run dev       # Start Vite development server
npm run build     # Create production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

### Backend

```bash
npm run dev       # Start with Nodemon
npm start         # Start production server
```

## Job Scraper

The backend scraper reads recent posts from configured public Telegram channels and stores them in PostgreSQL. It runs automatically at the start of every hour while the backend process is running.

The public jobs endpoint filters records to the last seven days and orders them by `postedAt` descending. Telegram publication timestamps are stored when available. Posts without an external application URL use a unique Telegram message URL so they do not overwrite other posts from the same channel.

An administrator can also start a scrape manually from the admin dashboard.

## API Overview

Base URL: `http://localhost:5000`

### Public routes

```text
GET  /api/jobs
GET  /api/jobs/:id
GET  /api/jobs/stats
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
PATCH /api/auth/reset-password/:token
GET  /api/auth/google
```

### Authenticated routes

```text
GET    /api/auth/me
PATCH  /api/auth/profile
PATCH  /api/auth/preferences
POST   /api/auth/avatar
GET    /api/tracker
POST   /api/tracker
PATCH  /api/tracker/:id
DELETE /api/tracker/:id
POST   /api/resume/score
POST   /api/resume/score-file
```

### Admin routes

All admin routes require a JWT belonging to an administrator.

```text
GET    /api/admin/stats
GET    /api/admin/jobs
POST   /api/admin/jobs
PATCH  /api/admin/jobs/:id
DELETE /api/admin/jobs/:id
GET    /api/admin/users
PATCH  /api/admin/users/:id/ban
PATCH  /api/admin/users/:id/unban
PATCH  /api/admin/users/:id/promote
DELETE /api/admin/users/:id
POST   /api/admin/scraper/run
```

## Deployment

Deploy the frontend and backend as separate services.

### Backend on Render

Use a Node web service with:

```text
Root directory: backend
Build command: npm install && npx prisma generate
Start command: npm start
```

Configure these production variables in Render:

```env
DATABASE_URL=your_production_database_url
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=your_production_secret
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
GOOGLE_CALLBACK_URL=https://your-api.onrender.com/api/auth/google/callback
```

Add production SMTP and Cloudinary variables when those integrations are enabled. The backend must remain running for the hourly scraper to execute.

### Frontend on Vercel

Create a Vercel project using:

```text
Root directory: frontend
Build command: npm run build
Output directory: dist
```

Set this Vercel environment variable:

```env
VITE_API_URL=https://your-api.onrender.com
```

Set the Render `FRONTEND_URL` to the exact Vercel URL. This is required for CORS. Update Google OAuth authorized origins and callback URLs to use the production domains.

## Security Notes

- Use separate production credentials; never reuse development secrets.
- Store secrets in Render/Vercel environment settings.
- Use a verified sender domain for production email.
- Rotate any credentials that have been exposed.
- Use HTTPS for both deployed services.
- Back up the production PostgreSQL database before schema changes.

## License

No license has been specified for this project yet.
