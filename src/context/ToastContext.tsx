'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toast = {
    success: useCallback((message: string, title?: string) => addToast('success', message, title || 'Success'), [addToast]),
    error: useCallback((message: string, title?: string) => addToast('error', message, title || 'Notice'), [addToast]),
    info: useCallback((message: string, title?: string) => addToast('info', message, title || 'Information'), [addToast]),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Glassmorphic Toast Notification Container */}
      <div
        aria-live="polite"
        style={{ zIndex: 99999 }}
        className="fixed top-5 right-5 flex flex-col gap-3 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none select-none"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-lg transition-all duration-300 transform translate-y-0 ${
              item.type === 'success'
                ? 'bg-white/90 border-emerald-500/30 text-slate-800 shadow-emerald-500/10'
                : item.type === 'error'
                ? 'bg-white/90 border-rose-500/30 text-slate-800 shadow-rose-500/10'
                : 'bg-white/90 border-slate-300/50 text-slate-800 shadow-slate-900/5'
            }`}
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {/* Subtle Glass Tint Accent Background */}
            <div
              className={`absolute inset-0 pointer-events-none opacity-40 ${
                item.type === 'success'
                  ? 'bg-linear-to-r from-emerald-100/80 via-emerald-50/40 to-transparent'
                  : item.type === 'error'
                  ? 'bg-linear-to-r from-rose-100/80 via-rose-50/40 to-transparent'
                  : 'bg-linear-to-r from-slate-100/80 via-slate-50/40 to-transparent'
              }`}
            />

            {/* Left Accent Bar */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                item.type === 'success'
                  ? 'bg-emerald-500'
                  : item.type === 'error'
                  ? 'bg-rose-500'
                  : 'bg-slate-700'
              }`}
            />

            {/* Icon Bubble */}
            <div
              className={`relative mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs ${
                item.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200/80 text-emerald-600'
                  : item.type === 'error'
                  ? 'bg-rose-50 border-rose-200/80 text-rose-600'
                  : 'bg-slate-100 border-slate-200/80 text-slate-700'
              }`}
            >
              {item.type === 'success' && <FiCheckCircle className="w-4 h-4 stroke-2" />}
              {item.type === 'error' && <FiAlertCircle className="w-4 h-4 stroke-2" />}
              {item.type === 'info' && <FiInfo className="w-4 h-4 stroke-2" />}
            </div>

            {/* Content */}
            <div className="relative flex-1 min-w-0 pr-1">
              <p
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  item.type === 'success'
                    ? 'text-emerald-700'
                    : item.type === 'error'
                    ? 'text-rose-700'
                    : 'text-slate-600'
                }`}
              >
                {item.title || (item.type === 'success' ? 'Success' : item.type === 'error' ? 'Error' : 'Notice')}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug mt-0.5 break-words">
                {item.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(item.id)}
              className="relative shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/70 transition-colors"
              aria-label="Close notification"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
};
