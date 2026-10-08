import React from 'react';
import { Project } from '@/types';
import { FiGlobe, FiGithub, FiServer, FiExternalLink, FiLock } from 'react-icons/fi';

export interface ProjectLinksProps {
  project: Project;
  className?: string;
  size?: 'sm' | 'md';
}

export const ProjectLinks: React.FC<ProjectLinksProps> = ({
  project,
  className = '',
  size = 'sm',
}) => {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const btnClass =
    size === 'sm'
      ? 'p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800'
      : 'px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 inline-flex items-center gap-1.5';

  const hasAnyLink =
    project.live_url ||
    project.github_url ||
    project.vercel_url ||
    project.server_url ||
    project.admin_url;

  if (!hasAnyLink) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* Live Website */}
      {project.live_url && (
        <a
          href={project.live_url}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          title={`Live Website: ${project.live_url}`}
          aria-label="Open Live Website"
        >
          <FiGlobe className={iconSize} />
          {size === 'md' && <span>Live Site</span>}
        </a>
      )}

      {/* GitHub Repository */}
      {project.github_url && (
        <a
          href={project.github_url}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          title={`GitHub Repository: ${project.github_url}`}
          aria-label="Open GitHub Repository"
        >
          <FiGithub className={iconSize} />
          {size === 'md' && <span>GitHub</span>}
        </a>
      )}

      {/* Vercel Deployment */}
      {project.vercel_url && (
        <a
          href={project.vercel_url}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          title={`Vercel Deployment: ${project.vercel_url}`}
          aria-label="Open Vercel URL"
        >
          <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L24 22H0L12 1Z" />
          </svg>
          {size === 'md' && <span>Vercel</span>}
        </a>
      )}

      {/* Server / Hosting */}
      {project.server_url && (
        <a
          href={project.server_url}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          title={`Server / Hosting: ${project.server_url}`}
          aria-label="Open Server URL"
        >
          <FiServer className={iconSize} />
          {size === 'md' && <span>Server</span>}
        </a>
      )}

      {/* Admin Panel */}
      {project.admin_url && (
        <a
          href={project.admin_url}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          title={`Admin Panel: ${project.admin_url}`}
          aria-label="Open Admin Panel"
        >
          <FiLock className={iconSize} />
          {size === 'md' && <span>Admin</span>}
        </a>
      )}
    </div>
  );
};
