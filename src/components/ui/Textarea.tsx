import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            'w-full bg-white dark:bg-slate-900 border text-sm text-slate-900 dark:text-slate-100 rounded-lg p-3 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10 focus:border-slate-800 dark:focus:border-slate-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-500 dark:disabled:text-slate-600 resize-y min-h-[80px]',
            error
              ? 'border-rose-300 dark:border-rose-500/50 focus:border-rose-500 focus:ring-rose-200 dark:focus:ring-rose-900/30'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
