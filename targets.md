# Ambit — Tomorrow's Target (July 20)

## 💳 RevenueCat Paywall & Monitization Demo
Completing this target will implement the monetization flow and push Hackathon MVP progress from **85.7%** to **94.2%** (33/35 features).

### Tasks:
- [ ] **SDK Configuration**: Setup `react-native-purchases` mock Sandbox credentials.
- [ ] **Premium UI Design**: Build a glassmorphic paywall screen for Society Admins showing the `Pro Society Plan - ₹1,499/mo`.
- [ ] **1-Tap Purchase**: Wire up button to run sandbox purchase, trigger a confetti animation on success, and update the society status to **"PRO GOLD"** dynamically.

## 🔔 Push Notifications Integration
Establish instant notification alerts for critical gate events.

### Tasks:
- [ ] **SDK Setup**: Wire up permissions requests for `expo-notifications` on initial app launch.
- [ ] **Background Triggers**: Implement local push notification alerts (e.g., alert residents instantly when a guard approves/declines a guest entry, notify guards on SOS panic actions).
- [ ] **Foreground Handlers**: Setup listeners to show clean inside-app banners when notifications arrive while active in the app.
