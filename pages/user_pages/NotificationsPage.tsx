import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({
  type,
  title,
  message,
  time,
  actionText,
  actionLink,
  isRead,
}: any) => {
  const styles: any = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      icon: AlertTriangle,
    },
    success: {
      bg: 'bg-white',
      border: 'border-gray-100', // Green border usually for specific emphasis, but design implies clean look
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      icon: CheckCircle,
    },
    info: {
      bg: 'bg-white',
      border: 'border-gray-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      icon: Info,
    },
    warning: {
      bg: 'bg-white',
      border: 'border-gray-100',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      icon: Bell,
    },
  };

  const style = styles[type] || styles.info;
  const Icon = style.icon;

  const currentBg = !isRead ? 'bg-blue-100 border-blue-100' : `${style.bg} ${style.border}`;

  return (
    <div
      className={`relative p-6 rounded-xl border ${currentBg} flex flex-col sm:flex-row gap-4 hover:shadow-md transition-all cursor-pointer`}
    >
      {!isRead && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm animate-pulse"></span>
      )}
      <div
        className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon size={24} className={style.iconColor} />
      </div>
      <div className="flex-grow">
        <h4 className="text-lg font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm mb-3 leading-relaxed">{message}</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center text-xs text-gray-500 font-medium">
            <Clock size={14} className="mr-1" /> {time}
          </span>
          {actionText && (
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline">
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notif: any) => {
    // 1. Đánh dấu đã đọc
    if (!notif.read) markAsRead(notif.userNotificationId);

    // 2. Chuyển hướng theo link có sẵn (nếu có)
    if (notif.link) {
      window.location.href = notif.link;
      return;
    }

    // 3. Tự động điều hướng theo type
    if (notif.type.includes('BORROW') || notif.type.includes('OVERDUE') || notif.type.includes('RETURN')) {
      const highlight = notif.referenceId ? `?highlight=${notif.referenceId}` : '';
      navigate(`/userpage/my-books${highlight}`);
    } else if (notif.type === 'FINE_ISSUED') {
      navigate(`/userpage/fines`);
    } else if (notif.type.includes('BOOK')) {
      navigate(`/userpage/reservations`);
    }
  };

  // Helper to map API notification types to UI styles
  const mapTypeToStyle = (type: string) => {
    switch (type) {
      case 'BORROW_SUCCESS':
      case 'BOOK_AVAILABLE':
      case 'BOOK_RESERVED':
        return 'success';
      case 'BORROW_CANCELLED_EXPIRED':
      case 'FINE_ISSUED':
        return 'critical';
      case 'OVERDUE_WARNING':
      case 'RETURN_REMINDER':
        return 'warning';
      case 'SYSTEM_MAINTENANCE':
      default:
        return 'info';
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Thông báo & Nhắc nhở
          </h1>
          <p className="text-gray-500 text-sm">Cập nhật quan trọng cho bạn</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            Đánh dấu tất cả là đã đọc
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchNotifications(0, 20)}>
            Làm mới
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Bạn chưa có thông báo nào.
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.userNotificationId} onClick={() => handleNotificationClick(notif)} className="transform transition-transform active:scale-[0.99]">
              <NotificationItem
                type={mapTypeToStyle(notif.type)}
                title={notif.title}
                message={notif.message}
                time={formatDistanceToNow(new Date(notif.receivedAt), { addSuffix: true, locale: vi })}
                actionText={notif.link ? "Xem chi tiết" : null}
                actionLink={notif.link}
                isRead={notif.read}
              />
            </div>
          ))
        )}
      </div>

      {notifications.length >= 20 && (
        <div className="text-center pt-8">
          <Button variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => fetchNotifications(1, 20)}>
            Tải thêm thông báo <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
