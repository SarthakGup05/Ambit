import { api } from '@/lib/axios';
import { Notice } from '@/features/notices/types';

export class NoticeService {
  /**
   * 📢 Fetch all notices from the backend
   */
  static async getNotices(): Promise<Notice[]> {
    const response = await api.get('/api/notices');
    const rawNotices = response.data?.notices || [];

    // Map raw backend notices to the frontend Notice interface
    return rawNotices.map((n: any) => {
      // Determine styling based on category
      let tagBg, tagBorder, tagText, iconName, iconColor, tag;

      switch (n.category) {
        case 'Society':
          tagBg = 'rgba(46, 125, 50, 0.08)';
          tagBorder = 'rgba(46, 125, 50, 0.25)';
          tagText = '#2E7D32';
          iconName = 'shield-check';
          iconColor = '#2E7D32';
          tag = 'Official';
          break;
        case 'Events':
          tagBg = 'rgba(14, 116, 144, 0.08)';
          tagBorder = 'rgba(14, 116, 144, 0.25)';
          tagText = '#0E7490';
          iconName = 'calendar';
          iconColor = '#0E7490';
          tag = 'Event';
          break;
        case 'Security':
          tagBg = 'rgba(239, 68, 68, 0.08)';
          tagBorder = 'rgba(239, 68, 68, 0.25)';
          tagText = '#DC2626';
          iconName = 'alert-triangle';
          iconColor = '#DC2626';
          tag = 'Security Alert';
          break;
        case 'Maintenance':
        default:
          tagBg = 'rgba(245, 158, 11, 0.08)';
          tagBorder = 'rgba(245, 158, 11, 0.25)';
          tagText = '#B45309';
          iconName = 'megaphone';
          iconColor = '#B45309';
          tag = 'Announcement';
          break;
      }

      // Format date and time safely
      const dateObj = new Date(n.createdAt);
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      const timeStr = 'Recently'; // Could use a timeago library, but 'Recently' works as a fallback

      return {
        id: n.id,
        category: n.category,
        title: n.title,
        description: n.description,
        content: n.content,
        tag,
        time: timeStr,
        date: formattedDate,
        author: 'Society Admin', // Can be fetched from authorId relation if available
        tagBg,
        tagBorder,
        tagText,
        iconName,
        iconColor,
        isUrgent: !!n.isUrgent,
        isRead: false, // You could manage this state locally or via API later
      } as Notice;
    });
  }
}
