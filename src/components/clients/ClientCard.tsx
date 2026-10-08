'use client';

import React, { useState } from 'react';
import { Card } from '@/ui/Card';
import { ClientStatusBadge } from '@/ui/Badge';
import { Client } from '@/types';
import { useData } from '@/context/DataContext';
import { formatCurrency, cleanWhatsAppNumber } from '@/lib/utils';
import {
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiEdit2,
  FiTrash2,
  FiLayers,
  FiDollarSign,
  FiEye,
} from 'react-icons/fi';
import { ConfirmModal } from '@/ui/ConfirmModal';
import { useToast } from '@/context/ToastContext';

export interface ClientCardProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onView, onEdit }) => {
  const { getClientProjects, deleteClient } = useData();
  const toast = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const projects = getClientProjects(client.id);

  let totalRemaining = 0;
  projects.forEach((p) => {
    totalRemaining += Number(p.remaining_amount) || 0;
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteClient(client.id);
      toast.success('Client deleted successfully');
      setShowDeleteConfirm(false);
    } catch {
      toast.error('Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  const whatsappClean = cleanWhatsAppNumber(client.whatsapp || client.phone);

  return (
    <>
      <Card hoverable className="flex flex-col justify-between group">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <h3
                onClick={() => onView(client)}
                className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug truncate hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                {client.name}
              </h3>
              {client.company && (
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {client.company}
                </p>
              )}
            </div>
            <ClientStatusBadge status={client.status} size="sm" />
          </div>

          {/* Contact Icons */}
          <div className="flex items-center gap-1.5 mb-4 pt-1">
            {whatsappClean ? (
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                title={`WhatsApp: ${client.whatsapp || client.phone}`}
              >
                <FiMessageCircle className="w-3.5 h-3.5" />
              </a>
            ) : null}

            {client.email ? (
              <a
                href={`mailto:${client.email}`}
                className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title={`Email: ${client.email}`}
              >
                <FiMail className="w-3.5 h-3.5" />
              </a>
            ) : null}

            {client.phone ? (
              <a
                href={`tel:${client.phone}`}
                className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title={`Phone: ${client.phone}`}
              >
                <FiPhone className="w-3.5 h-3.5" />
              </a>
            ) : null}
          </div>

          {/* Notes preview */}
          {client.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              {client.notes}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
              <FiLayers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {projects.length} {projects.length === 1 ? 'proj' : 'projs'}
            </span>
            <span
              className={`flex items-center gap-0.5 font-semibold ${
                totalRemaining > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
              }`}
              title="Remaining Balance"
            >
              <FiDollarSign className="w-3.5 h-3.5" />
              {formatCurrency(totalRemaining)}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(client)}
              className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="View Client Details"
            >
              <FiEye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onEdit(client)}
              className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Client"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete Client"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Are you sure you want to delete ${client.name}? All associated projects will also be deleted.`}
        confirmText="Delete Client"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
};
