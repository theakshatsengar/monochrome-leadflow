import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lead, LeadStatus } from '@/types/lead';
import { LeadService } from '@/services/leadService';

interface LeadStore {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'followupsSent' | 'hasReplies'>, userId: string) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  fetchLeads: (userId?: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLeadStore = create<LeadStore>()(
  persist(
    (set, get) => ({
      leads: [],
      isLoading: false,
      error: null,

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      fetchLeads: async (userId?: string) => {
        set({ isLoading: true, error: null });
        try {
          const leads = await LeadService.findAll(userId);
          set({ leads, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to fetch leads', isLoading: false });
        }
      },

      addLead: async (leadData, userId) => {
        set({ isLoading: true, error: null });
        try {
          // Check for duplicates by email
          const existingLead = await LeadService.findByEmail(leadData.contactEmail);
          
          if (existingLead) {
            throw new Error('A lead with this email already exists');
          }
          
          const newLead = await LeadService.create(leadData, userId);
          set(state => ({ 
            leads: [newLead, ...state.leads],
            isLoading: false 
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add lead';
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      updateLeadStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
          const updatedLead = await LeadService.updateStatus(id, status);
          set(state => ({
            leads: state.leads.map(lead =>
              lead.id === id ? updatedLead : lead
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update lead status', isLoading: false });
        }
      },

      deleteLead: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await LeadService.delete(id);
          set(state => ({
            leads: state.leads.filter(lead => lead.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete lead', isLoading: false });
        }
      },

      updateLead: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedLead = await LeadService.update(id, updates);
          set(state => ({
            leads: state.leads.map(lead =>
              lead.id === id ? updatedLead : lead
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update lead', isLoading: false });
        }
      },
    }),
    {
      name: 'lead-storage',
      partialize: (state) => ({ 
        leads: state.leads,
        // Don't persist loading states and errors
      }),
    }
  )
);
