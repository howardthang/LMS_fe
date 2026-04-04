import { CheckCircle, Lock, User } from 'lucide-react';
import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/public_pages/Layout';
import { Button } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { log } from 'console';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = usernameRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    try {
      // Gọi API đăng nhập và lưu tokens, lấy về role decoded từ JWT
      const role = await login(username, password);
      
      // Redirect dựa trên role thực tế
      if (role === 'librarian') {
        navigate('/librarian/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Side (Form) */}
        <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 lg:p-24 justify-center">
          <div className="mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <User size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Đăng nhập
            </h2>
            <p className="text-center text-gray-500">
              Truy cập vào hệ thống thư viện thông minh
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6 max-w-sm mx-auto w-full"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email / Mã sinh viên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  ref={usernameRef}
                  type="text"
                  placeholder="Nhập email hoặc mã sinh viên (student/librarian)"
                  defaultValue="student"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  ref={passwordRef}
                  type="password"
                  placeholder="Nhập mật khẩu"
                  defaultValue="password"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Quên mật khẩu?
              </a>
            </div>

            <Button fullWidth size="lg" type="submit">
              Đăng nhập
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            <Button
              fullWidth
              variant="outline"
              type="button"
              onClick={() => {
                login('student');
                navigate('/dashboard');
              }}
            >
              Đăng nhập với SSO trường
            </Button>

            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link
                to="/publicpage/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>

        {/* Right Side (Info/Benefits) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-12 lg:p-20 flex-col justify-center relative overflow-hidden">
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 max-w-lg mx-auto">
            <h2 className="text-3xl font-bold mb-8">Lợi ích khi đăng nhập</h2>
            <ul className="space-y-6">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                  <CheckCircle size={14} className="text-white" />
                </div>
                <p className="ml-4 text-lg text-blue-100">
                  Tìm kiếm thông minh với AI và gợi ý cá nhân hóa
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                  <CheckCircle size={14} className="text-white" />
                </div>
                <p className="ml-4 text-lg text-blue-100">
                  Quản lý mượn trả và đặt trước sách dễ dàng
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                  <CheckCircle size={14} className="text-white" />
                </div>
                <p className="ml-4 text-lg text-blue-100">
                  Nhận thông báo về sách yêu thích và hạn trả
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                  <CheckCircle size={14} className="text-white" />
                </div>
                <p className="ml-4 text-lg text-blue-100">
                  Truy cập kho tài liệu số và ebook miễn phí
                </p>
              </li>
            </ul>

            <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-bold">Dashboard cá nhân</h4>
                  <p className="text-sm text-blue-200">
                    Theo dõi hoạt động học tập
                  </p>
                </div>
              </div>
              <div className="h-24 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-lg flex items-end p-2 space-x-2">
                <div className="w-full bg-white/30 rounded-t h-[40%]"></div>
                <div className="w-full bg-white/50 rounded-t h-[70%]"></div>
                <div className="w-full bg-white/30 rounded-t h-[50%]"></div>
                <div className="w-full bg-white/80 rounded-t h-[85%] relative">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white text-blue-900 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    New
                  </div>
                </div>
                <div className="w-full bg-white/30 rounded-t h-[60%]"></div>
              </div>
              <p className="text-sm mt-3 text-blue-100">
                Theo dõi sách đang mượn, lịch sử và nhận gợi ý phù hợp với
                chuyên ngành.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
