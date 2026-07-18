import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import LoadingState from '@/components/ui/LoadingState';
import Table, { type TableColumn } from '@/components/ui/Table';
import api from '@/services/api';

interface Customer {
  key: string;
  id: string;
  name: string;
  phone: string;
  email: string;
  serviceRequestCount: number;
  completedServiceCount: number;
  serviceRevenue: number;
  lastServiceAt?: string | null;
  createdAt: string;
}

const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export default function Customers() {
  const [searchText, setSearchText] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => (await api.get('/admin/customers')).data,
  });

  const customers = (Array.isArray(data?.data) ? data.data : []) as Customer[];
  const query = searchText.trim().toLocaleLowerCase('vi-VN');
  const filteredCustomers = customers.filter((customer) => (
    !query
    || customer.name.toLocaleLowerCase('vi-VN').includes(query)
    || customer.phone.includes(searchText.trim())
    || customer.email.toLocaleLowerCase('vi-VN').includes(query)
  ));

  const columns: TableColumn<Customer>[] = [
    {
      title: 'Khách hàng',
      key: 'name',
      render: (row) => <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black text-white shadow-sm">{row.name.charAt(0).toUpperCase()}</div><div><strong className="block text-sm text-slate-950">{row.name}</strong><span className="text-xs text-slate-500">{row.email || 'Chưa có email'}</span></div></div>,
    },
    { title: 'Điện thoại', key: 'phone', render: (row) => <span className="font-semibold text-slate-700">{row.phone}</span> },
    { title: 'Lịch sử dịch vụ', key: 'serviceRequestCount', render: (row) => <Badge variant="primary" pill>{row.serviceRequestCount || 0} yêu cầu</Badge> },
    { title: 'Đã hoàn thành', key: 'completedServiceCount', render: (row) => <Badge variant="success" pill>{row.completedServiceCount || 0} lần</Badge> },
    { title: 'Doanh thu dịch vụ', key: 'serviceRevenue', className: 'text-right', render: (row) => <strong className="text-sm font-black text-emerald-600">{money.format(row.serviceRevenue || 0)}</strong> },
    { title: 'Dịch vụ gần nhất', key: 'lastServiceAt', render: (row) => <span className="text-xs font-semibold text-slate-500">{row.lastServiceAt ? new Date(row.lastServiceAt).toLocaleDateString('vi-VN') : 'Chưa phát sinh'}</span> },
  ];

  if (isLoading) return <LoadingState message="Đang tải hồ sơ khách hàng..." />;
  if (error || !data?.success) return <EmptyState message="Không thể tải dữ liệu" subMessage="Kiểm tra kết nối API và quyền customers.view." />;

  return (
    <div className="space-y-7 pb-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-primary-600">Service CRM</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-slate-950"><Users className="h-7 w-7 text-primary-600" />Hồ sơ khách hàng</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Theo dõi lịch sử sửa chữa, giá trị dịch vụ và lần phục vụ gần nhất — không còn chỉ số đơn bán sản phẩm.</p></div>
        <div className="relative w-full md:w-80"><Input placeholder="Tìm tên, SĐT hoặc email..." value={searchText} onChange={(event) => setSearchText(event.target.value)} className="h-11 border-slate-200 bg-white pl-10 shadow-sm" /><Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /></div>
      </header>
      <Card noPadding className="overflow-hidden border-slate-200/60 shadow-sm"><Table columns={columns} dataSource={filteredCustomers.map((customer, index) => ({ ...customer, key: customer.id || String(index) }))} emptyText="Không tìm thấy khách hàng phù hợp." /></Card>
    </div>
  );
}
