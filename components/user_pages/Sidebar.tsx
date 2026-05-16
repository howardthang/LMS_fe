import {
  Bell,
  Book,
  BookOpen,
  Clock,
  DollarSign,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import usersService, { UserProfileResponse } from '../../api/usersService';
import { useNotifications } from '../../contexts/NotificationContext';
import { getMyReservations } from '../../api/reservationService';
import transactionsService from '../../api/transactionsService';
import { Footer } from '../public_pages/Layout';

const publicNavItems = [
  { label: 'Trang chủ', to: '/publicpage' },
  { label: 'Tìm kiếm', to: '/publicpage/search' },
  { label: 'Danh mục', to: '/publicpage/categories' },
  { label: 'Giới thiệu', to: '/publicpage/about' },
  { label: 'Liên hệ', to: '/publicpage/contact' },
];

const SidebarItem = ({ to, icon: Icon, label, active, count }: any) => (
  <Link
    to={to}
    className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <div className="flex items-center">
      <Icon
        size={20}
        className={`mr-3 ${active ? 'text-white' : 'text-gray-500'}`}
      />
      {label}
    </div>
    {count !== undefined && count > 0 && (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}
      >
        {count}
      </span>
    )}
  </Link>
);

export const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const [profile, setProfile] = useState<UserProfileResponse['data'] | null>(null);
  const [pendingReservations, setPendingReservations] = useState(0);
  const [activeBorrows, setActiveBorrows] = useState(0);
  const { unreadCount } = useNotifications();
  const isPublicBrowsing = location.pathname.startsWith('/publicpage');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersService.getMyProfile();
        if (res && res.data) setProfile(res.data);
      } catch {}
    };
    const fetchCounts = async () => {
      try {
        const [resData, txData] = await Promise.all([
          getMyReservations(0, 50),
          transactionsService.getMyTransactions(0, 50),
        ]);
        setPendingReservations(
          resData.content.filter(r => r.status === 'PENDING' || r.status === 'READY_FOR_PICKUP').length
        );
        setActiveBorrows(
          txData.data.content.filter(
            (t: any) => t.status === 'BORROWING' || t.status === 'OVERDUE' || t.status === 'WAITING_FOR_PICKUP'
          ).length
        );
      } catch {}
    };
    fetchProfile();
    fetchCounts();
  }, []);

  const isActive = (path: string) => location.pathname.includes(path);

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:sticky top-0 h-screen left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col
        ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }
      `}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <Link to="/userpage/dashboard" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white mr-2">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">
                SmartLibrary
              </h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">
                AI-Powered
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-grow p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-2">
            Tổng quan
          </div>
          <SidebarItem
            to="/userpage/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active={isActive('/dashboard')}
          />
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
            Quản lý cá nhân
          </div>
          <SidebarItem
            to="/userpage/my-books"
            icon={Book}
            label="Sách đang mượn"
            count={activeBorrows || undefined}
            active={isActive('/my-books')}
          />
          <SidebarItem
            to="/userpage/reservations"
            icon={Clock}
            label="Đặt trước"
            count={pendingReservations || undefined}
            active={isActive('/reservations')}
          />
          <SidebarItem
            to="/userpage/wishlist"
            icon={Heart}
            label="Yêu thích"
            count={8}
            active={isActive('/wishlist')}
          />
          <SidebarItem
            to="/userpage/fines"
            icon={DollarSign}
            label="Phí phạt"
            active={isActive('/fines')}
          />
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-2">
            Cài đặt
          </div>
          <SidebarItem
            to="/userpage/profile"
            icon={User}
            label="Thông tin cá nhân"
            active={isActive('/profile')}
          />
          <SidebarItem
            to="/userpage/settings"
            icon={Settings}
            label="Cài đặt"
            active={isActive('/settings')}
          />
        </div>

        {/* User Mini Profile in Sidebar - Above Settings */}
        <div className="p-4 border-t border-gray-200 mt-6">
          <div className="flex items-center mb-3">
            {profile?.profilePictureUrl ? (
              <img
                src={profile.profilePictureUrl}
                alt="User"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                <User size={20} className="text-gray-500" />
              </div>
            )}
            <div className="ml-3 overflow-hidden flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.fullName || 'Đang tải...'}
              </p>
              <p className="text-xs text-gray-500 truncate">2213188</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header for public navigation and notifications */}
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm relative">
          <div className="flex items-center min-w-0 z-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-2"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold text-gray-800 xl:hidden">
              SmartLibrary
            </h2>
          </div>

          <nav className="hidden xl:flex items-center justify-center gap-8 absolute left-1/2 -translate-x-1/2">
            {publicNavItems.map(item => {
              const active = item.to === '/publicpage'
                ? location.pathname === item.to
                : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
              return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-semibold transition-colors ${
                  active
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-4 z-10">
            <Link
              to="/userpage/notifications"
              className="p-2 text-gray-400 hover:text-gray-600 relative rounded-full hover:bg-gray-100 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[1.25rem] h-5 px-1 bg-red-500 rounded-full border-2 border-white text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto ${isPublicBrowsing ? 'p-0' : 'p-4 lg:p-8'}`}>
          {children}
          {isPublicBrowsing && <Footer />}
        </main>
      </div>
    </div>
  );
};
