import { 
  Bell, Edit2, Lock, Save, User, Image as ImageIcon, 
  Hash, Mail, CreditCard, GraduationCap, Shield, Award 
} from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useEffect, useState } from 'react';
import usersService, { UserProfileResponse } from '../../api/usersService';

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfileResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    address: '',
    aiPersonalizationEnabled: false as boolean | undefined
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await usersService.getMyProfile();
        if (res && res.data) {
          setProfile(res.data);
          setEditData({
            fullName: res.data.fullName || '',
            phoneNumber: res.data.phoneNumber || '',
            dateOfBirth: res.data.dateOfBirth || '',
            address: res.data.address || '',
            aiPersonalizationEnabled: res.data.aiPersonalizationEnabled
          });
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
    if (isEditing && profile) {
      // Revert if cancelling
      setEditData({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        dateOfBirth: profile.dateOfBirth || '',
        address: profile.address || '',
        aiPersonalizationEnabled: profile.aiPersonalizationEnabled
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await usersService.updateMyProfile(editData);
      if (res && res.data) {
        setProfile(res.data);
        setIsEditing(false);
        alert('Cập nhật thông tin thành công!');
      }
    } catch (e: any) {
      alert('Cập nhật thất bại: ' + (e.message || 'Lỗi hệ thống'));
    } finally {
      setIsSaving(false);
    }
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
            disabled={isSaving}
          >
            {isEditing ? (
              'Hủy chỉnh sửa'
            ) : (
              <><Edit2 size={12} className="mr-1" /> Chỉnh sửa</>
            )}
          </Button>
        </div>
        
        <div className="p-6">
          {/* Read-only Immutable Info Cards */}
          <div className="bg-blue-50/40 rounded-xl p-5 border border-blue-100 grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><Hash size={12} className="mr-1"/> ID Hệ thống</p>
              <p className="text-sm font-semibold text-gray-800">{profile.id}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><Mail size={12} className="mr-1"/> Email</p>
              <p className="text-sm font-semibold text-gray-800 break-all">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><CreditCard size={12} className="mr-1"/> Mã SV/GV</p>
              <p className="text-sm font-semibold text-gray-800">{profile.studentId || 'Không có'}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><GraduationCap size={12} className="mr-1"/> Khoa/Ngành</p>
              <p className="text-sm font-semibold text-gray-800">{profile.faculty || 'Không có'}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><Shield size={12} className="mr-1"/> Vai trò</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {profile.roles?.[0]?.roleName || 'N/A'}
              </span>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><Award size={12} className="mr-1"/> Điểm tín nhiệm / Trạng thái</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
                  ⭐ {profile.creditScore ?? 100}
                </span>
                {profile.status === 'ACTIVE' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                    🟢 Hoạt động
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                    🔴 {profile.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <h4 className="text-sm font-bold text-gray-700 mb-4 border-b border-gray-100 pb-2">Thông tin có thể can thiệp</h4>
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
                <Button size="sm" variant="outline" className="w-full text-xs" disabled={isSaving}>
                  <ImageIcon size={14} className="mr-2" /> Đổi ảnh
                </Button>
              )}
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Họ tên" 
                value={editData.fullName} 
                onChange={(e: any) => setEditData({...editData, fullName: e.target.value})}
                disabled={!isEditing || isSaving}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input 
                label="Số điện thoại" 
                value={editData.phoneNumber} 
                onChange={(e: any) => setEditData({...editData, phoneNumber: e.target.value})}
                disabled={!isEditing || isSaving}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input 
                label="Ngày sinh" 
                type="date"
                value={editData.dateOfBirth} 
                onChange={(e: any) => setEditData({...editData, dateOfBirth: e.target.value})}
                disabled={!isEditing || isSaving}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input 
                label="Địa chỉ" 
                value={editData.address} 
                onChange={(e: any) => setEditData({...editData, address: e.target.value})}
                disabled={!isEditing || isSaving}
                className={!isEditing ? "bg-gray-50" : ""}
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
                  checked={editData.aiPersonalizationEnabled}
                  onChange={(e) => setEditData({...editData, aiPersonalizationEnabled: e.target.checked})}
                  disabled={!isEditing || isSaving}
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
            <div className="flex justify-end mt-5 border-t border-gray-100 pt-5">
              <Button 
                className="flex items-center px-6 md:mt-0 shadow-md"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save size={18} className="mr-2" /> 
                {isSaving ? 'Đang lưu...' : 'Lưu thiết lập'}
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

    </div>
  );
};

export default ProfilePage;
