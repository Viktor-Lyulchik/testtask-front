# InvestEstate — Frontend

React + Redux + Tailwind CSS frontend for the InvestEstate investment
apllication.

## Stack

- **React 18** + **TypeScript**
- **Redux Toolkit** — auth state (user, JWT token, persisted to localStorage)
- **Tailwind CSS** — utility-first styling
- **Axios** — API client with automatic JWT injection
- **React Router v6** — page routing
- **Vite** — dev server & bundler

## Getting Started

```bash
npm install
npm run dev
```

The dev server proxies `/api` → `http://localhost:3000` (NestJS backend).

## Backend expected

Make sure the NestJS backend is running on port 3000 and has CORS enabled:

```typescript
// main.ts
app.enableCors({ origin: 'http://localhost:5173' });
```

## Features

### Header

- Unauthenticated: **Log In** + **Sign Up** buttons
- Authenticated: user email + **Sign Out** button
- State persists across page reloads via localStorage

### Home Page (`/`)

- Hero section with background city photo, headline, CTA
- **Open Deals** grid — fetches `/properties` (public endpoint)
- 2-column grid on desktop, 1-column on mobile

### Property Card

- Shows: title, price, ticket, yield, daysLeft, soldPercent
- Click → if not logged in: redirect to `/login`
- Click → if logged in: modal to submit an Application (`POST /applications`)
- Progress bar showing soldPercent

### Login Page (`/login`)

- Split-screen: left photo panel, right form
- On success: stores token in Redux + localStorage, redirects to `/`
- Link to Register

### Register Page (`/register`)

- Same layout as Login
- On success: auto-login, redirects to `/`

## API Integration

All requests go through `src/api/api.ts` (axios instance). Auth token is
automatically injected from Redux store on every request.

Endpoints used:

- `POST /auth/login` → `{ accessToken, user }`
- `POST /auth/register` → `{ accessToken, user }`
- `GET /properties` → `Property[]` (public)
- `POST /applications` → requires JWT
- `GET /applications` → requires JWT

## Project Structure

```
src/
  store/
    store.ts          # Redux store
    authSlice.ts      # User + token state
  api/
    api.ts            # Axios instance with auth interceptor
    endpoints.ts      # API functions
  pages/
    HomePage.tsx      # Hero + Deals sections
    LoginPage.tsx     # Login form
    RegisterPage.tsx  # Register form
  components/
    Header.tsx        # Navigation with auth state
    Loader.tsx        # Loader component
    PropertyCard.tsx  # Property card + application modal
  main.tsx
  App.tsx             # Router + Provider setup
  index.css           # Tailwind directives
```
