// src/components/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const COLORS = {
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
};

const Toast = ({ id, message, type = 'info', duration = 5000, onClose }) => {
  const Icon = ICONS[type] || Info;
  const colorClass = COLORS[type] || COLORS.info;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose?.(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-start space-x-3 min-w-[320px] max-w-md p-4 rounded-lg border backdrop-blur-md shadow-lg animate-slide-in ${colorClass}`}
      role="alert"
      aria-live="polite"
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm text-gray-100">{message}</p>
      <button
        onClick={() => onClose?.(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

export default Toast;
