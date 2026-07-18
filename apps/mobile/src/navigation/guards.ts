// Navigation Role guards and redirect logic
export function getHomeRoute(role: 'resident' | 'guard' | 'admin'): string {
  switch (role) {
    case 'resident':
      return '/(resident)/(tabs)';
    case 'guard':
      return '/(guard)/(tabs)';
    case 'admin':
      return '/(admin)/(tabs)';
    default:
      return '/';
  }
}
