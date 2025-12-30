# Aegis AI Project Structure

This document explains the refactored project structure with separate frontend and backend.

## Overview

The project has been refactored into two main parts:

1. **Frontend** - Next.js web application (in project root)
2. **Backend** - Express API service (in `/backend` directory)

## Directory Structure

```
aegis-ai/
├── backend/                 # Backend API service (NEW)
│   ├── src/
│   │   ├── app.js          # Express app setup
│   │   ├── server.js       # Server entry point
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic (AI, scam detection)
│   │   └── models/         # Data models
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/               # Frontend documentation (NEW)
│   └── README.md          # Frontend documentation
│
├── app/                    # Next.js app directory (frontend)
│   ├── api/               # Next.js API routes (for web UI)
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   └── user/              # User dashboard
│
├── components/             # React components (frontend)
├── lib/                    # Utility libraries (frontend)
├── hooks/                  # React hooks (frontend)
├── public/                 # Static assets (frontend)
│
├── mobile/                 # Expo mobile app (separate)
│
├── package.json            # Frontend dependencies
├── next.config.mjs         # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Backend API Service

**Location:** `/backend`

**Purpose:** Pure REST API service for mobile app consumption

**Key Features:**
- Express.js server
- AI scam detection (Groq LLM)
- Call session management
- ElevenLabs voice integration
- No frontend dependencies

**Run Backend:**
```bash
cd backend
npm install
npm run dev  # Development mode
```

**API Endpoints:**
- `POST /api/ai/start-call` - Start call session
- `POST /api/ai/analyze` - Analyze transcript
- `GET /api/call/result/:callId` - Get call result
- `GET /api/ai/elevenlabs-signed-url` - Get ElevenLabs URL

See `/backend/README.md` for detailed API documentation.

## Frontend Web Application

**Location:** Project root (Next.js app)

**Purpose:** Web UI for users to monitor calls and manage settings

**Key Features:**
- Next.js 16 with App Router
- React components (shadcn/ui)
- User authentication
- Call monitoring dashboard
- Real-time scam detection UI

**Run Frontend:**
```bash
npm install
npm run dev  # Development mode
```

**Note:** Frontend API routes in `app/api/` are for web UI only. Mobile app should use the backend API.

## Mobile App

**Location:** `/mobile/aegis-ai`

**Purpose:** Expo React Native mobile application

**Integration:** Should consume the backend API service

## Environment Variables

### Backend (`.env` in `/backend`)
```env
PORT=3001
GROQ_API_KEY=your_key
ELEVENLABS_AGENT_ID=your_id
ELEVENLABS_API_KEY=your_key
```

### Frontend (`.env.local` in project root)
```env
# Frontend environment variables (if needed)
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development Workflow

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend (separate terminal):**
   ```bash
   npm install
   npm run dev
   ```

3. **Test Backend API:**
   ```bash
   curl http://localhost:3001/health
   ```

## Migration Notes

- ✅ Backend API service created and working
- ✅ AI logic extracted to backend services
- ✅ REST endpoints implemented
- ✅ Frontend preserved (still works)
- ⚠️ Frontend still uses Next.js API routes (can be migrated later)
- ⚠️ Call sessions are in-memory (add database for production)

## Next Steps

1. **For Mobile App:**
   - Point mobile app to backend API (`http://localhost:3001`)
   - Use backend endpoints instead of Next.js API routes

2. **For Production:**
   - Add database (MongoDB/PostgreSQL) for call sessions
   - Add authentication middleware to backend
   - Deploy backend separately from frontend
   - Add rate limiting and security headers

3. **Optional Frontend Migration:**
   - Migrate frontend to use backend API instead of Next.js routes
   - Remove `app/api/` routes (or keep for backward compatibility)

