-- Updated RLS policies for demo authentication
-- This script updates the existing policies to work with demo authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view all leads" ON leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
DROP POLICY IF EXISTS "Users can view all tasks" ON todo_tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON todo_tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON todo_tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON todo_tasks;
DROP POLICY IF EXISTS "Users can view all templates" ON todo_templates;
DROP POLICY IF EXISTS "Users can insert their own templates" ON todo_templates;
DROP POLICY IF EXISTS "Users can update their own templates" ON todo_templates;
DROP POLICY IF EXISTS "Users can delete their own templates" ON todo_templates;

-- Create more permissive policies for demo purposes
-- Users table - allow all operations for demo
CREATE POLICY "Demo: Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- Leads table - allow all operations for demo
CREATE POLICY "Demo: Allow all operations on leads" ON leads FOR ALL USING (true) WITH CHECK (true);

-- Todo tasks table - allow all operations for demo
CREATE POLICY "Demo: Allow all operations on todo_tasks" ON todo_tasks FOR ALL USING (true) WITH CHECK (true);

-- Todo templates table - allow all operations for demo
CREATE POLICY "Demo: Allow all operations on todo_templates" ON todo_templates FOR ALL USING (true) WITH CHECK (true);
