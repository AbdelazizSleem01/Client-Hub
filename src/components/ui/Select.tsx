'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: React.ReactNode;
}

export interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Select: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  disabled = false,
  className,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative w-full flex flex-col gap-1.5', className)} ref={containerRef}>
      {label && (
        <label id={id ? `${id}-label` : undefined} className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'w-full flex items-center justify-between bg-white dark:bg-slate-900 border text-sm rounded-lg px-3 py-2 text-left transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/10 focus:border-slate-800 dark:focus:border-slate-400 disabled:bg-slate-50 dark:disabled:bg-slate-950 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed',
          isOpen
            ? 'border-slate-800 dark:border-slate-400 ring-2 ring-slate-900/10 dark:ring-slate-100/10'
            : error
            ? 'border-rose-300 dark:border-rose-500/50'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              {selectedOption.badge}
              <span className="text-slate-900 dark:text-slate-100 truncate font-medium">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
          )}
        </div>
        <FiChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ml-2',
            isOpen ? 'rotate-180 text-slate-700 dark:text-slate-200' : ''
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 z-50 w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.badge}
                    <div className="truncate">
                      <div>{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-slate-400 dark:text-slate-500 font-normal">{option.description}</div>
                      )}
                    </div>
                  </div>
                  {isSelected && <FiCheck className="w-4 h-4 text-slate-800 dark:text-slate-200 shrink-0 ml-2" />}
                </div>
              );
            })
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
