'use client';

import React, { useRef } from 'react';
import { Project, Client } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/ui/Button';
import {
  FiPrinter,
  FiCopy,
  FiX,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiBriefcase,
  FiCalendar,
} from 'react-icons/fi';

export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, project }) => {
  const { settings: workspaceSettings } = useWorkspace();
  const { clients } = useData();
  const toast = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const client: Client | undefined = clients.find((c) => c.id === project.client_id);
  const clientDisplayName = client?.company
    ? `${client.name} (${client.company})`
    : client?.name || project.client_name || 'Valued Client';

  const invoiceNumber = `INV-${project.id.replace('proj-', '').slice(-6).toUpperCase()}`;
  const issueDate = formatDate(new Date().toISOString());
  const dueDate = project.deadline ? formatDate(project.deadline) : 'Upon Handover';

  const isFullyPaid = project.remaining_amount <= 0 && project.total_price > 0;
  const isPartiallyPaid = project.amount_paid > 0 && project.remaining_amount > 0;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    const summaryText = `*INVOICE / RECEIPT: ${invoiceNumber}*
From: ${workspaceSettings.name || 'Client Hub'}
To: ${clientDisplayName}
Project: ${project.name}

Total Agreed: ${formatCurrency(project.total_price, project.currency)}
Amount Paid: ${formatCurrency(project.amount_paid, project.currency)}
Remaining Balance: ${formatCurrency(project.remaining_amount, project.currency)}
Status: ${project.payment_status.toUpperCase()}
Due Date: ${dueDate}

Generated on ${issueDate}`;

    try {
      await navigator.clipboard.writeText(summaryText);
      toast.success('Invoice summary copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200/80 my-8 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden during print) */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Official Document
            </span>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
              {invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              leftIcon={<FiCopy className="w-3.5 h-3.5" />}
            >
              Copy Details
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<FiPrinter className="w-3.5 h-3.5" />}
            >
              Print / Save PDF
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-1"
              title="Close"
              aria-label="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="overflow-y-auto p-6 sm:p-10 flex-1 bg-white print:p-0 print:overflow-visible" ref={invoiceRef}>
          {/* Header Brand & Invoice Title */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-200">
            {/* Left: Provider / Workspace */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs overflow-hidden shrink-0">
                {workspaceSettings.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={workspaceSettings.logoUrl}
                    alt={workspaceSettings.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <FiBriefcase className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {workspaceSettings.name || 'Client Hub'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {workspaceSettings.tagline || 'Software Development & Design Services'}
                </p>
              </div>
            </div>

            {/* Right: Invoice Tag & Metadata */}
            <div className="text-left sm:text-right">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase block">
                {isFullyPaid ? 'Payment Receipt' : 'Official Invoice'}
              </span>
              <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                <p>
                  <span className="font-medium text-slate-700">Invoice No:</span>{' '}
                  <span className="font-mono text-slate-900">{invoiceNumber}</span>
                </p>
                <p>
                  <span className="font-medium text-slate-700">Issue Date:</span> {issueDate}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Due Date:</span> {dueDate}
                </p>
              </div>
            </div>
          </div>

          {/* Billed To / Client Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Billed To
              </span>
              <p className="text-sm font-semibold text-slate-900">{clientDisplayName}</p>
              {client?.email && (
                <p className="text-xs text-slate-600 mt-0.5">{client.email}</p>
              )}
              {client?.phone && (
                <p className="text-xs text-slate-600 mt-0.5">{client.phone}</p>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Project & Scope
              </span>
              <p className="text-sm font-semibold text-slate-900">{project.name}</p>
              {project.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
              )}
              {project.deadline && (
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                  Target Delivery: <span className="font-medium">{formatDate(project.deadline)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-2">Description</th>
                  <th className="py-2.5 px-2 text-center">Status</th>
                  <th className="py-2.5 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 px-2">
                    <p className="font-semibold text-slate-900">{project.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Full-stack engineering, delivery, and deployment specification.
                    </p>
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        Stack: {project.tech_stack.join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-2 text-center capitalize text-xs font-medium text-slate-700">
                    {project.status.replace('_', ' ')}
                  </td>
                  <td className="py-4 px-2 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatCurrency(project.total_price, project.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Totals */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            {/* Payment Status Pill */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Settlement Status
              </span>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                  isFullyPaid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : isPartiallyPaid
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {isFullyPaid ? (
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                ) : isPartiallyPaid ? (
                  <FiClock className="w-4 h-4 text-amber-600" />
                ) : (
                  <FiAlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span className="tracking-wide uppercase">
                  {isFullyPaid
                    ? 'Paid in Full'
                    : isPartiallyPaid
                    ? 'Partially Paid'
                    : 'Payment Due'}
                </span>
              </div>
            </div>

            {/* Totals Box */}
            <div className="w-full sm:w-64 space-y-2 bg-slate-50/90 p-4 rounded-xl border border-slate-200/80">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Total Contracted:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(project.total_price, project.currency)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-medium">
                <span>Amount Paid:</span>
                <span className="font-bold">
                  {formatCurrency(project.amount_paid, project.currency)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                <span className={project.remaining_amount > 0 ? 'text-amber-900' : 'text-slate-900'}>
                  Balance Due:
                </span>
                <span
                  className={`text-base font-extrabold ${
                    project.remaining_amount > 0 ? 'text-amber-950 font-mono' : 'text-slate-400 font-normal'
                  }`}
                >
                  {formatCurrency(project.remaining_amount, project.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Thank you for your business. Please submit any queries directly to the engineering team.
            </p>
          </div>
        </div>
      </div>

      {/* Print Specific CSS Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .fixed {
            position: static !important;
          }
          /* Make modal container full page */
          div[role='dialog'],
          .fixed.inset-0.z-50 {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .bg-slate-900\\/60 {
            display: none !important;
          }
          .max-w-3xl {
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          div[ref='invoiceRef'],
          .p-6.sm\\:p-10 {
            visibility: visible !important;
            padding: 20mm !important;
          }
          div[ref='invoiceRef'] * {
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
};
