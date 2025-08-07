# Monochrome Lead Flow - Supabase Integration

This project has been updated to use Supabase as the database backend instead of local storage. Here's how to set it up:

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Ensure you have Node.js installed (v16 or higher)
3. **Package Manager**: This project uses Bun, but npm/yarn also work

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a database password and region
3. Wait for the project to be fully set up

### 2. Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (something like `https://xyzcompany.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Set Up Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-migration.sql` 
3. Paste it into the SQL Editor and run the query
4. This will create all necessary tables, indexes, and sample data

### 5. Install Dependencies and Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Database Schema

The database includes the following tables:

### `users`
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `role` (ENUM: 'admin', 'manager', 'intern')
- `avatar` (TEXT, Optional)
- `created_at`, `updated_at` (Timestamps)

### `leads`
- `id` (UUID, Primary Key)
- `company_name` (VARCHAR)
- `website` (VARCHAR)
- `contact_person_name` (VARCHAR)
- `contact_email` (VARCHAR)
- `linkedin_profile` (VARCHAR, Optional)
- `assigned_intern` (VARCHAR)
- `status` (ENUM: lead statuses)
- `followups_sent` (INTEGER)
- `has_replies` (BOOLEAN)
- `user_id` (UUID, Foreign Key)
- `created_at`, `updated_at` (Timestamps)

### `todo_tasks`
- `id` (UUID, Primary Key)
- `title` (VARCHAR)
- `description` (TEXT, Optional)
- `priority` (ENUM: 'low', 'medium', 'high')
- `assigned_to` (VARCHAR)
- `created_by` (VARCHAR)
- `due_date` (TIMESTAMP, Optional)
- `completed` (BOOLEAN)
- `completed_at` (TIMESTAMP, Optional)
- `user_id` (UUID, Foreign Key)
- `created_at` (Timestamp)

### `todo_templates`
- `id` (UUID, Primary Key)
- `title` (VARCHAR)
- `description` (TEXT, Optional)
- `priority` (ENUM: 'low', 'medium', 'high')
- `is_default` (BOOLEAN)
- `user_id` (UUID, Foreign Key)
- `created_at`, `updated_at` (Timestamps)

## Key Changes Made

### 1. **Database Integration**
- Added Supabase client configuration
- Created comprehensive database types
- Implemented service layer for all CRUD operations
- Added proper error handling and loading states

### 2. **Store Updates**
- Updated Zustand stores to use async operations
- Added loading and error states
- Maintained existing API but made operations async

### 3. **Component Updates**
- Updated all components to handle async operations
- Added proper error handling and user feedback
- Maintained existing UI/UX patterns

### 4. **Security Features**
- Implemented Row Level Security (RLS)
- Added proper data isolation between users
- Secure API key handling via environment variables

## Sample Data

The migration script includes sample users:
- **Bhavya** (intern): `bhavyaojha28@gmail.com`
- **Bhumika** (intern): `bhumikabisht603@gmail.com`
- **Akshat** (admin): `akshatsengar1002@gmail.com`

You can login with these credentials using the same passwords as before.

## Development Notes

### Authentication
- The app still uses the same mock authentication for demo purposes
- Users are automatically created in Supabase when they first log in
- Each user gets their own data scope via RLS policies

### Data Migration
- Existing local storage data won't automatically migrate
- Users will start with fresh data after the Supabase setup
- The app gracefully handles the transition

### Performance
- All database operations are optimized with proper indexing
- Async operations prevent UI blocking
- Error boundaries handle connection issues gracefully

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file is in the project root
   - Restart the dev server after adding variables
   - Check that variable names start with `VITE_`

2. **Database Connection Errors**
   - Verify Supabase URL and API key are correct
   - Check that your Supabase project is active
   - Ensure you've run the migration script

3. **RLS Policy Errors**
   - Make sure the migration script ran completely
   - Check that RLS policies are enabled in Supabase
   - Verify user authentication is working

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase project is running
3. Ensure all environment variables are set correctly
4. Check the Network tab to see if API calls are failing

## Next Steps

With Supabase integrated, you can now:
- Add real-time features using Supabase subscriptions
- Implement proper user authentication with Supabase Auth
- Add file uploads using Supabase Storage
- Scale to handle multiple teams and organizations
- Add advanced analytics and reporting features
