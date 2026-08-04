'use client';

import { useAppStore } from '@/lib/store';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`toast ${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <Icon size={18} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <X size={14} style={{ opacity: 0.6, cursor: 'pointer' }} />
          </div>
        );
      })}
    </div>
  );
}
