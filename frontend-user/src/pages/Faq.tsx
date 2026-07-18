import { ChevronDown, HelpCircle, Phone, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '@/components/common/Breadcrumb';
import { serviceFaq } from '@/data/servicePolicies';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function Faq() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');
  const results = useMemo(
    () => serviceFaq.filter((item) => `${item.question} ${item.answer}`.toLocaleLowerCase('vi-VN').includes(normalizedQuery)),
    [normalizedQuery],
  );

  useDocumentTitle('Câu hỏi thường gặp | Điện Lạnh 247', 'Giải đáp về đặt lịch, báo giá, linh kiện, thanh toán, bảo hành và dữ liệu dịch vụ.');

  return (
    <div className="bg-slate-50 pb-20">
      <section className="bg-[#061527] py-12 text-white sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'Câu hỏi thường gặp' }]} />
          <div className="mt-8 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-black text-cyan-200">
              <HelpCircle aria-hidden="true" className="h-4 w-4" /> Hỗ trợ trước và sau dịch vụ
            </span>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Thông tin rõ trước khi bạn đặt lịch</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">Tìm nhanh câu trả lời về lịch hẹn, giá, linh kiện theo báo giá, thanh toán, hồ sơ và bảo hành.</p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <label htmlFor="faq-search" className="block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <span className="sr-only">Tìm trong câu hỏi thường gặp</span>
          <span className="relative block">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input id="faq-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: đổi lịch, giá cuối cùng, linh kiện..." className="ds-focus-ring min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none" />
          </span>
        </label>

        <p className="mt-5 text-sm font-bold text-slate-600" aria-live="polite">{results.length} câu trả lời phù hợp</p>
        <div className="mt-4 grid gap-4">
          {results.map((item, index) => (
            <details key={item.question} className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:border-blue-200 open:shadow-md">
              <summary className="ds-focus-ring flex min-h-14 cursor-pointer list-none items-center gap-4 rounded-2xl px-5 py-4 font-black text-slate-950 [&::-webkit-details-marker]:hidden">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-primary-700">{String(index + 1).padStart(2, '0')}</span>
                <span className="flex-1">{item.question}</span>
                <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180 motion-reduce:transition-none" />
              </summary>
              <p className="border-t border-slate-100 px-5 py-5 text-sm leading-7 text-slate-600 sm:pl-[5.25rem]">{item.answer}</p>
            </details>
          ))}
        </div>

        {!results.length && (
          <section role="status" className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <HelpCircle aria-hidden="true" className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-black text-slate-950">Chưa có câu trả lời khớp từ khóa</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Gửi câu hỏi cho bộ phận hỗ trợ hoặc gọi hotline nếu tình trạng cần tiếp nhận nhanh.</p>
          </section>
        )}

        <section className="mt-10 flex flex-col gap-5 rounded-3xl bg-[#0c1b2e] p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div><h2 className="text-xl font-black">Vẫn cần trao đổi trực tiếp?</h2><p className="mt-2 text-sm leading-6 text-slate-300">Mô tả thiết bị và mã yêu cầu nếu bạn đã đặt lịch.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-5 text-sm font-black text-slate-950">Gửi câu hỏi</Link>
            <a href="tel:19001234" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-black text-white"><Phone aria-hidden="true" className="h-4 w-4" /> Gọi ngay</a>
          </div>
        </section>
      </main>
    </div>
  );
}
