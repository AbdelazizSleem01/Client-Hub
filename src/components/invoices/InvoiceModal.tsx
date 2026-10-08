'use client';

import React, { useRef, useState } from 'react';
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
  FiGlobe,
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
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  if (!isOpen) return null;

  const isArabic = language === 'ar';
  const client: Client | undefined = clients.find((c) => c.id === project.client_id);
  const clientDisplayName = client?.company
    ? `${client.name} (${client.company})`
    : client?.name || project.client_name || (isArabic ? 'عميلنا العزيز' : 'Valued Client');

  const invoiceNumber = `INV-${project.id.replace('proj-', '').slice(-6).toUpperCase()}`;

  // Date formatting
  const issueDateEn = formatDate(new Date().toISOString());
  const dueDateEn = project.deadline ? formatDate(project.deadline) : 'Upon Handover';

  const formatDateAr = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('ar-EG', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const issueDateAr = formatDateAr(new Date().toISOString());
  const dueDateAr = project.deadline ? formatDateAr(project.deadline) : 'عند التسليم النهائي';

  const issueDate = isArabic ? issueDateAr : issueDateEn;
  const dueDate = isArabic ? dueDateAr : dueDateEn;

  const isFullyPaid = project.remaining_amount <= 0 && project.total_price > 0;
  const isPartiallyPaid = project.amount_paid > 0 && project.remaining_amount > 0;

  // Currency formatting for display
  const formatAmount = (amt: number) => {
    const formatted = amt.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    if (isArabic) {
      const curr = project.currency || '$';
      if (curr === '$' || curr === 'USD') return `${formatted} دولار`;
      if (curr === 'EGP' || curr === 'ج.م') return `${formatted} ج.م`;
      if (curr === 'SAR' || curr === 'ر.س') return `${formatted} ر.س`;
      if (curr === 'AED' || curr === 'د.إ') return `${formatted} د.إ`;
      if (curr === 'EUR' || curr === '€') return `${formatted} يورو`;
      return `${formatted} ${curr}`;
    }
    return formatCurrency(amt, project.currency);
  };

  const projectStatusAr: Record<string, string> = {
    in_progress: 'قيد التنفيذ',
    completed: 'مكتمل',
    review: 'قيد المراجعة',
    pending: 'معلق',
    cancelled: 'ملغي',
  };

  // Dedicated Print Function via Isolated Printable IFrame
  const handlePrint = () => {
    if (!invoiceRef.current) {
      window.print();
      return;
    }

    const printContent = invoiceRef.current.innerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('title', 'Invoice Print Frame');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets from main document
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="${language}" dir="${isArabic ? 'rtl' : 'ltr'}">
        <head>
          <title>${invoiceNumber} - ${project.name}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: ${isArabic ? "'Cairo', sans-serif" : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"} !important;
            }
            .print-wrapper {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
            }
            /* Clean table formatting */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${printContent}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 350);
  };

  const handleCopySummary = async () => {
    let summaryText = '';
    if (isArabic) {
      const settlementAr = isFullyPaid ? 'مدفوع بالكامل' : isPartiallyPaid ? 'مدفوع جزئياً' : 'مستحق السداد';
      summaryText = `*${isFullyPaid ? 'إيصال استلام دفعة' : 'فاتورة رسمية'}: ${invoiceNumber}*
من: ${workspaceSettings.name || 'Client Hub'}
إلى: ${clientDisplayName}
المشروع: ${project.name}

إجمالي قيمة العقد: ${formatAmount(project.total_price)}
المبلغ المسدد: ${formatAmount(project.amount_paid)}
المتبقي المستحق: ${formatAmount(project.remaining_amount)}
حالة السداد: ${settlementAr}
تاريخ الاستحقاق: ${dueDate}

تاريخ الإصدار: ${issueDate}`;
    } else {
      summaryText = `*INVOICE / RECEIPT: ${invoiceNumber}*
From: ${workspaceSettings.name || 'Client Hub'}
To: ${clientDisplayName}
Project: ${project.name}

Total Agreed: ${formatCurrency(project.total_price, project.currency)}
Amount Paid: ${formatCurrency(project.amount_paid, project.currency)}
Remaining Balance: ${formatCurrency(project.remaining_amount, project.currency)}
Status: ${project.payment_status.toUpperCase()}
Due Date: ${dueDate}

Generated on ${issueDate}`;
    }

    try {
      await navigator.clipboard.writeText(summaryText);
      toast.success(isArabic ? 'تم نسخ تفاصيل الفاتورة بنجاح!' : 'Invoice summary copied to clipboard!');
    } catch {
      toast.error(isArabic ? 'فشل نسخ التفاصيل' : 'Failed to copy to clipboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print-dialog-wrapper">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200 print:hidden"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 my-8 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:bg-white">
        {/* Top Control Bar (Hidden during print) */}
        <div className="px-4 sm:px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0 print:hidden">
          {/* Document Tag & Number */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {isArabic ? 'وثيقة رسمية' : 'Official Document'}
            </span>
            <span className="text-xs font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
              {invoiceNumber}
            </span>
          </div>

          {/* Action Tools & Language Switcher */}
          <div className="flex items-center gap-2">
            {/* Language Toggle: EN / العربية */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  language === 'ar'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <FiGlobe className="w-3 h-3" />
                العربية
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              leftIcon={<FiCopy className="w-3.5 h-3.5" />}
            >
              {isArabic ? 'نسخ التفاصيل' : 'Copy Details'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<FiPrinter className="w-3.5 h-3.5" />}
            >
              {isArabic ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-1"
              title={isArabic ? 'إغلاق' : 'Close'}
              aria-label="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div
          className="overflow-y-auto p-6 sm:p-10 flex-1 bg-white text-slate-900 print:p-0 print:overflow-visible"
          ref={invoiceRef}
          id="printable-invoice-sheet"
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          {/* Header Brand & Invoice Title */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-slate-200">
            {/* Provider / Workspace */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs overflow-hidden shrink-0 border border-slate-800">
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
                  {workspaceSettings.tagline || (isArabic ? 'خدمات التصميم والبرمجة والاستشارات التقنية' : 'Software Development & Design Services')}
                </p>
              </div>
            </div>

            {/* Invoice Tag & Metadata */}
            <div className={isArabic ? 'text-right sm:text-left' : 'text-left sm:text-right'}>
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase block">
                {isFullyPaid
                  ? (isArabic ? 'إيصال استلام دفعة' : 'Payment Receipt')
                  : (isArabic ? 'فاتورة رسمية' : 'Official Invoice')}
              </span>
              <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                <p>
                  <span className="font-medium text-slate-700">
                    {isArabic ? 'رقم الفاتورة:' : 'Invoice No:'}
                  </span>{' '}
                  <span className="font-mono text-slate-900">{invoiceNumber}</span>
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    {isArabic ? 'تاريخ الإصدار:' : 'Issue Date:'}
                  </span>{' '}
                  <span>{issueDate}</span>
                </p>
                <p>
                  <span className="font-medium text-slate-700">
                    {isArabic ? 'تاريخ الاستحقاق:' : 'Due Date:'}
                  </span>{' '}
                  <span>{dueDate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Billed To / Client Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                {isArabic ? 'فاتورة إلى (العميل)' : 'Billed To'}
              </span>
              <p className="text-sm font-semibold text-slate-900">{clientDisplayName}</p>
              {client?.email && (
                <p className="text-xs text-slate-600 mt-0.5 font-mono" dir="ltr">{client.email}</p>
              )}
              {client?.phone && (
                <p className="text-xs text-slate-600 mt-0.5 font-mono" dir="ltr">{client.phone}</p>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                {isArabic ? 'المشروع ونطاق العمل' : 'Project & Scope'}
              </span>
              <p className="text-sm font-semibold text-slate-900">{project.name}</p>
              {project.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{project.description}</p>
              )}
              {project.deadline && (
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isArabic ? 'موعد التسليم المستهدف:' : 'Target Delivery:'}</span>{' '}
                  <span className="font-medium">{dueDate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <table className={`w-full text-sm border-collapse ${isArabic ? 'text-right' : 'text-left'}`}>
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-2">{isArabic ? 'بيان الخدمة والمشروع' : 'Description'}</th>
                  <th className="py-2.5 px-2 text-center">{isArabic ? 'حالة المشروع' : 'Status'}</th>
                  <th className={`py-2.5 px-2 ${isArabic ? 'text-left' : 'text-right'}`}>
                    {isArabic ? 'المبلغ الإجمالي' : 'Amount'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-4 px-2">
                    <p className="font-semibold text-slate-900">{project.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isArabic
                        ? 'خدمات التصميم، البرمجة الكاملة، والتسليم والتثبيت.'
                        : 'Full-stack engineering, delivery, and deployment specification.'}
                    </p>
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">
                        {isArabic ? 'التقنيات: ' : 'Stack: '}
                        {project.tech_stack.join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-2 text-center text-xs font-medium text-slate-700">
                    {isArabic
                      ? (projectStatusAr[project.status] || project.status)
                      : project.status.replace('_', ' ')}
                  </td>
                  <td className={`py-4 px-2 font-bold text-slate-900 whitespace-nowrap ${isArabic ? 'text-left font-mono' : 'text-right font-mono'}`}>
                    {formatAmount(project.total_price)}
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
                {isArabic ? 'حالة السداد' : 'Settlement Status'}
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
                  {isArabic
                    ? isFullyPaid
                      ? 'مدفوع بالكامل'
                      : isPartiallyPaid
                      ? 'مدفوع جزئياً'
                      : 'مستحق السداد'
                    : isFullyPaid
                    ? 'Paid in Full'
                    : isPartiallyPaid
                    ? 'Partially Paid'
                    : 'Payment Due'}
                </span>
              </div>
            </div>

            {/* Totals Box */}
            <div className="w-full sm:w-72 space-y-2 bg-slate-50/90 p-4 rounded-xl border border-slate-200/80">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{isArabic ? 'إجمالي قيمة العقد:' : 'Total Contracted:'}</span>
                <span className="font-semibold text-slate-900 font-mono">
                  {formatAmount(project.total_price)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-medium">
                <span>{isArabic ? 'المبلغ المسدد:' : 'Amount Paid:'}</span>
                <span className="font-bold font-mono">
                  {formatAmount(project.amount_paid)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                <span className={project.remaining_amount > 0 ? 'text-amber-900' : 'text-slate-900'}>
                  {isArabic ? 'المتبقي المستحق:' : 'Balance Due:'}
                </span>
                <span
                  className={`text-base font-extrabold font-mono ${
                    project.remaining_amount > 0 ? 'text-amber-950' : 'text-slate-400 font-normal'
                  }`}
                >
                  {formatAmount(project.remaining_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              {isArabic
                ? 'نشكركم على حسن تعاملكم وثقتكم بنا. لأي استفسارات أو تفاصيل إضافية يرجى التواصل مع فريق العمل مباشرة.'
                : 'Thank you for your business. Please submit any queries directly to the engineering team.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
