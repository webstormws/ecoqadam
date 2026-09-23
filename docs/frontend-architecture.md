# Eco Qadam — React Frontend Architecture

Stack: **Vite + React + TypeScript + Tailwind CSS + Zustand + react-router-dom + PWA (vite-plugin-pwa)**.
Maps: `leaflet` + `react-leaflet` (maps preview / map screen). Mobile-first, app-like shell.

```
frontend/
├─ index.html                      PWA manifest + theme
├─ vite.config.ts                  proxy /api → backend, PWA plugin
├─ tailwind.config.js              eco palette, radius, shadows
└─ src/
   ├─ main.tsx                     bootstrap
   ├─ App.tsx                      providers + router
   ├─ index.css                    base styles, safe-area, animations
   ├─ api/  client.ts              axios instance, JWT interceptors, refresh
   │       endpoints.ts            typed endpoint helpers
   ├─ services/ auth.ts  reports.ts  wallet.ts  notifications.ts
   ├─ store/ authStore.ts          token+user (zustand + persist)
   │        toastStore.ts          toast queue
   ├─ hooks/ useGeolocation.ts  useDidMount.ts  useMediaQuery.ts
   ├─ layouts/ AppShell.tsx        max-width phone, top bar, bottom nav
   │           BottomNav.tsx       Home / Reports / Map / Balance / Profile
   ├─ components/                  Button, Card, StatusChip, Skeleton,
   │            Avatar, EmptyState, MiniMap, Toast, Modal, HeroCard,
   │            TransactionItem, ReportCard, BottomSheet, Screen
   └─ pages/
      ├─ Auth.Login.tsx  Auth.Register.tsx  Auth.TelegramCallback.tsx
      ├─ Home.tsx
      ├─ Submit/SubmitWaste.tsx  Submit/Success.tsx
      ├─ Reports.tsx  ReportDetail.tsx
      ├─ MapScreen.tsx
      ├─ Balance.tsx
      ├─ Withdraw.tsx
      └─ Profile.tsx
```

## Routing

```
/            → Home         (private)
/reports     → Reports     (private)
/reports/:id → ReportDetail
/map         → MapScreen
/balance     → Balance
/withdraw    → Withdraw
/profile     → Profile
/login  /register  /auth/telegram  (public)
```

Private routes render inside `<AppShell/>`; redirect to /login if no token.

## Key hooks

- `useGeolocation` — promises high-accuracy coords, retry UI, error states
- `authStore` — `login/register/logout`, persisted access+refresh tokens, auto refresh on 401
- `useDidMount` — one-shot data loading with skeletons

## Design tokens (Tailwind)

```
--color-primary:  #22C55E   (green family)
--color-bg:       #F7F9F7
--color-surface:  #FFFFFF
--color-ink:      #1A1D1C
--color-muted:    #8A9189
border-radius-card: 20px
shadow-card: 0 8px 24px rgba(16,24,40,.06)
```

## PWA

- manifest + maskable icon, theme color `#22C55E`, standalone display
- Workbox precache; can be "installed" like a native app