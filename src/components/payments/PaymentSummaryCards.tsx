import React from 'react';
import { Card } from '@/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { FiDollarSign, FiClock, FiCheckCircle } from 'react-icons/fi';

export interface PaymentSummaryCardsProps {
  totalInvoiced: number;
  totalCollected: number;
  totalReceivables: number;
}

export const PaymentSummaryCards: React.FC<PaymentSummaryCardsProps> = ({
  totalInvoiced,
  totalCollected,
  totalReceivables,
}) => {
  const collectionPercentage =
    totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Contracted */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Total Invoiced
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 block">
            {formatCurrency(totalInvoiced)}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">Across all client projects</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
          <FiDollarSign className="w-5 h-5" />
        </div>
      </Card>

      {/* Total Collected */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Total Collected
          </span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 block">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-1 block">
            {collectionPercentage}% collection rate
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <FiCheckCircle className="w-5 h-5" />
        </div>
      </Card>

      {/* Outstanding Receivables */}
      <Card className="p-4 flex items-center justify-between bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50">
        <div>
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">
            Outstanding Balance
          </span>
          <span className="text-xl font-bold text-amber-950 dark:text-amber-200 mt-1 block">
            {formatCurrency(totalReceivables)}
          </span>
          <span className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-1 block">Pending client payments</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
          <FiClock className="w-5 h-5" />
        </div>
      </Card>
    </div>
  );
};
