# Ambit Product Requirements Checklist (PRD)

This is the living PRD checklist for the Ambit Multi-Tenant SaaS platform.

## 🏢 Multi-Tenancy & SaaS Architecture
- [ ] Database isolation using `society_id` on all non-global tables:
  - [ ] `users` scoped to a society
  - [ ] `visitors` scoped to a society
  - [ ] `guest_passes` scoped to a society
  - [ ] `notices` scoped to a society
  - [ ] `polls` scoped to a society
  - [ ] `complaints` scoped to a society
  - [ ] `amenities` scoped to a society
  - [ ] `bookings` scoped to a society
- [ ] Express middleware to resolve `society_id` from auth context and scope all database queries automatically.
- [ ] Multi-tenant Onboarding Flow:
  - [ ] **Admin Onboarding**: Admin registers → creates a society (name, address, flat/tower structure) → generates unique invite code.
  - [ ] **Resident Onboarding**: Resident registers → enters/scans society invite code → joins society → selects flat number.
  - [ ] **Guard Onboarding**: Guard invited by admin → assigned to gate.
- [ ] Society Plans & Upgrades:
  - [ ] Billing screen at society level (Starter Free vs. Pro Paid).
  - [ ] Razorpay integration to process plan upgrade.

## 👥 User Roles & Features

### 1. Resident Dashboard & Features
- [ ] Real-time visitor approval (Push/Socket alert prompts to approve/deny).
- [ ] QR Guest Pass generation (signed token, custom boarding pass UI).
- [ ] Cab/Delivery/Service staff pre-approvals.
- [ ] Historical visitor entry log.
- [ ] Bulletins: view notices and vote in society polls.
- [ ] Helpdesk: raise, track, and close maintenance/security complaints.
- [ ] Amenity Bookings: reserve society resources (clubhouse, pool, court) with capacity checks.
- [ ] Maintenance Dues: pay monthly bills via Razorpay gateway.

### 2. Security Guard Dashboard & Features
- [ ] Log visitor entry requests (search flat, enter visitor name, phone, purpose).
- [ ] Resident & Flat directory search.
- [ ] QR Pass scanner: scan resident guest pass, hit `/guest-passes/verify`, validate token, auto-log entry.
- [ ] Verify manual visitor approvals and mark entries/exits.
- [ ] Real-time guard visitor entry log.
- [ ] Service provider check-in lookup.

### 3. Society Admin Dashboard & Features
- [ ] Central dashboard analytics (active visitors, billing status, amenity use).
- [ ] Flat and Tower configuration editor.
- [ ] Manage members (approve residents, configure guards).
- [ ] Manage bulletins (post notices, create polls).
- [ ] Manage amenities (define booking capacities, hours).
- [ ] Review society-wide visitor histories.

## 🎟️ Signature Feature: QR Guest Boarding Pass
- [ ] Resident pre-approves guest → generates a cryptographically signed, single-use token with short expiration.
- [ ] Custom Boarding Pass UI built with SVG (notches, dashed lines, perforated ticket style).
- [ ] Pass shareable via link or WhatsApp without requiring the guest to download the app.
- [ ] Verification endpoint `/guest-passes/verify` validating token signatures, timestamps, and single-use flags.

## 💳 Payment Gateway (Razorpay)
- [ ] Frontend Razorpay integration for:
  - [ ] Resident monthly maintenance dues.
  - [ ] B2B Admin Plan upgrades (Starter to Pro).
- [ ] Server-side signature validation of payment responses prior to updating transaction states.

## ⚡ Non-Functional & Quality Requirements
- [ ] Push notifications: configure Expo push token registry.
- [ ] Socket.io integration: establish instant event propagation for gate check-ins.
- [ ] Haptic feedback: integrate light impacts on approvals/successes.
- [ ] Skeleton loaders on all async screens.
- [ ] Empty state fallback screens.
- [ ] Version tagging and terms of service stubs.
