import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const OAuth2CallbackPage = () => {
  const { socialLogin } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    // Trích xuất mã code từ query string thực thay vì Hash Router
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (!code) {
      setError('Thiếu mã code từ Google');
      return;
    }

    const performLogin = async () => {
      try {
        const role = await socialLogin('google', code);
        // Điều hướng bằng window.location để reset lại pathname về gốc
        if (role === 'librarian') {
          window.location.href = '/#/librarianpage/dashboard';
        } else {
          window.location.href = '/#/userpage/dashboard';
        }
      } catch (err: any) {
        console.error('Social login error:', err);
        setError(err.message || 'Lỗi hệ thống khi tải đăng nhập social');
      }
    };

    performLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Đăng nhập thất bại</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => { window.location.href = '/#/publicpage/login'; }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Quay lại trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Đang xử lý đăng nhập Google...</h2>
        <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
};

export default OAuth2CallbackPage;
