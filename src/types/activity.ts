export type ActivityType = 
  | 'lead_created'
  | 'lead_updated'
  | 'status_changed'
  | 'email_sent'
  | 'followup_sent'
  | 'meeting_booked'
  | 'lead_deleted'
  | 'task_created'
  | 'task_completed';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  userId: string;
  userName: string;
  leadId?: string;
  leadName?: string;
  fromStatus?: string;
  toStatus?: string;
  createdAt: Date;
}

export interface ActivitySummary {
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  userName: string;
}
