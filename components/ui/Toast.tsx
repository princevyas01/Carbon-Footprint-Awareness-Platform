'use client';

import React from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ToastMessage } from '../../context/CarbonContext';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const { id, type, message } = toast;

  const typeStyles = {
    success: {
      bg: 'bg-green/10 border-green/30',
      text: 'text-[#00FF87] dark:text-[#00FF87]',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-amber/10 border-amber/30',
      text: 'text-amber',
      icon: AlertTriangle,
    },
    error: {
      bg: 'bg-coral/10 border-coral/30',
      text: 'text-coral',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-white/5 border-border',
      text: 'text-frost',
      icon: Info,
    },
  };

  const styles = typeStyles[type] || typeStyles.info;
  const Icon = styles.icon;

  return (
    <div
      className={`max-w-md w-full glass-panel ${styles.bg} border rounded-xl p-4 shadow-xl flex items-start space-x-3 transition-all duration-300 transform translate-y-0 scale-100 animate-fade-in-up`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`h-5 w-5 ${styles.text} shrink-0 mt-0.5`} />
      <div className="flex-1 text-sm font-body text-frost">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="text-muted hover:text-frost transition-colors shrink-0 p-0.5 rounded-lg hover:bg-white/5"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
