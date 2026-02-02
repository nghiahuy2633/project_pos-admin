import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/ui/layouts/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { userApi, getApiErrorMessage } from '@/api/apiClient';
import type { UpdateUserRequest, UserResponse } from '@/types/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [me, setMe] = useState<UserResponse | null>(null);

  const [profileForm, setProfileForm] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    fullName: '',
    username: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const initials = useMemo(() => {
    const name = (profileForm.fullName || `${profileForm.firstName} ${profileForm.lastName}`).trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'U';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (first + last).toUpperCase();
  }, [profileForm.firstName, profileForm.lastName, profileForm.fullName]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setIsLoading(true);
        const res: any = await userApi.getMyProfile();
        const data = res?.data ?? res;
        const user: UserResponse = data?.data ?? data;
        setMe(user);
        setProfileForm({
          email: user.email ?? '',
          phone: user.phone ?? '',
          firstName: user.firstName ?? '',
          lastName: user.lastName ?? '',
          fullName: user.fullName ?? '',
          username: user.username ?? '',
        });
      } catch (e) {
        toast.error(getApiErrorMessage(e, 'Không thể tải hồ sơ'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      if (!profileForm.firstName || !profileForm.lastName || !profileForm.username || !profileForm.phone) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const payload: UpdateUserRequest = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        fullName: (profileForm.fullName || `${profileForm.firstName} ${profileForm.lastName}`).trim(),
        username: profileForm.username,
        phone: profileForm.phone,
      };

      const res: any = await userApi.updateMyProfile(payload);
      const maybeWrapped = res && typeof res === 'object' && 'succeed' in res ? res : null;
      if (maybeWrapped && maybeWrapped.succeed === false) {
        toast.error(maybeWrapped.message || 'Cập nhật thất bại');
        return;
      }

      toast.success('Đã cập nhật hồ sơ');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Cập nhật thất bại'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsSaving(true);
      if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        toast.error('Vui lòng nhập đầy đủ mật khẩu');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }

      const res: any = await userApi.changePassword(passwordForm);
      const maybeWrapped = res && typeof res === 'object' && 'succeed' in res ? res : null;
      if (maybeWrapped && maybeWrapped.succeed === false) {
        toast.error(maybeWrapped.message || 'Đổi mật khẩu thất bại');
        return;
      }

      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Đã đổi mật khẩu');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Đổi mật khẩu thất bại'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Hồ sơ" description="Cập nhật thông tin cá nhân và đổi mật khẩu" />

      <div className="flex-1 space-y-8 p-6 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md rounded-[32px] overflow-hidden border-2 lg:col-span-1">
            <CardContent className="p-8">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-blue-600/15 border border-blue-600/20 text-blue-300 flex items-center justify-center font-black">
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-black text-white truncate">{profileForm.fullName || me?.fullName || 'Người dùng'}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500 truncate">{me?.roleCode || '—'}</div>
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/20 px-4 py-3">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-200 truncate max-w-[60%]">{profileForm.email || '—'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/20 px-4 py-3">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className="text-slate-200">{me?.status || '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8 lg:col-span-2">
            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md rounded-[32px] overflow-hidden border-2">
              <CardContent className="p-8">
                <div className="text-sm font-black text-white">Thông tin cá nhân</div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-sm font-medium">Họ</Label>
                    <Input
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                      className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-sm font-medium">Tên</Label>
                    <Input
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                      className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-400 text-sm font-medium">Họ và tên hiển thị</Label>
                    <Input
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Nếu để trống sẽ tự ghép Họ + Tên"
                      className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-sm font-medium">Tên đăng nhập</Label>
                    <Input
                      value={profileForm.username}
                      onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                      className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-sm font-medium">Số điện thoại</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-400 text-sm font-medium">Email</Label>
                    <Input
                      value={profileForm.email}
                      type="email"
                      className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20 disabled:opacity-60"
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoading || isSaving}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 h-12 shadow-lg shadow-blue-600/20"
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md rounded-[32px] overflow-hidden border-2">
              <CardContent className="p-8">
                <div className="text-sm font-black text-white">Đổi mật khẩu</div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-slate-400 text-sm font-medium">Mật khẩu hiện tại</Label>
                    <Input
                      value={passwordForm.oldPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))}
                      type="password"
                      className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-sm font-medium">Mật khẩu mới</Label>
                    <Input
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                      type="password"
                      className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-sm font-medium">Xác nhận mật khẩu</Label>
                    <Input
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      type="password"
                      className="bg-slate-800/50 border-slate-700 rounded-2xl h-12 text-white focus:ring-blue-500/20"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-8 h-12 shadow-lg shadow-blue-600/20"
                  >
                    {isSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
