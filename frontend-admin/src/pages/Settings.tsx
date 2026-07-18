import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Headphones, LockKeyhole, Save, Settings as SettingsIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import LoadingState from '@/components/ui/LoadingState';
import api from '@/services/api';
import { ADMIN_PERMISSIONS } from '@/config/adminPermissions';
import { useAdminAuthStore } from '@/store/adminAuthStore';

interface ServiceSettings {
  storeName: string;
  hotline: string;
  zalo: string;
  email: string;
  address: string;
}

const emptySettings: ServiceSettings = {
  storeName: '',
  hotline: '',
  zalo: '',
  email: '',
  address: '',
};

export default function Settings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ServiceSettings>(emptySettings);
  const [stepUpPassword, setStepUpPassword] = useState('');
  const canManage = useAdminAuthStore((state) => state.hasPermission(ADMIN_PERMISSIONS.SETTINGS_MANAGE));
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await api.get('/admin/settings')).data,
  });
  const updateSettings = useMutation({
    mutationFn: async (values: ServiceSettings) => {
      await api.post('/admin/auth/step-up', { currentPassword: stepUpPassword });
      return api.patch('/admin/settings', values);
    },
    onSuccess: () => {
      setStepUpPassword('');
      window.alert('Cập nhật cấu hình dịch vụ thành công');
      void queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (requestError: AxiosError<{ message?: string }>) => {
      window.alert(requestError.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu hình');
    },
  });

  useEffect(() => {
    if (!data?.data) return;
    const timer = window.setTimeout(() => {
      const source = data.data as Partial<ServiceSettings>;
      setFormData({
        storeName: source.storeName ?? '',
        hotline: source.hotline ?? '',
        zalo: source.zalo ?? '',
        email: source.email ?? '',
        address: source.address ?? '',
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [data]);

  if (isLoading) return <LoadingState message="Đang tải cấu hình dịch vụ..." />;
  if (error || !data?.success) return <EmptyState message="Không thể tải cấu hình" subMessage="Kiểm tra kết nối API và quyền settings.view." />;

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-10">
      <header><p className="text-xs font-black uppercase tracking-[0.2em] text-primary-600">Service configuration</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950"><SettingsIcon className="h-7 w-7 text-primary-600" />Cấu hình hệ thống</h1><p className="mt-2 text-sm leading-6 text-slate-500">Quản lý nhận diện và các kênh hỗ trợ dịch vụ. Cấu hình vận chuyển bán hàng đã được loại bỏ.</p></header>
      <form onSubmit={(event) => { event.preventDefault(); updateSettings.mutate(formData); }} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 to-blue-950 p-6 text-white"><Headphones className="h-6 w-6 text-cyan-300" /><h2 className="mt-3 text-xl font-black">Thông tin hỗ trợ khách hàng</h2><p className="mt-2 text-sm text-slate-300">Các thông tin này được công bố trên website và dùng trong thông báo dịch vụ.</p></div>
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <Input label="Tên đơn vị (*)" name="storeName" value={formData.storeName} onChange={(event) => setFormData((current) => ({ ...current, storeName: event.target.value }))} required />
          <Input label="Email hỗ trợ" name="email" type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} />
          <Input label="Hotline dịch vụ (*)" name="hotline" value={formData.hotline} onChange={(event) => setFormData((current) => ({ ...current, hotline: event.target.value }))} required />
          <Input label="Zalo tư vấn (*)" name="zalo" value={formData.zalo} onChange={(event) => setFormData((current) => ({ ...current, zalo: event.target.value }))} required />
          <div className="sm:col-span-2"><Input label="Địa chỉ trung tâm dịch vụ" name="address" value={formData.address} onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))} /></div>
          {canManage ? <div className="sm:col-span-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-5"><div className="mb-4 flex items-start gap-3"><div className="rounded-xl bg-blue-600 p-2 text-white"><LockKeyhole className="h-4 w-4" /></div><div><strong className="text-sm text-slate-950">Xác minh lại Super Admin</strong><p className="mt-1 text-xs leading-5 text-slate-600">Nhập mật khẩu hiện tại để mở cửa sổ step-up 5 phút trước khi lưu cấu hình nhạy cảm.</p></div></div><Input label="Mật khẩu Super Admin" name="stepUpPassword" type="password" autoComplete="current-password" value={stepUpPassword} onChange={(event) => setStepUpPassword(event.target.value)} required /></div> : <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Bạn có quyền xem cấu hình. Chỉ Super Admin đã xác minh lại mới được thay đổi.</div>}
        </div>
        {canManage ? <div className="flex justify-end border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8"><Button type="submit" isLoading={updateSettings.isPending} leftIcon={<Save className="h-4 w-4" />} className="rounded-xl px-6 font-bold">Xác minh và lưu</Button></div> : null}
      </form>
    </div>
  );
}
