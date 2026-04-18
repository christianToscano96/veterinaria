# VetClinic Pro

Veterinary Clinic Management System - MERN Stack

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm 10+

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   
   Edit `server/.env` with your settings:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret for JWT tokens
   - `ADMIN_SECRET_KEY` - Secret for admin registration

3. **Start MongoDB:**
   - Local: `mongod` or via Homebrew/Docker
   - Atlas: Use your connection string in MONGODB_URI

4. **Run the application:**
   ```bash
   # Development (both servers)
   npm run dev

   # Or run individually:
   npm run dev:server  # Backend on port 5001
   npm run dev:client  # Frontend on port 5173
   ```

## Access

- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api

## Project Structure

```
veterinaria/
├── client/          # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── lib/          # Utilities
│       └── App.tsx       # Main app
├── server/          # Express backend
│   └── src/
│       └── config/       # Database config
└── package.json    # Root workspace
```

## Tech Stack

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Backend: Express + TypeScript + Mongoose
- Database: MongoDB
- Auth: JWT

## Next Steps

- Create admin user for authentication
- Implement Animals CRUD
- Implement Appointments system
- Add Medical Records
- Add Vaccination tracking