import { Bell, Edit2, Lock, Save, User, Image as ImageIcon } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useEffect, useState } from 'react';
import usersService, { UserProfileResponse } from '../../api/usersService';

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfileResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersService.getMyProfile();
        if (res && res.data) {
          setProfile(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10 text-gray-500">
        Không thể tải thông tin người dùng.
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Thông tin cá nhân & Cài đặt
        </h1>
        <p className="text-gray-500 text-sm">
          Quản lý thông tin tài khoản và tùy chỉnh trải nghiệm
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Thông tin cơ bản</h3>
          <Button 
            size="sm" 
            variant={isEditing ? "primary" : "outline"} 
            className="text-xs h-8"
            onClick={handleEditToggle}
          >
            {isEditing ? (
              'Hủy chỉnh sửa'
            ) : (
              <><Edit2 size={12} className="mr-1" /> Chỉnh sửa</>
            )}
          </Button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-8 mb-6 border-b border-gray-100 pb-8">
            <div className="flex flex-col items-center max-w-[200px]">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4 flex items-center justify-center border-4 border-white shadow-lg">
                {profile.profilePictureUrl ? (
                  <img src={profile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-gray-400" />
                )}
              </div>
              {isEditing && (
                <Button size="sm" variant="outline" className="w-full text-xs">
                  <ImageIcon size={14} className="mr-2" /> Đổi ảnh
                </Button>
              )}
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Họ tên" 
                defaultValue={profile.fullName || ''} 
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input 
                label="Email" 
                defaultValue={profile.email || ''} 
                disabled
                className="bg-gray-100 font-semibold text-gray-500"
              />
              <Input 
                label="Số điện thoại" 
                defaultValue={profile.phoneNumber || ''} 
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input 
                label="Ngày sinh" 
                type="date"
                defaultValue={profile.dateOfBirth || ''} 
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input 
                label="Địa chỉ" 
                defaultValue={profile.address || ''} 
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input
                label="Vai trò (Role)"
                defaultValue={profile.roles?.[0]?.roleName || 'N/A'}
                disabled
                className="bg-gray-100 font-semibold"
              />
            </div>
          </div>

          {/* Moved from AI settings */}
          <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mr-6">
                <h4 className="text-sm font-bold text-gray-900">
                  Cá nhân hóa AI
                </h4>
                <p className="text-xs text-gray-500">
                  Sử dụng lịch sử mượn & tìm kiếm để cá nhân hóa gợi ý
                </p>
              </div>
            <div className="flex items-center my-2">
              <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in flex-shrink-0">
                <input
                  type="checkbox"
                  name="toggle"
                  id="toggle"
                  defaultChecked={profile.aiPersonalizationEnabled}
                  disabled={!isEditing}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-blue-600 right-4 border-gray-300 disabled:opacity-50"
                />
                <label
                  htmlFor="toggle"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer checked:bg-blue-600"
                ></label>
              </div>
            </div>

          </div>
            {isEditing && (
              <div className="flex justify-end mt-5">
                <Button className="flex items-center px-6 mt-4 md:mt-0 shadow-md">
                  <Save size={18} className="mr-2" /> Lưu thiết lập
                </Button>
              </div>
            )}
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900">Cài đặt tài khoản</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
              <Lock size={16} className="mr-2" /> Đổi mật khẩu
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="password" placeholder="Mật khẩu hiện tại" />
              <Input type="password" placeholder="Mật khẩu mới" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
              <Bell size={16} className="mr-2" /> Thông báo
            </h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">
                  Nhận email nhắc trả sách
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700">
                  Nhận email khi sách trong wishlist có bản khả dụng
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* AI Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900">
            Cấu hình AI & sở thích đọc
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngành ưu tiên
              </label>
              <select className="block w-full border border-gray-300 rounded-md p-2 text-sm" disabled={!isEditing}>
                <option>Công nghệ thông tin</option>
                <option>Khoa học máy tính</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mục tiêu
              </label>
              <select className="block w-full border border-gray-300 rounded-md p-2 text-sm" disabled={!isEditing}>
                <option>Nghiên cứu</option>
                <option>Học môn</option>
                <option>Giải trí</option>
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
