import React from 'react';
import { Inbox } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionLink?: string;
}

export default function EmptyState({
  icon = <Inbox aria-hidden="true" className="h-16 w-16 text-slate-300" />,
  title = 'Danh sách trống',
  description = 'Không tìm thấy dữ liệu nào phù hợp hoặc danh sách hiện tại đang trống.',
  actionText,
  onAction,
  actionLink,
}: EmptyStateProps) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionLink) {
      navigate(actionLink);
    }
  };

  return (
    <section role="status" className="mx-auto my-6 flex max-w-md flex-col items-center justify-center rounded-3xl border border-slate-100/80 bg-white p-8 text-center shadow-sm sm:p-12">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed max-w-sm">
        {description}
      </p>
      {(actionText && (onAction || actionLink)) && (
        <Button variant="primary" onClick={handleAction}>
          {actionText}
        </Button>
      )}
    </section>
  );
}
