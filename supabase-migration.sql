-- Supabase Database Migration Script
-- Note: JWT secret is automatically managed by Supabase

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'intern');

-- Create lead status enum
CREATE TYPE lead_status AS ENUM ('new', 'email-sent', 'followup-1', 'followup-2', 'replied', 'booked', 'converted');

-- Create task priority enum
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'intern',
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table
CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name VARCHAR NOT NULL,
    website VARCHAR NOT NULL,
    contact_person_name VARCHAR NOT NULL,
    contact_email VARCHAR NOT NULL,
    linkedin_profile VARCHAR,
    assigned_intern VARCHAR NOT NULL,
    status lead_status NOT NULL DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    followups_sent INTEGER DEFAULT 0,
    has_replies BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create todo_tasks table
CREATE TABLE todo_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    priority task_priority NOT NULL DEFAULT 'medium',
    assigned_to VARCHAR NOT NULL,
    created_by VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create todo_templates table
CREATE TABLE todo_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    priority task_priority NOT NULL DEFAULT 'medium',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_assigned_intern ON leads(assigned_intern);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_contact_email ON leads(contact_email);
CREATE INDEX idx_leads_created_at ON leads(created_at);

CREATE INDEX idx_todo_tasks_user_id ON todo_tasks(user_id);
CREATE INDEX idx_todo_tasks_assigned_to ON todo_tasks(assigned_to);
CREATE INDEX idx_todo_tasks_created_by ON todo_tasks(created_by);
CREATE INDEX idx_todo_tasks_completed ON todo_tasks(completed);
CREATE INDEX idx_todo_tasks_due_date ON todo_tasks(due_date);

CREATE INDEX idx_todo_templates_user_id ON todo_templates(user_id);
CREATE INDEX idx_todo_templates_is_default ON todo_templates(is_default);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can see their own data and admins can see all
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Leads policies - users can see all leads but only modify their own
CREATE POLICY "Users can view all leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Users can insert their own leads" ON leads FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own leads" ON leads FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own leads" ON leads FOR DELETE USING (auth.uid()::text = user_id::text);

-- Todo tasks policies - users can see all tasks but only modify their own
CREATE POLICY "Users can view all tasks" ON todo_tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert their own tasks" ON todo_tasks FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own tasks" ON todo_tasks FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own tasks" ON todo_tasks FOR DELETE USING (auth.uid()::text = user_id::text);

-- Todo templates policies - users can see all templates but only modify their own
CREATE POLICY "Users can view all templates" ON todo_templates FOR SELECT USING (true);
CREATE POLICY "Users can insert their own templates" ON todo_templates FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update their own templates" ON todo_templates FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete their own templates" ON todo_templates FOR DELETE USING (auth.uid()::text = user_id::text);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todo_templates_updated_at BEFORE UPDATE ON todo_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (id, name, email, role) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Bhavya', 'bhavyaojha28@gmail.com', 'intern'),
    ('00000000-0000-0000-0000-000000000002', 'Bhumika', 'bhumikabisht603@gmail.com', 'intern'),
    ('00000000-0000-0000-0000-000000000003', 'Akshat', 'akshatsengar1002@gmail.com', 'admin');

-- Added mock user Utkarsh for demo login
INSERT INTO users (id, name, email, role) VALUES
    ('00000000-0000-0000-0000-000000000004', 'Utkarsh', 'hello.utkarshjha@gmail.com', 'admin');

-- Insert sample templates
INSERT INTO todo_templates (title, description, priority, is_default, user_id) VALUES 
    ('Find 10–15 new leads', 'Research and identify potential prospects using LinkedIn, company directories, etc.', 'high', true, '00000000-0000-0000-0000-000000000003'),
    ('Submit leads using the form', 'Add new leads to the system with complete information', 'high', true, '00000000-0000-0000-0000-000000000003'),
    ('Send cold emails to new leads', 'Initial outreach to prospects using approved templates', 'medium', true, '00000000-0000-0000-0000-000000000003'),
    ('Follow up on pending leads', 'Check and respond to pending prospects', 'medium', true, '00000000-0000-0000-0000-000000000003'),
    ('Update lead statuses', 'Keep lead statuses current in the system', 'low', true, '00000000-0000-0000-0000-000000000003');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
