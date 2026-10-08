'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PaymentSummaryCards } from '@/components/payments/PaymentSummaryCards';
import { PaymentRecordModal } from '@/components/payments/PaymentRecordModal';
import { ProjectFormModal } from '@/components/projects/ProjectFormModal';
import { PaymentStatusBadge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/utils';
import { Project, PaymentStatus } from '@/types';
import { FiDollarSign, FiSearch, FiCreditCard, FiEdit2, FiCheckCircle } from 'react-icons/fi';

type PaymentFilter = 'all' | PaymentStatus;

export default function PaymentsPage() {
  const { projects, metrics } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<PaymentFilter>('all');
  const [selectedProjectForPayment, setSelectedProjectForPayment] = useState<Project | null>(null);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);

  // Filter projects by payment status and query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (activeFilter !== 'all' && project.payment_status !== activeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = project.name.toLowerCase().includes(query);
        const matchClient = project.client_name?.toLowerCase().includes(query);
        return matchName || matchClient;
      }
      return true;
    });
  }, [projects, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: projects.length,
      unpaid: projects.filter((p) => p.payment_status === 'unpaid').length,
      partially_paid: projects.filter((p) => p.payment_status === 'partially_paid').length,
      paid: projects.filter((p) => p.payment_status === 'paid').length,
    };
  }, [projects]);

  return (
    <AppShell
      title="Outstanding Payments"
      subtitle="Financial tracking of project prices, collected deposits, and remaining client balances"
    >
      <div className="space-y-6">
        {/* KPI Financial Metric Cards */}
        <PaymentSummaryCards
          totalInvoiced={metrics.totalInvoiced}
          totalCollected={metrics.totalCollected}
          totalReceivables={metrics.totalReceivables}
        />

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 flex-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Items
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'all' ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('unpaid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === 'unpaid'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Unpaid
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'unpaid' ? 'bg-slate-700 text-slate-100' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {counts.unpaid}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('partially_paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === 'partially_paid'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Partially Paid
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'partially_paid' ? 'bg-slate-700 text-slate-100' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {counts.partially_paid}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter('paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeFilter === 'paid'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Fully Paid
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === 'paid' ? 'bg-slate-700 text-slate-100' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {counts.paid}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by client or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<FiSearch className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Payments Table / List View */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <FiDollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No payment records found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery
                  ? `No matches for "${searchQuery}".`
                  : 'No deliverables match the selected payment status filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Project & Client</th>
                    <th className="py-3 px-4">Total Agreed</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Remaining Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map((project) => {
                    const isDue = project.remaining_amount > 0;
                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Project & Client */}
                        <td className="py-3.5 px-4 min-w-[200px]">
                          <div className="font-semibold text-slate-900 group-hover:text-slate-700">
                            {project.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {project.client_name || 'Individual client'}
                          </div>
                        </td>

                        {/* Total Price */}
                        <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                          {formatCurrency(project.total_price, project.currency)}
                        </td>

                        {/* Amount Paid */}
                        <td className="py-3.5 px-4 text-emerald-700 font-medium whitespace-nowrap">
                          {formatCurrency(project.amount_paid, project.currency)}
                        </td>

                        {/* Remaining Balance */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`font-bold inline-block ${
                              isDue ? 'text-amber-900 font-mono text-sm' : 'text-slate-400 font-normal'
                            }`}
                          >
                            {formatCurrency(project.remaining_amount, project.currency)}
                          </span>
                          {isDue && (
                            <span className="text-[10px] text-amber-700 block font-sans font-medium">
                              Pending collection
                            </span>
                          )}
                        </td>

                        {/* Payment Status Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <PaymentStatusBadge status={project.payment_status} size="sm" />
                        </td>

                        {/* Quick Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {isDue ? (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedProjectForPayment(project)}
                                leftIcon={<FiCreditCard className="w-3.5 h-3.5 text-slate-600" />}
                              >
                                Record Payment
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium px-2 py-1">
                                <FiCheckCircle className="w-3.5 h-3.5" />
                                Paid
                              </span>
                            )}

                            <button
                              onClick={() => setSelectedProjectForEdit(project)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="Edit Financials"
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Record Modal */}
      <PaymentRecordModal
        project={selectedProjectForPayment}
        isOpen={Boolean(selectedProjectForPayment)}
        onClose={() => setSelectedProjectForPayment(null)}
      />

      {/* Project Form Modal (for full editing) */}
      <ProjectFormModal
        projectToEdit={selectedProjectForEdit}
        isOpen={Boolean(selectedProjectForEdit)}
        onClose={() => setSelectedProjectForEdit(null)}
      />
    </AppShell>
  );
}
