# 🌿 Eco Qadam

Zamonaviy ekologik mobil platforma — chiqindidan darak bering, mukofot oling.

- **Foydalanuvchi** rasm + GPS orqali chiqindi haqida xabar beradi
- **Admin** tekshiradi va mukofot belgilaydi
- **Mukofot** balansga qo'shiladi, **pul yechish** admin tasdiqidan keyin amalga oshadi
- **Telegram bot** orqali ro'yxatdan o'tish va bildirishnomalar

## Arxitektura

```
docs/                        UX/UI, database, API, frontend arxitektura hujjatlari
backend/                     Django + DRF REST API
frontend/                    React + Vite + TypeScript + Tailwind (PWA) — foydalanuvchi app
admin/                       React + Vite + TypeScript + Tailwind — alohida admin panel (staff)
```

## Backend (Django REST)

- Custom `User` (phone login), `Profile`
- `WasteReport` + `WasteImage` + `Location` (GPS validatsiya, duplicate-guard, rate limit)
- Moliyaviy zanjir: `Transaction` (REWARD / WITHDRAWAL / REFUND / ADJUSTMENT) — balans lederaldan hisoblanadi
- `WithdrawalRequest` (PENDING → APPROVED → PAID / REJECTED)
- `Reward`, `AdminActionLog` (audit), `Notification` (in-app + Telegram)
- JWT (simplejwt), staff-only admin API, fayl/stafkalar tekshiruvi
- Custom admin dashboard: statistika, arizalarni tasdiqlash, to'lovlar, balansni tuzatish, audit

### Ishga tushirish

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r requirements.txt

copy .env.example .env            # va to'ldiring (DB, Telegram to'keni)

DB_ENGINE=sqlite python manage.py migrate        # quick start; yoki PostgreSQL
python manage.py seed_demo                        # admin + demo user + arizalar
python manage.py runserver
```

Demo akkauntlar (seed_demo):
| Rol | Telefon | Parol |
|---|---|---|
| Admin | +998900000000 | admin123 |
| Foydalanuvchi | +998901234567 | user1234 |

Telegram bot (pochta sozlamasi o'tkazilganda):

```bash
python manage.py runbot          # TELEGRAM_BOT_TOKEN .env da ko'rsatilgan bo'lishi kerak
```

Muhim sozlamalar (`.env`): `TELEGRAM_BOT_TOKEN`, `BOT_SECRET_TOKEN`, `APP_BASE_URL`, `DB_*`, `MAX_UPLOAD_SIZE`, `MIN_WITHDRAWAL_AMOUNT`.

API hujjati: `http://127.0.0.1:8000/api/v1/docs/`

## Frontend (React PWA)

- Mobile-first, app-like UI (bottom navigation, telefonda to'liq ekran)
- Ekranlar: Kirish/Registratsiya, Bosh sahifa, Chiqindi yuborish (wizard), Xabarlar, Xarita, Balans, Pul yechish, Profil, Bildirishnomalar
- JWT auto-refresh, zustand, toasts, skeleton loading, Leaflet xarita, PWA (installable)

### Ishga tushirish

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173 (API /api → backend proksi)
```

## Admin panel (alohida React app)

- Statistika, arizalar, to'lovlar, foydalanuvchilar, tranzaksiyalar, audit (faqat staff)
- Standalone app: `admin/` papkasida, mustaqil `eco_qadam_admin_auth` sessiyasi bilan

### Ishga tushirish

```bash
cd admin
npm install
npm run dev            # http://localhost:5174 (API /api → backend proksi)
```

## Telegram orqali kirish oqimi

1. Foydalanuvchi botda `/start` → telefon raqamini yuboradi → ism-familiya kiritadi
2. Bot hisob yaratadi va bir martalik login havolasini yuboradi
3. Havola frontendda ochiladi: `/auth/telegram?token=...` → JWT olinadi

## To'lovlar

To'lovlar hozircha **qo'lda** (admin "Mark as Paid" bosadi). Kelajakda Click / Payme / Uzcard / Humo
integratsiyasi uchun `PAYMENT_PROVIDER` sozlamasi va `Transaction` (WITHDRAWAL) modeli tayyor.

## Security

- JWT + staff-only admin API
- Foydalanuvchi faqat o'z arizalarini ko'radi; reward miqdorini o'zgartira olmaydi
- GPS, rasm o'lcham/tur, blank-rasm validatsiyasi; takroriy yuborishlar bloklanadi
- Karta raqamlari API'da maskalanadi
- Har bir moliyaviy amal audit qilinadi (`AdminActionLog`)