# Proposal: Initial MERN Setup

## Intent

Set up the complete MERN stack foundation for VetClinic Pro from a greenfield state. The project has comprehensive specs in AGENTS.md but zero code. This establishes the development environment, project structure, and base configurations for both frontend and backend.

## Scope

### In Scope
- Create root project structure with npm workspaces (client/server)
- Initialize Express + TypeScript backend with MongoDB connection
- Initialize React + Vite + TypeScript frontend
- Configure Tailwind CSS (v4 patterns)
- Initialize shadcn/ui components
- Set up environment variables and configuration files
- Create database connection utility with Mongoose

### Out of Scope
- API endpoints and controllers
- React components and pages
- Authentication implementation
- Business logic and services

## Capabilities

### New Capabilities
- `mern-foundation`: Complete MERN stack development environment ready for feature implementation

## Approach

**Manual Setup (Recommended)**: Create folders manually and initialize with npm/Vite. This provides full control over structure and avoids unnecessary boilerplate from generators.

### Steps:
1. Create root `package.json` with npm workspaces
2. Initialize server: Express + TypeScript + Mongoose + Zod + JWT
3. Initialize client: Vite + React + TypeScript + React Router
4. Configure Tailwind CSS 4 with PostCSS
5. Initialize shadcn/ui (Button, Card, Input, Form, Table, Dialog, etc.)
6. Set up .env files for both client and server
7. Create database connection utility

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/` | New | Express backend with TypeScript |
| `client/` | New | React frontend with Vite |
| `package.json` | New | Root workspace configuration |
| `.env` | New | Environment variables |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| MongoDB not available | Medium | Use Atlas URI or local instance |
| shadcn/ui CLI issues | Low | Fallback to manual component creation |
| Node v25 compatibility | Low | Use LTS versions of packages |

## Rollback Plan

Delete created folders and files. Remove from git staging. No migration needed since no prior state exists.

## Dependencies

- Node.js v18+ (available: v25.8.1)
- npm v10+ (available: 10.8.2)
- MongoDB (local or Atlas)

## Success Criteria

- [ ] `npm install` succeeds in root, client, and server
- [ ] `npm run dev` starts backend on port 5000
- [ ] `npm run dev` starts frontend on port 5173
- [ ] MongoDB connection established
- [ ] Tailwind CSS classes work in client
- [ ] shadcn/ui components render correctly