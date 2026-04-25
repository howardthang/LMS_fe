import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, UserNotification, NotificationResponse } from '../api/notificationService';
import { useAuth } from './AuthContext'; // assuming we have a useAuth hook in AuthContext

interface NotificationContextProps {
  notifications: UserNotification[];
  unreadCount: number;
  fetchNotifications: (page?: number, size?: number) => Promise<void>;
  markAsRead: (userNotificationId: number) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { userType } = useAuth(); // Only connect if user is authenticated

  const fetchNotifications = useCallback(async (page: number = 0, size: number = 20) => {
    try {
      const response = await getNotifications(page, size);
      if (response.code === 200) {
        setNotifications((prev) => {
          // If page is 0, replace, else append
          if (page === 0) return response.data.content;
          return [...prev, ...response.data.content];
        });
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      if (response.code === 200) {
        setUnreadCount(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const markAsRead = useCallback(async (userNotificationId: number) => {
    // Optimistic UI update
    setNotifications((prev) => 
      prev.map(n => n.userNotificationId === userNotificationId ? { ...n, read: true } : n)
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    
    // Call API to mark as read
    try {
      await markNotificationAsRead(userNotificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Optional: Revert optimistic UI update if API fails
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    // Fetch initial notifications and unread count
    fetchNotifications(0, 20);
    fetchUnreadCount();

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`
      },
      debug: function (str) {
        if (import.meta.env.DEV) {
          console.log(str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function (frame) {
      console.log('Connected to WebSocket:', frame);
      client.subscribe('/user/queue/notifications', (message: IMessage) => {
        if (message.body) {
          try {
            const notification: UserNotification = JSON.parse(message.body);
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            // Optionally trigger a toast here
            // toast.info(notification.title);
          } catch (e) {
            console.error('Failed to parse notification message:', e);
          }
        }
      });
    };

    client.onStompError = function (frame) {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [userType, fetchNotifications, fetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
