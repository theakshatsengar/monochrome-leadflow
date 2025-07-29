import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  {
    id: '6',
    companyName: 'CloudTech Industries',
    website: 'https://cloudtech.io',
    contactPersonName: 'Michael Rodriguez',
    contactEmail: 'michael@cloudtech.io',
    linkedinProfile: 'https://linkedin.com/in/michaelrodriguez',
    assignedIntern: 'John Smith',
    status: 'converted',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-25'),
    followupsSent: 4,
    hasReplies: true,
  },
  {
    id: '7',
    companyName: 'InnovateLab',
    website: 'https://innovatelab.com',
    contactPersonName: 'Sarah Martinez',
    contactEmail: 'sarah@innovatelab.com',
    assignedIntern: 'Sarah Johnson',
    status: 'new',
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23'),
    followupsSent: 0,
    hasReplies: false,
  },
  {
    id: '8',
    companyName: 'DataDriven Corp',
    website: 'https://datadriven.com',
    contactPersonName: 'James Anderson',
    contactEmail: 'james@datadriven.com',
    linkedinProfile: 'https://linkedin.com/in/jamesanderson',
    assignedIntern: 'Mike Chen',
    status: 'email-sent',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-19'),
    followupsSent: 1,
    hasReplies: false,
  },
  {
    id: '9',
    companyName: 'NextGen Solutions',
    website: 'https://nextgensol.com',
    contactPersonName: 'Emma Thompson',
    contactEmail: 'emma@nextgensol.com',
    assignedIntern: 'Emily Davis',
    status: 'followup-2',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-21'),
    followupsSent: 2,
    hasReplies: false,
  },
  {
    id: '10',
    companyName: 'AI Dynamics',
    website: 'https://aidynamics.ai',
    contactPersonName: 'Christopher Lee',
    contactEmail: 'chris@aidynamics.ai',
    linkedinProfile: 'https://linkedin.com/in/christopherlee',
    assignedIntern: 'Alex Rodriguez',
    status: 'replied',
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-20'),
    followupsSent: 2,
    hasReplies: true,
  },
  {
    id: '11',
    companyName: 'CyberSecure Inc',
    website: 'https://cybersecure.com',
    contactPersonName: 'Nicole White',
    contactEmail: 'nicole@cybersecure.com',
    assignedIntern: 'John Smith',
    status: 'booked',
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-24'),
    followupsSent: 3,
    hasReplies: true,
  },
  {
    id: '12',
    companyName: 'FinTech Pioneers',
    website: 'https://fintechpioneers.com',
    contactPersonName: 'Ryan Kumar',
    contactEmail: 'ryan@fintechpioneers.com',
    linkedinProfile: 'https://linkedin.com/in/ryankumar',
    assignedIntern: 'Sarah Johnson',
    status: 'new',
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
    followupsSent: 0,
    hasReplies: false,
  },
  {
    id: '13',
    companyName: 'GreenTech Ventures',
    website: 'https://greentech.ventures',
    contactPersonName: 'Sofia Garcia',
    contactEmail: 'sofia@greentech.ventures',
    assignedIntern: 'Mike Chen',
    status: 'email-sent',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-18'),
    followupsSent: 1,
    hasReplies: false,
  },
  {
    id: '14',
    companyName: 'RoboticsFlow',
    website: 'https://roboticsflow.com',
    contactPersonName: 'Daniel Park',
    contactEmail: 'daniel@roboticsflow.com',
    linkedinProfile: 'https://linkedin.com/in/danielpark',
    assignedIntern: 'Emily Davis',
    status: 'followup-1',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-20'),
    followupsSent: 1,
    hasReplies: false,
  },
  {
    id: '15',
    companyName: 'BlockChain Experts',
    website: 'https://blockchainexperts.io',
    contactPersonName: 'Rachel Torres',
    contactEmail: 'rachel@blockchainexperts.io',
    assignedIntern: 'Alex Rodriguez',
    status: 'converted',
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-26'),
    followupsSent: 5,
    hasReplies: true,
  },
  {
    id: '16',
    companyName: 'MedTech Innovations',
    website: 'https://medtechinnovations.com',
    contactPersonName: 'Kevin O\'Connor',
    contactEmail: 'kevin@medtechinnovations.com',
    linkedinProfile: 'https://linkedin.com/in/kevinoconnor',
    assignedIntern: 'John Smith',
    status: 'replied',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-23'),
    followupsSent: 2,
    hasReplies: true,
  },
  {
    id: '17',
    companyName: 'EduTech Solutions',
    website: 'https://edutechsolutions.edu',
    contactPersonName: 'Maria Fernandez',
    contactEmail: 'maria@edutechsolutions.edu',
    assignedIntern: 'Sarah Johnson',
    status: 'followup-2',
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-21'),
    followupsSent: 2,
    hasReplies: false,
  },
  {
    id: '18',
    companyName: 'Smart Logistics',
    website: 'https://smartlogistics.com',
    contactPersonName: 'Andrew Kim',
    contactEmail: 'andrew@smartlogistics.com',
    linkedinProfile: 'https://linkedin.com/in/andrewkim',
    assignedIntern: 'Mike Chen',
    status: 'booked',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-25'),
    followupsSent: 3,
    hasReplies: true,
  },
  {
    id: '19',
    companyName: 'VR Gaming Studio',
    website: 'https://vrgamingstudio.com',
    contactPersonName: 'Jessica Liu',
    contactEmail: 'jessica@vrgamingstudio.com',
    assignedIntern: 'Emily Davis',
    status: 'new',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
    followupsSent: 0,
    hasReplies: false,
  },
  {
    id: '20',
    companyName: 'IoT Connect',
    website: 'https://iotconnect.tech',
    contactPersonName: 'Mark Johnson',
    contactEmail: 'mark@iotconnect.tech',
    linkedinProfile: 'https://linkedin.com/in/markjohnson',
    assignedIntern: 'Alex Rodriguez',
    status: 'email-sent',
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-20'),
    followupsSent: 1,
    hasReplies: false,
  },
];

export const useLeadStore = create<LeadStore>()(
  persist(
    (set, get) => ({
      leads: mockLeads,
      
      addLead: (leadData) =>
        set((state) => {
          // Check for duplicates by email
          const existingLead = state.leads.find(
            lead => lead.contactEmail.toLowerCase() === leadData.contactEmail.toLowerCase()
          );
          
          if (existingLead) {
            throw new Error('A lead with this email already exists');
          }
          
          return {
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
          };
        }),

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
    }),
    {
      name: 'lead-storage',
      partialize: (state) => ({ leads: state.leads }),
    }
  )
);