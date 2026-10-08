'use client';

import React, { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        ref={contentRef}
        className={cn(
          'relative w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-snug">{title}</h2>
            {description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5" suppressHydrationWarning>
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-4"
            aria-label="Close dialog"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-700 dark:text-slate-300">{children}</div>
      </div>
    </div>
  );
};
