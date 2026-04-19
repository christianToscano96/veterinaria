# DESIGN.md - Veterinaria Pandy

## Overview
Veterinaria Pandy - MERN stack app (React 19 + shadcn/ui + Tailwind CSS)

---

## 1. Nombre
**Veterinaria Pandy** - derived from "panda" + warm, friendly veterinary care

---

## 2. Color Palette

### Core Colors
```css
/* Primary - Orchid vibe */
--primary: #9e18a6;           /* Main brand - Orchid */
--primary-container: #bc3ac1;   /* Lighter orchid */
--on-primary: #ffffff;

/* Secondary - Deep Plum */
--secondary: #814974;
--secondary-container: #d6beff;
--on-secondary: #221921;

/* Surface Hierarchy */
--surface: #ffffff;
--surface-low: #fafafa;
--surface-dim: #e6d5e1;
--surface-variant: #d7c0d1;

/* Background */
--background: #fafafa;
--on-background: #221921;

/* Status Colors (veterinary-specific) */
--status-ok: #22c55e;        /* Green - healthy */
--status-warning: #eab308;     /* Yellow - due soon */
--status-error: #ef4444;        /* Red - urgent/overdue */
--status-info: #3b82f6;        /* Blue - info */
```

### Tailwind Config Additions
```javascript
// tailwind.config.js additions
colors: {
  primary: {
    DEFAULT: '#9e18a6',
    container: '#bc3ac1',
    muted: '#814974',
  },
  surface: {
    DEFAULT: '#ffffff',
    dim: '#e6d5e1',
    variant: '#d7c0d1',
  },
  status: {
    ok: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
  }
}
```

---

## 3. Typography

### Font Family
- **Manrope** (Google Fonts) - geometric yet warm, editorial feel
- Fallback: sans-serif

### Scale
- **Display** (text-4xl to text-3xl): Hero headlines, -0.02em tracking
- **Headline** (text-2xl): Section headers
- **Title** (text-xl): Card titles
- **Body** (text-base): Readability, leading-relaxed
- **Label** (text-sm): Metadata, technical details
- **Caption** (text-xs): Timestamps, small labels

---

## 4. UI Patterns

### "No-Line" Rule ✅
- NO 1px borders for sectioning
- Use background color shifts for divisions
- Whitespace (32px or 48px) between list items

### "Ghost Border" Fallback ✅
- Input fields: bottom border only (20% opacity of outline variant)
- Focus: border expands to 2px, turns primary

### Cards ✅
- Background: `surface-low` (#fafafa)
- Corner radius: `xl` (1.5rem) - "welcoming" feel
- No dividers inside cards

### Buttons ✅
- Primary: bg-primary (#9e18a6), text white, rounded-md
- Secondary: bg-secondary-container, no border
- Tertiary: no bg, primary text

### Status Badges ✅
- Normal: secondary_container (purple tint), full rounded (pill)
- Urgent: error_container (red tint), full rounded

### Glassmorphism ✅
- Navigation header: surface color at 70% + backdrop-blur(12px)
- Floating elements: blur + subtle shadow

---

## 5. Project Structure (Frontend)

```
client/src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx      # Main layout
│   │   ├── Sidebar.tsx       # Navigation
│   │   ├── Header.tsx        # Top bar with user menu
│   │   └── MobileNav.tsx     # Mobile navigation
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   ├── TodayAppointments.tsx
│   │   ├── UpcomingVaccinations.tsx
│   │   └── RecentActivity.tsx
│   ├── animals/
│   │   ├── AnimalCard.tsx
│   │   ├── AnimalList.tsx
│   │   └── AnimalForm.tsx
│   └── ui/                  # shadcn/ui components
├── context/
│   └── AuthContext.tsx       # JWT + user state
├── hooks/
│   └── useAuth.ts          # Auth hook
├── lib/
│   ├── api.ts            # Fetch client
│   └── utils.ts           # cn(), helpers
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Animals.tsx
│   ├── AnimalDetail.tsx
│   ├── Appointments.tsx
│   └── Vaccinations.tsx
├── services/
│   ├── auth.ts
│   ├── animals.ts
│   ├── appointments.ts
│   ├── vaccinations.ts
│   └── dashboard.ts
├── types/
│   └── index.ts          # TypeScript interfaces
└── App.tsx             # Routes
```

---

## 6. Routes

```
/login                    → LoginPage
/                         → Redirect /dashboard
/dashboard              → DashboardPage (protected)
/animals                 → AnimalListPage
/animals/new            → AnimalFormPage (create)
/animals/:id             → AnimalDetailPage
/animals/:id/edit       → AnimalFormPage (edit)
/appointments            → AppointmentListPage
/appointments/new       → AppointmentFormPage
/vaccinations           → VaccinationListPage
/vaccinations/upcoming  → UpcomingPage
/vaccinations/overdue   → OverduePage
```

---

## 7. Implementation Priority

### Phase 1: Core (Login + Layout)
- [ ] AuthContext
- [ ] API client (fetch)
- [ ] Login page
- [ ] AppLayout + Sidebar + Header

### Phase 2: Dashboard
- [ ] Dashboard page
- [ ] Stats cards
- [ ] Today's appointments widget
- [ ] Upcoming vaccinations widget

### Phase 3: Animales
- [ ] Animal list
- [ ] Animal cards
- [ ] Animal detail
- [ ] Animal form

### Phase 4: Turnos
- [ ] Appointment list
- [ ] Appointment form

### Phase 5: Vacunas
- [ ] Vaccination list
- [ ] Vaccination form

---

## 8. Design System Principles

### ✅ Do
- Use asymmetrical layouts for hero sections
- Use Manrope font throughout
- Use whitespace to separate content
- Use status badges (ok/warning/error)
- Use cards with xl radius
- Use ghost borders for inputs
- Use Glassmorphism for floating headers

### ❌ Don't
- NO 1px grey lines for dividers
- NO drop shadows with high opacity
- NO pure black text (#000)
- NO crowded interfaces