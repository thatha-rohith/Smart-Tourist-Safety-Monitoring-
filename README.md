# Smart Tourist Safety Monitoring System (STSMS)

A full-stack **MERN** web application designed to help **Indian police authorities** monitor tourist safety in real time. The platform provides a centralized **Authority Control Panel** for officers and a dedicated **Tourist Safety App** where tourists share live GPS locations, trigger SOS alerts, and receive emergency broadcasts.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [User Roles](#user-roles)
5. [Features & Functionality](#features--functionality)
6. [Module-wise Panel Details](#module-wise-panel-details)
7. [Project Structure](#project-structure)
8. [Prerequisites](#prerequisites)
9. [Installation & Setup](#installation--setup)
10. [How to Run the Project](#how-to-run-the-project)
11. [Default Login Credentials](#default-login-credentials)
12. [Seed Data](#seed-data)
13. [API Endpoints](#api-endpoints)
14. [Live Location Workflow](#live-location-workflow)
15. [Environment Variables](#environment-variables)
16. [Screens & Routes](#screens--routes)
17. [License](#license)

---

## Project Overview

The **Smart Tourist Safety Monitoring System** is a web-based safety and monitoring platform that enables:

- **Tourists** to register, share live GPS location, send SOS alerts, and receive safety broadcasts
- **Police Officers / Authority** to monitor tourists, track locations, manage alerts, zones, E-FIRs, and broadcasts
- **Admin** to manage officer accounts and oversee the entire system

All seed/demo data uses **Indian names, locations, phone numbers (+91), and real Indian tourist destinations** (Delhi, Ladakh, Goa, Jaipur, Uttarakhand, Chennai, Lucknow, etc.).

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js 18, Vite, React Router v6 |
| **UI / Styling** | Custom CSS (CSS Variables), Lucide React Icons |
| **Maps** | Leaflet.js + React-Leaflet + OpenStreetMap |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express.js |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Database** | MongoDB with Mongoose ODM |
| **Dev Tools** | Nodemon (backend), Vite HMR (frontend) |

### MERN Breakdown

| Letter | Technology | Purpose |
|--------|------------|---------|
| **M** | MongoDB | Store users, tourists, alerts, zones, E-FIRs, broadcasts |
| **E** | Express.js | REST API, business logic, middleware |
| **R** | React.js | Landing page, Authority panel, Tourist app |
| **N** | Node.js | Server runtime |

---

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Landing Page   │     │ Authority Panel │     │  Tourist App    │
│  (Public)       │     │ /dashboard/*    │     │ /tourist/*      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────────────────┼─────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   React Frontend (Vite)  │
                    │   Port: 3000             │
                    └────────────┬────────────┘
                                 │ REST API (Proxy)
                    ┌────────────▼────────────┐
                    │   Express Backend        │
                    │   Port: 5000             │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   MongoDB Database       │
                    │   smart_tourist_safety   │
                    └─────────────────────────┘
```

---

## User Roles

| Role | Access | Portal URL |
|------|--------|------------|
| **Admin** | Full authority access + Officer Management | `/dashboard` |
| **Authority (Police Officer)** | All operational modules (tourists, alerts, zones, E-FIR, broadcast) | `/dashboard` |
| **Tourist** | Live tracking, SOS, personal alerts, broadcasts | `/tourist` |

---

## Features & Functionality

### Core Features

- Attractive **landing page** with feature showcase and dual portal access
- **JWT-based authentication** with role-based route protection
- **Live GPS location tracking** (tourist app → server → officer dashboard)
- **Auto zone detection** — entering Restricted/Risky zones triggers alerts
- **Emergency SOS** one-tap alert with live coordinates
- **Safety Score System** (0–100) based on alerts, status, and activity
- **Interactive maps** using OpenStreetMap / Leaflet
- **Search & filter** across tourists, alerts, zones, and E-FIRs
- **Dark / Light theme** toggle
- **Toast notifications** for user feedback
- **Full CRUD operations** on all authority modules
- **Indian seed data** — 8 records per collection

### Alert Types

- SOS alert
- Emergency alert
- Safety alert
- Location-based alert
- Restricted zone alert

### Alert Severity Levels

Critical · High · Medium · Low

### Zone Types

| Type | Description |
|------|-------------|
| **Restricted** | Military/border areas — no entry (e.g. Kargil LOC, Leh Air Force) |
| **Risky** | High-risk areas — monsoon landslides, wildlife, altitude (e.g. Kedarnath, Sundarbans) |
| **Safe** | Designated safe hubs with police patrol (e.g. Connaught Place, Calangute Beach) |

### Broadcast Types

- **All Tourists** — State-wide / national alert
- **Radius** — Tourists within X meters of a coordinate
- **Zone** — Tourists inside a selected safety zone
- **Region** — Tourists whose location address matches a region name

---

## Module-wise Panel Details

### 1. Landing Page (`/`)

Public marketing page for the project.

| Feature | Description |
|---------|-------------|
| Hero section | Project introduction with CTA buttons |
| Statistics | Tourist monitoring stats showcase |
| Features grid | 6 core modules explained |
| Portal links | Officer Login + Tourist App buttons |
| Footer | Project credits |

---

### 2. Authority / Police Control Panel (`/dashboard`)

Professional dashboard with fixed sidebar navigation. Accessible to **Admin** and **Authority** roles.

#### 2.1 Dashboard Overview (`/dashboard`)

| Feature | Description |
|---------|-------------|
| Stat cards | Total tourists, pending alerts, critical SOS, safe tourists, active zones, E-FIRs, broadcasts |
| Live tourist map | OpenStreetMap with all active tourist markers — **auto-refreshes every 15 seconds** |
| Recent alerts table | Latest pending/resolved alerts |
| Active tourists table | Recently updated tourist locations with safety scores |

#### 2.2 Tourist Management (`/dashboard/tourists`)

| Feature | Description |
|---------|-------------|
| Tourist registry | View all registered tourists with search and status filter |
| Safety score display | Visual score badge (0–100) per tourist |
| Register tourist | Create new tourist account with Indian profile details |
| Edit tourist | Update name, phone, nationality, safety status, safety score |
| Deactivate tourist | Soft-delete / disable tourist account |
| Live refresh | Tourist list auto-refreshes every 15 seconds |
| Tourist detail (`/dashboard/tourists/:id`) | Full profile, live map, location history, edit modal — polls location every 15s |

**Tourist data shown:** Name, Tourist ID, Email, Phone, Safety Score, Status, Last Seen, Total Alerts, Live Location

#### 2.3 Alert Management (`/dashboard/alerts`)

| Feature | Description |
|---------|-------------|
| Alert statistics | Critical, High priority, Pending, Resolved counts |
| Alert queue table | All alerts with tourist name, type, severity, location, status, time |
| Search & filter | By tourist name, severity, status |
| Create alert | Manually create alert for any tourist |
| View alert | Modal with full alert details |
| Edit alert | Update type, severity, status, description |
| Resolve alert | Mark pending alert as resolved |
| Delete alert | Remove alert record |
| Quick actions | View tourist location, resolve, edit, delete |

#### 2.4 Zone Management (`/dashboard/zones`)

| Feature | Description |
|---------|-------------|
| Zone statistics | Restricted, Risky, Safe zone counts |
| Zone registry | List all zones with type, radius, status |
| Interactive map | All zones displayed as colored circles on map |
| Create zone | Add new zone with name, type, coordinates, radius, description |
| Edit zone | Full edit — name, type, location, radius, status |
| Delete zone | Remove zone permanently |
| Search & filter | By zone name; filter by type; sort by name |

#### 2.5 E-FIR Records (`/dashboard/efirs`)

| Feature | Description |
|---------|-------------|
| E-FIR statistics | Total, Verified, This Month, Pending counts |
| E-FIR registry | All electronic FIR records with search and status filter |
| Generate E-FIR | Create new E-FIR linked to a tourist |
| View E-FIR detail | Full incident, tourist, and officer information |
| Edit E-FIR | Update incident type, severity, officer, status, description |
| Verify E-FIR | Mark pending report as verified |
| Close case | Close E-FIR with response action |
| Download report | Download E-FIR as `.txt` file |
| Delete E-FIR | Delete pending (non-verified) records only |

**E-FIR detail page (`/dashboard/efirs/:id`):** Incident details, tourist info, assigned officer, verification status, download & close actions

#### 2.6 Emergency Broadcast (`/dashboard/broadcast`)

| Feature | Description |
|---------|-------------|
| Compose broadcast | Send alerts with title, message, broadcast type |
| Broadcast types | All Tourists, Radius, Zone, Region |
| Emergency flag | Mark broadcast as emergency warning |
| Broadcast history | Table of all sent broadcasts |
| View details | Modal with full broadcast information |
| Delete broadcast | Remove from history |

#### 2.7 Officer Management — Admin Only (`/dashboard/users`)

| Feature | Description |
|---------|-------------|
| Officer directory | List all authority and admin accounts |
| Statistics | Total, active, inactive officers |
| Add officer | Create new authority or admin account |
| Edit officer | Update name, role, badge, department, phone, password |
| Activate / Deactivate | Toggle officer account status |
| Search & filter | By name, email, badge; filter by role and status |

#### 2.8 Profile & Settings (`/dashboard/profile`)

| Feature | Description |
|---------|-------------|
| Officer profile view | Name, email, badge, department |
| Update profile | Change name, phone, password |
| Theme toggle | Switch between dark and light mode |

---

### 3. Tourist Safety App (`/tourist`)

Mobile-friendly panel for registered tourists. Accessible to **Tourist** role only.

#### 3.1 Tourist Login & Register

| Route | Description |
|-------|-------------|
| `/tourist/login` | Sign in with tourist credentials |
| `/tourist/register` | Create new tourist account (auto-creates tourist profile) |

#### 3.2 Live Tracking Home (`/tourist`)

| Feature | Description |
|---------|-------------|
| Safety score card | Current score (0–100) and safety status |
| Tourist ID display | Unique TID assigned on registration |
| Start/Stop live tracking | Toggle GPS location sharing |
| Auto GPS sync | Sends location to server every ~20 seconds |
| Update now button | Manual immediate location update |
| Live map | Shows current position on OpenStreetMap |
| Address display | Reverse-geocoded Indian address via Nominatim |
| SOS button | One-tap emergency alert to police with live coordinates |
| Zone alerts | Auto-triggered when entering restricted/risky zones |

#### 3.3 My Alerts (`/tourist/alerts`)

| Feature | Description |
|---------|-------------|
| Alert history | All alerts linked to the logged-in tourist |
| Alert details | Type, severity, location, status, timestamp |

#### 3.4 Safety Broadcasts (`/tourist/broadcasts`)

| Feature | Description |
|---------|-------------|
| Broadcast feed | Police safety warnings and emergency notices |
| Emergency indicator | Highlighted emergency broadcasts |

#### 3.5 Tourist Profile (`/tourist/profile`)

| Feature | Description |
|---------|-------------|
| Account details | Tourist ID, email display |
| Edit profile | Update name, phone, password |

---

## Project Structure

```
Smart Tourist Safety Monitoring System/
│
├── backend/                          # Node.js + Express API
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                   # JWT protect & authorize middleware
│   ├── models/
│   │   ├── User.js                   # Admin, Authority, Tourist users
│   │   ├── Tourist.js                # Tourist profiles & locations
│   │   ├── Alert.js                  # Safety alerts
│   │   ├── Zone.js                   # Safety zones
│   │   ├── EFIR.js                   # E-FIR records
│   │   └── Broadcast.js              # Emergency broadcasts
│   ├── routes/
│   │   ├── auth.js                   # Login, register, profile
│   │   ├── tourists.js               # Tourist CRUD + live location + tourist portal
│   │   ├── alerts.js                 # Alert management
│   │   ├── zones.js                  # Zone management
│   │   ├── efirs.js                  # E-FIR management
│   │   ├── broadcasts.js             # Broadcast management
│   │   ├── dashboard.js              # Dashboard statistics
│   │   └── users.js                  # Officer management (admin)
│   ├── seed/
│   │   └── seed.js                   # Database seed script (Indian data)
│   ├── utils/
│   │   └── geo.js                    # Distance calc & zone alert detection
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Environment template
│   ├── server.js                     # Express server entry point
│   └── package.json
│
├── frontend/                         # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Modal, Panel, PageHeader, UI components
│   │   │   ├── layout/               # DashboardLayout, TouristLayout, Sidebar
│   │   │   └── map/                  # LiveMap (Leaflet)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication state
│   │   │   ├── ThemeContext.jsx      # Dark/Light theme
│   │   │   └── ToastContext.jsx      # Toast notifications
│   │   ├── hooks/
│   │   │   ├── useLiveLocation.js    # Tourist GPS tracking hook
│   │   │   └── useLiveTouristPolling.js
│   │   ├── pages/
│   │   │   ├── tourist/              # Tourist app pages
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx             # Officer login
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Tourists.jsx
│   │   │   ├── TouristDetail.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── Zones.jsx
│   │   │   ├── EFIRs.jsx
│   │   │   ├── EFIRDetail.jsx
│   │   │   ├── Broadcast.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Users.jsx
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with JWT interceptor
│   │   ├── styles/
│   │   │   └── dashboard-pro.css     # Production dashboard styles
│   │   ├── App.jsx                   # Route definitions
│   │   └── main.jsx                  # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json                      # Root scripts (optional)
└── README.md
```

---

## Prerequisites

Before running the project, ensure you have:

| Requirement | Version |
|-------------|---------|
| **Node.js** | v18 or higher |
| **npm** | v9 or higher |
| **MongoDB** | v6 or higher (running locally or via MongoDB Atlas) |
| **Modern Browser** | Chrome / Edge / Firefox (for GPS location in tourist app) |

---

## Installation & Setup

### Step 1 — Clone / Open the Project

```bash
cd "Smart Tourist Safety Monitoring System"
```

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create environment file (if not present):

```bash
copy .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_tourist_safety
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
```

Seed the database with Indian demo data:

```bash
npm run seed
```

### Step 3 — Frontend Setup

```bash
cd ../frontend
npm install
```

---

## How to Run the Project

> **Important:** MongoDB must be running before starting the backend.

### Terminal 1 — Start MongoDB

Make sure MongoDB is running on `mongodb://127.0.0.1:27017`

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or start mongod manually
mongod
```

### Terminal 2 — Start Backend

```bash
cd backend
npm run dev
```

Backend API: **http://localhost:5000**  
Health check: **http://localhost:5000/api/health**

### Terminal 3 — Start Frontend

```bash
cd frontend
npm run dev
```

Frontend App: **http://localhost:3000**

### Quick Test Flow

1. Open **http://localhost:3000** — Landing page
2. **Tourist test:** Go to `/tourist/login` → login as `arjun.sharma@gmail.com` → Start Live Tracking (allow GPS)
3. **Officer test:** Go to `/login` → login as `rajesh@police.gov.in` → Open Dashboard → see live tourist map
4. **SOS test:** In tourist app, press **EMERGENCY SOS** → check Alerts module in officer dashboard

### Production Build (Frontend)

```bash
cd frontend
npm run build
npm run preview
```

---

## Default Login Credentials

### Admin

| Field | Value |
|-------|-------|
| **Name** | Superintendent Anil Mehta |
| **Email** | admin@stsms.gov.in |
| **Password** | admin123 |
| **Portal** | http://localhost:3000/login → `/dashboard` |
| **Extra Access** | Officer Management module |

### Police Authority (Officers)

| Name | Email | Password | Department |
|------|-------|----------|------------|
| Inspector Rajesh Kumar | rajesh@police.gov.in | police123 | Delhi Tourist Safety Division |
| Sub-Inspector Priya Sharma | priya@police.gov.in | police123 | UP Emergency Response Unit |

**Portal:** http://localhost:3000/login → `/dashboard`

### Tourists (All passwords: `tourist123`)

| Name | Email | Tourist ID | Current Location |
|------|-------|------------|-----------------|
| Arjun Sharma | arjun.sharma@gmail.com | TID100001 | Connaught Place, New Delhi |
| Priya Nair | priya.nair@gmail.com | TID100002 | Leh, Ladakh |
| Akash Patel | akash.patel@gmail.com | TID100003 | Hawa Mahal, Jaipur |
| Vikram Singh | vikram.singh@gmail.com | TID100004 | Kargil Border, Ladakh |
| Rohan Desai | rohan.desai@gmail.com | TID100005 | Calangute Beach, Goa |
| Meera Joshi | meera.joshi@gmail.com | TID100006 | Kedarnath, Uttarakhand |
| Rahul Verma | rahul.verma@gmail.com | TID100007 | Marina Beach, Chennai |
| Kavita Reddy | kavita.reddy@gmail.com | TID100008 | Bara Imambara, Lucknow |

**Portal:** http://localhost:3000/tourist/login → `/tourist`

---

## Seed Data

Run from the `backend` directory:

```bash
npm run seed
```

This clears existing data and creates:

| Collection | Count | Details |
|------------|-------|---------|
| Users | 11 | 1 Admin + 2 Officers + 8 Tourists |
| Tourists | 8 | Indian profiles with GPS locations across India |
| Alerts | 8 | SOS, Emergency, Zone, Safety alerts |
| Zones | 8 | Kargil, Leh, Pahalgam, Kedarnath, Lonavala, Sundarbans, Delhi, Goa |
| E-FIRs | 8 | Indian incident reports (EFIR/2025/xxxx) |
| Broadcasts | 8 | IMD alerts, Ladakh advisory, Diwali security, 1363 helpline |

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register tourist account | Public |
| POST | `/api/auth/login` | Login (all roles) | Public |
| GET | `/api/auth/me` | Get current user | Authenticated |
| PUT | `/api/auth/profile` | Update own profile | Authenticated |

### Dashboard

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/stats` | Overview statistics | Authority, Admin |

### Tourists

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tourists` | List all tourists | Authority, Admin |
| GET | `/api/tourists/live` | Live locations (polling) | Authority, Admin |
| GET | `/api/tourists/stats` | Tourist statistics | Authority, Admin |
| GET | `/api/tourists/me` | Own tourist profile | Tourist |
| PUT | `/api/tourists/me/location` | Update own GPS location | Tourist |
| POST | `/api/tourists/me/sos` | Trigger SOS alert | Tourist |
| GET | `/api/tourists/me/alerts` | Own alert history | Tourist |
| GET | `/api/tourists/me/broadcasts` | Safety broadcasts | Tourist |
| POST | `/api/tourists` | Register tourist | Authority, Admin |
| GET | `/api/tourists/:id` | Tourist detail | Authenticated |
| PUT | `/api/tourists/:id` | Update tourist | Authority, Admin |
| DELETE | `/api/tourists/:id` | Deactivate tourist | Authority, Admin |

### Alerts

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/alerts` | List alerts | Authority, Admin |
| GET | `/api/alerts/stats` | Alert statistics | Authority, Admin |
| POST | `/api/alerts` | Create alert | Authority, Admin |
| PUT | `/api/alerts/:id` | Update alert | Authority, Admin |
| PUT | `/api/alerts/:id/resolve` | Resolve alert | Authority, Admin |
| DELETE | `/api/alerts/:id` | Delete alert | Authority, Admin |

### Zones

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/zones` | List zones | Authority, Admin |
| GET | `/api/zones/stats` | Zone statistics | Authority, Admin |
| POST | `/api/zones` | Create zone | Authority, Admin |
| PUT | `/api/zones/:id` | Update zone | Authority, Admin |
| DELETE | `/api/zones/:id` | Delete zone | Authority, Admin |

### E-FIRs

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/efirs` | List E-FIRs | Authority, Admin |
| GET | `/api/efirs/stats` | E-FIR statistics | Authority, Admin |
| GET | `/api/efirs/:id` | E-FIR detail | Authority, Admin |
| GET | `/api/efirs/:id/download` | Download report (.txt) | Authority, Admin |
| POST | `/api/efirs` | Generate E-FIR | Authority, Admin |
| PUT | `/api/efirs/:id` | Update E-FIR | Authority, Admin |
| PUT | `/api/efirs/:id/verify` | Verify E-FIR | Authority, Admin |
| PUT | `/api/efirs/:id/close` | Close case | Authority, Admin |
| DELETE | `/api/efirs/:id` | Delete pending E-FIR | Authority, Admin |

### Broadcasts

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/broadcasts` | List broadcasts | Authority, Admin |
| POST | `/api/broadcasts` | Send broadcast | Authority, Admin |
| DELETE | `/api/broadcasts/:id` | Delete broadcast | Authority, Admin |

### Users (Admin Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List officers | Admin |
| GET | `/api/users/stats` | Officer statistics | Admin |
| GET | `/api/users/officers` | Officers dropdown list | Authority, Admin |
| POST | `/api/users` | Create officer | Admin |
| PUT | `/api/users/:id` | Update officer | Admin |
| DELETE | `/api/users/:id` | Deactivate officer | Admin |

---

## Live Location Workflow

```
Tourist App                    Backend                      Officer Dashboard
     │                              │                                │
     │  Start Live Tracking         │                                │
     │  (Browser GPS)               │                                │
     │─────────────────────────────►│                                │
     │  PUT /api/tourists/me/location                                │
     │  (every ~20 seconds)         │                                │
     │                              │  Save to MongoDB               │
     │                              │  Check zone boundaries         │
     │                              │  Auto-create alert if          │
     │                              │  entered Restricted/Risky zone │
     │                              │                                │
     │                              │  GET /api/tourists/live        │
     │                              │◄───────────────────────────────│
     │                              │  (every 15 seconds)            │
     │                              │───────────────────────────────►│
     │                              │  Updated map markers           │
     │                              │                                │
     │  Press SOS Button            │                                │
     │─────────────────────────────►│                                │
     │  POST /api/tourists/me/sos   │  Critical alert created        │
     │                              │───────────────────────────────►│
     │                              │  Appears in Alert Management   │
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/smart_tourist_safety` |
| `JWT_SECRET` | Secret key for JWT signing | Change in production |
| `JWT_EXPIRE` | Token expiry duration | `7d` |

---

## Screens & Routes

### Public Routes

| URL | Page |
|-----|------|
| `/` | Landing Page |
| `/login` | Officer / Authority Login |
| `/tourist/login` | Tourist Login |
| `/tourist/register` | Tourist Registration |

### Authority Panel Routes

| URL | Module |
|-----|--------|
| `/dashboard` | Dashboard Overview |
| `/dashboard/tourists` | Tourist Management |
| `/dashboard/tourists/:id` | Tourist Detail + Live Map |
| `/dashboard/alerts` | Alert Management |
| `/dashboard/zones` | Zone Management |
| `/dashboard/efirs` | E-FIR Records |
| `/dashboard/efirs/:id` | E-FIR Detail View |
| `/dashboard/broadcast` | Emergency Broadcast |
| `/dashboard/users` | Officer Management (Admin only) |
| `/dashboard/profile` | Profile & Settings |

### Tourist App Routes

| URL | Module |
|-----|--------|
| `/tourist` | Live GPS Tracking + SOS |
| `/tourist/alerts` | My Alerts |
| `/tourist/broadcasts` | Safety Broadcasts |
| `/tourist/profile` | My Profile |

---

## License

This project is developed for **educational and academic purposes**.

---

**Smart Tourist Safety Monitoring System (STSMS)** — Built with MERN Stack · Indian Tourism Safety Platform
