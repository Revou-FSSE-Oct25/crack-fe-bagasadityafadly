# 🏋 Gymora — Frontend

> Smart gym management & booking platform built with Next.js 15

**Live Demo → [https://crack-fe-bagasadityafadly.vercel.app](https://crack-fe-bagasadityafadly.vercel.app)**

---

## Overview

Gymora is a full-stack gym management application. Members can book gym visits, join group classes, track personal training sessions, earn XP points, maintain streaks, and view their progress on a leaderboard. Admins have a dedicated panel to manage users, memberships, bookings, classes, schedules, and trainers.

---

## Features

### For Guests (no login required)
- Browse the landing page and membership plans
- View member benefits comparison
- Book a gym visit without creating an account (anonymous booking with QR entry code)
- Register or login to activate a paid membership plan

### For Members
- Dashboard with XP level, streak counter, and leaderboard
- Quick-book gym visits from the dashboard
- Browse and book upcoming group class sessions
- Book personal trainer sessions
- View booking history and status
- Membership page showing current plan and benefits
- QR code entry card

### For Non-Members (logged in)
- Same dashboard view as members
- Gym visit booking works immediately
- Class / PT booking prompts an upgrade modal
- Clear upgrade paths shown throughout the UI

### For Admins
- Overview stats (users, bookings, check-ins, revenue estimate, active members)
- User management — change roles, assign memberships, deactivate accounts
- Membership management — view all active plans, cancel memberships
- Booking management — filter by status/type, update booking status
- Class management — create and remove classes
- Schedule management — create and cancel sessions
- Trainer management — add trainers, toggle active status

---

## Pricing

| Plan | Price | Includes |
|------|-------|----------|
| Non-Member | Rp 50.000 / visit | Gym floor, basic equipment |
| Trial | Rp 50.000 / visit (14-day access) | Group classes, 2 PT sessions, XP |
| Basic | Rp 250.000 / month | Unlimited gym + all classes + 4 PT/month |
| Premium | Rp 500.000 / month | Everything in Basic + unlimited PT + nutrition |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| State Management | Zustand v5 (with `persist`) |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Public pages: login, register, book, benefits
│   ├── (dashboard)/     # Member dashboard: overview, classes, bookings, membership
│   └── (admin)/         # Admin panel: users, bookings, classes, schedules, trainers
├── components/
│   ├── dashboard/       # XpCard, StreakCard, QuickBookCard, LeaderboardCard, etc.
│   ├── layout/          # Sidebar, Topbar
│   └── ui/              # shadcn components + UpgradeModal
├── lib/
│   ├── api.ts           # apiFetch wrapper (reads JWT from Zustand, unwraps response envelope)
│   └── utils.ts
├── store/
│   └── auth.store.ts    # Zustand auth store with hydration guard
└── types/
    └── index.ts         # Shared TypeScript interfaces
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Backend API running (see [crack-be README](../crack-be-bagasadityafadly/README.md))

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=Gymora

# 4. Start development server (runs on port 3002)
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### Default Admin Account (after seeding)
```
Email:    admin@gymora.com
Password: Admin123!
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://gymora-api.onrender.com/api/v1` |
| `NEXT_PUBLIC_APP_NAME` | App display name | `Gymora` |

---

## Deployment

This project is deployed on **Vercel**.

**Live URL:** [https://crack-fe-bagasadityafadly.vercel.app](https://crack-fe-bagasadityafadly.vercel.app)

To deploy your own instance:
1. Fork this repo
2. Import into [Vercel](https://vercel.com)
3. Set `NEXT_PUBLIC_API_URL` to your backend URL
4. Deploy

---

## Related

- **Backend API** → [crack-be-bagasadityafadly](../crack-be-bagasadityafadly) — NestJS + Prisma + PostgreSQL
- **Database** — Supabase (PostgreSQL)
- **Backend Hosting** — Render

---

## Author

**Bagas Aditya Fadly** — Built for RevoU Crack Assignment
