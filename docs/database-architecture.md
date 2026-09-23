# Eco Qadam — Database Architecture

PostgreSQL. Concurrency-safe financial ledger: **balance is derived / guarded by a Transaction system**, the cached `balance` field on `User` is only updated inside atomic services.

## Entity diagram

```
users_User 1──< users_Profile 1..1
users_User 1──< reports_WasteReport >──1 reports_Location
                        >──< reports_WasteImage
                        >──1 rewards_Reward
users_User 1──< transactions_Transaction >──1 rewards_Reward (reward)
users_User 1──< withdrawals_WithdrawalRequest
users_User 1──< notifications_Notification
users_User 1──< rewards_AdminActionLog
```

## users_user

| field | type | notes |
|---|---|---|
| phone | varchar, unique | login identifier |
| email | varchar | nullable, unique |
| first_name / last_name | varchar | |
| telegram_id | bigint, nullable, unique | |
| telegram_username | varchar | |
| avatar | image | |
| balance | bigint | cached, guarded by transactions |
| is_active / is_staff / is_superuser | bool | |
| password | hashed | for password flow |
| date_joined | datetime | |

## users_profile

| field | type | notes |
|---|---|---|
| user | OneToOne | |
| notifications_enabled | bool | default true |
| language | varchar | uz / ru / en |

## reports_waste_report

| field | type | notes |
|---|---|---|
| user | FK | |
| waste_type | varchar | plastic / paper / glass / household / other |
| description | text | optional |
| status | varchar | PENDING / APPROVED / REJECTED |
| reward_amount | bigint | 0 default, set by admin on approval |
| client_uid | uuid | duplicate-prevention key |
| reviewed_by / reviewed_at | FK+datetime | |
| created_at / updated_at | datetime | |

## reports_location

| field | type | notes |
|---|---|---|
| report | OneToOne | |
| latitude / longitude | decimal(10,7) | validated ranges |
| address | varchar | reverse geocoded |
| accuracy | float | GPS accuracy meters |

## reports_waste_image

| field | type | notes |
|---|---|---|
| report | FK | |
| image | image | validated size/type |
| created_at | datetime | |

## rewards_reward

| field | type | notes |
|---|---|---|
| report | OneToOne | one reward per approved report |
| user | FK | denormalized |
| amount | bigint | |
| created_at | datetime | |

## transactions_transaction

| field | type | notes |
|---|---|---|
| user | FK | |
| amount | bigint | signed: +income / -expense |
| type | varchar | REWARD / WITHDRAWAL / REFUND / ADJUSTMENT |
| status | varchar | PENDING / COMPLETED / FAILED |
| reference | varchar | e.g. "report:12" / "withdrawal:5" |
| note | text | |
| created_by | FK nullable | admin for ADJUSTMENT |
| created_at | datetime | |

## withdrawals_withdrawal_request

| field | type | notes |
|---|---|---|
| user | FK | |
| amount | bigint | |
| card_number | varchar | masked in API responses |
| status | varchar | PENDING / APPROVED / PAID / REJECTED |
| processed_by / processed_at | FK+datetime | |
| created_at / updated_at | datetime | |
| unique active constraint | partial | only one PENDING+APPROVED per user |

## notifications_notification

| field | type | notes |
|---|---|---|
| user | FK | |
| type | varchar | report / reward / withdrawal / system |
| title / body | varchar/text | |
| data | JSON | |
| is_read | bool | |
| created_at | datetime | |

## rewards_admin_action_log

| field | type | notes |
|---|---|---|
| admin | FK | |
| action | varchar | e.g. "approve_report", "adjust_balance" |
| target_type / target_id | varchar+bigint | polymorphic |
| details | JSON | full audit payload |
| created_at | datetime | |