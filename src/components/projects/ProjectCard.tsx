'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/ui/Card';
import { ProjectStatusBadge, PaymentStatusBadge } from '@/ui/Badge';
import { Project } from '@/types';
import { ProjectLinks } from './ProjectLinks';
import { formatCurrency, getDeadlineInfo, cn } from '@/lib/utils';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/ui/ConfirmModal';
import { PaymentRecordModal } from '@/components/payments/PaymentRecordModal';
import { InvoiceModal } from '@/components/invoices/InvoiceModal';
import {
  FiEdit2,
  FiTrash2,
  FiCreditCard,
  FiLayers,
  FiCalendar,
  FiFileText,
} from 'react-icons/fi';

export interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  priority?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, priority = false }) => {
  const { deleteProject } = useData();
  const toast = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const deadlineInfo = getDeadlineInfo(project.deadline);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProject(project.id);
      toast.success('Project deleted successfully');
      setShowDeleteConfirm(false);
    } catch {
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const getSafeImageUrl = (url: string | undefined): string => {
    if (!url) return '';
    if (url.startsWith('/') || url.startsWith('data:')) return url;
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  return (
    <>
      <Card hoverable className="p-0 overflow-hidden flex flex-col justify-between group border-slate-200/80">
        <div>
          {/* Top Image or Header Banner */}
          <div className="relative h-44 w-full bg-slate-50/80 dark:bg-slate-900/80 overflow-hidden border-b border-slate-100 dark:border-slate-800 flex items-center justify-center p-3">
            {project.image_url && !imageError ? (
              <div className="w-32 h-32 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-xs flex items-center justify-center p-2.5 overflow-hidden shrink-0 group-hover:scale-105 transition-all duration-300 mt-2 sm:mt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getSafeImageUrl(project.image_url)}
                  alt={project.name}
                  className="w-full h-full object-contain rounded-xl"
                  loading={priority ? 'eager' : 'lazy'}
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 shadow-2xs flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 mt-2 sm:mt-1">
                <FiLayers className="w-7 h-7 stroke-1 text-slate-400 dark:text-slate-500" />
                <span className="text-[10px] font-medium tracking-wider uppercase mt-1 text-slate-400 dark:text-slate-500">
                  {imageError ? 'No preview' : 'No logo'}
                </span>
              </div>
            )}

            {/* Status Badges Overlay - Positioned to the card edges/corners */}
            <div className="absolute top-0 left-0 flex items-center gap-1.5 flex-wrap z-10">
              <ProjectStatusBadge status={project.status} size="sm" />
            </div>

            <div className="absolute top-0 right-0 z-10">
              <PaymentStatusBadge status={project.payment_status} size="sm" />
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5">
            {/* Client Denormalized Tag */}
            {project.client_name && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {project.client_name}
              </span>
            )}

            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {project.name}
            </h3>

            {project.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                {project.description}
              </p>
            )}

            {/* Delivery Deadline Badge */}
            {deadlineInfo && (
              <div
                className={cn(
                  'mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-2xs',
                  deadlineInfo.isOverdue
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
                    : deadlineInfo.isDueToday
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 animate-pulse'
                    : deadlineInfo.isDueSoon
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                )}
                title={`Target delivery: ${project.deadline}`}
              >
                <FiCalendar className="w-3.5 h-3.5 shrink-0" />
                <span>{deadlineInfo.label}</span>
              </div>
            )}

            {/* Tech Stack Badges */}
            {project.tech_stack && project.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.tech_stack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Clickable Action URLs */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <ProjectLinks project={project} size="sm" />
            </div>

            {/* Financials Summary Box */}
            <div className="mt-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Total / Paid
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {formatCurrency(project.total_price, project.currency)} /{' '}
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{formatCurrency(project.amount_paid, project.currency)}</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  Remaining Balance
                </span>
                <span
                  className={`text-sm font-bold ${
                    project.remaining_amount > 0 ? 'text-amber-900 dark:text-amber-300' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {formatCurrency(project.remaining_amount, project.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs mt-auto">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
          >
            <FiCreditCard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            Record Payment
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Generate Invoice / Receipt"
              aria-label="Generate Invoice"
            >
              <FiFileText className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              title="Edit Project"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Project"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
        confirmText="Delete Project"
        isDestructive={true}
        isLoading={isDeleting}
      />

      {/* Record Payment Modal */}
      <PaymentRecordModal
        project={project}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />

      {/* Invoice & Receipt Generator Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        project={project}
      />
    </>
  );
};
