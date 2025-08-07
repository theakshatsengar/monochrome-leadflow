# Daily Tasks Database Migration

This document explains the migration of daily tasks from localStorage to the database for cross-device synchronization.

## What Changed

### Before (localStorage)
- Daily tasks were stored in browser localStorage
- Tasks were isolated per browser/device
- No synchronization across devices
- Data could be lost if localStorage was cleared

### After (Database)
- Daily tasks are stored in Supabase database
- Full synchronization across all devices and browsers
- Data persistence and backup
- Better performance and reliability

## Database Schema

A new `daily_tasks` table has been created with the following structure:

```sql
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL,              -- Predefined task ID (e.g., 'find-leads')
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  target_count INTEGER,
  current_count INTEGER DEFAULT 0,
  icon TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Migration Process

### Automatic Migration
The app automatically migrates existing localStorage data when a user logs in:

1. **Detection**: Checks for existing `daily-tasks-storage` in localStorage
2. **Validation**: Ensures user is authenticated and has tasks
3. **Migration**: Converts localStorage format to database format
4. **Backup**: Creates a backup of localStorage data before removal
5. **Cleanup**: Removes localStorage data after successful migration

### Manual Migration
If automatic migration fails, you can run it manually:

```javascript
import { migrateDailyTasksFromLocalStorage } from '@/services/dailyTaskMigration';

// Run migration
await migrateDailyTasksFromLocalStorage();
```

## Deployment Steps

### 1. Run Database Migration
Execute the SQL migration script in your Supabase dashboard:

```bash
-- Run this script in Supabase SQL Editor
\i supabase-daily-tasks-database-migration.sql
```

### 2. Deploy Code Changes
Deploy the updated code with the new daily tasks service and store.

### 3. Verify Migration
After deployment, verify that:
- New daily tasks are created in the database
- Existing users' tasks are migrated automatically
- Tasks sync across devices

## Files Changed

### New Files
- `supabase-daily-tasks-database-migration.sql` - Database migration script
- `src/services/dailyTaskService.ts` - Database operations for daily tasks
- `src/services/dailyTaskMigration.ts` - Migration utilities

### Modified Files
- `src/types/database.ts` - Added daily_tasks table types
- `src/store/dailyTasksStore.ts` - Updated to use database instead of localStorage
- `src/components/DailyTasksSection.tsx` - Added loading states and error handling
- `src/App.tsx` - Added automatic migration on app start

## Benefits

1. **Cross-Device Sync**: Tasks now sync across all devices and browsers
2. **Data Persistence**: No data loss from browser cache clearing
3. **Better UX**: Loading states and error handling
4. **Analytics Ready**: Database storage enables future analytics features
5. **Scalability**: Better performance for multiple users

## Troubleshooting

### Migration Issues
If migration fails:
1. Check console for error messages
2. Verify user authentication
3. Check database connectivity
4. Manually run migration script

### Task Loading Issues
If tasks don't load:
1. Check network connectivity
2. Verify Supabase configuration
3. Check browser console for errors
4. Refresh the page

### Data Recovery
If localStorage backup is needed:
1. Check for backup keys: `daily-tasks-storage-backup-{timestamp}`
2. Restore from backup if needed
3. Contact support for database recovery

## Future Enhancements

With database storage, we can now implement:
- Task completion analytics
- Historical performance tracking
- Manager oversight of intern progress
- Custom task templates
- Team-wide task assignments

## Security

- Row Level Security (RLS) ensures users only see their own tasks
- All database operations require authentication
- Tasks are tied to user IDs for proper isolation
