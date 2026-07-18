import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Cookie,
  CreditCard,
  FileCheck2,
  Landmark,
  Lock,
  MessageSquareWarning,
  ShieldCheck,
} from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
  policies,
  policyNavigation,
  POLICY_APPROVAL_STATUS,
  POLICY_EFFECTIVE_DATE,
  POLICY_PUBLISHED_DATE,
  POLICY_VERSION,
  type PolicyIconName,
} from '@/data/servicePolicies';
import useDocumentTitle from '@/hooks/useDocumentTitle';

const policyIcons: Record<PolicyIconName, React.ElementType> = {
  calendar: CalendarDays,
  clock: Clock3,
  cookie: Cookie,
  'credit-card': CreditCard,
  'file-check': FileCheck2,
  landmark: Landmark,
  lock: Lock,
  'message-square-warning': MessageSquareWarning,
  'shield-check': ShieldCheck,
};

export default function Policy() {
  const { slug = 'terms' } = useParams<{ slug: string }>();
  const document = policies[slug];
  useDocumentTitle(document ? `${document.title} | Điện Lạnh 247` : 'Chính sách không tồn tại');

  if (!document) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-600">Không tìm thấy nội dung</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Chính sách này chưa được công bố</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">Hãy quay lại bộ điều khoản dịch vụ hoặc liên hệ để được hỗ trợ.</p>
        <Link to="/policy/terms" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-600 px-5 text-sm font-black text-white">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Xem điều khoản website
        </Link>
      </section>
    );
  }

  const Icon = policyIcons[document.icon];

  return (
    <div className="bg-slate-50">
      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'Chính sách' }, { name: document.title }]} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[270px_1fr] lg:px-8 lg:py-16">
        <aside className="lg:sticky lg:top-32 lg:self-start" aria-label="Danh sách chính sách">
          <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            {policyNavigation.map((item) => (
              <Link
                key={item.slug}
                to={`/policy/${item.slug}`}
                aria-current={item.slug === slug ? 'page' : undefined}
                className={`ds-focus-ring block min-h-11 rounded-xl px-4 py-3 text-sm font-black transition ${
                  item.slug === slug ? 'bg-primary-700 text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-primary-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
            <strong className="block font-black">Cổng kiểm duyệt trước go-live</strong>
            <span className="mt-1 block">{POLICY_APPROVAL_STATUS === 'PENDING_OWNER_AND_LEGAL_APPROVAL' ? 'Đang chờ chủ cửa hàng và tư vấn pháp lý duyệt bản cuối.' : 'Đã duyệt nội dung.'}</span>
          </div>
        </aside>

        <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <header className="border-b border-slate-200 bg-[#061527] p-6 text-white sm:p-9">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
              <Icon aria-hidden="true" className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{document.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{document.summary}</p>
            <dl className="mt-6 grid gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3"><dt className="text-slate-400">Phiên bản</dt><dd className="mt-1 font-black text-white">{POLICY_VERSION}</dd></div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3"><dt className="text-slate-400">Ngày ban hành</dt><dd className="mt-1 font-black text-white">{POLICY_PUBLISHED_DATE}</dd></div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3"><dt className="text-slate-400">Ngày hiệu lực</dt><dd className="mt-1 font-black text-white">{POLICY_EFFECTIVE_DATE}</dd></div>
            </dl>
          </header>

          <div className="p-6 sm:p-9">
            <div className="space-y-9">
              {document.sections.map((section) => (
                <section key={section.heading} aria-labelledby={`${slug}-${section.heading.replace(/\W+/g, '-').toLowerCase()}`}>
                  <h2 id={`${slug}-${section.heading.replace(/\W+/g, '-').toLowerCase()}`} className="text-xl font-black text-slate-950">{section.heading}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-700">{paragraph}</p>
                  ))}
                  {section.bullets && (
                    <ul className="mt-4 grid gap-3">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                          <CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-lg font-black text-slate-950">Cần giải thích theo trường hợp cụ thể?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Gửi câu hỏi kèm mã yêu cầu dịch vụ để đội ngũ đối chiếu đúng phiên bản báo giá, lịch hẹn hoặc bảo hành.</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-700 px-5 text-sm font-black text-white">Liên hệ hỗ trợ</Link>
                <Link to="/faq" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200 bg-white px-5 text-sm font-black text-primary-800">Xem câu hỏi thường gặp</Link>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
