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
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
            Total Invoiced
          </span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {formatCurrency(totalInvoiced)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all client projects</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
          <FiDollarSign className="w-5 h-5" />
        </div>
      </Card>

      {/* Total Collected */}
      <Card className="p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider block">
            Total Collected
          </span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-emerald-600/80 font-medium mt-1 block">
            {collectionPercentage}% collection rate
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <FiCheckCircle className="w-5 h-5" />
        </div>
      </Card>

      {/* Outstanding Receivables */}
      <Card className="p-4 flex items-center justify-between bg-amber-50/40 border-amber-200/80">
        <div>
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
            Outstanding Balance
          </span>
          <span className="text-xl font-bold text-amber-950 mt-1 block">
            {formatCurrency(totalReceivables)}
          </span>
          <span className="text-[11px] text-amber-800/80 mt-1 block">Pending client payments</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
          <FiClock className="w-5 h-5" />
        </div>
      </Card>
    </div>
  );
};
