# Veterinary Clinic Management - AGENTS.md

## Project Overview

**Project Name**: VetClinic Pro  
**Type**: Full-stack Web Application (MERN Stack)  
**Core Functionality**: Complete veterinary clinic management system with appointment scheduling, medical history tracking, vaccination reminders, and social media integration.  
**Target Users**: Veterinarians (Admin) and Secretaries

---

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + React Router DOM
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + useReducer
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Validation**: Zod

---

## Project Structure

```
veterinaria/
├── client/                 # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API service functions
│   │   ├── utils/          # Helper functions
│   │   ├── types/          # TypeScript interfaces/schemas
│   │   └── lib/            # Utilities (api, utils)
│   └── ...
├── server/                 # Express backend (TypeScript)
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth, validation middleware
│   ├── services/           # Business logic
│   ├── schemas/            # Zod validation schemas
│   └── types/              # TypeScript definitions
└── package.json
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['admin', 'secretary']),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Animals Collection (Patients)
```javascript
{
  _id: ObjectId,
  name: String (required),
  species: String (required), // 'dog', 'cat', 'bird', 'rabbit', 'other'
  breed: String,
  color: String,
  gender: String (enum: ['male', 'female', 'unknown']),
  birthDate: Date,
  weight: Number, // in kg
  ownerName: String (required),
  ownerPhone: String (required),
  ownerEmail: String,
  ownerAddress: String,
  notes: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointments Collection
```javascript
{
  _id: ObjectId,
  animal: ObjectId (ref: 'animals'),
  veterinarian: ObjectId (ref: 'users'),
  date: Date (required),
  time: String (required), // '09:00', '09:30', etc.
  duration: Number (default: 30), // minutes
  type: String (enum: ['consultation', 'vaccination', 'surgery', 'checkup', 'emergency', 'other']),
  reason: String,
  status: String (enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']),
  notes: String,
  cancellationReason: String,
  createdBy: ObjectId (ref: 'users'),
  createdAt: Date,
  updatedAt: Date
}
```

### MedicalRecords Collection
```javascript
{
  _id: ObjectId,
  animal: ObjectId (ref: 'animals'),
  appointment: ObjectId (ref: 'appointments'),
  date: Date (required),
  type: String (enum: ['consultation', 'surgery', 'treatment', 'diagnosis', 'checkup', 'other']),
  diagnosis: String,
  treatment: String,
  medication: String, // JSON string or array
  dosage: String,
  notes: String,
  attachments: [String], // URLs to images/documents
  veterinarian: ObjectId (ref: 'users'),
  createdAt: Date,
  updatedAt: Date
}
```

### Vaccinations Collection
```javascript
{
  _id: ObjectId,
  animal: ObjectId (ref: 'animals'),
  name: String (required), // 'Rabies', 'Pentavalente', 'Antirrabica', etc.
  dateAdministered: Date (required),
  nextDueDate: Date,
  batchNumber: String,
  laboratory: String,
  veterinarian: ObjectId (ref: 'users'),
  notes: String,
  reminderSent: Boolean (default: false),
  reminderDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### SocialPosts Collection
```javascript
{
  _id: ObjectId,
  content: String (required),
  platforms: [String], // ['facebook', 'instagram']
  status: String (enum: ['draft', 'scheduled', 'published', 'failed']),
  scheduledDate: Date,
  publishedDate: Date,
  mediaUrls: [String],
  publishError: String,
  createdBy: ObjectId (ref: 'users'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login *(returns JWT)*
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout (client-side token removal)

### Animals
- `GET /api/animals` - List animals *(with filters: search, species, isActive)*
- `GET /api/animals/:id` - Get single animal with full history
- `POST /api/animals` - Create animal
- `PUT /api/animals/:id` - Update animal
- `DELETE /api/animals/:id` - Soft delete (isActive: false)

### Appointments
- `GET /api/appointments` - List appointments *(filters: date, veterinarian, status, animal)*
- `GET /api/appointments/today` - Get today's appointments
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create appointment *(with conflict detection)*
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `POST /api/appointments/:id/complete` - Mark as completed
- `POST /api/appointments/:id/confirm` - Confirm appointment

### Medical Records
- `GET /api/medical-records/animal/:animalId` - Get records for animal *(with pagination)*
- `GET /api/medical-records/:id` - Get single record
- `POST /api/medical-records` - Create medical record
- `PUT /api/medical-records/:id` - Update record
- `DELETE /api/medical-records/:id` - Delete record

### Vaccinations
- `GET /api/vaccinations/animal/:animalId` - Get vaccinations for animal
- `GET /api/vaccinations/upcoming` - Get upcoming reminders *(configurable days)*
- `GET /api/vaccinations/overdue` - Get overdue vaccinations
- `POST /api/vaccinations` - Create vaccination record
- `PUT /api/vaccinations/:id` - Update vaccination
- `DELETE /api/vaccinations/:id` - Delete vaccination

### Social Posts
- `GET /api/social-posts` - List posts *(filters: status, platform, date)*
- `GET /api/social-posts/:id` - Get single post
- `POST /api/social-posts` - Create post (draft)
- `PUT /api/social-posts/:id` - Update post
- `DELETE /api/social-posts/:id` - Delete post
- `POST /api/social-posts/:id/schedule` - Schedule post for later
- `POST /api/social-posts/:id/publish` - Publish to social media *(v2 - stub for now)*

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/upcoming` - Get upcoming items

---

## User Roles & Permissions

### Admin (Veterinario)
- Full access to all features
- Can create/register other users
- Can view/manage all appointments
- Can view/manage medical records (write)
- Can manage vaccinations and set reminders
- Can publish social media posts
- Can access user management
- Can view reports and statistics

### Secretary
- Can manage animals (CRUD)
- Can manage appointments (CRUD + confirm)
- Can view medical records (read-only for history)
- Can create medical records (no: for now, only vet)
- Can view vaccination records
- Can create social media posts (draft only)
- Cannot delete users or access settings

---

## Pages & Routes

### Public Routes
- `/login` - Login page

### Protected Routes (Auth Required)
- `/` - Redirect to dashboard based on role
- `/dashboard` - Main dashboard

### Admin Routes
- `/animals` - Animal list (searchable, filterable)
- `/animals/new` - Add new animal
- `/animals/:id` - Animal detail + medical history
- `/animals/:id/edit` - Edit animal
- `/appointments` - Appointment calendar/list
- `/appointments/new` - Create appointment
- `/appointments/:id` - Appointment detail
- `/vaccinations` - Vaccination management + reminders
- `/vaccinations/upcoming` - Upcoming reminders view
- `/social-posts` - Social media posts manager
- `/social-posts/new` - Create new post
- `/users` - User management (admin only)
- `/settings` - App settings (admin only)

### Secretary Routes
- `/appointments` - Manage appointments
- `/appointments/new` - Create appointment
- `/animals` - View animals
- `/animals/:id` - View animal + history
- `/social-posts` - Create drafts

---

## Dashboard Widgets

The dashboard should show:

1. **Today's Appointments** - List of today's scheduled appointments with quick actions (confirm, complete, cancel)
2. **Upcoming Vaccinations** - Widget showing vaccinations due in next 7/30 days with status indicators (green/yellow/red)
3. **Quick Stats Cards**:
   - Total animals (active)
   - Appointments today
   - Pending vaccinations
   - Draft posts
4. **Recent Activity** - Latest medical records, appointments, etc.
5. **Overdue Vaccinations** - Alert widget for overdue vaccines requiring attention

---

## Key Features Implementation

### 1. Turnos (Appointments)
- Calendar view with day/week/month options
- Time slots in 30-minute intervals (configurable)
- Conflict detection: **prevent two appointments for the SAME animal at the SAME time**
- Status workflow: scheduled → confirmed → in-progress → completed
- Cancellation with reason

### 2. Historial Médico
- Chronological list of all medical events per animal
- Filter by type: consultation, surgery, treatment, diagnosis
- Attachments support (images, PDFs via URL)
- Link to appointment when applicable

### 3. Seguimiento de Vacunas
- Per-animal vaccination history
- Next due date tracking
- Automatic reminder calculation (default: 30 days before due)
- Status indicators:
  - 🟢 **OK**: due date > 30 days
  - 🟡 **Due Soon**: due date within 30 days
  - 🔴 **Overdue**: past due date

### 4. Recordatorios de Vacunas
- Dashboard widget showing upcoming vaccinations
- Filter in vaccinations page: upcoming, overdue, all
- Visual color coding
- Mark as "reminder sent" (manual tracking for v1)

### 5. Social Media Posts (v1 - Draft Manager)
- Rich text editor for post content
- Platform selection: Facebook, Instagram
- Status: draft → scheduled → published
- Schedule for future publishing
- Draft saving
- **Note**: Actual Facebook/Instagram API integration is v2/future

### 6. Animal Search & Filter
- Search by: name, owner name, owner phone
- Filter by: species, breed, isActive
- Paginated list

---

## First User Creation

**Option**: Admin registration endpoint (protected by a secret key in .env)

Or use a seed script:
```
npm run seed
```

This creates the first admin user. After that, admin can create more users.

---

## Authentication Flow

1. User enters credentials on `/login`
2. Server validates and returns JWT token + user data (including role)
3. Frontend stores token in localStorage
4. Protected routes check for valid token
5. Role-based route guards control access
6. Token expiration: 7 days
7. Refresh token endpoint for session extension

---

## Validation (Zod)

All API inputs should be validated with Zod schemas:

- `UserLoginSchema` - email, password
- `UserRegisterSchema` - email, password, name, role
- `AnimalSchema` - name, species, ownerName, ownerPhone, etc.
- `AppointmentSchema` - animal, date, time, type, reason
- `MedicalRecordSchema` - animal, date, type, diagnosis, treatment
- `VaccinationSchema` - animal, name, dateAdministered, nextDueDate
- `SocialPostSchema` - content, platforms

---

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vetclinic
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=development
# First user setup
ADMIN_SECRET_KEY=your-admin-secret
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## Development Guidelines

### Coding Standards
- Use TypeScript for all new code
- Use Zod for input validation
- Component-based architecture with separation of concerns
- API responses should follow consistent format
- Error handling with appropriate HTTP status codes
- Use shadcn/ui components as base

### Git Conventions
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Commits: conventional commits format

### Security
- Passwords hashed with bcrypt (min 10 rounds)
- JWT tokens with expiration + refresh
- Input validation with Zod on ALL endpoints
- CORS configuration
- Rate limiting (future)
- SQL injection prevention (Mongoose queries)

### Testing
- Component tests with Vitest + React Testing Library
- API tests with supertest

---

## Future Enhancements (Out of Scope for v1)
- SMS/Email notifications (real sending)
- WhatsApp integration
- Online booking for clients (self-service)
- PDF report generation
- Data export (CSV, PDF)
- Multi-clinic support
- Mobile app
- Facebook/Instagram real API integration
- Online payments
- Inventory management

---

## Success Criteria for v1
- [ ] User authentication working (login, JWT, role-based)
- [ ] Animal CRUD operations with search/filter
- [ ] Appointment scheduling (today + future) with conflict detection
- [ ] Medical history viewable per animal
- [ ] Vaccination tracking with status indicators (ok/due/overdue)
- [ ] Dashboard with today's appointments and vaccine reminders
- [ ] Social media post drafts creatable
- [ ] Role-based access control functional
- [ ] Soft delete for animals
- [ ] TypeScript throughout