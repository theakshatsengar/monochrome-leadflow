import { create } from 'zustand';
import { Lead, LeadStatus } from '@/types/lead';

interface LeadStore {
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'followupsSent' | 'hasReplies'>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  deleteLead: (id: string) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
}

// Mock data
const mockLeads: Lead[] = [
  {
    id: '1',
    companyName: 'TechCorp Solutions',
    website: 'https://techcorp.com',
    contactPersonName: 'Jane Doe',
    contactEmail: 'jane@techcorp.com',
    linkedinProfile: 'https://linkedin.com/in/janedoe',
    assignedIntern: 'John Smith',
    status: 'email-sent',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    followupsSent: 1,
    hasReplies: false,
  },
  {
    id: '2',
    companyName: 'Digital Innovations',
    website: 'https://diginnovations.com',
    contactPersonName: 'Robert Wilson',
    contactEmail: 'robert@diginnovations.com',
    assignedIntern: 'Sarah Johnson',
    status: 'replied',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    followupsSent: 2,
    hasReplies: true,
  },
  {
    id: '3',
    companyName: 'StartupXYZ',
    website: 'https://startupxyz.com',
    contactPersonName: 'Lisa Chen',
    contactEmail: 'lisa@startupxyz.com',
    assignedIntern: 'Mike Chen',
    status: 'new',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    followupsSent: 0,
    hasReplies: false,
  },
  {
    id: '4',
    companyName: 'Enterprise Global',
    website: 'https://enterpriseglobal.com',
    contactPersonName: 'David Brown',
    contactEmail: 'david@enterpriseglobal.com',
    linkedinProfile: 'https://linkedin.com/in/davidbrown',
    assignedIntern: 'Emily Davis',
    status: 'booked',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22'),
    followupsSent: 3,
    hasReplies: true,
  },
  {
    id: '5',
    companyName: 'Future Systems',
    website: 'https://futuresystems.com',
    contactPersonName: 'Amanda Taylor',
    contactEmail: 'amanda@futuresystems.com',
    assignedIntern: 'Alex Rodriguez',
    status: 'followup-1',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
    followupsSent: 1,
    hasReplies: false,
  },
];

export const useLeadStore = create<LeadStore>((set) => ({
  leads: mockLeads,
  
  addLead: (leadData) =>
    set((state) => ({
      leads: [
        ...state.leads,
        {
          ...leadData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
          followupsSent: 0,
          hasReplies: false,
        },
      ],
    })),

  updateLeadStatus: (id, status) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id
          ? { ...lead, status, updatedAt: new Date() }
          : lead
      ),
    })),

  deleteLead: (id) =>
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
    })),

  updateLead: (id, updates) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id
          ? { ...lead, ...updates, updatedAt: new Date() }
          : lead
      ),
    })),
}));