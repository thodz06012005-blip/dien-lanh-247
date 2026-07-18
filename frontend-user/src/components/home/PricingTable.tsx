import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Calendar, ShieldCheck } from 'lucide-react';

interface PricingItem {
  name: string;
  price: string;
  warranty: string;
  category: 'dieu-hoa' | 'tu-lanh' | 'may-giat';
}

const pricingData: PricingItem[] = [
  { name: 'Vệ sinh điều hòa treo tường (1HP - 2.5HP)', price: '150.000đ', warranty: '1 tháng chảy nước', category: 'dieu-hoa' },
  { name: 'Sửa điều hòa chảy nước dàn lạnh', price: '200.000đ', warranty: '1 tháng', category: 'dieu-hoa' },
  { name: 'Nạp gas châm thêm R32 / R410A', price: 'Từ 8.000đ / PSI', warranty: 'Bảo hành kín khít', category: 'dieu-hoa' },
  { name: 'Kiểm tra xử lý sự cố mất nguồn', price: 'Từ 250.000đ', warranty: '3 - 6 tháng', category: 'dieu-hoa' },
  { name: 'Kiểm tra xử lý tủ lạnh đóng tuyết', price: 'Từ 350.000đ', warranty: '3 tháng', category: 'tu-lanh' },
  { name: 'Thay thế cảm biến nhiệt / sò nóng, lạnh', price: '300.000đ - 450.000đ', warranty: '3 tháng', category: 'tu-lanh' },
  { name: 'Sửa bo mạch điều khiển tủ lạnh Inverter', price: 'Từ 550.000đ', warranty: '6 tháng', category: 'tu-lanh' },
  { name: 'Vệ sinh lồng giặt cửa đứng (cửa trên)', price: '250.000đ', warranty: 'Lồng giặt sạch bóng', category: 'may-giat' },
  { name: 'Vệ sinh lồng giặt cửa ngang (cửa trước)', price: '450.000đ', warranty: 'Tháo rời xịt rửa sâu', category: 'may-giat' },
  { name: 'Sửa máy giặt rung lắc mạnh, kêu to', price: 'Từ 300.000đ', warranty: '6 tháng', category: 'may-giat' },
  { name: 'Xử lý lỗi board mạch máy giặt mất nguồn', price: 'Từ 450.000đ', warranty: '6 tháng', category: 'may-giat' }
];

export default function PricingTable() {
  const getCategoryLabel = (cat: PricingItem['category']) => {
    switch (cat) {
      case 'dieu-hoa': return 'Dịch vụ Điều hòa';
      case 'tu-lanh': return 'Dịch vụ Tủ lạnh';
      case 'may-giat': return 'Dịch vụ Máy giặt';
    }
  };

  const categories: PricingItem['category'][] = ['dieu-hoa', 'tu-lanh', 'may-giat'];

  return (
    <section className="border-y border-slate-100 bg-white py-20 sm:py-24" aria-labelledby="reference-pricing-title">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary-700">
            <span className="inline-block h-px w-5 rounded-full bg-blue-500" />
            Bảng giá tham khảo
          </p>
          <h2 id="reference-pricing-title" className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
            Mức giá dễ đối chiếu trước khi đặt lịch
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Các mức dưới đây giúp khách hàng hình dung chi phí ban đầu. Báo giá chính thức chỉ được xác nhận sau khi kiểm tra tình trạng và luôn cần khách hàng đồng ý trước khi thực hiện.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {categories.map((cat) => {
            const items = pricingData.filter(item => item.category === cat);
            return (
              <article key={cat} className="flex flex-col rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl motion-reduce:transform-none sm:p-8">
                <h3 className="mb-5 flex items-center gap-2 border-b border-slate-200/80 pb-4 text-base font-black text-slate-950">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
                  {getCategoryLabel(cat)}
                </h3>

                <ul className="flex flex-grow flex-col gap-5">
                  {items.map((item) => (
                    <li key={item.name} className="group flex flex-col border-b border-slate-200/60 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="text-xs font-bold leading-snug text-slate-800 transition-colors group-hover:text-blue-700">{item.name}</h4>
                        <span className="shrink-0 text-right text-xs font-black text-slate-950">{item.price}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>Bảo hành: <strong className="font-bold text-slate-700">{item.warranty}</strong></span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-slate-200/80 pt-6">
                  <Link to="/service-booking" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-600 px-4 text-xs font-black text-white shadow-sm transition hover:from-blue-800 hover:to-cyan-700 hover:shadow-md">
                      <Calendar aria-hidden="true" className="h-4 w-4" />
                      Đặt lịch kỹ thuật viên
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <p className="text-xs leading-6 text-slate-600">
            <strong className="font-black text-orange-800">Lưu ý:</strong> Kỹ thuật viên kiểm tra và báo giá chính xác trước khi sửa. Khách hàng có quyền không tiếp tục nếu chưa đồng ý phương án hoặc chi phí.
          </p>
        </div>
      </div>
    </section>
  );
}
