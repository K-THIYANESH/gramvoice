/**
 * GramVoice TN - Common Feedback & Helper Components
 */
import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Inbox } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string | React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, message, className = '' }) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  }[type];

  const icons = {
    info: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
  }[type];

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${styles} ${className}`}>
      {icons}
      <div className="flex-1">
        {title && <h5 className="font-bold mb-0.5">{title}</h5>}
        <div>{message}</div>
      </div>
    </div>
  );
};

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse p-4">
      <div className="h-6 bg-slate-200 rounded-lg w-1/3" />
      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl border border-slate-200" />
        ))}
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{title}</h4>
      {description && <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>}
      {action}
    </div>
  );
};
