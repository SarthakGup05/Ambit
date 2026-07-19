# Ambit — Hackathon MVP Product Requirements (Target: July 25)

**Hackathon MVP Progress: 85.7% Complete (30/35 features implemented)**

This is the living Hackathon MVP checklist for the Ambit Multi-Tenant SaaS platform.

## 🏢 Multi-Tenancy & SaaS Architecture
- [x] Database isolation using `society_id` on all non-global tables:
  - [x] `users` scoped to a society
  - [x] `visitors` scoped to a society
  - [x] `guest_passes` scoped to a society
  - [x] `notices` scoped to a society
  - [x] `polls` scoped to a society
  - [x] `complaints` scoped to a society
  - [x] `amenities` scoped to a society
  - [x] `bookings` scoped to a society
- [x] Express middleware to resolve `society_id` from auth context and scope all database queries automatically.
- [x] Multi-tenant Onboarding Flow:
  - [x] **Admin Onboarding**: Admin registers → creates a society → generates unique invite code.
  - [x] **Resident Onboarding**: Resident registers → enters society invite code → joins society.
  - [x] **Guard Onboarding**: Guard invited by admin → assigned to gate via invite code.

## 🏆 Hackathon Core MVP Demos (July 19 – July 25)

### 1. 🎟️ Signature Feature: QR Guest Boarding Pass
- [x] Resident pre-approves guest → generates a cryptographically signed QR token.
- [x] Custom Boarding Pass UI built with SVG (notches, dashed lines, perforated ticket style, brand logo in center).
- [x] Native Share via WhatsApp / Copy Link without requiring guest app download (shares high-contrast JPG).
- [x] Guard App Camera QR Scanner + `/guest-passes/verify` API with instant green "ACCESS GRANTED" UI.

### 2. 💳 RevenueCat In-App Purchase Paywall (Sandbox Demo)
- [ ] Integrated `react-native-purchases` SDK with Sandbox / Test Key configuration.
- [ ] Glassmorphic Admin Paywall screen (`Pro Society Plan - ₹1,499/mo`).
- [ ] 1-Tap Purchase Demo → Triggers confetti animation & upgrades society to **"PRO GOLD"** badge.

### 3. 🚨 Instant Emergency SOS Guard Alarm
- [ ] Resident App floating **SOS Panic Button**.
- [ ] Guard App full-screen red flashing alert with siren sound & location.

### 4. 👥 Resident & Admin Features
- [x] Bulletins: view notices and vote in society polls (real-time votes, progress rings, vote overrides, suggest poll modal).
- [x] Helpdesk: raise, track, and close maintenance/security complaints.
- [x] Notifications: elevation cards, read/unread states, bold headings.
- [x] Admin Member Management: approve residents & configure guards.
- [x] Admin Bulletin & Poll Management: create and delete polls API endpoints.
- [x] Society Admin Invite Code Display: Clipboard copy & native Share sheet.

## ⚡ Performance & Quality Requirements
- [x] 60FPS Smooth Transitions: deferred state hydration using `InteractionManager.runAfterInteractions`.
- [x] Custom Skeleton Loaders on all async screens (notifications, polls, settings, complaints).
- [x] Haptic feedback integration on button presses and actions.
- [x] Brand Logo (`ambit_logo.png`) integration across splash, welcome screen, icons, and headers.
- [x] Cinematic Splash Screen Zoom-In Exit transition.
- [x] Removed social buttons from Login & Register for clean authentication flow.
