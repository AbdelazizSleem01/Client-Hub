'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, RememberDuration } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useTheme } from '@/context/ThemeContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Input } from '@/ui/Input';
import { Button } from '@/ui/Button';
import {
  FiLock,
  FiBriefcase,
  FiMail,
  FiEye,
  FiEyeOff,
  FiClock,
  FiSun,
  FiMoon,
} from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();
  const { settings: workspaceSettings } = useWorkspace();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [email, setEmail] = useState('owner@workspace.dev');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [rememberDuration, setRememberDuration] = useState<RememberDuration>('month');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const effectiveDuration = rememberMe ? rememberDuration : 'session';
    const res = await login(password, email, effectiveDuration);

    if (res.success) {
      toast.success('Welcome back! Logged in successfully.');
      router.push('/dashboard');
    } else {
      setError(res.error || 'Authentication failed');
      toast.error(res.error || 'Invalid credentials');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      {/* Top-Right Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <FiSun className="w-4 h-4 text-amber-400" /> : <FiMoon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs overflow-hidden p-1.5 border border-slate-800">
            {workspaceSettings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={workspaceSettings.logoUrl}
                alt={workspaceSettings.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <FiBriefcase className="w-6 h-6" />
            )}
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {workspaceSettings.name || 'Client Management Dashboard'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {workspaceSettings.tagline || 'Private owner portal for clients, projects & receivables'}
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white dark:bg-slate-900 py-8 px-6 shadow-sm border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:px-8">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Owner Access</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter credentials to unlock workspace</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              Private
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Owner Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@workspace.dev"
              leftIcon={<FiMail className="w-4 h-4" />}
              disabled={isSubmitting}
              required
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                leftIcon={<FiLock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    ) : (
                      <FiEye className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                  </button>
                }
                error={error}
                disabled={isSubmitting}
                autoFocus
                required
              />
            </div>

            {/* Remember Session */}
            <div className="pt-2 pb-2 border-t border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-slate-900 dark:focus:ring-slate-400 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Stay Signed In
                  </span>
                </label>

                {rememberMe && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-md border border-slate-200/90 dark:border-slate-800">
                    <FiClock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    <span>Duration:</span>
                    <select
                      value={rememberDuration}
                      onChange={(e) => setRememberDuration(e.target.value as RememberDuration)}
                      className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="month" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">30 Days</option>
                      <option value="week" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">7 Days</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Sign In to Dashboard
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Secured with Supabase Auth & PostgreSQL Row-Level Security
        </p>
      </div>
    </div>
  );
}
