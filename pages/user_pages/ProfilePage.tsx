import {
  Bell, Edit2, Lock, Save, User, Image as ImageIcon,
  Hash, Mail, CreditCard, GraduationCap, Shield, Award, Camera
} from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
    aiPersonalizationEnabled: false as boolean | undefined,
    faculty: ''
  });
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isViewingAvatar, setIsViewingAvatar] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsUploadingAvatar(true);
        const file = e.target.files[0];
        const res = await usersService.updateAvatar(file);

        // Mocking the update or utilizing response
        const newUrl = res?.data?.profilePictureUrl || URL.createObjectURL(file);
        setProfile(prev => prev ? { ...prev, profilePictureUrl: newUrl } : null);
        alert('Cập nhật ảnh đại diện thành công!');
      } catch (error: any) {
        alert('Cập nhật ảnh thất bại: ' + (error.message || ''));
      } finally {
        setIsUploadingAvatar(false);
        setIsAvatarModalOpen(false);
      }
    }
  };

  const FACULTY_LABELS: Record<string, string> = {
    KHOA_KHOA_HOC_VA_KY_THUAT_MAY_TINH: "Khoa Khoa học và Kỹ thuật Máy tính",
    KHOA_DIEN_DIEN_TU: "Khoa Điện - Điện tử",
    KHOA_CO_KHI: "Khoa Cơ khí",
    KHOA_KY_THUAT_HOA_HOC: "Khoa Kỹ thuật Hóa học",
    KHOA_KY_THUAT_XAY_DUNG: "Khoa Kỹ thuật Xây dựng",
    KHOA_KY_THUAT_GIAO_THONG: "Khoa Kỹ thuật Giao thông",
    KHOA_QUAN_LY_CONG_NGHIEP: "Khoa Quản lý Công nghiệp",
    KHOA_MOI_TRUONG_VA_TAI_NGUYEN: "Khoa Môi trường và Tài nguyên",
    KHOA_CONG_NGHE_VAT_LIEU: "Khoa Công nghệ Vật liệu",
    KHOA_KHOA_HOC_UNG_DUNG: "Khoa Khoa học Ứng dụng",
    KHOA_KY_THUAT_DIA_CHAT_VA_DAU_KHI: "Khoa Kỹ thuật Địa chất và Dầu khí"
  };

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
            aiPersonalizationEnabled: res.data.aiPersonalizationEnabled,
            faculty: res.data.faculty || '',
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
        aiPersonalizationEnabled: profile.aiPersonalizationEnabled,
        faculty: profile.faculty || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin mật khẩu!');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      setIsChangingPassword(true);
      const res = await usersService.changePassword(passwordData);
      if (res && res.code === 200) {
        alert('Đổi mật khẩu thành công!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(res?.message || 'Đổi mật khẩu thất bại!');
      }
    } catch (error: any) {
      alert('Đổi mật khẩu thất bại: ' + (error.message || ''));
    } finally {
      setIsChangingPassword(false);
    }
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
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto pb-10">
      {/* Profile Header / Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        <div className="px-6 pb-6 relative flex flex-col md:flex-row justify-between items-center md:items-end">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-12 w-full md:w-auto text-center md:text-left">
            <div
              className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white overflow-hidden relative group cursor-pointer"
              onClick={() => setIsAvatarModalOpen(true)}
            >
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={28} />
              </div>
            </div>
            <div className="mt-4 md:mt-0 md:ml-5 pb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.fullName}</h2>
              <p className="text-sm font-medium text-blue-600 mt-1 uppercase tracking-wider">{profile.roles?.[0]?.roleName || 'STUDENT'}</p>
            </div>
          </div>
        </div>
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
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><Hash size={12} className="mr-1" /> ID Hệ thống</p>
              <p className="text-sm font-semibold text-gray-800">{profile.id}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><Mail size={12} className="mr-1" /> Email</p>
              <p className="text-sm font-semibold text-gray-800 break-all">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><CreditCard size={12} className="mr-1" /> Mã SV/GV</p>
              <p className="text-sm font-semibold text-gray-800">{profile.studentId || 'Không có'}</p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><GraduationCap size={12} className="mr-1" /> Khoa/Ngành</p>
              <p className="text-sm font-semibold text-gray-800">
                {profile.faculty ? FACULTY_LABELS[profile.faculty] : 'Không có'}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><Shield size={12} className="mr-1" /> Vai trò</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {profile.roles?.[0]?.roleName || 'N/A'}
              </span>
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-1 font-semibold flex items-center uppercase tracking-wider"><Award size={12} className="mr-1" /> Điểm tín nhiệm / Trạng thái</p>
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
          <div className="mb-6 border-b border-gray-100 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Input
                label="Họ tên"
                value={editData.fullName}
                onChange={(e: any) => setEditData({ ...editData, fullName: e.target.value })}
                disabled={!isEditing || isSaving}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input
                label="Số điện thoại"
                value={editData.phoneNumber}
                onChange={(e: any) => setEditData({ ...editData, phoneNumber: e.target.value })}
                disabled={!isEditing || isSaving}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input
                label="Ngày sinh"
                type="date"
                value={editData.dateOfBirth}
                onChange={(e: any) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                disabled={!isEditing || isSaving}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <Input
                label="Địa chỉ"
                value={editData.address}
                onChange={(e: any) => setEditData({ ...editData, address: e.target.value })}
                disabled={!isEditing || isSaving}
                className={!isEditing ? "bg-gray-50" : ""}
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Khoa/Ngành</label>
                <select
                  value={editData.faculty || ''}
                  onChange={(e) => setEditData({ ...editData, faculty: e.target.value })}
                  disabled={!isEditing || isSaving}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Chọn khoa</option>
                  {Object.entries(FACULTY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
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
                  onChange={(e) => setEditData({ ...editData, aiPersonalizationEnabled: e.target.checked })}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <Input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={passwordData.currentPassword}
                onChange={(e: any) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Mật khẩu mới"
                value={passwordData.newPassword}
                onChange={(e: any) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={passwordData.confirmPassword}
                    onChange={(e: any) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex">
              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="px-6"
              >
                {isChangingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </Button>
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

      {/* Avatar Modals */}
      {isAvatarModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-fade-in">
            <h3 className="text-lg font-extrabold text-gray-900 mb-6 text-center">Tùy chọn ảnh đại diện</h3>
            <div className="space-y-3">
              <Button fullWidth variant="outline" onClick={() => { setIsViewingAvatar(true); setIsAvatarModalOpen(false); }}>
                <ImageIcon size={18} className="mr-2" /> Xem ảnh lớn
              </Button>
              <Button fullWidth variant="primary" onClick={() => document.getElementById('avatar-upload')?.click()} disabled={isUploadingAvatar}>
                <Camera size={18} className="mr-2" /> {isUploadingAvatar ? 'Đang tải lên...' : 'Cập nhật ảnh mới'}
              </Button>
              <input type="file" id="avatar-upload" hidden accept="image/*" onChange={handleAvatarChange} />
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100">
              <Button variant="ghost" fullWidth onClick={() => setIsAvatarModalOpen(false)} className="text-gray-500">Đóng</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isViewingAvatar && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4 cursor-pointer" onClick={() => setIsViewingAvatar(false)}>
          <img
            src={profile.profilePictureUrl || ''}
            alt="Avatar Enlarge"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>,
        document.body
      )}

    </div>
  );
};

export default ProfilePage;
