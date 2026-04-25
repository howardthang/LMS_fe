import React from 'react';
import { Bell, Info, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const Notifications = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="text-blue-500" size={24} />;
      case 'warning': return <AlertCircle className="text-orange-500" size={24} />;
      case 'success': return <CheckCircle className="text-green-500" size={24} />;
      case 'error': return <AlertCircle className="text-red-500" size={24} />;
      default: return <Bell className="text-slate-500" size={24} />;
    }
  };

  const getBgColor = (type: string) => {
     switch (type) {
      case 'info': return 'bg-blue-50';
      case 'warning': return 'bg-orange-50';
      case 'success': return 'bg-green-50';
      case 'error': return 'bg-red-50';
      default: return 'bg-blue-50';
    }
  };

  const mapTypeToIconType = (type: string) => {
    switch (type) {
      case 'BORROW_SUCCESS':
      case 'BOOK_AVAILABLE':
      case 'BOOK_RESERVED':
        return 'success';
      case 'BORROW_CANCELLED_EXPIRED':
      case 'FINE_ISSUED':
        return 'error';
      case 'OVERDUE_WARNING':
      case 'RETURN_REMINDER':
        return 'warning';
      case 'SYSTEM_MAINTENANCE':
      default:
        return 'info';
    }
  };
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thông báo</h1>
          <p className="text-slate-500">Cập nhật tin tức và cảnh báo từ hệ thống</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            className="text-sm text-blue-600 font-medium hover:underline" 
            onClick={() => markAllAsRead()}
          >
            Đánh dấu tất cả là đã đọc
          </button>
          <button 
            className="text-sm text-slate-500 font-medium hover:text-slate-700 hover:underline" 
            onClick={() => fetchNotifications(0, 20)}
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Bạn chưa có thông báo nào.
          </div>
        ) : (
          notifications.map((notif) => {
            const iconType = mapTypeToIconType(notif.type);
            return (
              <div 
                key={notif.userNotificationId} 
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif.userNotificationId);
                }}
                className={`p-4 rounded-xl border ${notif.isRead ? 'bg-white border-slate-200' : 'bg-blue-50/50 border-blue-200 shadow-sm'} flex gap-4 transition-all hover:shadow-md cursor-pointer`}
              >
                <div className={`w-12 h-12 rounded-full ${getBgColor(iconType)} flex items-center justify-center flex-shrink-0`}>
                  {getIcon(iconType)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>}
                  </div>
                  <p className="text-slate-600 text-sm mt-1">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Clock size={12} /> {formatDistanceToNow(new Date(notif.receivedAt), { addSuffix: true, locale: vi })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {notifications.length >= 20 && (
        <div className="mt-8 text-center">
          <button className="px-6 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 text-sm" onClick={() => fetchNotifications(1, 20)}>
            Tải thêm thông báo cũ
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
