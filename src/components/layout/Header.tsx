'use client';

import React from 'react';
import { FiMenu, FiPlus, FiBell, FiSidebar, FiSun, FiMoon } from 'react-icons/fi';
import { Button } from '@/ui/Button';
import { useSidebar } from '@/context/SidebarContext';
import { useTheme } from '@/context/ThemeContext';

export interface HeaderProps {
  onOpenMobileMenu: () => void;
  title: string;
  subtitle?: string;
  onAddClient?: () => void;
  onAddProject?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  title,
  subtitle,
  onAddClient,
  onAddProject,
}) => {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Left Title & Menu/Sidebar Buttons */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          aria-label="Toggle sidebar"
        >
          <FiSidebar className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onAddClient && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddClient}
            leftIcon={<FiPlus className="w-3.5 h-3.5" />}
          >
            <span className="hidden xs:inline">Add Client</span>
            <span className="xs:hidden">Client</span>
          </Button>
        )}

        {onAddProject && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAddProject}
            leftIcon={<FiPlus className="w-3.5 h-3.5" />}
          >
            <span className="hidden xs:inline">Add Project</span>
            <span className="xs:hidden">Project</span>
          </Button>
        )}

        <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <FiSun className="w-4 h-4 text-amber-400" />
            ) : (
              <FiMoon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <FiBell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-emerald-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
