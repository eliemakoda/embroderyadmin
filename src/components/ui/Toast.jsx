import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    icon: 'text-success-500',
    text: 'text-success-800'
  },
  error: {
    bg: 'bg-error-50',
    border: 'border-error-200',
    icon: 'text-error-500',
    text: 'text-error-800'
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    icon: 'text-warning-500',
    text: 'text-warning-800'
  },
  info: {
    bg: 'bg-info-50',
    border: 'border-info-200',
    icon: 'text-info-500',
    text: 'text-info-800'
  },
};

export default function Toast({ type = 'info', message, onClose }) {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`flex items-center p-4 rounded-lg border ${colors.bg} ${colors.border} shadow-lg min-w-80 animate-slide-down`}>
      <Icon className={`w-5 h-5 ${colors.icon} mr-3 flex-shrink-0`} />
      <p className={`text-sm font-medium ${colors.text} flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`ml-3 p-1 rounded-full hover:bg-black/10 transition-colors ${colors.text}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}