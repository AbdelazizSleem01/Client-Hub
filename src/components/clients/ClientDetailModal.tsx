'use client';

import React, { useState } from 'react';
import { Modal } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { ConfirmModal } from '@/ui/ConfirmModal';
import { ClientStatusBadge, ProjectStatusBadge, PaymentStatusBadge } from '@/ui/Badge';
import { Client } from '@/types';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate, cleanWhatsAppNumber } from '@/lib/utils';
import {
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiLayers,
  FiFolderPlus,
} from 'react-icons/fi';

export interface ClientDetailModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
  onAddProjectForClient: (client: Client) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  isOpen,
  onClose,
  onEdit,
  onAddProjectForClient,
}) => {
  const { getClientProjects, deleteClient } = useData();
  const toast = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!client) return null;

  const projects = getClientProjects(client.id);

  // Client financial summary
  let clientTotal = 0;
  let clientPaid = 0;
  let clientRemaining = 0;

  projects.forEach((p) => {
    clientTotal += Number(p.total_price) || 0;
    clientPaid += Number(p.amount_paid) || 0;
    clientRemaining += Number(p.remaining_amount) || 0;
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteClient(client.id);
      toast.success('Client deleted successfully');
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      toast.error('Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  const whatsappClean = cleanWhatsAppNumber(client.whatsapp || client.phone);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={client.company ? `${client.name} — ${client.company}` : client.name}
        description={`Added on ${formatDate(client.created_at)}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Top Info Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold text-lg shadow-2xs">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{client.name}</h3>
                  <ClientStatusBadge status={client.status} size="sm" />
                </div>
                {client.company && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{client.company}</p>
                )}
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-2">
              {whatsappClean && (
                <a
                  href={`https://wa.me/${whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-medium transition-colors"
                >
                  <FiMessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              )}
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
                >
                  <FiMail className="w-3.5 h-3.5" />
                  Email
                </a>
              )}
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
                >
                  <FiPhone className="w-3.5 h-3.5" />
                  Call
                </a>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Contracted
              </span>
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block">
                {formatCurrency(clientTotal)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Amount Paid
              </span>
              <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                {formatCurrency(clientPaid)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                Remaining Balance
              </span>
              <span className="text-base font-semibold text-amber-900 dark:text-amber-200 mt-0.5 block">
                {formatCurrency(clientRemaining)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Notes
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          )}

          {/* Associated Projects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FiLayers className="w-3.5 h-3.5" />
                Projects ({projects.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onAddProjectForClient(client);
                }}
                leftIcon={<FiFolderPlus className="w-3.5 h-3.5" />}
              >
                Add Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                No projects assigned to this client yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{proj.name}</span>
                        <ProjectStatusBadge status={proj.status} size="sm" />
                        <PaymentStatusBadge status={proj.payment_status} size="sm" />
                      </div>
                      {proj.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{proj.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(proj.total_price, proj.currency)}
                        </div>
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          Due: {formatCurrency(proj.remaining_amount, proj.currency)}
                        </div>
                      </div>

                      {proj.live_url && (
                        <a
                          href={proj.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Open live website"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<FiTrash2 className="w-3.5 h-3.5" />}
            >
              Delete Client
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(client);
                }}
                leftIcon={<FiEdit2 className="w-3.5 h-3.5" />}
              >
                Edit Client
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Are you sure you want to delete ${client.name}? This will also permanently remove all associated projects and payment records.`}
        confirmText="Delete Client"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
};
