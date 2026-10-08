'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientFormModal } from '@/components/clients/ClientFormModal';
import { ClientDetailModal } from '@/components/clients/ClientDetailModal';
import { ProjectFormModal } from '@/components/projects/ProjectFormModal';
import { useData } from '@/context/DataContext';
import { Client, ClientStatus } from '@/types';
import { FiPlus, FiSearch, FiUsers, FiFilter } from 'react-icons/fi';

type FilterTab = 'all' | ClientStatus;

export default function ClientsPage() {
  const { clients } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedClientForView, setSelectedClientForView] = useState<Client | null>(null);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectPresetClientId, setProjectPresetClientId] = useState<string | undefined>(undefined);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Status filter
      if (activeFilter !== 'all' && client.status !== activeFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = client.name.toLowerCase().includes(query);
        const matchCompany = client.company?.toLowerCase().includes(query);
        const matchEmail = client.email?.toLowerCase().includes(query);
        const matchPhone = client.phone?.toLowerCase().includes(query);
        return matchName || matchCompany || matchEmail || matchPhone;
      }
      return true;
    });
  }, [clients, activeFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: clients.length,
      active: clients.filter((c) => c.status === 'active').length,
      completed: clients.filter((c) => c.status === 'completed').length,
      pending: clients.filter((c) => c.status === 'pending').length,
      inactive: clients.filter((c) => c.status === 'inactive').length,
    };
  }, [clients]);

  return (
    <AppShell
      title="Clients"
      subtitle="Directory of software development clients, accounts, and contact points"
    >
      <div className="space-y-6">
        {/* Top Controls: Search, Filters, and New Client Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="w-full md:w-80">
            <Input
              placeholder="Search clients by name, company, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<FiSearch className="w-4 h-4" />}
            />
          </div>

          {/* Action Button */}
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsClientModalOpen(true)}
            leftIcon={<FiPlus className="w-4 h-4" />}
          >
            Add Client
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Clients
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === 'all' ? 'bg-slate-700 dark:bg-slate-300 text-slate-100 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'active'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Active
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === 'active' ? 'bg-slate-700 dark:bg-slate-300 text-slate-100 dark:text-slate-900' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {counts.active}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'completed'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Completed
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === 'completed' ? 'bg-slate-700 dark:bg-slate-300 text-slate-100 dark:text-slate-900' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
              }`}
            >
              {counts.completed}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'pending'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Pending
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === 'pending' ? 'bg-slate-700 dark:bg-slate-300 text-slate-100 dark:text-slate-900' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
              }`}
            >
              {counts.pending}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'inactive'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Inactive
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === 'inactive' ? 'bg-slate-700 dark:bg-slate-300 text-slate-100 dark:text-slate-900' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {counts.inactive}
            </span>
          </button>
        </div>

        {/* Client Cards Grid */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No clients match your filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No results found for "${searchQuery}". Try a different keyword.`
                : 'You have no clients under this status filter.'}
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onView={setSelectedClientForView}
                onEdit={setSelectedClientForEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ClientDetailModal
        client={selectedClientForView}
        isOpen={Boolean(selectedClientForView)}
        onClose={() => setSelectedClientForView(null)}
        onEdit={(cli) => {
          setSelectedClientForView(null);
          setSelectedClientForEdit(cli);
        }}
        onAddProjectForClient={(cli) => {
          setProjectPresetClientId(cli.id);
          setIsProjectModalOpen(true);
        }}
      />

      <ClientFormModal
        isOpen={isClientModalOpen || Boolean(selectedClientForEdit)}
        onClose={() => {
          setIsClientModalOpen(false);
          setSelectedClientForEdit(null);
        }}
        clientToEdit={selectedClientForEdit}
      />

      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setProjectPresetClientId(undefined);
        }}
        defaultClientId={projectPresetClientId}
      />
    </AppShell>
  );
}
