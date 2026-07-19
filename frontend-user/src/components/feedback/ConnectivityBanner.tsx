import { useEffect, useState } from 'react';
import { CheckCircle2, CloudOff, RefreshCw } from 'lucide-react';

type ConnectivityState = 'online' | 'offline' | 'restored';

export default function ConnectivityBanner() {
  const [state, setState] = useState<ConnectivityState>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online',
  );

  useEffect(() => {
    let restoredTimer: number | undefined;
    const handleOffline = () => {
      window.clearTimeout(restoredTimer);
      setState('offline');
    };
    const handleOnline = () => {
      setState('restored');
      restoredTimer = window.setTimeout(() => setState('online'), 4_000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.clearTimeout(restoredTimer);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (state === 'online') return null;
  const offline = state === 'offline';

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[100] border-b px-4 py-3 shadow-lg backdrop-blur motion-safe:animate-[connectivity-slide_.2s_ease-out] ${
        offline
          ? 'border-amber-300 bg-amber-50/95 text-amber-950'
          : 'border-emerald-300 bg-emerald-50/95 text-emerald-950'
      }`}
      role="status"
      aria-live="assertive"
      data-testid="connectivity-banner"
      data-connectivity-state={state}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 text-sm font-semibold">
        {offline ? <CloudOff className="h-5 w-5 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />}
        <span>
          {offline
            ? 'Đang mất kết nối. Thông tin bạn đã nhập vẫn được giữ; hãy kết nối lại trước khi gửi.'
            : 'Đã kết nối lại. Bạn có thể tiếp tục gửi yêu cầu.'}
        </span>
        {offline && <RefreshCw className="hidden h-4 w-4 shrink-0 motion-safe:animate-spin sm:block" aria-hidden="true" />}
      </div>
    </div>
  );
}
