'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Client, Project, DashboardMetrics } from '@/types';
import { INITIAL_CLIENTS, INITIAL_PROJECTS } from '@/lib/mock-data';
import { calculateRemaining, determinePaymentStatus } from '@/lib/utils';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface DataContextType {
  clients: Client[];
  projects: Project[];
  metrics: DashboardMetrics;
  isLoading: boolean;
  addClient: (data: Omit<Client, 'id' | 'created_at'>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  addProject: (data: Omit<Project, 'id' | 'created_at' | 'remaining_amount' | 'payment_status'>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  recordPayment: (projectId: string, amount: number) => Promise<void>;
  resetToSampleData: () => void;
  getClientProjects: (clientId: string) => Project[];
  getClientById: (clientId: string) => Client | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_CLIENTS = 'client_dashboard_clients_v2';
const LOCAL_STORAGE_PROJECTS = 'client_dashboard_projects_v2';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const hasSupabase = isSupabaseConfigured();

    if (hasSupabase && user) {
      try {
        const supabase = createClient();
        const [clientsRes, projectsRes] = await Promise.all([
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('projects').select('*').order('created_at', { ascending: false }),
        ]);

        if (!clientsRes.error && !projectsRes.error && clientsRes.data) {
          const loadedClients = clientsRes.data as Client[];
          const clientsMap = new Map(
            loadedClients.map((c) => [c.id, c.company || c.name || ''])
          );
          const enrichedProjects = ((projectsRes.data || []) as Project[]).map((p) => ({
            ...p,
            client_name: p.client_name || clientsMap.get(p.client_id) || '',
          }));
          setClients(loadedClients);
          setProjects(enrichedProjects);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not load from Supabase directly, falling back to local storage:', err);
      }
    }

    // Local / Demo Mode storage
    if (typeof window !== 'undefined') {
      const savedClients = localStorage.getItem(LOCAL_STORAGE_CLIENTS);
      const savedProjects = localStorage.getItem(LOCAL_STORAGE_PROJECTS);

      if (savedClients && savedProjects) {
        try {
          const loadedClients: Client[] = JSON.parse(savedClients);
          const loadedProjects: Project[] = JSON.parse(savedProjects);
          const clientsMap = new Map(
            loadedClients.map((c) => [c.id, c.company || c.name || ''])
          );
          const enrichedProjects = loadedProjects.map((p) => ({
            ...p,
            client_name: p.client_name || clientsMap.get(p.client_id) || '',
          }));
          setClients(loadedClients);
          setProjects(enrichedProjects);
          setIsLoading(false);
          return;
        } catch {
          // Fallback to initial
        }
      }

      // First time loading demo data
      setClients(INITIAL_CLIENTS);
      setProjects(INITIAL_PROJECTS);
      localStorage.setItem(LOCAL_STORAGE_CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      localStorage.setItem(LOCAL_STORAGE_PROJECTS, JSON.stringify(INITIAL_PROJECTS));
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist to local storage helper in demo mode
  const syncLocal = (newClients: Client[], newProjects: Project[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_CLIENTS, JSON.stringify(newClients));
      localStorage.setItem(LOCAL_STORAGE_PROJECTS, JSON.stringify(newProjects));
    }
  };

  // Add Client
  const addClient = async (data: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
    const newClient: Client = {
      ...data,
      id: `cli-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && user) {
      try {
        const supabase = createClient();
        const { data: inserted, error } = await supabase
          .from('clients')
          .insert([{ ...data, user_id: user.id }])
          .select()
          .single();
        if (!error && inserted) {
          const clientResult = inserted as Client;
          setClients((prev) => [clientResult, ...prev]);
          return clientResult;
        }
      } catch (err) {
        console.warn('Supabase insert failed, storing locally:', err);
      }
    }

    const updated = [newClient, ...clients];
    setClients(updated);
    syncLocal(updated, projects);
    return newClient;
  };

  // Update Client
  const updateClient = async (id: string, data: Partial<Client>): Promise<Client> => {
    if (isSupabaseConfigured() && user) {
      try {
        const supabase = createClient();
        const { data: updated, error } = await supabase
          .from('clients')
          .update(data)
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) {
          const clientResult = updated as Client;
          setClients((prev) => prev.map((c) => (c.id === id ? clientResult : c)));
          return clientResult;
        }
      } catch (err) {
        console.warn('Supabase update failed, updating locally:', err);
      }
    }

    const updatedClients = clients.map((c) => {
      if (c.id === id) {
        return { ...c, ...data, updated_at: new Date().toISOString() };
      }
      return c;
    });
    setClients(updatedClients);

    // If client name or company changed, also update denormalized client_name in projects
    const targetClient = updatedClients.find((c) => c.id === id);
    const updatedProjects = projects.map((p) => {
      if (p.client_id === id && targetClient) {
        return { ...p, client_name: targetClient.company || targetClient.name };
      }
      return p;
    });
    setProjects(updatedProjects);
    syncLocal(updatedClients, updatedProjects);

    return targetClient!;
  };

  // Delete Client
  const deleteClient = async (id: string): Promise<void> => {
    if (isSupabaseConfigured() && user) {
      try {
        const supabase = createClient();
        await supabase.from('clients').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete failed, deleting locally:', err);
      }
    }

    const updatedClients = clients.filter((c) => c.id !== id);
    const updatedProjects = projects.filter((p) => p.client_id !== id);
    setClients(updatedClients);
    setProjects(updatedProjects);
    syncLocal(updatedClients, updatedProjects);
  };

  // Add Project
  const addProject = async (
    data: Omit<Project, 'id' | 'created_at' | 'remaining_amount' | 'payment_status'>
  ): Promise<Project> => {
    const total_price = Number(data.total_price) || 0;
    const amount_paid = Number(data.amount_paid) || 0;
    const remaining_amount = calculateRemaining(total_price, amount_paid);
    const payment_status = determinePaymentStatus(total_price, amount_paid);

    const client = clients.find((c) => c.id === data.client_id);
    const client_name = client ? (client.company || client.name) : data.client_name || '';

    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      client_name,
      total_price,
      amount_paid,
      remaining_amount,
      payment_status,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && user) {
      try {
        const supabase = createClient();
        const { data: inserted, error } = await supabase
          .from('projects')
          .insert([{
            ...data,
            total_price,
            amount_paid,
            payment_status,
            user_id: user.id,
          }])
          .select()
          .single();
        if (!error && inserted) {
          const projectResult: Project = {
            ...(inserted as Project),
            client_name: client_name || (client ? (client.company || client.name) : ''),
          };
          setProjects((prev) => [projectResult, ...prev]);
          return projectResult;
        }
      } catch (err) {
        console.warn('Supabase add project failed, adding locally:', err);
      }
    }

    const updated = [newProject, ...projects];
    setProjects(updated);
    syncLocal(clients, updated);
    return newProject;
  };

  // Update Project
  const updateProject = async (id: string, data: Partial<Project>): Promise<Project> => {
    const existing = projects.find((p) => p.id === id);
    const total_price = data.total_price !== undefined ? Number(data.total_price) : (existing?.total_price || 0);
    const amount_paid = data.amount_paid !== undefined ? Number(data.amount_paid) : (existing?.amount_paid || 0);
    const remaining_amount = calculateRemaining(total_price, amount_paid);
    const payment_status = data.payment_status || determinePaymentStatus(total_price, amount_paid);

    const targetClient = data.client_id
      ? clients.find((c) => c.id === data.client_id)
      : clients.find((c) => c.id === existing?.client_id);
    const resolvedClientName = targetClient
      ? (targetClient.company || targetClient.name)
      : (data.client_name || existing?.client_name || '');

    if (isSupabaseConfigured() && user) {
      try {
        const supabase = createClient();
        const { data: updated, error } = await supabase
          .from('projects')
          .update({
            ...data,
            total_price,
            amount_paid,
            payment_status,
          })
          .eq('id', id)
          .select()
          .single();
        if (!error && updated) {
          const projResult: Project = {
            ...(updated as Project),
            client_name: resolvedClientName,
          };
          setProjects((prev) => prev.map((p) => (p.id === id ? projResult : p)));
          return projResult;
        }
      } catch (err) {
        console.warn('Supabase update project failed, updating locally:', err);
      }
    }

    const updatedProjects = projects.map((p) => {
      if (p.id === id) {
        const targetClient = data.client_id ? clients.find((c) => c.id === data.client_id) : undefined;
        return {
          ...p,
          ...data,
          client_name: targetClient ? (targetClient.company || targetClient.name) : p.client_name,
          total_price,
          amount_paid,
          remaining_amount,
          payment_status,
          updated_at: new Date().toISOString(),
        };
      }
      return p;
    });

    setProjects(updatedProjects);
    syncLocal(clients, updatedProjects);
    return updatedProjects.find((p) => p.id === id)!;
  };

  // Delete Project
  const deleteProject = async (id: string): Promise<void> => {
    if (isSupabaseConfigured() && user) {
      try {
        const supabase = createClient();
        await supabase.from('projects').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete project failed, deleting locally:', err);
      }
    }

    const updatedProjects = projects.filter((p) => p.id !== id);
    setProjects(updatedProjects);
    syncLocal(clients, updatedProjects);
  };

  // Record Payment
  const recordPayment = async (projectId: string, paymentAmount: number): Promise<void> => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const newAmountPaid = (proj.amount_paid || 0) + Number(paymentAmount);
    await updateProject(projectId, {
      amount_paid: newAmountPaid,
      total_price: proj.total_price,
    });
  };

  // Reset to sample data
  const resetToSampleData = () => {
    setClients(INITIAL_CLIENTS);
    setProjects(INITIAL_PROJECTS);
    syncLocal(INITIAL_CLIENTS, INITIAL_PROJECTS);
  };

  const getClientProjects = useCallback(
    (clientId: string) => projects.filter((p) => p.client_id === clientId),
    [projects]
  );

  const getClientById = useCallback(
    (clientId: string) => clients.find((c) => c.id === clientId),
    [clients]
  );

  // Compute metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === 'active').length;
    const activeProjects = projects.filter((p) => p.status === 'in_development' || p.status === 'live').length;
    const completedProjects = projects.filter((p) => p.status === 'completed').length;

    let totalReceivables = 0;
    let totalInvoiced = 0;
    let totalCollected = 0;

    projects.forEach((p) => {
      const price = Number(p.total_price) || 0;
      const paid = Number(p.amount_paid) || 0;
      const remaining = calculateRemaining(price, paid);

      totalInvoiced += price;
      totalCollected += paid;
      totalReceivables += remaining;
    });

    return {
      totalClients,
      activeClients,
      activeProjects,
      completedProjects,
      totalReceivables,
      totalInvoiced,
      totalCollected,
    };
  }, [clients, projects]);

  return (
    <DataContext.Provider
      value={{
        clients,
        projects,
        metrics,
        isLoading,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        recordPayment,
        resetToSampleData,
        getClientProjects,
        getClientById,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
