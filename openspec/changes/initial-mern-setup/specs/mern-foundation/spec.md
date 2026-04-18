# MERN Foundation Specification

## Purpose

Establish the complete MERN stack development environment for VetClinic Pro, enabling feature development on both frontend and backend.

## Requirements

### Requirement: Root Project Structure

The project MUST have a root `package.json` configured as an npm workspace that includes both `client/` and `server/` directories.

#### Scenario: Workspace Configuration

- GIVEN npm workspaces enabled in root package.json
- WHEN `npm install` is run in root
- THEN dependencies are installed in both client/ and server/ directories
- AND a `node_modules` symlink is created in each workspace

#### Scenario: Directory Structure

- GIVEN fresh project clone
- WHEN user runs `ls -la`
- THEN they see `client/`, `server/`, `package.json`, and `.env` files

### Requirement: Backend Server Setup

The backend MUST be an Express.js server written in TypeScript that connects to MongoDB via Mongoose.

#### Scenario: Server Starts

- GIVEN MongoDB is running locally on port 27017
- WHEN `npm run dev` is executed in server directory
- THEN server starts on port 5000
- AND MongoDB connection is established successfully
- AND console shows "Server running on port 5000"

#### Scenario: Database Connection

- GIVEN valid MONGODB_URI in .env
- WHEN server starts
- THEN mongoose.connect() succeeds
- AND connection is stored for reuse

### Requirement: Frontend Client Setup

The frontend MUST be a React application created with Vite, using TypeScript and React Router DOM.

#### Scenario: Frontend Starts

- GIVEN dependencies are installed
- WHEN `npm run dev` is executed in client directory
- THEN Vite dev server starts on port 5173 (or next available)
- AND browser shows React app at localhost:5173

#### Scenario: React Router

- GIVEN React app is running
- WHEN user navigates to any route
- THEN appropriate component renders based on route definition

### Requirement: Tailwind CSS Configuration

Tailwind CSS 4 MUST be properly configured in the client with PostCSS.

#### Scenario: Tailwind Works

- GIVEN Tailwind is configured
- WHEN developer adds `className="text-red-500 p-4"`
- THEN styles are applied correctly in browser

### Requirement: shadcn/ui Components

The following shadcn/ui components MUST be initialized and functional:
- Button, Card, Input, Label
- Form (react-hook-form + zod)
- Table, Dialog, Select, DropdownMenu

#### Scenario: Components Available

- GIVEN shadcn/ui is initialized
- WHEN developer imports Button from @/components/ui/button
- THEN Button component renders correctly

### Requirement: Environment Variables

Both client and server MUST have appropriate `.env` files with required variables.

#### Scenario: Server Environment

- GIVEN .env exists in server directory
- WHEN server starts
- THEN it reads PORT, MONGODB_URI, JWT_SECRET from environment

#### Scenario: Client Environment

- GIVEN .env exists in client directory
- WHEN API calls are made
- THEN VITE_API_URL is used as base URL

## Technical Specifications

### Server Stack
- express ^4.x
- mongoose ^8.x
- dotenv ^16.x
- cors ^2.x
- bcryptjs ^2.x
- jsonwebtoken ^9.x
- zod ^3.x
- TypeScript ^5.x
- ts-node-dev for dev

### Client Stack
- react ^18.x
- vite ^5.x
- react-router-dom ^6.x
- axios ^1.x
- lucide-react ^0.x
- date-fns ^3.x
- zod ^3.x
- @hookform/resolvers ^3.x
- react-hook-form ^7.x
- tailwindcss ^4.x
- @shadcn/ui components

### Database
- MongoDB with Mongoose ODM
- Connection pooling enabled
- Graceful disconnect on shutdown