export type LeadStatus = 
  | 'new'
  | 'email-sent'
  | 'followup-1'
  | 'followup-2'
  | 'replied'
  | 'booked'
  | 'converted';

export interface Lead {
  id: string;
  companyName: string;
  website: string;
  contactPersonName: string;
  contactEmail: string;
  linkedinProfile?: string;
  assignedIntern: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
  followupsSent: number;
  hasReplies: boolean;
}

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'email-sent', label: 'Email Sent' },
  { value: 'followup-1', label: 'Follow-up 1' },
  { value: 'followup-2', label: 'Follow-up 2' },
  { value: 'replied', label: 'Replied' },
  { value: 'booked', label: 'Booked' },
  { value: 'converted', label: 'Converted' },
];

export const INTERNS = [
  'John Smith',
  'Sarah Johnson',
  'Mike Chen',
  'Emily Davis',
  'Alex Rodriguez'
];