import { useQuery } from '@tanstack/react-query';
import { FileCheck2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import AdminDataTable, { type AdminDataColumn } from '@/components/admin/AdminDataTable';
import api from '@/services/api';

type AuditRow = {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resource: string;
  status: string;
  message: string;
};

function rowsFrom(payload: unknown): AuditRow[] {
  const root = payload as { data?: unknown };
  const nested = root?.data as { data?: unknown } | undefined;
  const rows = Array.isArray(root?.data) ? root.data : nested?.data;
  return Array.isArray(rows) ? rows as AuditRow[] : [];
}

export default function Audit() {
  const [status, setStatus] = useState('');
  const logs = useQuery({
    queryKey: ['admin-audit', status],
    queryFn: async () => rowsFrom((await api.get('/admin/audit-logs', { params: { limit: 100, ...(status ? { status } : {}) } })).data),
  });
  const integrity = useQuery({
    queryKey: ['admin-audit-integrity'],
    queryFn: async () => {
      const payload = (await api.get('/admin/audit-logs/integrity')).data as { data?: { valid?: boolean; entriesChecked?: number } };
      return payload.data ?? {};
    },
  });
  const columns: AdminDataColumn<AuditRow>[] = [
    { key: 'timestamp', header: 'Thời gian', accessor: 'timestamp', sortable: true, render: (row) => new Date(row.timestamp).toLocaleString('vi-VN') },
    { key: 'actor', header: 'Tác nhân', accessor: 'actorEmail', sortable: true, render: (row) => <div><strong className="block text-sm text-slate-950">{row.actorEmail}</strong><span className="text-[10px] font-black uppercase text-slate-400">{row.actorRole}</span></div> },
    { key: 'action', header: 'Hành động', accessor: 'action', sortable: true, render: (row) => <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{row.action}</code> },
    { key: 'resource', header: 'Tài nguyên', accessor: 'resource', sortable: true },
    { key: 'status', header: 'Kết quả', accessor: 'status', sortable: true, render: (row) => <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${row.status === 'success' ? 'bg-emerald-50 text-emerald-700' : row.status === 'denied' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{row.status}</span> },
  ];

  return <div className="space-y-7 pb-10"><header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-7 text-white shadow-xl"><div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-indigo-400/15 blur-3xl" /><div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-indigo-300">Security & compliance</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-black"><FileCheck2 className="h-7 w-7" />Nhật ký kiểm toán</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Truy vết hành động quản trị, các lần bị từ chối và tính toàn vẹn chuỗi log.</p></div><div className={`rounded-2xl border px-5 py-4 backdrop-blur ${integrity.data?.valid === false ? 'border-red-300/30 bg-red-400/10' : 'border-emerald-300/20 bg-emerald-300/10'}`}><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide"><ShieldCheck className="h-4 w-4" />{integrity.data?.valid === false ? 'Chuỗi log bất thường' : 'Chuỗi log hợp lệ'}</div><div className="mt-1 text-sm text-slate-300">{integrity.data?.entriesChecked ?? 0} bản ghi đã kiểm tra</div></div></div></header><div className="flex flex-wrap items-center justify-between gap-3"><select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600"><option value="">Mọi kết quả</option><option value="success">Thành công</option><option value="failure">Thất bại</option><option value="denied">Bị từ chối</option><option value="rate_limited">Giới hạn tần suất</option></select><button type="button" onClick={() => void Promise.all([logs.refetch(), integrity.refetch()])} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-primary-200"><RefreshCw className="h-3.5 w-3.5" />Làm mới</button></div><AdminDataTable rows={logs.data ?? []} columns={columns} rowKey={(row) => row.id} searchFields={['action', 'actorEmail', 'resource', 'message']} exportFileName="security-audit.csv" isLoading={logs.isLoading} emptyTitle="Chưa có nhật ký" emptyDescription="Các hành động quản trị mới sẽ xuất hiện tại đây." /></div>;
}
