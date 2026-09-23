# Eco Qadam — Django REST API Architecture

Base: `/api/v1/`. JSON. JWT via `djangorestframework-simplejwt` (access + refresh).
Bot-only endpoints protected by header `HTTP_X_BOT_TOKEN`. Admin-only = `IsAdminUser`.

```
/api/v1/
├─ auth/
│  ├─ register/            POST   phone+password+name
│  ├─ login/               POST   phone+password → tokens
│  ├─ refresh/             POST   refresh token
│  ├─ telegram/verify/     POST   token (from bot link) → JWT
│  └─ me/                  GET    current profile (auth)
├─ reports/
│  ├─ /                   GET  list own | POST create (photo+location+description)
│  ├─ {id}/               GET  own detail
├─ map/                   GET  own reports w/ coordinates (light payload)
├─ balance/               GET  cached balance + totals
├─ transactions/          GET  own ledger
├─ withdrawals/
│  ├─ /                   GET own | POST create (with validations)
│  └─ {id}/               GET own
├─ notifications/         GET own | POST {id}/read
│
└─ (staff /admin/)
   ├─ stats/              GET  dashboard numbers
   ├─ reports/            GET  all (filters) | POST {id}/approve (reward) | POST {id}/reject
   ├─ withdrawals/        GET  all | POST {id}/approve | /reject | /mark-paid
   ├─ users/              GET  list | GET {id} | POST {id}/adjust-balance
   ├─ transactions/       GET  all ledger + audit
   └─ audit-log/          GET  admin action logs
```

## Security

- JWT; user scoped querysets (`get_queryset` filters by request.user)
- Users can only read their own reports / transactions / withdrawals (sensible fields)
- Reward amount set **only** via admin approval endpoint (never writable by user)
- Approved/Rejected reports immutable by the owner
- Staff-only views guarded with `IsAdminUser`
- Image upload: extension + PIL size/type validation, `MAX_UPLOAD_SIZE`
- GPS validated (±90 / ±180, accuracy cap)
- Duplicate submissions: unique `client_uid` per device + recent-duplicate guard (location+time window)
- Report creation throttled (e.g. 5/hour/user)
- Card numbers masked in all API responses
- Bot endpoint requires shared secret

## Lifecycle services

| action | mutation |
|---|---|
| approve report | report→APPROVED, reward=amount, Reward row, Transaction(REWARD, COMPLETED), user.balance+=amount, notifications (push+Telegram), audit log |
| reject report | report→REJECTED, notification, audit |
| withdraw create | validation → WithdrawalRequest PENDING, notification |
| withdrawal mark paid | status→PAID, Transaction(WITHDRAWAL, COMPLETED) negative, notification |
| withdrawal reject | status→REJECTED, notification |
| admin adjust balance | Transaction(ADJUSTMENT) + sync balance + audit log |

All wrapped in `transaction.atomic()`.