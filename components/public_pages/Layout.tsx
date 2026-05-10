import { Bell, BookOpen, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { useAuth } from '../../contexts/AuthContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userType } = useAuth();
  const isAuthenticated = !!userType;

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-blue-600 font-semibold'
      : 'text-gray-600 hover:text-blue-600';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/publicpage" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white mr-2">
                <BookOpen size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-none">
                  SmartLibrary
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                  AI-Powered Discovery
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/publicpage" className={isActive('/publicpage')}>
              Trang chủ
            </Link>
            <Link
              to="/publicpage/search"
              className={isActive('/publicpage/search')}
            >
              Tìm kiếm
            </Link>
            <Link
              to="/publicpage/about"
              className={isActive('/publicpage/about')}
            >
              Giới thiệu
            </Link>
            <Link
              to="/publicpage/categories"
              className={isActive('/publicpage/categories')}
            >
              Danh mục
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <button
                onClick={() => navigate('/userpage/notifications')}
                className="p-2 text-gray-400 hover:text-gray-600 relative"
              >
                <Bell size={20} />
              </button>
            )}
            <div className="h-6 w-px bg-gray-300"></div>
            {isAuthenticated ? (
              <Link to={userType === 'librarian' ? '/librarian/dashboard' : '/userpage/dashboard'}>
                <Button size="sm">Vào Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/publicpage/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/publicpage/register">
                  <Button size="sm">Đăng ký</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/publicpage"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-50"
            >
              Trang chủ
            </Link>
            <Link
              to="/publicpage/search"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50"
            >
              Tìm kiếm
            </Link>
            {isAuthenticated ? (
              <Link
                to={userType === 'librarian' ? '/librarian/dashboard' : '/userpage/dashboard'}
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
              >
                Vào Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/publicpage/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/publicpage/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold">SmartLibrary</h3>
                <p className="text-[10px] text-gray-400 uppercase">
                  AI-Powered Discovery
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Hệ thống quản lý thư viện thông minh với công nghệ AI, giúp sinh
              viên tìm kiếm và khám phá tri thức hiệu quả hơn.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.facebook.com/sgnaht"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/sgnaht"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="tel:+84886765392"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-green-600 hover:text-white transition-colors"
                aria-label="Gọi điện"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Khám phá</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/publicpage" className="hover:text-blue-400">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/publicpage/search" className="hover:text-blue-400">
                  Tìm kiếm
                </Link>
              </li>
              <li>
                <Link
                  to="/publicpage/categories"
                  className="hover:text-blue-400"
                >
                  Danh mục
                </Link>
              </li>
              <li>
                <Link
                  to="/publicpage/search?sort=newest"
                  className="hover:text-blue-400"
                >
                  Sách mới
                </Link>
              </li>
              <li>
                <Link
                  to="/publicpage/search?sort=popular"
                  className="hover:text-blue-400"
                >
                  Được mượn nhiều
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/publicpage/about" className="hover:text-blue-400">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/publicpage/guide" className="hover:text-blue-400">
                  Hướng dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link to="/publicpage/faq" className="hover:text-blue-400">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link to="/publicpage/contact" className="hover:text-blue-400">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/publicpage/terms" className="hover:text-blue-400">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start">
                <MapPin size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                <span>
                  Đại học Bách Khoa TPHCM
                  <br />
                  268 Lý Thường Kiệt, Phường 14, Quận 10, TPHCM
                </span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 flex-shrink-0" />
                <a
                  href="mailto:thang.hokhmtk22@hcmut.edu.vn"
                  className="hover:text-blue-400"
                >
                  thang.hokhmtk22@hcmut.edu.vn
                </a>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 flex-shrink-0" />
                <a href="tel:+84886765392" className="hover:text-blue-400">
                  +84 88 676 5392
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2025 SmartLibrary. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/publicpage/privacy-policy" className="hover:text-white">
              Chính sách bảo mật
            </Link>
            <Link to="/publicpage/service-terms" className="hover:text-white">
              Điều khoản dịch vụ
            </Link>
            <Link to="/publicpage/cookie-policy" className="hover:text-white">
              Chính sách Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};
