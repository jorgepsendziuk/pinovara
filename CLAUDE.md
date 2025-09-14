# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PINOVARA is a full-stack TypeScript application with:
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL (IP interno: 10.158.0.2:5432 em produção, localhost:5432 em desenvolvimento)

## Development Commands

### Backend (port 3001)
```bash
cd backend
npm install                 # Install dependencies
npm run dev                 # Development server
npm run build               # Compile TypeScript to dist/
npm start                   # Production server
npx prisma generate         # Generate Prisma client
npx prisma db push          # Push schema changes to database
npx prisma studio          # Open database GUI
```

### Frontend (port 5173)
```bash
cd frontend
npm install                 # Install dependencies  
npm run dev                 # Development server with Vite
npm run build               # Build for production (tsc + vite build)
npm run preview             # Preview production build
npm run lint                # Run ESLint
```

### Full Development Workflow
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev` 
3. Access application at http://localhost:5173

## Architecture

### Backend Structure (`backend/src/`)
- `server.ts` - Express server entry point with CORS, basic routes, and Prisma setup
- `config/` - Configuration files (currently empty)
- `controllers/` - Request handlers (currently empty)
- `routes/` - API route definitions (currently empty) 
- `services/` - Business logic (currently empty)
- `middleware/` - Custom middleware (currently empty)
- `models/` - Data models if needed (currently empty)
- `utils/` - Utility functions (currently empty)
- `prisma/schema.prisma` - Database schema with User model

**Current Backend Features:**
- Basic Express server with CORS enabled for frontend (port 5173)
- Prisma ORM connected to PostgreSQL
- Basic API endpoints: `GET /` and `GET /health`
- Environment configuration from `config.env` file

### Frontend Structure (`frontend/src/`)
- `App.tsx` - Main React component with routing and API connection test
- `main.tsx` - React app entry point
- `services/api.ts` - Axios HTTP client configured for backend API
- `components/` - React components (currently empty)
- `pages/` - Page components (currently empty) 
- `hooks/` - Custom React hooks (currently empty)
- `types/` - TypeScript type definitions (currently empty)
- `utils/` - Utility functions (currently empty)

**Current Frontend Features:**
- React Router setup for SPA navigation
- API integration with backend using Axios
- Connection status testing on home page
- Responsive design starter

### Database Schema
Current Prisma schema defines:
- **User model**: id (String/cuid), email (unique), password, name, timestamps

### Development Environment
- Backend package.json is currently empty - needs to be populated
- Frontend uses Vite dev server with proxy to backend (`/api` → `http://localhost:3001`)
- TypeScript configuration uses ES2020 target with strict mode
- Database connection via `DATABASE_URL` environment variable

## Key Project Decisions

1. **Monorepo Structure**: Backend and frontend are separate packages in the same repository
2. **Database**: PostgreSQL hosted externally, accessed via Prisma ORM  
3. **Authentication**: JWT + bcrypt planned (not yet implemented)
4. **API Communication**: Frontend uses Axios with proxy configuration
5. **Development Mode**: Backend runs on 3001, frontend on 5173 with proxy

## Current Development Status

The project is in initial setup phase with:
- ✅ Basic project structure established
- ✅ Backend/frontend integration working
- ✅ Database connection configured
- ❌ Authentication system not implemented yet
- ❌ Most feature directories empty
- ❌ Backend package.json is empty

Next planned development phases focus on implementing JWT authentication system starting with the backend.

## Important Notes

- Backend package.json needs to be populated with proper scripts and dependencies
- Database credentials are in `backend/config.env` (DATABASE_URL, etc.)
- Frontend proxy redirects `/api/*` calls to backend server
- All development documentation is in Portuguese (project language)
- Uses conventional commits format (feat:, fix:, docs:, etc.)