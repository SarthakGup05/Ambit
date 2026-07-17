# Portl — Master Build Prompt (PRD + Design System)

> Use this as the master prompt/brief for building Portl. Feed it to Claude Code (or any dev agent) to scaffold the project, or use it as the living PRD/design reference for yourself.

---

## 1. Product Summary

**Portl** is a mobile-first society management app that replaces gate calls, WhatsApp groups, and paper registers with one seamless mobile experience. It serves three roles — **Resident**, **Security Guard**, **Society Admin** — each with their own dashboard, permissions, and workflows.

Built as a genuine **multi-tenant SaaS platform**: any apartment community can sign up independently (their own admin, residents, guards, data — fully isolated), not a single-society hardcoded demo.

**Positioning for judges:** product-thinking over feature-count. One flawless real-time flow (visitor approval) + one memorable differentiator (QR guest passes designed like a physical boarding pass) beats eleven half-finished modules.

---

## 2. Tech Stack (final)

| Layer | Choice |
|---|---|
| Mobile app | Expo + React Native + TypeScript |
| Styling | NativeWind (Tailwind for RN) |
| State management | Zustand |
| Backend | Node.js + Express + TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Auth | better-auth + `@better-auth/drizzle-adapter` + `@better-auth/expo` (email/password only — skip OAuth for demo scope) |
| Realtime | Socket.io |
| Push notifications | Expo push notification service |
| Payments | Razorpay (maintenance dues + "Upgrade to Pro" plan) — **not** RevenueCat (RevenueCat is for consumer IAP subscriptions; this app needs a direct payment gateway for both resident-to-society dues and B2B plan upgrades) |
| QR scanning | `expo-camera` / `expo-barcode-scanner` |
| Haptics | `expo-haptics` |
| Animation | `react-native-reanimated` |
| Icons | `lucide-react-native` |
| Fonts | `expo-google-fonts` (Manrope + Inter) |
| Backend hosting | Railway or Render |
| Build | EAS (development build required — native modules like Razorpay SDK and camera don't run in Expo Go) |

**Architecture note:** Backend is fully separate from the Expo app — the app only talks to the Express REST API + Socket.io connection. No direct DB access from the client.

---

## 3. Multi-Tenancy / SaaS Requirements (non-negotiable, build in from day 1)

- Every non-global table carries a `society_id` foreign key: users, visitors, guest_passes, notices, polls, complaints, amenities, bookings, staff.
- Express middleware resolves `society_id` from the authenticated session and scopes every query — no cross-society data leakage.
- **Onboarding flow (real, not seeded):**
  - Admin signs up → creates a society (name, address, tower/flat structure) → gets an invite code/link
  - Resident signs up → enters invite code or scans admin-generated QR → joins society → selects flat
  - Guard is invited directly by admin, assigned to a gate/entrance
- **Settings/Account area:** profile, society settings (admin only), notification preferences, a simple **Plans screen** (Starter free / Pro paid) with a Razorpay-linked "Upgrade" button.
- App icon + splash screen customized (not Expo defaults).
- Stub Terms/Privacy screens.
- Version number visible in settings.

---

## 4. User Roles & Core Features

### Resident
- Approve/deny visitor requests (real-time push)
- Pre-approve guests via QR pass (with expiry window, single-use validation)
- Approve delivery/cab/service staff requests
- View visitor history
- View notices, vote in polls
- Raise + track helpdesk complaints
- Book amenities
- Pay maintenance dues (Razorpay)
- Manage profile/notification settings

### Security Guard
- Register visitor entry requests
- Search residents/flats
- Scan QR guest passes → instant validate (signed token, expiry check, single-use)
- Verify approvals, mark entry/exit
- View real-time visitor log
- Staff/service provider directory lookup

### Society Admin
- Create/manage society, towers, flats, residents, staff
- Manage amenities, notices, polls, complaints
- Oversee visitor logs across the society
- Manage Plans/billing at the society level
- Central dashboard view across all modules

---

## 5. Signature Differentiator: QR Guest Pass Flow

- Resident pre-approves a guest (name, time window, optional photo) → backend issues a **signed, single-use token** (short expiry) → app renders it as a QR code styled like a physical boarding pass (notched side cutouts, dashed divider, perforated edge — built with `react-native-svg`)
- Shareable via link/WhatsApp, no app required for the guest
- Guard scans → hits `/guest-passes/verify` → instant green (approved + auto-logs entry) or red (invalid/expired) screen
- Optional stretch: guard can request a 30-min extension push if guest is running late

---

## 6. Design System

### Direction
"Calm concierge" — warm, premium, residential trust. Deliberately avoiding generic clichés: no cream-background-serif-terracotta combo, no neon-on-black tech look, no broadsheet/hairline-rule layout.

### Color tokens
| Token | Hex | Use |
|---|---|---|
| Background | `#FAF8F5` | App background |
| Surface | `#FFFFFF` | Cards |
| Primary | `#2B2E4A` | Buttons, headers, active states |
| Accent (positive) | `#7A9B76` | Approved, success |
| Alert (negative) | `#C1584B` | Denied, overdue, destructive actions |
| Text primary | `#1C1B1F` | Headings |
| Text secondary | `#6B6873` | Body/secondary text |

### Typography
- Display/headings: **Manrope**
- Body/data-dense (tables, logs, amounts): **Inter**, tabular numbers for anything numeric

### Layout
- Card radius: 16px
- Button radius: 12px
- Status badges: pill (999px radius)
- One consistent soft shadow only: `shadowOpacity: 0.06, shadowRadius: 12`

### Component kit (build before any screen)
`Button`, `Card`, `StatusBadge` (approved/pending/denied), `Avatar`, `EmptyState`, `ListRow` — reused everywhere for consistency.

### Micro-interaction details
- Haptic feedback on approve/deny/scan success
- Pressable scale-down (0.97) on press via Reanimated, not flat opacity
- Skeleton loaders instead of spinners
- Realistic seed data (real-sounding names/times, never "Test User 1")

### Signature element
The QR guest pass screen — the one place extra design effort goes; everything else stays quiet and disciplined around it.

---

## 7. Non-Functional Requirements
- Loading, empty, and error states on every screen — no dead-ends
- Real-time visitor approval must feel instant (this is the core demo moment)
- Push notification delivery tested early and across multiple physical devices — highest-risk live-demo failure point
- Payment verification (Razorpay) must be verified server-side via signature check — never trust client-side success callback alone
- Offline/poor-connectivity handling at the gate is a nice-to-have, not required for MVP scope

---

## 8. 12-Day Build Roadmap
- **Day 1–2:** Drizzle schema + migrations, better-auth + Drizzle adapter wiring, Express role middleware, deploy skeleton to Railway/Render immediately
- **Day 3:** Expo app auth + role-based navigation wiring
- **Day 4–5:** Real-time visitor approval flow (register → push → approve/deny → live status)
- **Day 6–7:** QR guest pass system (signed token issuance, boarding-pass UI, guard scan/verify)
- **Day 8:** Delivery/service staff approvals (reuse approval engine) + Razorpay integration (maintenance dues + Plans upgrade)
- **Day 9:** Notices + Polls
- **Day 10:** Helpdesk + Amenity booking
- **Day 11:** Admin dashboard + staff directory
- **Day 12:** Polish, empty/error states, seed data, demo video, README, EAS build, buffer

---

## 9. Submission Checklist
- [ ] Public GitHub repo
- [ ] Expo project / APK (EAS build)
- [ ] Demo video (lead with QR pass flow, then live visitor approval, then quick tour)
- [ ] README with setup instructions
- [ ] Screenshots
- [ ] Demo credentials for all 3 roles
