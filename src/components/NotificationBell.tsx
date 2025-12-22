'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notificationService } from '@/services/notification.service';
import { Notification, NotificationSummary } from '@/types';
import { useBusinessStore } from '@/store';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<NotificationSummary>({ unreadCount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentBusiness } = useBusinessStore();

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [currentBusiness?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await notificationService.getNotificationSummary(currentBusiness?.id);
      setSummary(data);
    } catch (error) {
      console.error('Error fetching notification summary:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({ page: 1, pageSize: 10 });
      setNotifications(data.items || []);
      
      // Auto-mark all as read when dropdown is opened
      if (summary.unreadCount > 0) {
        await notificationService.markAllAsRead(currentBusiness?.id);
        setSummary(prev => ({ ...prev, unreadCount: 0 }));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setSummary(prev => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(currentBusiness?.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setSummary(prev => ({ ...prev, unreadCount: 0 }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.referenceType === 'ChangeRequest' && notification.referenceId) {
      router.push(`/dashboard/change-requests?id=${notification.referenceId}`);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ChangeRequestCreated':
        return <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
          <Bell className="w-4 h-4 text-yellow-600" />
        </div>;
      case 'ChangeRequestApproved':
        return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-green-600" />
        </div>;
      case 'ChangeRequestRejected':
        return <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <X className="w-4 h-4 text-red-600" />
        </div>;
      default:
        return <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Bell className="w-4 h-4 text-blue-600" />
        </div>;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {summary.unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
            {summary.unreadCount > 9 ? '9+' : summary.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border z-50 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {summary.unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="h-10 w-10 mb-2 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t bg-gray-50 rounded-b-lg">
            <button
              onClick={() => {
                router.push('/dashboard/change-requests');
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all change requests
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
