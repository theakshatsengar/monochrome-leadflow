import { create } from 'zustand';
import { Activity, ActivityType, ActivitySummary } from '@/types/activity';
import { formatDistanceToNow } from 'date-fns';

interface ActivityStore {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  getRecentActivities: (limit?: number) => ActivitySummary[];
  clearActivities: () => void;
  initializeSampleActivities: () => void;
}

export const useActivityStore = create<ActivityStore>((set, get) => ({
  activities: [],

  addActivity: (activityData) => {
    const activity: Activity = {
      ...activityData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };

    set(state => ({
      activities: [activity, ...state.activities].slice(0, 100) // Keep only last 100 activities
    }));
  },

  getRecentActivities: (limit = 10) => {
    const { activities } = get();
    
    return activities
      .slice(0, limit)
      .map(activity => {
        let title = '';
        let description = '';

        switch (activity.type) {
          case 'lead_created':
            title = `New lead added: ${activity.leadName || 'Unknown'}`;
            description = `Created by ${activity.userName}`;
            break;
          case 'status_changed':
            title = `Status updated: ${activity.leadName || 'Lead'} → ${activity.toStatus}`;
            description = `Changed from ${activity.fromStatus} by ${activity.userName}`;
            break;
          case 'lead_updated':
            title = `Lead updated: ${activity.leadName || 'Unknown'}`;
            description = `Updated by ${activity.userName}`;
            break;
          case 'email_sent':
            title = `Email sent to ${activity.leadName || 'lead'}`;
            description = `Sent by ${activity.userName}`;
            break;
          case 'followup_sent':
            title = `Follow-up sent to ${activity.leadName || 'lead'}`;
            description = `Sent by ${activity.userName}`;
            break;
          case 'meeting_booked':
            title = `Meeting booked with ${activity.leadName || 'lead'}`;
            description = `Booked by ${activity.userName}`;
            break;
          case 'lead_deleted':
            title = `Lead deleted: ${activity.leadName || 'Unknown'}`;
            description = `Deleted by ${activity.userName}`;
            break;
          case 'task_created':
            title = `New task created`;
            description = `Created by ${activity.userName}`;
            break;
          case 'task_completed':
            title = `Task completed`;
            description = `Completed by ${activity.userName}`;
            break;
          default:
            title = activity.title;
            description = activity.description || `Action by ${activity.userName}`;
        }

        return {
          type: activity.type,
          title,
          description,
          timestamp: activity.createdAt,
          userName: activity.userName,
        };
      });
  },

  clearActivities: () => set({ activities: [] }),

  initializeSampleActivities: () => {
    const sampleActivities: Activity[] = [
      {
        id: 'sample-1',
        type: 'lead_created',
        title: 'New lead added: TechCorp Solutions',
        userId: '00000000-0000-0000-0000-000000000001',
        userName: 'Nitin Sengar',
        leadId: 'sample-lead-1',
        leadName: 'TechCorp Solutions',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 'sample-2',
        type: 'status_changed',
        title: 'Status updated: Digital Innovations → Replied',
        userId: '00000000-0000-0000-0000-000000000002',
        userName: 'Shreyash Garg',
        leadId: 'sample-lead-2',
        leadName: 'Digital Innovations',
        fromStatus: 'email-sent',
        toStatus: 'replied',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: 'sample-3',
        type: 'followup_sent',
        title: 'Follow-up sent to StartupXYZ',
        userId: '00000000-0000-0000-0000-000000000001',
        userName: 'Nitin Sengar',
        leadId: 'sample-lead-3',
        leadName: 'StartupXYZ',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 'sample-4',
        type: 'meeting_booked',
        title: 'Meeting booked with InnovateTech',
        userId: '00000000-0000-0000-0000-000000000002',
        userName: 'Shreyash Garg',
        leadId: 'sample-lead-4',
        leadName: 'InnovateTech',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ];

    set({ activities: sampleActivities });
  },
}));
