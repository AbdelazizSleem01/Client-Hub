'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/ui/Modal';
import { Input } from '@/ui/Input';
import { Textarea } from '@/ui/Textarea';
import { Select, SelectOption } from '@/ui/Select';
import { Button } from '@/ui/Button';
import { Project, ProjectStatus } from '@/types';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { ProjectStatusBadge } from '@/ui/Badge';
import { calculateRemaining, determinePaymentStatus, formatCurrency } from '@/lib/utils';
import {
  FiGlobe,
  FiGithub,
  FiServer,
  FiLock,
  FiImage,
  FiDollarSign,
  FiUpload,
  FiTrash2,
  FiCheckCircle,
  FiCalendar,
} from 'react-icons/fi';

export interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
  defaultClientId?: string;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'in_development', label: 'In Development', badge: <ProjectStatusBadge status="in_development" size="sm" /> },
  { value: 'live', label: 'Live', badge: <ProjectStatusBadge status="live" size="sm" /> },
  { value: 'completed', label: 'Completed', badge: <ProjectStatusBadge status="completed" size="sm" /> },
  { value: 'maintenance', label: 'Maintenance', badge: <ProjectStatusBadge status="maintenance" size="sm" /> },
  { value: 'paused', label: 'Paused', badge: <ProjectStatusBadge status="paused" size="sm" /> },
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  defaultClientId,
}) => {
  const { clients, addProject, updateProject } = useData();
  const toast = useToast();

  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [vercelUrl, setVercelUrl] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [adminUrl, setAdminUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('in_development');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [totalPrice, setTotalPrice] = useState<string>('0');
  const [amountPaid, setAmountPaid] = useState<string>('0');
  const [currency, setCurrency] = useState('$');

  const [activeTab, setActiveTab] = useState<'details' | 'links' | 'financials'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const clientOptions: SelectOption[] = clients.map((c) => ({
    value: c.id,
    label: c.company ? `${c.name} (${c.company})` : c.name,
  }));

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size is too large. Please select an image under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setImageUrl(base64);
        toast.success('Project image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (projectToEdit) {
      setClientId(projectToEdit.client_id || '');
      setName(projectToEdit.name || '');
      setDescription(projectToEdit.description || '');
      setLiveUrl(projectToEdit.live_url || '');
      setGithubUrl(projectToEdit.github_url || '');
      setVercelUrl(projectToEdit.vercel_url || '');
      setServerUrl(projectToEdit.server_url || '');
      setAdminUrl(projectToEdit.admin_url || '');
      setImageUrl(projectToEdit.image_url || '');
      setTechStackInput(projectToEdit.tech_stack ? projectToEdit.tech_stack.join(', ') : '');
      setStatus(projectToEdit.status || 'in_development');
      setDeadline(projectToEdit.deadline || '');
      setNotes(projectToEdit.notes || '');
      setTotalPrice(String(projectToEdit.total_price || 0));
      setAmountPaid(String(projectToEdit.amount_paid || 0));
      setCurrency(projectToEdit.currency || '$');
    } else {
      setClientId(defaultClientId || (clients[0]?.id || ''));
      setName('');
      setDescription('');
      setLiveUrl('');
      setGithubUrl('');
      setVercelUrl('');
      setServerUrl('');
      setAdminUrl('');
      setImageUrl('');
      setTechStackInput('Next.js, TypeScript, Tailwind CSS');
      setStatus('in_development');
      setDeadline('');
      setNotes('');
      setTotalPrice('0');
      setAmountPaid('0');
      setCurrency('$');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setActiveTab('details');
    setErrors({});
  }, [projectToEdit, defaultClientId, clients, isOpen]);

  // Real-time calculation of remaining amount and payment status
  const numericTotal = Math.max(0, parseFloat(totalPrice) || 0);
  const numericPaid = Math.max(0, parseFloat(amountPaid) || 0);
  const remainingAmount = calculateRemaining(numericTotal, numericPaid);
  const paymentStatus = determinePaymentStatus(numericTotal, numericPaid);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = 'Project name is required';
    }
    if (!clientId) {
      errs.clientId = 'Please select a client';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const tech_stack = techStackInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const selectedClient = clients.find((c) => c.id === clientId);
      const client_name = selectedClient ? (selectedClient.company || selectedClient.name) : '';

      const payload = {
        client_id: clientId,
        client_name,
        name: name.trim(),
        description: description.trim(),
        live_url: liveUrl.trim(),
        github_url: githubUrl.trim(),
        vercel_url: vercelUrl.trim(),
        server_url: serverUrl.trim(),
        admin_url: adminUrl.trim(),
        image_url: imageUrl.trim(),
        tech_stack,
        status,
        deadline: deadline.trim() || undefined,
        notes: notes.trim(),
        total_price: numericTotal,
        amount_paid: numericPaid,
        currency,
      };

      if (projectToEdit) {
        await updateProject(projectToEdit.id, payload);
        toast.success('Project updated successfully');
      } else {
        await addProject(payload);
        toast.success('Project added successfully');
      }
      onClose();
    } catch {
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Project' : 'Add New Project'}
      description="Manage client project specifications, links, and financial balances."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            1. General Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'links'
                ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            2. Deployment & URLs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('financials')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'financials'
                ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            3. Financials
          </button>
        </div>

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Assign Client"
                options={clientOptions}
                value={clientId}
                onChange={setClientId}
                placeholder="Choose Client"
                error={errors.clientId}
                disabled={isSubmitting}
              />
              <Select
                label="Project Status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(val) => setStatus(val as ProjectStatus)}
                disabled={isSubmitting}
              />
            </div>

            <Input
              label="Project Name"
              placeholder="e.g. Modern E-Commerce Platform"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              disabled={isSubmitting}
            />

            <Textarea
              label="Description"
              placeholder="Short description of what the project does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />

            <Input
              label="Technology Stack"
              placeholder="Next.js, TypeScript, Tailwind, Supabase (comma-separated)"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              helperText="Separate multiple technologies with commas"
              disabled={isSubmitting}
            />

            {/* Delivery Deadline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Delivery Deadline (Optional)
                </label>
                {deadline && (
                  <button
                    type="button"
                    onClick={() => setDeadline('')}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Clear Date
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    leftIcon={<FiCalendar className="w-4 h-4 text-slate-400" />}
                    disabled={isSubmitting}
                  />
                </div>
                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setDeadline(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    +1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 14);
                      setDeadline(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    +2 Weeks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 1);
                      setDeadline(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                  >
                    +1 Month
                  </button>
                </div>
              </div>
            </div>

            {/* Project Screenshot / Image & Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                  Project Screenshot / Logo
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                    Remove Image
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="https://... direct image URL or upload file"
                        value={imageUrl.startsWith('data:') ? 'Custom uploaded image from device' : imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        leftIcon={<FiImage className="w-4 h-4" />}
                        disabled={isSubmitting || imageUrl.startsWith('data:')}
                      />
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="project-image-file-input"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => fileInputRef.current?.click()}
                      leftIcon={<FiUpload className="w-4 h-4" />}
                      className="shrink-0 font-medium whitespace-nowrap"
                    >
                      Upload File
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Paste a direct image URL (PNG, WebP, JPG) or upload a picture directly .
                  </p>
                </div>

                {/* Live Thumbnail Preview */}
                {imageUrl && (
                  <div className="shrink-0 flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 flex items-center justify-center overflow-hidden relative shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl.startsWith('data:') ? imageUrl : `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`}
                        alt="Preview"
                        className="w-full h-full object-contain p-1 rounded-lg"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = imageUrl;
                        }}
                      />
                    </div>
                    <div className="text-left pr-2">
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        Preview Ready
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {imageUrl.startsWith('data:') ? 'Device upload' : 'Web URL'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Textarea
              label="Additional Notes"
              placeholder="Server credentials, environment notes, or handover reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={2}
            />
          </div>
        )}

        {/* Tab 2: URLs & Hosting */}
        {activeTab === 'links' && (
          <div className="space-y-4 pt-1">
            <p className="text-xs text-slate-500 mb-2">
              All entered URLs will be clickable and safely opened in a new browser tab.
            </p>

            <Input
              label="Live Website URL"
              placeholder="https://example.com"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              leftIcon={<FiGlobe className="w-4 h-4" />}
              disabled={isSubmitting}
            />

            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/username/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              leftIcon={<FiGithub className="w-4 h-4" />}
              disabled={isSubmitting}
            />

            <Input
              label="Vercel URL / Deployment"
              placeholder="https://project.vercel.app"
              value={vercelUrl}
              onChange={(e) => setVercelUrl(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L24 22H0L12 1Z" />
                </svg>
              }
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Server / Hosting URL"
                placeholder="https://api.domain.com or AWS/DigitalOcean console"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                leftIcon={<FiServer className="w-4 h-4" />}
                disabled={isSubmitting}
              />
              <Input
                label="Admin Panel URL"
                placeholder="https://example.com/admin"
                value={adminUrl}
                onChange={(e) => setAdminUrl(e.target.value)}
                leftIcon={<FiLock className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Financials */}
        {activeTab === 'financials' && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Currency Symbol"
                placeholder="$"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={isSubmitting}
              />
              <Input
                label="Total Project Price"
                type="number"
                min="0"
                step="any"
                placeholder="5000"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                leftIcon={<FiDollarSign className="w-4 h-4" />}
                disabled={isSubmitting}
              />
              <Input
                label="Amount Paid So Far"
                type="number"
                min="0"
                step="any"
                placeholder="2000"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                leftIcon={<FiDollarSign className="w-4 h-4" />}
                disabled={isSubmitting}
              />
            </div>

            {/* Live Calculation Display */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Financial Summary & Calculation
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Agreed:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(numericTotal, currency)}</span>
                </div>
                <div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 block">Collected:</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(numericPaid, currency)}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                  <span className="text-xs text-amber-800 dark:text-amber-300 font-medium block">
                    Remaining Balance:
                  </span>
                  <span className="text-base font-bold text-amber-900 dark:text-amber-200">
                    {formatCurrency(remainingAmount, currency)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Calculated formula: <code className="text-slate-700 dark:text-slate-300">Remaining = Total - Paid</code></span>
                <span className="font-medium capitalize text-slate-700 dark:text-slate-300">
                  Status: <strong>{paymentStatus.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-400">
            {activeTab === 'details' && 'Step 1 of 3'}
            {activeTab === 'links' && 'Step 2 of 3'}
            {activeTab === 'financials' && 'Step 3 of 3'}
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== 'details' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (activeTab === 'financials') setActiveTab('links');
                  else if (activeTab === 'links') setActiveTab('details');
                }}
              >
                Back
              </Button>
            )}

            {activeTab !== 'financials' ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (activeTab === 'details') setActiveTab('links');
                  else if (activeTab === 'links') setActiveTab('financials');
                }}
              >
                Next
              </Button>
            ) : null}

            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              {projectToEdit ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
