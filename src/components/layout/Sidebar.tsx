'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid,
  FiUsers,
  FiLayers,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiDatabase,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useSidebar } from '@/context/SidebarContext';

export interface SidebarProps {
  onNavigate?: () => void;
  isMobileDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, isMobileDrawer = false }) => {
  const pathname = usePathname();
  const { user, logout, isDemoMode } = useAuth();
  const { settings: workspaceSettings } = useWorkspace();
  const { isCollapsed: contextCollapsed, toggleCollapse } = useSidebar();

  // If this is rendered in mobile drawer, ignore collapsed state and show full expanded sidebar
  const isCollapsed = isMobileDrawer ? false : contextCollapsed;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiGrid },
    { name: 'Clients', href: '/clients', icon: FiUsers },
    { name: 'Projects', href: '/projects', icon: FiLayers },
    { name: 'Payments', href: '/payments', icon: FiDollarSign },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  return (
    <aside
      className={cn(
        'h-full bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between select-none transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Section */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div
          className={cn(
            'border-b border-slate-100 dark:border-slate-800/80 flex items-center transition-all duration-300',
            isCollapsed ? 'p-3 justify-center' : 'p-4 justify-between'
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center min-w-0 group',
              isCollapsed ? 'justify-center' : 'gap-2.5'
            )}
            onClick={onNavigate}
            title={isCollapsed ? workspaceSettings.name || 'Client Hub' : undefined}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden shrink-0 relative transition-transform group-hover:scale-105">
              {workspaceSettings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={workspaceSettings.logoUrl}
                  alt={workspaceSettings.name}
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                <FiBriefcase className="w-4 h-4" />
              )}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1 truncate transition-opacity duration-200">
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight block truncate">
                  {workspaceSettings.name || 'Client Hub'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase block truncate">
                  {workspaceSettings.tagline || 'Workspace'}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button in Header (when expanded) */}
          {!isCollapsed && !isMobileDrawer && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
              title="Collapse sidebar (Ctrl+B)"
              aria-label="Collapse sidebar"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>


        {/* Navigation Links */}
        <nav className={cn('space-y-1.5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden', isCollapsed ? 'p-2' : 'p-3')}>
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <div key={item.name} className="relative group">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center rounded-xl text-sm font-medium transition-all duration-150',
                    isCollapsed
                      ? 'justify-center w-full h-11'
                      : 'gap-3 px-3.5 py-2.5',
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'shrink-0 transition-transform group-hover:scale-110',
                      isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                      isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    )}
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium shadow-xl whitespace-nowrap">
                    {item.name}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-slate-800" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Profile & Collapse Toggle */}
      <div className={cn('border-t border-slate-100 dark:border-slate-800/80 transition-all', isCollapsed ? 'p-2' : 'p-3')}>
        {/* Toggle button when collapsed */}
        {isCollapsed && !isMobileDrawer && (
          <div className="mb-2 flex justify-center">
            <button
              type="button"
              onClick={toggleCollapse}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Expand sidebar (Ctrl+B)"
              aria-label="Expand sidebar"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {isCollapsed ? (
          <div className="relative group flex justify-center">
            <button
              onClick={() => logout()}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center text-xs font-semibold transition-all border border-slate-200/60 dark:border-slate-800"
              title="Log out"
              aria-label="Log out"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
            <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex items-center px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium shadow-xl whitespace-nowrap">
              {user?.name || 'Owner'} (Log out)
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-slate-800" />
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'O'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {user?.name || 'Owner'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                  {user?.email || 'owner@workspace.dev'}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Log out"
              aria-label="Log out"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

