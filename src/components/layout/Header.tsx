'use client';

import React from 'react';
import { FiMenu, FiPlus, FiBell, FiSidebar } from 'react-icons/fi';
import { Button } from '@/ui/Button';
import { useSidebar } from '@/context/SidebarContext';

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

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0">
      {/* Left Title & Menu/Sidebar Buttons */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          aria-label="Toggle sidebar"
        >
          <FiSidebar className="w-4 h-4" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5">{subtitle}</p>
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

        <div className="hidden sm:flex items-center pl-2 border-l border-slate-200">
          <button
            type="button"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <FiBell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-900" />
          </button>
        </div>
      </div>
    </header>
  );
};
