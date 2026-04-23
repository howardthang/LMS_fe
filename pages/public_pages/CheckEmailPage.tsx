import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/public_pages/Layout';
import { Button } from '../../components/ui';

const CheckEmailPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 relative">
            <Mail size={40} className="text-blue-600" />
            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
              <CheckCircle size={14} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Kiểm tra email
          </h2>
          
          <div className="space-y-4 text-gray-600 mb-8 text-md leading-relaxed">
            <p>
              Chúng tôi đã gửi một email xác nhận tài khoản cho bạn.
            </p>
            <p>
              Vui lòng nhấn vào liên kết trong email để <strong>kích hoạt tài khoản</strong> của bạn trước khi tiến hành đăng nhập.
            </p>
          </div>
          
          <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-xl mb-8 flex items-start text-left shadow-inner border border-blue-100">
            <p>💡 Nếu bạn không thấy email trong hộp thư đến, vui lòng kiểm tra thêm ở thư mục <strong>Spam</strong> hoặc <strong>Thư rác</strong>.</p>
          </div>

          <Link to="/publicpage/login" className="block w-full">
            <Button fullWidth size="lg" className="group text-lg py-6 shadow-md hover:shadow-lg transition-all duration-300">
              Tiến hành Đăng nhập
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
