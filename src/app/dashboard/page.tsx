'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { ClientStatusBadge, ProjectStatusBadge, PaymentStatusBadge } from '@/ui/Badge';
import { useData } from '@/context/DataContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Client, Project } from '@/types';
import { ClientDetailModal } from '@/components/clients/ClientDetailModal';
import { ClientFormModal } from '@/components/clients/ClientFormModal';
import { ProjectFormModal } from '@/components/projects/ProjectFormModal';
import { ProjectLinks } from '@/components/projects/ProjectLinks';
import {
  FiUsers,
  FiLayers,
  FiCheckCircle,
  FiDollarSign,
  FiArrowRight,
  FiPlus,
  FiExternalLink,
} from 'react-icons/fi';

export default function DashboardPage() {
  const { clients, projects, metrics } = useData();

  // Modals state
  const [selectedClientForView, setSelectedClientForView] = useState<Client | null>(null);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectClientPreset, setProjectClientPreset] = useState<string | undefined>(undefined);

  // Recent clients and projects (sorted by created_at desc)
  const recentClients = [...clients]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const handleOpenAddProjectForClient = (client: Client) => {
    setProjectClientPreset(client.id);
    setIsProjectModalOpen(true);
  };

  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of your client base, active deliverables, and outstanding balances"
    >
      <div className="space-y-6">
        {/* KPI / Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Clients */}
          <Card className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Total Clients
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{metrics.totalClients}</span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  {metrics.activeClients} active
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <FiUsers className="w-5 h-5" />
            </div>
          </Card>

          {/* Active Projects */}
          <Card className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Active Projects
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{metrics.activeProjects}</span>
                <span className="text-xs text-slate-500">in dev & live</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 shrink-0">
              <FiLayers className="w-5 h-5" />
            </div>
          </Card>

          {/* Completed Projects */}
          <Card className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Completed Projects
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">{metrics.completedProjects}</span>
                <span className="text-xs text-emerald-700 font-medium">delivered</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700 shrink-0">
              <FiCheckCircle className="w-5 h-5" />
            </div>
          </Card>

          {/* Total Outstanding Payments */}
          <Card className="p-4 flex items-center justify-between bg-amber-50/50 border-amber-200/80">
            <div>
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
                Outstanding Balance
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-bold text-amber-950">
                  {formatCurrency(metrics.totalReceivables)}
                </span>
              </div>
              <span className="text-[11px] text-amber-800/80 font-medium block mt-0.5">
                Paid: {formatCurrency(metrics.totalCollected)} / {formatCurrency(metrics.totalInvoiced)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Quick Action Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Quick Actions:
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsClientModalOpen(true)}
              leftIcon={<FiPlus className="w-3.5 h-3.5" />}
            >
              Add New Client
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProjectClientPreset(undefined);
                setIsProjectModalOpen(true);
              }}
              leftIcon={<FiPlus className="w-3.5 h-3.5" />}
            >
              Add New Project
            </Button>
            <Link href="/payments">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<FiArrowRight className="w-3.5 h-3.5" />}
              >
                Review Receivables
              </Button>
            </Link>
          </div>
        </div>

        {/* Two Columns: Recent Clients & Recent Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Recently Added Clients</h3>
                </div>
                <Link
                  href="/clients"
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                  View all ({clients.length})
                  <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {recentClients.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No clients added yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientForView(client)}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {client.name}
                          </span>
                          <ClientStatusBadge status={client.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {client.company || client.email || 'No company listed'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-slate-400 block" suppressHydrationWarning>
                          {formatDate(client.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => setIsClientModalOpen(true)}
                leftIcon={<FiPlus className="w-3.5 h-3.5" />}
              >
                Create another client
              </Button>
            </div>
          </Card>

          {/* Recent Projects */}
          <Card className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <FiLayers className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Recently Added Projects</h3>
                </div>
                <Link
                  href="/projects"
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                >
                  View all ({projects.length})
                  <FiArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {recentProjects.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No projects added yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => setSelectedProjectForEdit(project)}
                            className="text-sm font-semibold text-slate-900 truncate hover:underline cursor-pointer"
                          >
                            {project.name}
                          </span>
                          <ProjectStatusBadge status={project.status} size="sm" />
                          <PaymentStatusBadge status={project.payment_status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {project.client_name ? `Client: ${project.client_name}` : 'No client name'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-900 block">
                            {formatCurrency(project.total_price, project.currency)}
                          </span>
                          {project.remaining_amount > 0 ? (
                            <span className="text-[11px] font-medium text-amber-700 block">
                              Due: {formatCurrency(project.remaining_amount, project.currency)}
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-emerald-700 block">
                              Paid in full
                            </span>
                          )}
                        </div>

                        <ProjectLinks project={project} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-xs"
                onClick={() => {
                  setProjectClientPreset(undefined);
                  setIsProjectModalOpen(true);
                }}
                leftIcon={<FiPlus className="w-3.5 h-3.5" />}
              >
                Create another project
              </Button>
            </div>
          </Card>
        </div>
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
        onAddProjectForClient={handleOpenAddProjectForClient}
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
        isOpen={isProjectModalOpen || Boolean(selectedProjectForEdit)}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProjectForEdit(null);
          setProjectClientPreset(undefined);
        }}
        projectToEdit={selectedProjectForEdit}
        defaultClientId={projectClientPreset}
      />
    </AppShell>
  );
}
