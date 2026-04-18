# Tasks: Initial MERN Setup

## Phase 1: Project Structure & Configuration

- [x] 1.1 Create root `package.json` with npm workspaces (client, server)
- [x] 1.2 Create `server/package.json` with Express + TypeScript dependencies
- [x] 1.3 Create `client/package.json` with React + Vite + TypeScript dependencies
- [x] 1.4 Create root `.env` with environment variable templates
- [x] 1.5 Create `server/.env` with PORT, MONGODB_URI, JWT_SECRET, ADMIN_SECRET_KEY
- [x] 1.6 Create `client/.env` with VITE_API_URL

## Phase 2: Backend Implementation

- [x] 2.1 Create `server/tsconfig.json` with proper TypeScript config
- [x] 2.2 Create `server/src/config/database.ts` with Mongoose connection
- [x] 2.3 Create `server/src/index.ts` with Express app, CORS, JSON parsing
- [x] 2.4 Add start/dev scripts to `server/package.json`

## Phase 3: Frontend Implementation

- [x] 3.1 Create `client/vite.config.ts` with Vite configuration
- [x] 3.2 Create `client/tsconfig.json` with proper paths (include @ alias)
- [x] 3.3 Create `client/tailwind.config.js` with Tailwind CSS 4 setup
- [x] 3.4 Create `client/postcss.config.js` with PostCSS configuration
- [x] 3.5 Create `client/src/index.css` with Tailwind directives
- [x] 3.6 Initialize shadcn/ui with core components (Button, Card, Input, Label, Table, Dialog)
- [x] 3.7 Create `client/src/App.tsx` with React Router setup
- [x] 3.8 Create `client/src/main.tsx` entry point
- [x] 3.9 Create `client/src/lib/utils.ts` with cn() utility

## Phase 4: Dependencies Installation & Verification

- [x] 4.1 Run `npm install` in root to install workspaces
- [x] 4.2 Run `npm run dev` in server to verify backend starts
- [x] 4.3 Run `npm run dev` in client to verify frontend starts
- [x] 4.4 Verify MongoDB connection (server logs "connected to MongoDB")
- [x] 4.5 Test Tailwind CSS is working (add test class in App.tsx)
- [x] 4.6 Test shadcn/ui components render correctly

## Phase 5: Cleanup

- [x] 5.1 Remove any boilerplate code from Vite template
- [x] 5.2 Add basic README with setup instructions
- [x] 5.3 Verify all scripts work from root (workspace commands)