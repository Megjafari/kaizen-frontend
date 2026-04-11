<p align="center">
  <img src="https://raw.githubusercontent.com/Megjafari/kaizen-frontend/main/public/pwa-512x512.png" alt="Kaizen Logo" width="120" />
</p>

<h1 align="center">Kaizen</h1>

<p align="center">
  <strong>A fitness tracking PWA built with React and TypeScript</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Auth0-EB5424?style=for-the-badge&logo=auth0&logoColor=white" alt="Auth0" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Pages](#pages)
- [Components](#components)
- [Authentication](#authentication)
- [PWA](#pwa)
- [Deployment](#deployment)
- [Related](#related)

---

## Overview

Kaizen is a modern fitness tracking Progressive Web App that helps users log workouts, track nutrition, monitor weight, and document their transformation with progress photos. The app features a beautiful animated gradient background, smooth page transitions, and a mobile-first responsive design.

**Live App:** [https://kaizen.meghdadjafari.dev](https://kaizen.meghdadjafari.dev)

**Backend API:** [https://kaizen-api-production-ce18.up.railway.app](https://kaizen-api-production-ce18.up.railway.app)

---

## Features

- **Dashboard** - Overview of daily calories, protein, activity, and weight with weekly summary
- **Workout Calendar** - Visual calendar showing workout history, tap any day to view details
- **Quick Add Menu** - Floating action button to quickly log weight, food, or workouts
- **Food Tracking** - Search ingredients, log meals, track macros (calories, protein, carbs, fat)
- **Weight Logging** - Daily weight tracking with trend indicators
- **Progress Photos** - Upload transformation photos with date selection and compare mode
- **Profile Management** - Edit profile, upload profile picture, view stats
- **Admin Panel** - Manage users, ingredients, and workout templates (admin only)
- **Onboarding Wizard** - Guided setup for new users with custom number picker
- **Animated Background** - WebGL-powered gradient animation (Grainient)
- **Smooth Transitions** - Page transitions with Framer Motion
- **PWA Support** - Installable on mobile devices, works offline

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript 5.6 |
| **Build Tool** | Vite 6.2 |
| **Styling** | Tailwind CSS 4.0 |
| **Authentication** | Auth0 React SDK |
| **Animations** | Framer Motion |
| **WebGL** | OGL (for Grainient background) |
| **PWA** | vite-plugin-pwa |
| **Routing** | React Router DOM |
| **Deployment** | Vercel |

---

## Architecture

```
src/
├── App.tsx                    # Main app with routing and global background
├── main.tsx                   # Entry point
├── index.css                  # Global styles and Tailwind imports
├── auth/
│   └── Auth0Provider.tsx      # Auth0 configuration wrapper
├── components/
│   ├── Grainient.tsx          # WebGL animated gradient background
│   ├── Grainient.css          # Grainient styles
│   ├── Layout.tsx             # Main layout with navbar and quick-add menu
│   ├── NumberPicker.tsx       # Custom drag-to-select number input
│   ├── Onboarding.tsx         # New user onboarding wizard
│   └── PageTransition.tsx     # Framer Motion page transition wrapper
├── context/
│   ├── ProfileContext.ts      # Profile context definition
│   ├── ProfileContextType.ts  # Profile type definitions
│   └── ProfileProvider.tsx    # Profile state provider
├── hooks/
│   ├── useApi.ts              # API fetch hook with auth token
│   └── useProfile.ts          # Profile context hook
└── pages/
    ├── Dashboard.tsx          # Home dashboard with stats
    ├── Workouts.tsx           # Workout calendar and logging
    ├── Food.tsx               # Food logging and search
    ├── Weight.tsx             # Weight history (legacy, accessed via quick-add)
    ├── Progress.tsx           # Progress photos feed and compare
    ├── Profile.tsx            # User profile and settings
    └── Admin.tsx              # Admin panel for managing data
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Auth0 account (for authentication)
- Running backend API

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Megjafari/kaizen-frontend.git
   cd kaizen-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

### Configuration

Create `.env.local` in the project root:

```env
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://kaizen-api
VITE_API_URL=http://localhost:5164
```

For production, add these as environment variables in Vercel.

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/` | Daily overview with calories, protein, activity, weight, macros, and weekly summary |
| **Workouts** | `/workouts` | Calendar view of workout history with logging modal |
| **Food** | `/food` | Search ingredients, log meals, view daily nutrition |
| **Progress** | `/progress` | Progress photo feed with upload and compare mode |
| **Profile** | `/profile` | User stats, edit profile, upload profile picture |
| **Admin** | `/admin` | Manage users, ingredients, and templates (admin only) |

---

## Components

| Component | Description |
|-----------|-------------|
| **Layout** | Main layout with floating bottom navbar, quick-add menu, and weight modal |
| **Grainient** | WebGL animated gradient background using OGL library |
| **Onboarding** | 5-step wizard for new users (gender, weight, height, age, goal) |
| **NumberPicker** | Custom draggable number input with tap-to-type support |
| **PageTransition** | Framer Motion wrapper for smooth page transitions |

---

## Authentication

This app uses **Auth0** for authentication with Google social login.

### Features

- Google OAuth login
- JWT tokens stored in localStorage
- Token refresh with `useRefreshTokens`
- Protected routes (all pages require authentication)
- Role-based access (admin panel for `IsAdmin` users)

### Auth0 Configuration

In Auth0 Dashboard, configure your SPA application:

**Allowed Callback URLs:**
```
http://localhost:5173, https://kaizen.meghdadjafari.dev
```

**Allowed Logout URLs:**
```
http://localhost:5173, https://kaizen.meghdadjafari.dev
```

**Allowed Web Origins:**
```
http://localhost:5173, https://kaizen.meghdadjafari.dev
```

---

## PWA

Kaizen is a fully installable Progressive Web App.

### Features

- Installable on iOS, Android, and desktop
- Custom app icon and splash screen
- Standalone display mode (no browser UI)
- Offline-capable with service worker

### Installation

**iOS:** Safari > Share > Add to Home Screen

**Android:** Chrome > Menu > Install app

**Desktop:** Chrome > Address bar install icon

### Manifest

The PWA is configured in `vite.config.ts` using `vite-plugin-pwa`:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Kaizen',
    short_name: 'Kaizen',
    description: 'Track workouts, food and weight',
    theme_color: '#020617',
    background_color: '#020617',
    display: 'standalone',
    icons: [...]
  }
})
```

---

## Deployment

### Vercel (Production)

1. Connect your GitHub repository to Vercel
2. Add environment variables:
   ```
   VITE_AUTH0_DOMAIN=your-tenant.auth0.com
   VITE_AUTH0_CLIENT_ID=your-client-id
   VITE_AUTH0_AUDIENCE=https://kaizen-api
   VITE_API_URL=https://your-api-url.up.railway.app
   ```
3. Deploy

### Custom Domain

To use a custom subdomain (e.g., `kaizen.yourdomain.dev`):

1. In Vercel: Settings > Domains > Add domain
2. Add CNAME record in your DNS:
   - Name: `kaizen`
   - Value: `cname.vercel-dns.com`
3. Update Auth0 allowed URLs with your custom domain

---

## Related

- [Kaizen API](https://github.com/Megjafari/kaizen-API) - Backend REST API built with ASP.NET Core

---

<p align="center">
  Made by <a href="https://meghdadjafari.dev">Meg Jafari</a>
</p>
