import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/public_pages/Layout';
import { Button, Input } from '../../components/ui';
import authService from '../../api/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Vui lòng nhập email');
      return;
    }
    
    if (!/^[a-zA-Z0-9._%+-]+@hcmut\.edu\.vn$/.test(email)) {
      alert('Email sai định dạng. Vui lòng dùng email @hcmut.edu.vn');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res && res.code === 200) {
        setIsSent(true);
      } else {
        alert(res?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error: any) {
      alert(error.message || 'Không thể gửi email. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {!isSent ? (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 text-blue-600 shadow-sm">
                  <Mail size={32} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                  Quên mật khẩu?
                </h2>
                <p className="text-gray-500 text-sm">
                  Nhập email @hcmut.edu.vn của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email trường"
                  icon={<Mail size={18} />}
                  type="email"
                  placeholder="Ví dụ: student@hcmut.edu.vn"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  disabled={loading}
                />
                
                <Button fullWidth size="lg" type="submit" disabled={loading} className="mt-2">
                  {loading ? 'Đang gửi...' : (
                    <>
                      Gửi link xác nhận <Send size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 relative">
                <Mail size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                Kiểm tra email của bạn
              </h2>
              <p className="text-gray-600 mb-8 text-md leading-relaxed">
                Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>.<br />
                Vui lòng kiểm tra hộp thư đến (và hộp thư Spam) để tiếp tục.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link
              to="/publicpage/login"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Quay lại trang Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
