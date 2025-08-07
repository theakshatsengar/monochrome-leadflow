-- Migration to create daily_tasks table for syncing across devices
-- This replaces localStorage storage for daily tasks

-- Create daily_tasks table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL, -- The predefined task ID (e.g., 'find-leads', 'send-emails')
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  target_count INTEGER,
  current_count INTEGER DEFAULT 0,
  icon TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE, -- Track which date this task is for
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(date);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON daily_tasks(user_id);

-- Create unique constraint to prevent duplicate tasks for same user on same date
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_tasks_unique_user_task_date 
ON daily_tasks(user_id, task_id, date);

-- Add RLS (Row Level Security) policies
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own daily tasks
CREATE POLICY "Users can view their own daily tasks" ON daily_tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own daily tasks
CREATE POLICY "Users can insert their own daily tasks" ON daily_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own daily tasks
CREATE POLICY "Users can update their own daily tasks" ON daily_tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own daily tasks
CREATE POLICY "Users can delete their own daily tasks" ON daily_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_daily_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_daily_tasks_updated_at
  BEFORE UPDATE ON daily_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_tasks_updated_at();

-- Add comments for documentation
COMMENT ON TABLE daily_tasks IS 'Stores daily tasks for interns with cross-device synchronization';
COMMENT ON COLUMN daily_tasks.task_id IS 'Predefined task identifier (e.g., find-leads, send-emails)';
COMMENT ON COLUMN daily_tasks.date IS 'The date this task instance is for';
COMMENT ON COLUMN daily_tasks.target_count IS 'Target number to complete (if applicable)';
COMMENT ON COLUMN daily_tasks.current_count IS 'Current progress count';
