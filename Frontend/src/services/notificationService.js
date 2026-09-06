import { apiClient, USE_MOCKS, mockDelay } from './api.js';
import { mockAlerts } from '../data/mockData.js';

let notifications = [...mockAlerts];

function sorted() {
  return [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

async function getRecentAlerts(limit = 5) {
  if (USE_MOCKS) return mockDelay(sorted().slice(0, limit));
  return apiClient.get(`/notifications?sort=-timestamp&limit=${limit}`);
}

async function getNotifications() {
  if (USE_MOCKS) return mockDelay(sorted());
  return apiClient.get('/notifications'); // GET /notifications
}

async function getUnreadCount() {
  if (USE_MOCKS) return mockDelay(notifications.filter((n) => !n.read).length);
  const all = await apiClient.get('/notifications?read=false');
  return all.length;
}

async function markAsRead(id) {
  if (USE_MOCKS) {
    notifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    return mockDelay(true, 200);
  }
  return apiClient.patch(`/notifications/${id}`, { read: true });
}

async function markAllAsRead() {
  if (USE_MOCKS) {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return mockDelay(true, 300);
  }
  return apiClient.patch('/notifications/mark-all-read', {});
}

export const notificationService = { getRecentAlerts, getNotifications, getUnreadCount, markAsRead, markAllAsRead };
