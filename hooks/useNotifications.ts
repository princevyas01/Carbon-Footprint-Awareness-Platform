import { useCarbon } from '../context/CarbonContext';

export function useNotifications() {
  const {
    state,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useCarbon();

  const unreadCount = state.notifications.filter((n) => !n.read).length;

  return {
    notifications: state.notifications,
    unreadCount,
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
    clearAll: clearAllNotifications,
  };
}
