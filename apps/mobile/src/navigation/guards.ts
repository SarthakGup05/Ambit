// Navigation Role guards and redirect logic
export function getHomeRoute(role: 'resident' | 'guard' | 'admin'): string {
  switch (role) {
    case 'resident': return '/(resident)/home';
    case 'guard': return '/(guard)/scanner';
    case 'admin': return '/(admin)/dashboard';
    default: return '/';
  }
}
