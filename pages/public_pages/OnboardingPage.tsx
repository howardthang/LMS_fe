import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usersService, { OnboardingProfileRequest } from '../../api/usersService';
import { Button, Input } from '../../components/ui';
import { GraduationCap, CreditCard } from 'lucide-react';
import { Header } from '../../components/public_pages/Layout';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    faculty: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.faculty) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    if (!/^\d{7}$/.test(formData.studentId)) {
        alert('Mã sinh viên phải gồm đúng 7 chữ số');
        return;
    }

    setLoading(true);
    try {
      const payload: OnboardingProfileRequest = {
        studentId: formData.studentId,
        faculty: formData.faculty
      };
      const response = await usersService.onboardingProfile(payload);
      if (response && response.code === 200) {
        alert(response.message || 'Cập nhật thông tin thành công!');
        navigate('/userpage/dashboard');
      } else {
        alert(response?.message || 'Cập nhật thất bại, vui lòng thử lại.');
      }
    } catch (error: any) {
      alert(error?.message || 'Đã có lỗi xảy ra. Hãy thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
            Hoàn tất hồ sơ đăng nhập
          </h2>
          <p className="text-sm text-gray-600 text-center mb-8">
            Vui lòng cung cấp thêm thông tin để hoàn tất việc đăng nhập Google
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Mã sinh viên *"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              required
              placeholder="Ví dụ: 2213188"
              icon={<CreditCard size={18} />}
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

            <Button fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Hoàn tất'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
