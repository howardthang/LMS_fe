import { Bell, Lock, Moon, Palette, Save, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Input } from '../../components/ui';
import usersService from '../../api/usersService';

const SettingsPage = () => {
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    wishlistAvailable: true,
    overdueWarnings: true,
    newBookAlerts: false,
    weeklyDigest: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showReadingHistory: false,
    allowRecommendations: true,
  });

  const [appearance, setAppearance] = useState({
    theme: 'light',
    fontSize: 'medium',
    language: 'vi',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('studentSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.privacy) setPrivacy(parsed.privacy);
        if (parsed.appearance) setAppearance(parsed.appearance);
      } catch {
        localStorage.removeItem('studentSettings');
      }
    }

    usersService.getMyProfile()
      .then((res) => {
        if (res.code === 200) {
          setPrivacy((prev) => ({
            ...prev,
            allowRecommendations: res.data.aiPersonalizationEnabled,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleCancel = () => {
    const savedSettings = localStorage.getItem('studentSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setNotifications(parsed.notifications ?? notifications);
        setPrivacy(parsed.privacy ?? privacy);
        setAppearance(parsed.appearance ?? appearance);
      } catch {
        localStorage.removeItem('studentSettings');
      }
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSave = async () => {
    if (passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword) {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        toast.error('Vui lòng nhập đầy đủ thông tin đổi mật khẩu.');
        return;
      }
      if (passwordForm.newPassword.length < 8) {
        toast.error('Mật khẩu mới phải có ít nhất 8 ký tự.');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp.');
        return;
      }
    }

    try {
      setIsSaving(true);
      await usersService.updateMyProfile({
        aiPersonalizationEnabled: privacy.allowRecommendations,
      });
      if (passwordForm.currentPassword) {
        await usersService.changePassword(passwordForm);
      }
      localStorage.setItem('studentSettings', JSON.stringify({
        notifications,
        privacy,
        appearance,
      }));
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Đã lưu cài đặt.');
    } catch (error: any) {
      toast.error(error?.message || 'Không thể lưu cài đặt.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-500 text-sm">
          Tùy chỉnh trải nghiệm và quản lý tài khoản của bạn
        </p>
      </div>

      {/* Notifications Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">Thông báo</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Nhận email nhắc trả sách
                  </p>
                  <p className="text-xs text-gray-500">
                    Nhận thông báo khi sách sắp đến hạn trả
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailReminders}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    emailReminders: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Bell className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Sách trong wishlist có bản khả dụng
                  </p>
                  <p className="text-xs text-gray-500">
                    Thông báo khi sách bạn yêu thích có thể mượn
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.wishlistAvailable}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    wishlistAvailable: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Bell className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Cảnh báo sách quá hạn
                  </p>
                  <p className="text-xs text-gray-500">
                    Nhận thông báo khi sách đã quá hạn trả
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.overdueWarnings}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    overdueWarnings: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Bell className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Thông báo sách mới
                  </p>
                  <p className="text-xs text-gray-500">
                    Nhận email về các sách mới được thêm vào thư viện
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.newBookAlerts}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    newBookAlerts: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Tóm tắt tuần
                  </p>
                  <p className="text-xs text-gray-500">
                    Nhận email tóm tắt hoạt động hàng tuần
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifications.weeklyDigest}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    weeklyDigest: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">Quyền riêng tư</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Hiển thị hồ sơ công khai
                  </p>
                  <p className="text-xs text-gray-500">
                    Cho phép người khác xem thông tin cơ bản của bạn
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={privacy.showProfile}
                onChange={(e) =>
                  setPrivacy({ ...privacy, showProfile: e.target.checked })
                }
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Hiển thị lịch sử đọc
                  </p>
                  <p className="text-xs text-gray-500">
                    Cho phép người khác xem sách bạn đã đọc
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={privacy.showReadingHistory}
                onChange={(e) =>
                  setPrivacy({
                    ...privacy,
                    showReadingHistory: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Cho phép gợi ý cá nhân hóa
                  </p>
                  <p className="text-xs text-gray-500">
                    Sử dụng dữ liệu của bạn để cải thiện gợi ý
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={privacy.allowRecommendations}
                onChange={(e) =>
                  setPrivacy({
                    ...privacy,
                    allowRecommendations: e.target.checked,
                  })
                }
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">Giao diện</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ đề
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setAppearance({ ...appearance, theme: 'light' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  appearance.theme === 'light'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span className="text-sm font-medium">Sáng</span>
                </div>
              </button>
              <button
                onClick={() => setAppearance({ ...appearance, theme: 'dark' })}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  appearance.theme === 'dark'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Moon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Tối</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cỡ chữ
            </label>
            <select
              value={appearance.fontSize}
              onChange={(e) =>
                setAppearance({ ...appearance, fontSize: e.target.value })
              }
              className="block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="small">Nhỏ</option>
              <option value="medium">Vừa</option>
              <option value="large">Lớn</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ
            </label>
            <select
              value={appearance.language}
              onChange={(e) =>
                setAppearance({ ...appearance, language: e.target.value })
              }
              className="block w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">Bảo mật</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-4">
              Đổi mật khẩu
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                placeholder="Mật khẩu hiện tại"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Mật khẩu mới"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <Input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và
              số
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>Hủy</Button>
        <Button className="flex items-center px-6" onClick={handleSave} disabled={isSaving}>
          <Save size={18} className="mr-2" /> {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
