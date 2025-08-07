-- Disable RLS for demo setup (simplest approach)
-- Run this in Supabase SQL Editor if you're still having authentication issues

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_templates DISABLE ROW LEVEL SECURITY;
