import {
  CheckCircle,
  CreditCard,
  GraduationCap,
  Lock,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import authService, { RegisterRequest } from '../../api/authService';
import { Header } from '../../components/public_pages/Layout';
import { Button, Input } from '../../components/ui';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    faculty: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (!formData.faculty) {
      alert('Vui lòng chọn khoa / ngành!');
      return;
    }
    
    if (!/^[a-zA-Z0-9._%+-]+@hcmut\.edu\.vn$/.test(formData.email)) {
      alert('Email không hợp lệ. Vui lòng dùng email @hcmut.edu.vn');
      return;
    }
    
    setLoading(true);
    try {
      const payload: RegisterRequest = {
        ...formData,
        studentId: Number(formData.studentId)
      };
      const response = await authService.register(payload);
      console.log(response);
      if (response && response.code === 200) {
        alert(response.message || 'Đăng ký thành công!');
        navigate('/publicpage/login');
      } else {
        alert(response?.message || 'Đăng ký thất bại, vui lòng thử lại.');
      }
    } catch (error: any) {
      alert(error?.message || 'Đã có lỗi xảy ra. Hãy thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Side (Benefits/Branding) - Blue side */}
        <div className="hidden md:flex w-2/5 bg-blue-600 text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-800"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-6">
              Khám phá tri thức với AI
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Tham gia hệ thống thư viện thông minh, tìm kiếm sách bằng ngôn ngữ
              tự nhiên và nhận gợi ý cá nhân hóa.
            </p>

            <div className="space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold">Tìm kiếm thông minh</h3>
                  <p className="text-blue-200 text-sm">
                    AI hiểu ngữ nghĩa, tìm đúng tài liệu bạn cần
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold">Gợi ý cá nhân hóa</h3>
                  <p className="text-blue-200 text-sm">
                    Sách phù hợp với ngành học và sở thích của bạn
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold">Quản lý dễ dàng</h3>
                  <p className="text-blue-200 text-sm">
                    Theo dõi mượn trả, gia hạn online tiện lợi
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center text-sm text-blue-200 mt-auto">
            <Shield size={14} className="mr-2" /> Dữ liệu được bảo mật an toàn
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full md:w-3/5 p-8 md:p-16 overflow-y-auto">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Tạo tài khoản
            </h2>
            <p className="text-gray-500 mb-8">
              Đăng ký để truy cập hệ thống thư viện
            </p>

            <form className="space-y-5" onSubmit={handleRegister}>
              <Input
                label="Họ và tên *"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Nguyễn Văn A"
                icon={<User size={18} />}
              />

              <Input
                label="Mã sinh viên / Mã giảng viên *"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                placeholder="2213188"
                icon={<CreditCard size={18} />}
              />

              <Input
                label="Email trường *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="student@hcmut.edu.vn"
                icon={<Mail size={18} />}
              />

              <Input
                label="Mật khẩu *"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Tối thiểu 8 ký tự"
                icon={<Lock size={18} />}
              />

              <Input
                label="Xác nhận mật khẩu *"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Nhập lại mật khẩu"
                icon={<Lock size={18} />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khoa / Ngành *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <GraduationCap size={18} />
                  </div>
                  <select 
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-500"
                  >
                    <option value="">Chọn khoa / ngành</option>
                    <option value="KHOA_KHOA_HOC_VA_KY_THUAT_MAY_TINH">Khoa Khoa học và Kỹ thuật Máy tính</option>
                    <option value="KHOA_DIEN_DIEN_TU">Khoa Điện - Điện tử</option>
                    <option value="KHOA_CO_KHI">Khoa Cơ khí</option>
                    <option value="KHOA_KY_THUAT_HOA_HOC">Khoa Kỹ thuật Hóa học</option>
                    <option value="KHOA_KY_THUAT_XAY_DUNG">Khoa Kỹ thuật Xây dựng</option>
                    <option value="KHOA_KY_THUAT_GIAO_THONG">Khoa Kỹ thuật Giao thông</option>
                    <option value="KHOA_QUAN_LY_CONG_NGHIEP">Khoa Quản lý Công nghiệp</option>
                    <option value="KHOA_MOI_TRUONG_VA_TAI_NGUYEN">Khoa Môi trường và Tài nguyên</option>
                    <option value="KHOA_CONG_NGHE_VAT_LIEU">Khoa Công nghệ Vật liệu</option>
                    <option value="KHOA_KHOA_HOC_UNG_DUNG">Khoa Khoa học Ứng dụng</option>
                    <option value="KHOA_KY_THUAT_DIA_CHAT_VA_DAU_KHI">Khoa Kỹ thuật Địa chất và Dầu khí</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Chính sách bảo mật
                  </a>{' '}
                  của hệ thống
                </span>
              </div>

              <Button fullWidth size="lg" className="mt-2" type="submit" disabled={loading}>
                {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Đã có tài khoản?{' '}
                  <Link
                    to="/publicpage/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">hoặc</span>
                </div>
              </div>

              <Button fullWidth variant="outline" type="button">
                <span className="mr-2 font-bold">🏛️</span> Đăng ký với tài khoản
                trường
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
