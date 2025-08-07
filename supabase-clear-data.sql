-- Clear existing data and reset for fresh start
-- Run this in Supabase SQL Editor

DELETE FROM leads;
DELETE FROM todo_tasks WHERE user_id NOT IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002', 
  '00000000-0000-0000-0000-000000000003'
);

-- Verify the users exist with correct UUIDs
SELECT id, name, email, role FROM users;
