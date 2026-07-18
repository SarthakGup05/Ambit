export const routes = {
  auth: {
    login: '/(auth)/login',
  },
  resident: {
    home: '/(resident)/(tabs)',
    bookings: '/(resident)/(tabs)/bookings',
    complaints: '/(resident)/(tabs)/complaints',
    notices: '/(resident)/(tabs)/notices',
    more: '/(resident)/(tabs)/more',
  },
  guard: {
    dashboard: '/(guard)/(tabs)',
    visitors: '/(guard)/(tabs)/visitors',
    logs: '/(guard)/(tabs)/logs',
    profile: '/(guard)/(tabs)/profile',
  },
  admin: {
    dashboard: '/(admin)/(tabs)',
    residents: '/(admin)/(tabs)/residents',
    more: '/(admin)/(tabs)/more',
  },
};
