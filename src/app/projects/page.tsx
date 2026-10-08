'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select, SelectOption } from '@/ui/Select';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFormModal } from '@/components/projects/ProjectFormModal';
import { useData } from '@/context/DataContext';
import { Project, ProjectStatus } from '@/types';
import { FiPlus, FiSearch, FiLayers } from 'react-icons/fi';

type FilterTab = 'all' | ProjectStatus;

export default function ProjectsPage() {
  const { projects, clients } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<FilterTab>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Client dropdown options
  const clientOptions: SelectOption[] = [
    { value: 'all', label: 'All Clients' },
    ...clients.map((c) => ({
      value: c.id,
      label: c.company ? `${c.name} (${c.company})` : c.name,
    })),
  ];

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Status filter
      if (activeStatusFilter !== 'all' && project.status !== activeStatusFilter) {
        return false;
      }
      // Client filter
      if (selectedClientId !== 'all' && project.client_id !== selectedClientId) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = project.name.toLowerCase().includes(query);
        const matchDesc = project.description?.toLowerCase().includes(query);
        const matchClient = project.client_name?.toLowerCase().includes(query);
        const matchTech = project.tech_stack?.some((t) => t.toLowerCase().includes(query));
        return matchName || matchDesc || matchClient || matchTech;
      }
      return true;
    });
  }, [projects, activeStatusFilter, selectedClientId, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: projects.length,
      in_development: projects.filter((p) => p.status === 'in_development').length,
      live: projects.filter((p) => p.status === 'live').length,
      completed: projects.filter((p) => p.status === 'completed').length,
      maintenance: projects.filter((p) => p.status === 'maintenance').length,
      paused: projects.filter((p) => p.status === 'paused').length,
    };
  }, [projects]);

  return (
    <AppShell
      title="Projects & Websites"
      subtitle="Track repositories, hosting links, technical stacks, and deliverables"
    >
      <div className="space-y-6">
        {/* Top Controls: Search, Client Filter, Add Project Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
            <div className="flex-1">
              <Input
                placeholder="Search projects, technologies, repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<FiSearch className="w-4 h-4" />}
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                options={clientOptions}
                value={selectedClientId}
                onChange={setSelectedClientId}
                placeholder="Filter by Client"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsProjectModalOpen(true)}
            leftIcon={<FiPlus className="w-4 h-4" />}
          >
            Add Project
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
          <button
            onClick={() => setActiveStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeStatusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Projects
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeStatusFilter === 'all' ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('in_development')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeStatusFilter === 'in_development'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            In Development
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeStatusFilter === 'in_development'
                  ? 'bg-slate-700 text-slate-100'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {counts.in_development}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeStatusFilter === 'live'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Live
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeStatusFilter === 'live'
                  ? 'bg-slate-700 text-slate-100'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {counts.live}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeStatusFilter === 'completed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Completed
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeStatusFilter === 'completed'
                  ? 'bg-slate-700 text-slate-100'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {counts.completed}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeStatusFilter === 'maintenance'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Maintenance
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeStatusFilter === 'maintenance'
                  ? 'bg-slate-700 text-slate-100'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {counts.maintenance}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusFilter('paused')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeStatusFilter === 'paused'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Paused
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeStatusFilter === 'paused'
                  ? 'bg-slate-700 text-slate-100'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {counts.paused}
            </span>
          </button>
        </div>

        {/* Project Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FiLayers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No projects found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No matching results for "${searchQuery}".`
                : 'No projects match your current status or client filter.'}
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setActiveStatusFilter('all');
                  setSelectedClientId('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={setSelectedProjectForEdit}
                priority={idx === 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isProjectModalOpen || Boolean(selectedProjectForEdit)}
        onClose={() => {
          setIsProjectModalOpen(false);
          setSelectedProjectForEdit(null);
        }}
        projectToEdit={selectedProjectForEdit}
      />
    </AppShell>
  );
}
