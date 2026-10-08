import { PaymentStatus } from '@/types';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number | string | undefined | null, currency: string = '$'): string {
  const numeric = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(numeric)) return `${currency}0.00`;
  return `${currency}${numeric.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function calculateRemaining(total: number, paid: number): number {
  const safeTotal = Math.max(0, total || 0);
  const safePaid = Math.max(0, paid || 0);
  return Math.max(0, safeTotal - safePaid);
}

export function determinePaymentStatus(total: number, paid: number): PaymentStatus {
  const safeTotal = Math.max(0, total || 0);
  const safePaid = Math.max(0, paid || 0);

  if (safePaid >= safeTotal && safeTotal > 0) {
    return 'paid';
  }
  if (safePaid > 0) {
    return 'partially_paid';
  }
  return 'unpaid';
}

export function cleanWhatsAppNumber(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}
