# Eco Qadam — UX/UI Concept

> Minimal, premium, modern mobile-first environmental platform.

## Product vision

Eco Qadam motivates citizens to report illegally dumped / littered waste.
A user snaps a photo with GPS location → an admin verifies it → the user earns a reward
→ balance grows → withdrawal to a bank card (after admin payment confirmation).

## Flow

```
USER ──▶ PHOTO + GPS ──▶ WASTE REPORT ──▶ ADMIN VERIFICATION ──▶ REWARD ──▶ BALANCE ──▶ WITHDRAWAL ──▶ ADMIN PAYMENT
```

## Design system

- **Primary**: fresh eco green — `#22C55E` (with `#16A34A` pressed state)
- **Background**: `#F7F9F7` (near-white, very light)
- **Cards**: `#FFFFFF`, radius 20px, soft shadow `0 8px 24px rgba(16,24,40,0.06)`
- **Text**: dark charcoal `#1A1D1C`; secondary muted gray `#8A9189`
- **Success**: green / **Warning**: orange `#F59E0B` / **Danger**: red `#EF4444`
- **Typography**: large (headers 22–28px), generous whitespace
- **Micro-interactions**: button press scale, upload shimmer, location pulse,
  success check animation, skeleton loaders, toasts, smooth page transitions

Principles: minimal, one-hand usable, app-like (NOT a desktop website),
no old-fashioned dashboards, no excessive gradients.

## App shell (mobile)

- Single column, max-width 480px, centered on desktop (background is a neutral tint)
- Safe-area aware top bar + floating bottom navigation (Home, Reports, Map, Balance, Profile)
- Bottom nav: modern line icons (feather style), active item = eco green with soft pill background

## Screens

### 1. Home
- Top bar: logo (leaf mark) + greeting + avatar
- Hero card "Ekologiyaga qo'shgan hissangiz":
  - Jami yuborilgan, Tasdiqlangan, Jami ishlab topilgan summa
- CTA (primary button): "Chiqindi haqida xabar berish"
- "Oxirgi faoliyat" — recent reports list with status chips (Tasdiqlandi / Ko'rib chiqilmoqda / Rad etildi)

### 2. Submit waste (wizard)
1. **Step 1** — big camera card: capture via camera OR pick from gallery
2. **Step 2** — photo preview + "Confirm" / "Retake"
3. **Step 3** — location detection: "Lokatsiya aniqlandi 📍" + mini map preview
4. **Step 4** — optional description + waste type selector (Plastik, Qog'oz, Shisha, Maishiy, Boshqa)
5. **Step 5** — submit
- Success screen: "Rahmat! Ekologiyaga qo'shgan hissangiz uchun." + status "Ko'rib chiqilmoqda"

### 3. Reports list + detail
- Cards: photo, waste type, date/time, status chip, reward (if approved `+ 10 000 so'm`)
- Detail: photo, type, coordinates, date, time, description, status, reward

### 4. Map
- Interactive map, shows own position (blue dot) and own reports (green markers for approved, amber for pending, red for rejected)
- Tap marker → bottom card: photo, date, status, reward

### 5. Balance
- Big balance card "Joriy balans — 125 000 so'm"
- "Pul yechish" button
- Transaction history list (`+ 10 000 so'm — Chiqindi tasdiqlandi`, `- 50 000 so'm — Pul yechish`)

### 6. Withdraw
- Form: amount, card number `8600 …`
- Validation: min amount, sufficient balance, card format, no concurrent pending requests
- Button "Pul yechish so'rovini yuborish"

### 7. Profile
- Avatar, name, phone, telegram, registered date
- Stats: reports, approved, total earned
- Settings: Bildirishnomalar, Til, Yordam, Maxfiylik, Chiqish

### 8. Auth
- Login / Register by phone + password
- "Telegram orqali kirish" button → connects to bot deep-link flow

## Admin dashboard (web)

- Sidebar: Stats, Reports, Withdrawals, Users, Settings
- Stats cards: foydalanuvchilar, reportlar, kutilayotgan, tasdiqlangan, rad etilgan,
  berilgan mukofotlar, kutilayotgan withdrawal, to'langan pullar
- Report detail: user, phone, photo, GPS coords, interactive map, address, datetime, description, type
- Actions: Tasdiqlash (with reward amount input) / Rad etish
- Withdrawals: user, amount, card, date, status + Approve / Reject / Mark as Paid
- Financial safety: all balance changes go through Transactions + AdminActionLog audit

## Statuses

- Report: PENDING "Ko'rib chiqilmoqda" / APPROVED "Tasdiqlandi" / REJECTED "Rad etildi"
- Withdrawal: PENDING "Kutilmoqda" / APPROVED "Tasdiqlandi" / PAID "To'landi" / REJECTED "Rad etildi"

## Telegram notifications

"Arizangiz qabul qilindi." · "Arizangiz admin tomonidan ko'rib chiqilmoqda."
"Tabriklaymiz! Siz yuborgan chiqindi tasdiqlandi." · "Hisobingizga 10 000 so'm qo'shildi."
"Pul yechish so'rovingiz qabul qilindi." · "…tasdiqlandi." · "Pul to'lovi amalga oshirildi."