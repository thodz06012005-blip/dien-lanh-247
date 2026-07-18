import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CircleDollarSign,
  ClipboardCheck,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  Users,
  WalletCards,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminDataTable, { type AdminDataColumn } from '@/components/admin/AdminDataTable';
import ErrorState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import { getOperationsOverview, getSlaAlerts } from '@/services/operationsApi';

type AttentionRow = Record<string, unknown>;

const money = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const text = (value: unknown) => String(value ?? '');

export default function Dashboard() {
  const overview = useQuery({
    queryKey: ['operations-overview'],
    queryFn: getOperationsOverview,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const slaAlerts = useQuery({
    queryKey: ['operations-sla-alerts'],
    queryFn: () => getSlaAlerts(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  if (overview.isLoading) return <LoadingState message="Đang tổng hợp dữ liệu dịch vụ..." />;
  if (overview.isError || !overview.data) {
    return <ErrorState message="Không thể tải Dashboard dịch vụ" subMessage="Kiểm tra kết nối backend và quyền dashboard.view." />;
  }

  const metrics = overview.data.metrics;
  const activeRequests = Math.max(metrics.activeRequests, 0);
  const breachedSla = Math.max(metrics.breachedSla, 0);
  const slaCompliance = activeRequests === 0
    ? 100
    : Math.max(0, Math.round(((activeRequests - breachedSla) / activeRequests) * 100));
  const averageLoad = metrics.technicians > 0
    ? (activeRequests / metrics.technicians).toFixed(1)
    : '0.0';
  const alerts = slaAlerts.data ?? overview.data.attention ?? [];

  const alertColumns: AdminDataColumn<AttentionRow>[] = [
    {
      key: 'id',
      header: 'Yêu cầu',
      accessor: 'id',
      sortable: true,
      render: (item) => <strong className="font-mono text-sm text-primary-700">{text(item.id)}</strong>,
    },
    {
      key: 'customer',
      header: 'Khách hàng',
      accessor: 'customerName',
      sortable: true,
      render: (item) => <div><strong className="block text-sm text-slate-950">{text(item.customerName) || 'Khách hàng'}</strong><span className="mt-1 block text-xs text-slate-500">{text(item.applianceType)}</span></div>,
    },
    {
      key: 'priority',
      header: 'Ưu tiên',
      accessor: 'priority',
      sortable: true,
      render: (item) => <span className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase text-amber-700">{text(item.priority) || 'medium'}</span>,
    },
    {
      key: 'sla',
      header: 'SLA',
      accessor: 'breachStage',
      sortable: true,
      render: (item) => item.breachStage
        ? <span className="inline-flex rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase text-red-700">{text(item.breachStage)}</span>
        : <span className="text-xs font-black text-emerald-600">Trong hạn</span>,
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (item) => <Link to={`/service-requests/${encodeURIComponent(text(item.id))}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-black text-primary-700 hover:bg-blue-100">Mở hồ sơ <ArrowRight className="h-3.5 w-3.5" /></Link>,
    },
  ];

  return (
    <div className="space-y-7 pb-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#06162d] via-[#0a2850] to-[#006f92] p-6 text-white shadow-2xl sm:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative grid gap-7 xl:grid-cols-[1.45fr_0.75fr] xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Service Operations Command Center</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Điều hành dịch vụ theo SLA, năng lực đội ngũ và chất lượng hoàn thành</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">Một bề mặt thống nhất cho yêu cầu sửa chữa, kỹ thuật viên, báo giá, thanh toán dịch vụ và bảo hành — cập nhật tự động mỗi phút.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/service-requests" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 motion-reduce:transform-none"><Wrench className="h-4 w-4" />Mở hàng đợi dịch vụ</Link>
              <Link to="/operations" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-black text-white backdrop-blur transition hover:bg-white/15">Trung tâm điều phối <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">SLA đang trong hạn</p><strong className="mt-2 block text-4xl font-black">{slaCompliance}%</strong></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><ShieldCheck className="h-6 w-6 text-cyan-200" /></div></div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${slaCompliance}%` }} /></div>
            <p className="mt-3 text-xs leading-5 text-slate-300">{breachedSla} yêu cầu quá hạn trên {activeRequests} yêu cầu đang mở.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={Wrench} label="Yêu cầu đang mở" value={activeRequests} detail="Toàn bộ hàng đợi cần tiếp tục xử lý" tone="blue" />
        <MetricCard icon={AlertTriangle} label="SLA quá hạn" value={breachedSla} detail="Ưu tiên điều phối và escalation" tone={breachedSla > 0 ? 'red' : 'green'} />
        <MetricCard icon={UserRoundCheck} label="Kỹ thuật viên" value={metrics.technicians} detail={`${averageLoad} yêu cầu mở / kỹ thuật viên`} tone="cyan" />
        <MetricCard icon={WalletCards} label="Báo giá chưa thu đủ" value={metrics.unpaidAcceptedQuotes} detail="Báo giá dịch vụ đã được chấp thuận" tone="amber" />
        <MetricCard icon={CircleDollarSign} label="Doanh thu dịch vụ 30 ngày" value={money.format(metrics.serviceRevenue30Days)} detail="Từ ServicePaymentRecord đã hoàn tất" tone="green" />
        <MetricCard icon={ShieldCheck} label="Bảo hành hiệu lực" value={metrics.activeWarranties} detail="Hồ sơ đang trong thời hạn bảo hành" tone="purple" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-black text-slate-950">Hàng đợi SLA cần chú ý</h2><p className="mt-1 text-sm text-slate-500">Sắp xếp theo vi phạm và thời hạn xử lý gần nhất.</p></div><button type="button" onClick={() => void Promise.all([overview.refetch(), slaAlerts.refetch()])} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 hover:border-primary-200 hover:text-primary-700"><RefreshCw className="h-3.5 w-3.5" />Làm mới</button></div>
          <AdminDataTable rows={alerts} columns={alertColumns} rowKey={(item) => text(item.id)} searchFields={['id', 'customerName', 'applianceType', 'priority']} exportFileName="service-sla-attention.csv" defaultPageSize={8} isLoading={slaAlerts.isLoading} emptyTitle="Không có cảnh báo SLA" emptyDescription="Các yêu cầu đang hoạt động đều nằm trong ngưỡng xử lý." />
        </div>
        <aside className="space-y-4">
          <h2 className="text-xl font-black text-slate-950">Thao tác nhanh</h2>
          <QuickAction icon={CalendarClock} title="Điều phối lịch kỹ thuật viên" description="Phân công, hẹn lại và kiểm tra trùng lịch." to="/operations" />
          <QuickAction icon={ClipboardCheck} title="Xử lý yêu cầu mới" description="Xác nhận, đánh giá ưu tiên và cập nhật workflow." to="/service-requests" />
          <QuickAction icon={Users} title="Tra cứu hồ sơ khách hàng" description="Xem thiết bị và lịch sử dịch vụ liên quan." to="/customers" />
        </aside>
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone }: { icon: LucideIcon; label: string; value: string | number; detail: string; tone: 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'purple' }) {
  const tones = {
    blue: 'from-blue-600 to-indigo-600',
    cyan: 'from-cyan-500 to-blue-500',
    green: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    red: 'from-red-500 to-rose-600',
    purple: 'from-violet-500 to-purple-600',
  };
  return <article className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"><div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white shadow-lg`}><Icon className="h-5 w-5" /></div><p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p><strong className="mt-2 block break-words text-2xl font-black tracking-tight text-slate-950">{value}</strong><p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p></article>;
}

function QuickAction({ icon: Icon, title, description, to }: { icon: LucideIcon; title: string; description: string; to: string }) {
  return <Link to={to} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary-600"><Icon className="h-5 w-5" /></div><div className="min-w-0"><strong className="text-sm text-slate-950">{title}</strong><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div><ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600 motion-reduce:transform-none" /></Link>;
}
