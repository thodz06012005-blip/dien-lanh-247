import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Drill,
  Droplets,
  Headphones,
  MapPin,
  Phone,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
  Wind,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import OptimizedImage from '@/components/common/OptimizedImage';
import QuickContactForm from '@/components/contact/QuickContactForm';
import CmsManagedHomepage from '@/components/cms/CmsManagedHomepage';
import PricingTable from '@/components/home/PricingTable';
import { articles, processSteps, reasons } from '@/data/phase4Content';
import { serviceFaq } from '@/data/servicePolicies';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useSettings } from '@/hooks/useSettings';
import { DISTRICT_OPTIONS } from '@/constants/areas';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
}

function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
}: SectionHeaderProps) {
  const centered = align === 'center';
  const dark = tone === 'dark';
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className={`text-xs font-black uppercase tracking-[0.2em] ${dark ? 'text-cyan-300' : 'text-primary-700'}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl ${dark ? 'text-white' : 'text-slate-950'}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-sm leading-7 sm:text-base ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
          {description}
        </p>
      )}
    </div>
  );
}

const servicePromises = [
  { icon: ShieldCheck, title: 'Bảo hành rõ ràng', text: 'Có thời hạn và lịch sử dịch vụ' },
  { icon: Wrench, title: 'Đúng chuyên môn', text: 'Phân công theo kỹ năng thiết bị' },
  { icon: Clock3, title: 'Hẹn giờ linh hoạt', text: 'Xác nhận trước khi kỹ thuật viên đến' },
  { icon: Headphones, title: 'Hỗ trợ sau dịch vụ', text: 'Tiếp nhận bảo hành và phản hồi' },
];

const featuredServices = [
  {
    id: 'sua-dieu-hoa',
    icon: Wind,
    title: 'Sửa chữa',
    description: 'Chẩn đoán điều hòa, tủ lạnh, máy giặt và thiết bị điện lạnh có dấu hiệu bất thường.',
    price: 'Từ 250.000đ',
  },
  {
    id: 've-sinh-dieu-hoa',
    icon: Droplets,
    title: 'Vệ sinh',
    description: 'Làm sạch chuyên sâu, kiểm tra thoát nước và đánh giá hiệu suất vận hành.',
    price: 'Từ 150.000đ',
  },
  {
    id: 'lap-dat-dieu-hoa',
    icon: Drill,
    title: 'Lắp đặt',
    description: 'Khảo sát vị trí, vật tư, đường điện và chạy thử trước khi bàn giao.',
    price: 'Báo giá sau khảo sát',
  },
  {
    id: 'bao-tri-dinh-ky',
    icon: ClipboardCheck,
    title: 'Bảo trì',
    description: 'Lập lịch định kỳ, checklist thiết bị và hồ sơ nghiệm thu cho gia đình hoặc doanh nghiệp.',
    price: 'Theo quy mô hệ thống',
  },
  {
    id: 'kiem-tra-chan-doan',
    icon: ScanSearch,
    title: 'Kiểm tra',
    description: 'Đo kiểm và xác định nguyên nhân trước khi đề xuất phương án, chi phí hoặc linh kiện.',
    price: 'Phí khảo sát công khai',
  },
] as const;

export default function Home() {
  useDocumentTitle(
    'Điện Lạnh 247 - Sửa chữa, bảo trì và lắp đặt điện lạnh',
    'Dịch vụ điện lạnh tại nhà, bảo trì doanh nghiệp, lắp đặt và tư vấn kỹ thuật minh bạch.',
  );
  const { settings } = useSettings();
  const hotline = settings?.hotline || '1900 1234';

  return (
    <div className="overflow-hidden bg-white">
      <section className="relative isolate overflow-hidden bg-[#061527] text-white">
        <OptimizedImage
          assetKey="home.hero"
          priority
          widths={[480, 768, 1024, 1440]}
          sizes="100vw"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center] opacity-38"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,12,24,0.98),rgba(6,21,39,0.9)_55%,rgba(6,21,39,0.64))]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_15%,rgba(6,182,212,0.22),transparent_32%),radial-gradient(circle_at_10%_90%,rgba(37,99,235,0.2),transparent_35%)]" />

        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
          <div className="animate-[phase13-fade-up_500ms_ease-out_both] motion-reduce:animate-none">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-extrabold text-cyan-200 backdrop-blur">
              <Sparkles aria-hidden="true" className="h-4 w-4" /> Hỗ trợ kỹ thuật mỗi ngày
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
              Không gian mát lành,
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-white bg-clip-text text-transparent">
                dịch vụ rõ ràng từ đầu.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Tiếp nhận sửa chữa, vệ sinh, lắp đặt, bảo trì và kiểm tra tại Hà Nội. Mỗi yêu cầu có mã tra cứu, được xác nhận lịch và chỉ triển khai sau khi khách hàng đồng ý báo giá.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/service-booking"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-orange-800 motion-reduce:transform-none"
              >
                Đặt lịch kỹ thuật <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${hotline.replace(/\s+/g, '')}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                <Phone aria-hidden="true" className="h-4 w-4" /> Gọi {hotline}
              </a>
            </div>
            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Hà Nội', 'Khu vực phục vụ'],
                ['Mã riêng', 'Theo dõi yêu cầu'],
                ['Báo giá trước', 'Không tự ý sửa'],
                ['8:00–21:00', 'Tiếp nhận mỗi ngày'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <dt className="text-xs leading-5 text-slate-300">{label}</dt>
                  <dd className="mt-1 text-sm font-black text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:justify-self-end">
            <QuickContactForm
              compact
              title="Yêu cầu gọi lại"
              description="Gửi thông tin cơ bản để được tư vấn và xác nhận lịch phù hợp."
            />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 py-8" aria-label="Cam kết dịch vụ">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {servicePromises.map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-2xl p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary-700">
                <item.icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span>
                <strong className="block text-sm font-black text-slate-900">{item.title}</strong>
                <span className="mt-1 block text-xs leading-5 text-slate-600">{item.text}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader
              eyebrow="Dịch vụ nổi bật"
              title="Giải pháp phù hợp cho từng thiết bị"
              description="Nội dung dịch vụ được trình bày rõ về phạm vi, thời gian phản hồi, bảo hành và mức giá tham khảo."
            />
            <Link to="/services" className="inline-flex items-center gap-2 text-sm font-black text-primary-700">
              Xem toàn bộ dịch vụ <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {featuredServices.map((service, index) => (
              <article
                key={service.id}
                className={`group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl motion-reduce:transform-none ${
                  index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <span aria-hidden="true" className="absolute right-4 top-2 text-5xl font-black text-slate-50">0{index + 1}</span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-lg shadow-blue-500/15">
                  <service.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3 className="relative mt-5 text-lg font-black text-slate-950">{service.title}</h3>
                <p className="relative mt-3 min-h-24 text-sm leading-6 text-slate-600">{service.description}</p>
                <p className="relative mt-4 text-xs font-black text-emerald-700">{service.price}</p>
                <Link
                  to={`/service-booking?service=${encodeURIComponent(service.id)}`}
                  className="relative mt-5 inline-flex items-center gap-2 text-sm font-black text-primary-700"
                >
                  Gửi yêu cầu <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PricingTable />

      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative pb-6">
            <div className="overflow-hidden rounded-[2rem] bg-slate-100 shadow-2xl">
              <OptimizedImage
                assetKey="service.diagnostic-team"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="aspect-[4/3] h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-4 rounded-2xl border border-white/70 bg-white/95 p-5 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <ScanSearch aria-hidden="true" className="h-5 w-5" />
                </span>
                <div><strong className="block text-sm font-black text-slate-950">Chẩn đoán trước</strong><span className="text-xs text-slate-600">Báo giá rồi mới thực hiện</span></div>
              </div>
            </div>
          </div>
          <div className="lg:pl-6">
            <SectionHeader
              eyebrow="Về Điện Lạnh 247"
              title="Dịch vụ kỹ thuật được tổ chức như một quy trình có thể theo dõi"
              description="Từ bước tiếp nhận đến bảo hành, mỗi công việc đều có người phụ trách, trạng thái xử lý và thông tin bàn giao rõ ràng."
            />
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {['Điều phối theo khu vực và kỹ năng', 'Báo giá trước khi triển khai', 'Ghi nhận hình ảnh và kết quả', 'Theo dõi bảo hành sau dịch vụ'].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />{item}
                </div>
              ))}
            </div>
            <Link to="/about" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white">
              Tìm hiểu về chúng tôi <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Lý do lựa chọn"
            title="Bốn nguyên tắc xuyên suốt mỗi yêu cầu"
            description="Thiết kế dịch vụ tập trung vào sự rõ ràng, an toàn và khả năng hỗ trợ sau khi hoàn thành."
            align="center"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((reason, index) => (
              <article key={reason.title} className="rounded-[1.75rem] border border-slate-200 p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-primary-700">0{index + 1}</span>
                <h3 className="mt-5 text-lg font-black text-slate-950">{reason.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Quy trình phục vụ"
            title="Từ yêu cầu đến chăm sóc sau dịch vụ"
            description="Quy trình sáu bước giúp khách hàng biết rõ công việc đang ở đâu và ai đang phụ trách."
          />
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((item) => (
              <li key={item.step} className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-6">
                <span aria-hidden="true" className="absolute right-5 top-3 text-5xl font-black text-slate-100">{item.step}</span>
                <div className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-700 text-white"><CalendarCheck aria-hidden="true" className="h-5 w-5" /></span>
                  <h3 className="mt-5 text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[#061527] py-20 text-white sm:py-24" aria-labelledby="service-area-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Khu vực và thời gian</p>
            <h2 id="service-area-title" className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Biết trước nơi phục vụ và cách xác nhận lịch</h2>
            <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
              Hệ thống tiếp nhận yêu cầu mỗi ngày từ 8:00 đến 21:00 theo múi giờ Việt Nam. Khung giờ khách chọn là thời gian mong muốn; điều phối viên sẽ xác nhận lại trước khi kỹ thuật viên di chuyển.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="block text-sm">Tiếp nhận trực tuyến</strong><span className="mt-1 block text-xs text-slate-400">24/7, phản hồi trong giờ làm việc</span></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><strong className="block text-sm">Lịch được xác nhận</strong><span className="mt-1 block text-xs text-slate-400">Qua điện thoại, email hoặc Customer Hub</span></div>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-3"><MapPin aria-hidden="true" className="h-5 w-5 text-cyan-300" /><h3 className="font-black">Khu vực đang hỗ trợ tại Hà Nội</h3></div>
            <div className="mt-5 flex flex-wrap gap-2">
              {DISTRICT_OPTIONS.map((area) => (
                <span key={area.value} className="rounded-full border border-white/10 bg-slate-950/30 px-3 py-2 text-xs font-bold text-slate-200">{area.label}</span>
              ))}
            </div>
            <p className="mt-5 text-xs leading-6 text-slate-400">Địa chỉ ngoài danh sách sẽ được kiểm tra khả năng điều phối trước khi xác nhận. Website không tự động cam kết thời gian có mặt.</p>
          </div>
        </div>
      </section>

      <CmsManagedHomepage />

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader
              eyebrow="Góc kiến thức"
              title="Thông tin dễ hiểu để sử dụng thiết bị tốt hơn"
              description="Bài viết được tổ chức theo chủ đề, thời gian đọc và nội dung thực hành."
            />
            <Link to="/articles" className="inline-flex items-center gap-2 text-sm font-black text-primary-700">Xem tất cả bài viết <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <article key={article.slug} className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                <OptimizedImage src={article.image} alt={article.title} assetKey="article.cover" width={720} height={440} sizes="(max-width: 768px) 100vw, 33vw" className="aspect-[16/10] h-full w-full object-cover" />
                <div className="p-6">
                  <div className="flex gap-2 text-xs font-bold text-primary-700"><span>{article.category}</span><span>•</span><span>{article.readTime}</span></div>
                  <h3 className="mt-3 line-clamp-2 text-lg font-black text-slate-950">{article.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{article.excerpt}</p>
                  <Link to={`/articles/${article.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary-700">Đọc bài viết <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24" aria-labelledby="home-faq-title">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-primary-700">Câu hỏi thường gặp</p>
            <h2 id="home-faq-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950">Rõ lịch, rõ giá, rõ trách nhiệm</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Các điểm quan trọng được giải thích trước khi khách hàng gửi yêu cầu và trước khi kỹ thuật viên thực hiện công việc.</p>
            <Link to="/faq" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white">Xem toàn bộ câu hỏi <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-3">
            {serviceFaq.slice(0, 4).map((item) => (
              <details key={item.question} className="group rounded-2xl border border-slate-200 bg-slate-50 open:bg-white open:shadow-md">
                <summary className="ds-focus-ring flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 [&::-webkit-details-marker]:hidden">
                  {item.question}<span aria-hidden="true" className="text-xl text-primary-700 group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-slate-200 px-5 py-4 text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0c1b2e] py-20 text-white sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_88%_80%,rgba(6,182,212,0.18),transparent_36%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Liên hệ Điện Lạnh 247</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Mô tả tình trạng, chúng tôi sẽ cùng bạn tìm phương án.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">Form liên hệ được rút gọn để sử dụng tốt trên điện thoại. Trường hợp khẩn cấp, hãy gọi hotline để được tiếp nhận ngay.</p>
            <div className="mt-8 grid gap-4 text-sm text-slate-200">
              <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="flex items-center gap-3 font-bold"><Phone aria-hidden="true" className="h-5 w-5 text-cyan-300" /> {hotline}</a>
              <div className="flex items-center gap-3"><MapPin aria-hidden="true" className="h-5 w-5 text-cyan-300" /> {settings?.address || 'Cầu Giấy, Hà Nội'}</div>
              <div className="flex items-center gap-3"><Users aria-hidden="true" className="h-5 w-5 text-cyan-300" /> Phục vụ khách hàng gia đình và doanh nghiệp</div>
              <div className="flex items-center gap-3"><Building2 aria-hidden="true" className="h-5 w-5 text-cyan-300" /> Có phương án bảo trì định kỳ</div>
            </div>
          </div>
          <QuickContactForm title="Gửi yêu cầu liên hệ" description="Thông tin được sử dụng để tư vấn và xác nhận lịch dịch vụ." />
        </div>
      </section>
    </div>
  );
}
