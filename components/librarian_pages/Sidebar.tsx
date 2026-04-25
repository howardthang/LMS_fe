import {
  Barcode,
  Bell,
  Book,
  BookOpen,
  Inbox,
  LayoutDashboard,
  LogOut,
  RefreshCcw,
  Settings,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Trang chủ', path: '/librarian/dashboard' },
    {
      icon: RefreshCcw,
      label: 'Quản lý mượn - trả sách',
      path: '/librarian/circulation',
    },
    { icon: Book, label: 'Đầu sách', path: '/librarian/books', badge: 842 },
    { icon: Barcode, label: 'Bản sao', path: '/librarian/copies' },
    {
      icon: Inbox,
      label: 'Yêu cầu',
      path: '/librarian/requests',
      badge: 12,
      badgeColor: 'bg-red-100 text-red-600',
    },
  ];

  const { unreadCount } = useNotifications();

  const systemItems = [
    { icon: Settings, label: 'Cài đặt', path: '/librarian/settings' },
    { icon: Bell, label: 'Thông báo', path: '/librarian/notifications', badge: unreadCount > 0 ? unreadCount : undefined, badgeColor: 'bg-red-100 text-red-600' },
  ];

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <Link
        to="/publicpage"
        className="p-6 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="bg-blue-600 p-2 rounded-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-lg leading-tight">
            SmartLibrary
          </h1>
          <p className="text-xs text-slate-500">Admin Portal</p>
        </div>
      </Link>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-6">
          <h2 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menu chính
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive(item.path) ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.badgeColor || 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Hệ thống
          </h2>
          <div className="space-y-1">
            {systemItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive(item.path) ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.badgeColor || 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-left"
            >
              <LogOut className="w-5 h-5 text-slate-400" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <img
            src="public/avatar/Avatar.JPG"
            alt="User"
            className="w-10 h-10 rounded-full border border-slate-200"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">
              Hồ Sỹ Thắng
            </p>
            <p className="text-xs text-slate-500 truncate">Librarian Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
