import {
  Bell,
  UserCheck,
  Package,
  FileText,
  Megaphone,
  Calendar,
  BarChart2,
  Shield,
} from 'lucide-react-native';

type NotificationRoute =
  | '/(resident)/(tabs)/visitors'
  | '/(resident)/preapprove-guest'
  | '/(resident)/(tabs)/complaints'
  | '/(resident)/(tabs)/notices'
  | '/(resident)/(tabs)/bookings'
  | '/(resident)/polls'
  | null;

interface NotificationMeta {
  Icon: any;
  iconColor: string;
  bgColor: string;
  category: 'Requests' | 'Updates' | 'Others';
  route: NotificationRoute;
}

export function getNotificationMeta(title: string): NotificationMeta {
  const t = title.toLowerCase();

  if (t.includes('visitor') || t.includes('approval') || t.includes('request')) {
    return {
      Icon: UserCheck,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      category: 'Requests',
      route: '/(resident)/(tabs)/visitors',
    };
  }
  if (t.includes('pre-approved') || t.includes('guest')) {
    return {
      Icon: Package,
      iconColor: '#B57A2B',
      bgColor: '#FCF3E8',
      category: 'Updates',
      route: '/(resident)/preapprove-guest',
    };
  }
  if (t.includes('complaint')) {
    return {
      Icon: FileText,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      category: 'Updates',
      route: '/(resident)/(tabs)/complaints',
    };
  }
  if (t.includes('notice') || t.includes('society') || t.includes('water supply')) {
    return {
      Icon: Megaphone,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      category: 'Updates',
      route: '/(resident)/(tabs)/notices',
    };
  }
  if (t.includes('booking') || t.includes('amenity') || t.includes('confirmed')) {
    return {
      Icon: Calendar,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      category: 'Updates',
      route: '/(resident)/(tabs)/bookings',
    };
  }
  if (t.includes('poll')) {
    return {
      Icon: BarChart2,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      category: 'Updates',
      route: '/(resident)/polls',
    };
  }
  if (t.includes('entry') || t.includes('log') || t.includes('exited')) {
    return {
      Icon: Shield,
      iconColor: '#B57A2B',
      bgColor: '#FCF3E8',
      category: 'Others',
      route: null,
    };
  }
  return {
    Icon: Bell,
    iconColor: '#2E7D32',
    bgColor: '#EAF0E8',
    category: 'Others',
    route: null,
  };
}

export function formatNotificationTime(dateStr: string): string {
  const date = new Date(dateStr);
  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (date.toDateString() === todayStr) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (date.toDateString() === yesterdayStr) {
    return 'Yesterday';
  }
  return 'Yesterday';
}
