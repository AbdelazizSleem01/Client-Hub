'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardHeader, CardTitle } from '@/ui/Card';
import { Input } from '@/ui/Input';
import { Button } from '@/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { ConfirmModal } from '@/ui/ConfirmModal';
import { cn } from '@/lib/utils';
import {
  FiLock,
  FiBriefcase,
  FiUploadCloud,
  FiUpload,
  FiTrash2,
  FiShield,
  FiEye,
  FiCheckCircle,
} from 'react-icons/fi';

export default function SettingsPage() {
  const { user, isDemoMode, updatePassword } = useAuth();
  const { resetToSampleData } = useData();
  const { settings: workspaceSettings, updateSettings: updateWorkspaceSettings } = useWorkspace();
  const toast = useToast();

  // Branding states
  const [siteName, setSiteName] = useState(workspaceSettings.name || 'Client Hub');
  const [siteTagline, setSiteTagline] = useState(workspaceSettings.tagline || 'Workspace');
  const [siteLogoUrl, setSiteLogoUrl] = useState(workspaceSettings.logoUrl || '');
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync workspace settings when loaded
  useEffect(() => {
    setSiteName(workspaceSettings.name || 'Client Hub');
    setSiteTagline(workspaceSettings.tagline || 'Workspace');
    setSiteLogoUrl(workspaceSettings.logoUrl || '');
  }, [workspaceSettings]);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Handle Logo Upload and Drag & Drop
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image file is too large. Please select an image under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setSiteLogoUrl(base64);
        toast.info('Logo loaded! Click "Save Branding" to apply changes');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) {
      toast.error('Please enter a website name');
      return;
    }

    setIsSavingBranding(true);
    updateWorkspaceSettings({
      name: siteName.trim(),
      tagline: siteTagline.trim(),
      logoUrl: siteLogoUrl.trim(),
    });

    toast.success('Workspace branding updated successfully!');
    setIsSavingBranding(false);
  };

  const handleRemoveLogo = () => {
    setSiteLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError('');

    const res = await updatePassword(newPassword);
    if (res.success) {
      toast.success('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res.error || 'Failed to update password');
      toast.error(res.error || 'Could not change password');
    }
    setIsUpdatingPassword(false);
  };

  return (
    <AppShell
      title="Settings & Branding"
      subtitle="Manage your website branding, logo, credentials, and workspace preferences"
    >
      <div className="max-w-4xl space-y-6">
        {/* Workspace Branding: Site Name & Logo */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FiBriefcase className="w-4 h-4 text-slate-700" />
              <CardTitle>Workspace Branding</CardTitle>
            </div>
          </CardHeader>

          <form onSubmit={handleSaveBranding} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Website Name"
                placeholder="e.g. Client Hub or Your Agency Name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />

              <Input
                label="Tagline / Subtitle"
                placeholder="e.g. Workspace, Studio, Agency"
                value={siteTagline}
                onChange={(e) => setSiteTagline(e.target.value)}
              />
            </div>

            {/* Logo Configuration */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                    Website Logo
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Upload your custom logo icon to display in the sidebar brand header
                  </p>
                </div>
                {siteLogoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1.5 font-medium transition-colors px-2.5 py-1 rounded-lg hover:bg-rose-50"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    Reset to Default Logo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Upload Dropzone Box (7 columns) */}
                <div className="lg:col-span-7">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="logo-file-input"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      'relative group border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[175px]',
                      isDragging
                        ? 'border-slate-900 bg-slate-100/80 scale-[0.99]'
                        : 'border-slate-200/90 hover:border-slate-400 hover:bg-slate-50/80 bg-slate-50/40'
                    )}
                  >
                    {siteLogoUrl ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-center p-2 relative group-hover:scale-105 transition-transform overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={siteLogoUrl}
                            alt="Uploaded Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Custom Logo Loaded</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Click or drag a new image file to replace
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-600 group-hover:text-slate-900 group-hover:scale-110 transition-all">
                          <FiUploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            Click to upload <span className="font-normal text-slate-500">or drag and drop</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            PNG, JPG, WebP, SVG • Maximum 2MB (Square ratio recommended)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Preview Box (5 columns) */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FiEye className="w-3.5 h-3.5 text-slate-400" />
                          Sidebar Preview
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Header Pill</span>
                      </div>

                      {/* Mini Sidebar Preview Pill */}
                      <div className="w-full p-3 rounded-xl bg-white border border-slate-200/90 flex items-center gap-3 shadow-xs">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden shrink-0">
                          {siteLogoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={siteLogoUrl}
                              alt="Logo Preview"
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <FiBriefcase className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="min-w-0 text-left flex-1">
                          <span className="font-semibold text-slate-900 text-sm tracking-tight block truncate">
                            {siteName || 'Client Hub'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase block truncate">
                            {siteTagline || 'Workspace'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-3 text-center">
                      Shows how your logo & workspace name appear in the sidebar header.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={isSavingBranding}>
                Save Branding
              </Button>
            </div>
          </form>
        </Card>

        {/* Security / Change Password */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FiLock className="w-4 h-4 text-slate-500" />
              <CardTitle>Change Owner Password</CardTitle>
            </div>
          </CardHeader>

          <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Update the password used to access this dashboard.
              {isDemoMode
                ? ' Running in Demo Mode: changes will persist in your local browser storage.'
                : ' Running with Supabase: your password will be updated directly in Supabase Auth.'}
            </p>

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError('');
              }}
              error={passwordError}
              leftIcon={<FiLock className="w-4 h-4" />}
              disabled={isUpdatingPassword}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError('');
              }}
              leftIcon={<FiShield className="w-4 h-4" />}
              disabled={isUpdatingPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUpdatingPassword}
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
