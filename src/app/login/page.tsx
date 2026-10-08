'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, RememberDuration } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Input } from '@/ui/Input';
import { Button } from '@/ui/Button';
import {
  FiLock,
  FiBriefcase,
  FiMail,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiShield,
  FiClock,
} from 'react-icons/fi';

import { useWorkspace } from '@/context/WorkspaceContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, signUp, isDemoMode, isLoading } = useAuth();
  const { settings: workspaceSettings } = useWorkspace();
  const toast = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
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

    if (mode === 'signup') {
      const res = await signUp(password, email, effectiveDuration);
      if (res.success) {
        toast.success('Owner account created successfully!');
        // Try logging in immediately if not already set
        const loginRes = await login(password, email, effectiveDuration);
        if (loginRes.success) {
          router.push('/dashboard');
        } else {
          setMode('signin');
          toast.info('Account created. Please sign in now.');
        }
      } else {
        setError(res.error || 'Failed to create account');
        toast.error(res.error || 'Registration failed');
      }
    } else {
      const res = await login(password, email, effectiveDuration);
      if (res.success) {
        toast.success('Welcome back! Logged in successfully.');
        router.push('/dashboard');
      } else {
        setError(res.error || 'Authentication failed');
        toast.error(res.error || 'Invalid credentials');
      }
    }

    setIsSubmitting(false);
  };

  const handleQuickDemoLogin = async () => {
    setPassword('password');
    setIsSubmitting(true);
    const res = await login('password', 'owner@workspace.dev', rememberMe ? rememberDuration : 'session');
    if (res.success) {
      toast.success('Entered dashboard via Demo Mode');
      router.push('/dashboard');
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm overflow-hidden p-1.5">
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
          <h2 className="mt-4 text-xl font-bold text-slate-900 tracking-tight">
            {workspaceSettings.name || 'Client Management Dashboard'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {workspaceSettings.tagline || 'Private owner portal for clients, projects & receivables'}
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-8">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
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
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4 text-slate-600" />
                    ) : (
                      <FiEye className="w-4 h-4 text-slate-400" />
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
            <div className="pt-1 pb-1 border-t border-b border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Stay Signed In
                  </span>
                </label>

                {rememberMe && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    <FiClock className="w-3 h-3 text-slate-400" />
                    <span>Duration:</span>
                    <select
                      value={rememberDuration}
                      onChange={(e) => setRememberDuration(e.target.value as RememberDuration)}
                      className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="month">30 Days</option>
                      <option value="week">7 Days</option>
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
              {mode === 'signin' ? 'Sign In to Dashboard' : 'Create Owner Account'}
            </Button>
          </form>

      
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secured with Supabase Auth & PostgreSQL Row-Level Security
        </p>
      </div>
    </div>
  );
}
