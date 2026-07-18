import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';

type NotificationItem = {
  id: string;
  type: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
};

const severityClasses: Record<NotificationItem['severity'], string> = {
  INFO: 'border-sky-200 bg-sky-50 text-sky-700',
  SUCCESS: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  WARNING: 'border-amber-200 bg-amber-50 text-amber-700',
  CRITICAL: 'border-rose-200 bg-rose-50 text-rose-700',
};

function unwrapNotifications(payload: unknown): NotificationItem[] {
  const root = payload as { data?: unknown };
  const nested = root?.data as { data?: unknown } | undefined;
  const records = Array.isArray(root?.data) ? root.data : nested?.data;
  return Array.isArray(records) ? records as NotificationItem[] : [];
}

export default function Notifications() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['admin-notifications', unreadOnly],
    queryFn: async () => unwrapNotifications((await api.get('/admin/notifications', { params: { limit: 60, unreadOnly } })).data),
    refetchInterval: 30_000,
  });
  const markRead = useMutation({
    mutationFn: async (id: string) => api.patch(`/admin/notifications/${encodeURIComponent(id)}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notifications'] }),
  });
  const items = query.data ?? [];
  const unreadCount = items.filter((item) => !item.isRead).length;

  return (
    <section className="space-y-6 pb-10">
      <header className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-900 p-7 text-white shadow-xl">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Operations intelligence</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight"><Bell className="h-7 w-7" />Trung tâm thông báo</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Theo dõi yêu cầu mới, cảnh báo SLA, trạng thái gửi thông báo và sự kiện quan trọng của đội vận hành.</p></div><div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur"><div className="text-xs uppercase tracking-wider text-slate-300">Chưa đọc</div><div className="mt-1 text-3xl font-black">{unreadCount}</div></div></div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><label className="inline-flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />Chỉ hiển thị chưa đọc</label><button type="button" onClick={() => void query.refetch()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"><RefreshCw className="h-4 w-4" />Làm mới</button></div>
      {query.isLoading && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500" role="status">Đang tải thông báo…</div>}
      {query.isError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700" role="alert">Không thể tải trung tâm thông báo.</div>}
      {!query.isLoading && !query.isError && items.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Không có thông báo phù hợp.</div>}
      <div className="grid gap-4">{items.map((item) => <article key={String(item.id)} className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none ${item.isRead ? 'border-slate-200 opacity-80' : 'border-blue-200 ring-1 ring-blue-100'}`}><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-[11px] font-black tracking-wide ${severityClasses[item.severity]}`}>{item.severity}</span>{!item.isRead && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-black text-white">MỚI</span>}<time className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('vi-VN')}</time></div><h2 className="mt-3 text-base font-black text-slate-900">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p></div><div className="flex shrink-0 gap-2">{item.actionUrl && <Link to={item.actionUrl} className="inline-flex min-h-10 items-center rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700">Xem chi tiết</Link>}{!item.isRead && <button type="button" onClick={() => markRead.mutate(String(item.id))} disabled={markRead.isPending} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><CheckCheck className="h-4 w-4" />Đã đọc</button>}</div></div></article>)}</div>
    </section>
  );
}
