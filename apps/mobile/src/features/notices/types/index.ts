export interface Notice {
  id: string;
  category: 'Maintenance' | 'Society' | 'Events' | 'Security';
  title: string;
  description: string;
  content: string;
  tag: string;
  time: string;
  date: string;
  author: string;
  tagBg: string;
  tagBorder: string;
  tagText: string;
  iconName: 'megaphone' | 'shield-check' | 'calendar' | 'alert-triangle';
  iconColor: string;
  isUrgent?: boolean;
  isRead?: boolean;
}
