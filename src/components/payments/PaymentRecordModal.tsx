'use client';

import React, { useState } from 'react';
import { Modal } from '@/ui/Modal';
import { Input } from '@/ui/Input';
import { Button } from '@/ui/Button';
import { Project } from '@/types';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import { FiDollarSign, FiCheckCircle } from 'react-icons/fi';

export interface PaymentRecordModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentRecordModal: React.FC<PaymentRecordModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { recordPayment } = useData();
  const toast = useToast();

  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  if (!project) return null;

  const currentRemaining = project.remaining_amount;

  const handlePayRemaining = () => {
    setAmount(String(currentRemaining));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordPayment(project.id, numericAmount);
      toast.success('Payment updated successfully');
      setAmount('');
      setError('');
      onClose();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      description={`Log payment received for "${project.name}"`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Balance Status */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total Price:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(project.total_price, project.currency)}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-emerald-700 dark:text-emerald-400">Already Paid:</span>
            <span className="font-semibold text-emerald-800 dark:text-emerald-300">
              {formatCurrency(project.amount_paid, project.currency)}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200 dark:border-slate-700">
            <span className="text-amber-800 dark:text-amber-300 font-semibold">Remaining Balance:</span>
            <span className="font-bold text-amber-900 dark:text-amber-200">
              {formatCurrency(currentRemaining, project.currency)}
            </span>
          </div>
        </div>

        {/* Input */}
        <div>
          <Input
            label="Payment Amount Received"
            type="number"
            min="1"
            step="any"
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            error={error}
            leftIcon={<FiDollarSign className="w-4 h-4" />}
            required
            disabled={isSubmitting}
          />

          {currentRemaining > 0 && (
            <button
              type="button"
              onClick={handlePayRemaining}
              className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 underline flex items-center gap-1 font-medium"
            >
              <FiCheckCircle className="w-3 dot text-emerald-600 dark:text-emerald-400" />
              Pay full remaining amount ({formatCurrency(currentRemaining, project.currency)})
            </button>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
